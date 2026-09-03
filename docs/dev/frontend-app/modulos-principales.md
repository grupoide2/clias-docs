---
id: modulos-principales
title: Módulos Principales
sidebar_position: 3
---

# Módulos Principales

Esta sección describe **qué hace cada módulo**, qué servicios intervienen y qué debe conocer un desarrollador para mantener o extender la app.

## Autenticación y gestión de sesión

**Propósito:** validar credenciales, emitir/renovar token y mantener la sesión segura del usuario.

**Servicios clave:** `auth_service.dart`, `connectivity_service.dart`, `notification_service.dart`, `firebase_messaging_handler.dart`

**Responsabilidades:**
- Inicio de sesión, cierre de sesión.
- Almacenamiento seguro de `token`, `publicId`, `deviceId` en **SecureStorage**.
- Renovación/validación de sesión (token) de forma transparente.
- Registro/actualización del **token FCM** tras un login exitoso.

**Entradas / Salidas:** entrada → usuario, contraseña, `appVersion`. Salida → objeto de sesión (ids + token) y estado autenticado en la UI.

**Errores comunes:**
- 401/403: limpiar sesión y redirigir a **Login**.
- Timeout/red: informar al usuario y permitir reintentos.
- Incompatibilidad de versión: bloquear con mensaje claro si el backend lo exige.

**Seguridad:** token en cabecera para todas las llamadas autenticadas. Nunca registrar en logs `token` ni contraseñas. Usar `SecureStorage` para persistir credenciales.

## Gestión de pacientes

**Propósito:** CRUD de pacientes y acceso a su información clínica relevante.

**Servicios clave:** `paciente_service.dart`, `archivo_service.dart`, `resultado_service.dart`

**Responsabilidades:**
- Crear/actualizar datos del paciente asociados a la cuenta de usuario.
- Consultar información resumida (dashboard) y detalle bajo demanda.
- Manejo de adjuntos clínicos básicos.

**Offline:** Cachear consultas recientes y permitir lectura limitada sin conexión.

## Chat y sesiones de chat

**Propósito:** asistente conversacional (chatbot Rasa) que acompaña el proceso de automuestreo.

**Servicios clave:** `chat_service.dart`, `sesion_chat_service.dart`

**Responsabilidades:**
- `chat_service.dart` abre un **WebSocket Socket.IO** (`socket_io_client`) contra el servidor Rasa (`https://appclias.ucuenca.edu.ec`), emitiendo `session_request` / `user_uttered` y escuchando las respuestas del bot.
- `sesion_chat_service.dart` **persiste** las sesiones y el resultado del automuestreo en el backend por REST (`/sesion-chat/usuario`, `/sesion-chat/chatbot/inicio`).
- Pantallas: `chat.dart` (en línea) y `offline_chat.dart` (flujo reducido por reglas sin conexión).

## Notificaciones push (FCM)

**Propósito:** informar eventos críticos (resultados disponibles, recordatorios, nuevos recursos).

**Servicios clave:** `notification_service.dart`, `firebase_messaging_handler.dart`, `notification_state.dart`

**Flujo resumido:**
1. Backend envía notificación → **FCM**.
2. FCM entrega al dispositivo (foreground/background/terminated).
3. `firebase_messaging_handler.dart` normaliza el mensaje.
4. `notification_state.dart` actualiza la UI (banners, badges, navegación).

**Buenas prácticas:**
- Registrar/actualizar el **token FCM** en login.
- Manejar *deep-links* o rutas para abrir pantallas específicas.
- Registrar interacciones del usuario (tocar notificación, descartar).

## Encuestas y formularios

**Propósito:** recolectar datos de salud y **socioeconómicos** con formularios estructurados.

**Servicios clave:** `encuesta_service.dart`, `inf_socioeconomica_service.dart`

**Responsabilidades:**
- Renderizar formularios y validar campos.
- Guardar borradores en **cache** para modo offline.
- Enviar respuestas al backend y manejar estados (pendiente/enviado).

**Errores y recuperación:** sin conexión → guardar en cola para sincronización posterior. Validación → feedback rápido en campo (requeridos, formatos).

## Registro de kit (escáner QR)

**Propósito:** vincular un kit de automuestreo a la cuenta escaneando su código QR.

**Servicios / paquetes:** `mobile_scanner`, `paciente_service.dart` (`/paciente/registrar-dispositivo/`), `/dispositivo`.

**Pantallas:** `scanner.dart`, `scanner_result.dart`.

## Resultados y recursos médicos

**Propósito:** exponer resultados de exámenes (PDF) y contenido educativo.

**Servicios clave:** `resultado_service.dart`, `resource_service.dart`

- **Resultados:** visor PDF (`pdfx` / `flutter_pdfview`), descarga con `file_saver` / `open_file`; distinción visual por estado (nuevo, visto).
- **Recursos educativos:** ~15 blogs (`view/screens/blog_*.dart`) renderizados con `flutter_markdown`; video de automuestreo con `chewie` / `video_player`; `resource_service` reporta vistas a `/api/recursos/aumentar-vista`.

## Ubicación y mapas

**Propósito:** localizar en el mapa los centros de salud, protección y atención psicológica.

**Servicios / paquetes:** `ubicacion_service.dart` (`GET /api/ubicaciones`), `flutter_map` + `latlong2` (OpenStreetMap) y `google_maps_flutter` (Google Maps).

**Pantallas:** `maps_selector_screen.dart` (elige proveedor), `maps_osm_screen.dart`, `maps_google_screen.dart`.

**Privacidad:** Solicitar permisos explícitos. Minimizar persistencia local de geodatos.

## Archivos y adjuntos

**Propósito:** subir y descargar archivos clínicos vinculados a formularios y resultados.

**Servicios clave:** `archivo_service.dart`, `resource_service.dart`, `connectivity_service.dart`

**Recomendaciones:**
- Limitar tamaños y tipos de archivos permitidos.
- Reintentos exponenciales en fallos de red.

## Tabla resumen

| Módulo | Servicios / paquetes involucrados |
|--------|----------------------|
| Autenticación y sesión | `auth_service.dart`, `api_client.dart`, `notification_service.dart`, `firebase_messaging_handler.dart`, `connectivity_service.dart` |
| Gestión de pacientes | `paciente_service.dart`, `archivo_service.dart`, `resultado_service.dart` |
| Registro de kit (QR) | `mobile_scanner`, `paciente_service.dart` |
| Chat y sesiones | `chat_service.dart` (`socket_io_client`), `sesion_chat_service.dart` |
| Notificaciones push | `notification_service.dart`, `firebase_messaging_handler.dart`, `notification_state.dart` |
| Encuestas y formularios | `encuesta_service.dart`, `inf_socioeconomica_service.dart` |
| Resultados y recursos | `resultado_service.dart`, `resource_service.dart`, `pdfx`, `flutter_markdown`, `chewie` |
| Ubicación y mapas | `ubicacion_service.dart`, `flutter_map`, `google_maps_flutter` |
| Archivos y adjuntos | `archivo_service.dart`, `resource_service.dart`, `connectivity_service.dart` |

## Checklist para desarrolladores

- ¿Este flujo requiere autenticación? → usar `auth_service` + token en cabeceras.
- ¿Debe funcionar offline? → cache/borradores + cola de sincronización.
- ¿Se deben disparar notificaciones o *deep-links*? → `notification_service` + handler.
- ¿Hay datos sensibles? → cifrado en tránsito, **SecureStorage** en reposo.
- ¿Se necesitan permisos del SO? → solicitar, justificar, degradar funcionalidad si se niegan.
