---
id: endpoints
title: Endpoints API
sidebar_position: 6
---

# Backend – Endpoints API

Catálogo de endpoints REST de `clias-backend`, extraído de los `@RestController`. Base local `http://localhost:9001`, producción `https://clias.ucuenca.edu.ec`.

**Columna "Acceso":**

- **Público** → está en la lista `permitAll()` de `SecurityConfig`.
- **JWT** → cae en `anyRequest().authenticated()`; requiere `Authorization: Bearer <token>`.
- **ADMIN / USER / DOCTOR** → además lleva `@PreAuthorize("hasRole('…')")` en el método o la clase.

Los endpoints `/fhir/**` se documentan aparte en [FHIR / HL7](../../hl7.md).

---

## Autenticación

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | Público | Login del **admin web** (Admin o Médico). Body `{ usuario, contrasena }` → `{ publicId, nombre, usuario, role, token }`. `401` si es inválido |
| POST | `/usuarios/registro` | Público | Alta de usuaria de la **app móvil** + datos de paciente. Body `CuentaUsuarioRequest` |
| POST | `/usuarios/autenticar` | Público | Login de la **app móvil**. Body `{ nombreUsuario, contrasena }` → `{ publicId, nombre, nombreUsuario, token, dispositivo }` |
| GET | `/usuarios/validar` | JWT | Valida / refresca el token |
| PUT | `/usuarios/cambiar-contrasena` | Público | Cambio de contraseña (verifica fecha de nacimiento) |

`CuentaUsuarioRequest`: `nombreUsuario`, `contrasena`, `aceptaConsentimiento`, `rol` (default `USER`), `paciente` (`PacienteRequest`), `appVersion`, `fechaNacimientoCambioPass`.

---

## Cuenta de usuario (`/usuarios`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| PUT | `/usuarios/editar/{publicId}` | USER | Actualizar datos de la cuenta |
| PUT | `/usuarios/chat-time/{publicId}` | USER | Acumula tiempo de chat en `metrica_uso_paciente` *(la app ya no lo usa)* |
| PUT | `/usuarios/app-time/{publicId}` | USER | Acumula tiempo de app en `metrica_uso_paciente` |
| PUT | `/usuarios/app-version/{publicId}` | USER | Registrar la versión del cliente |
| GET | `/usuarios/public-indent/{idInterno}` | Público | Resolver `publicId` a partir del id interno |
| GET | `/usuarios/admin/{publicId}` | ADMIN | Obtener una cuenta |
| GET | `/usuarios/admin` | ADMIN | Listar cuentas |
| DELETE | `/usuarios/admin/eliminar/{publicId}` | ADMIN | Eliminar cuenta |
| GET | `/usuarios/chat-time-average` | ADMIN | Promedio de tiempo de chat (calculado sobre `metrica_uso_paciente`) |

---

## Administradores y médicos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET / POST | `/api/users` | ADMIN | Listar / crear administradores |
| GET / PUT / DELETE | `/api/users/{id}` | ADMIN | Obtener / editar / eliminar administrador |
| GET / POST | `/api/medicos` | JWT | Listar / crear médicos |
| GET / PUT / DELETE | `/api/medicos/{id}` | JWT | Obtener / editar / eliminar médico |

---

## Pacientes (`/paciente`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| PUT | `/paciente/editar/{publicId}` | USER | Editar datos del paciente |
| GET | `/paciente/usuario/{publicId}` | JWT | Paciente por `publicId` de la cuenta |
| PUT | `/paciente/registrar-dispositivo/{publicId}` | USER | Vincular un kit (código QR) a la usuaria. `409` si el código ya está registrado por otra paciente |
| GET | `/paciente/estado-automuestreo/{publicId}` | USER | `{ completado, codigoDispositivo }` — indica si el dispositivo registrado ya tiene examen (para bloquear el botón "Iniciar proceso" en la app) |
| GET | `/paciente/dispositivo/{codigo}` | JWT | Paciente asociado a un código de dispositivo |
| GET | `/paciente/admin` | ADMIN | Listar pacientes |

---

## Dispositivos y códigos QR

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/dispositivo` | Público | Registrar token FCM del dispositivo móvil (`usuarioPublicId`, `fcmToken`) |
| GET | `/dispositivo/{usuarioPublicId}` | Público | Consultar dispositivos de una usuaria |
| GET | `/api/dispositivos_registrados/{dispositivo}` | Público | Datos del dispositivo/kit registrado |
| GET / POST | `/api/codigosqr` | Público | Consultar / generar lotes de códigos QR |
| GET | `/api/codigosqr/validar/{codigo}` | Público | Valida un código escaneado: `{ valido, expirado, mensaje }` |
| GET | `/api/estado-dispositivos` | Público (GET) | Panel de estado paginado (`page`, `size`, `estado?`, `fechaInicio?`, `fechaFin?`) |

---

## Exámenes VPH (`/prueba`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/prueba/medico/nombre/{codigoDispositivo}` | Público | Nombre de la paciente por código de dispositivo |
| POST | `/prueba/medico/subir` | Público | Subir resultado PDF (multipart) |
| PATCH | `/prueba/medico/clear-fields/{codigoDispositivo}` | Público | Limpiar diagnóstico y archivo |
| GET | `/prueba/medico/prefixes` | Público | Prefijos de dispositivos válidos |
| GET | `/prueba/medico/pdf/{codigoDispositivo}` | Público | Descargar el PDF del resultado (bytes) |
| GET | `/prueba/admin` | Público | Datos de reporting del panel de administrador |
| GET | `/prueba/admin/{publicId}` | Público | Un examen |
| PUT | `/prueba/admin/resultado/{publicId}` | Público | Actualizar resultados estructurados |

**`POST /prueba/medico/subir`** (`multipart/form-data`):

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `file` | MultipartFile | Sí | PDF del resultado |
| `nombre` | String | Sí | Nombre del archivo |
| `dispositivo` | String | Sí | Código del dispositivo |
| `diagnostico` | String | Sí | Diagnóstico (categoría de riesgo) |
| `genotipos` | String | No | Array JSON de genotipos detectados |

---

## Formularios clínicos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/info-socioeconomica/ficha/existe/{cuentaUsuarioPublicId}` | Público | ¿Tiene ficha socioeconómica? |
| GET | `/info-socioeconomica/usuario/{publicId}` | USER | Ficha socioeconómica de la usuaria |
| PUT | `/info-socioeconomica/editar/{publicId}` | USER | Editar ficha socioeconómica |
| GET | `/info-socioeconomica/admin` | ADMIN | Listar fichas |
| POST / GET / PUT / DELETE | `/anamnesis/admin/{publicId}` · `/anamnesis/admin` | ADMIN | CRUD de anamnesis |
| POST / GET / DELETE | `/evolucion/admin/{publicId}` · `/evolucion/admin` | ADMIN | Signos vitales (evolución) |
| GET | `/salud-sexual/admin/{publicId}` · `/salud-sexual/admin` | ADMIN | Datos de salud sexual |

---

## Encuesta SUS (`/api/encuesta_sus`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/encuesta_sus` | USER | Enviar respuestas (14 ítems, escala 1–5). Se responde una sola vez |
| GET | `/api/encuesta_sus/completada/{cuentaUsuarioId}` | JWT | ¿Ya respondió la encuesta? |

```json
POST /api/encuesta_sus
{ "item1": 4, "item2": 2, "item3": 5, "...": "...", "item14": 3 }
```

---

## Sesión de chat (`/sesion-chat`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/sesion-chat/usuario` | JWT | Registrar el automuestreo completo (la app lo llama **solo** al tocar "Automuestreo completado"). Crea la fila `sesion_chat` con `tipo=EXAMEN`, `origen=APP` + `salud_sexual` + `examen_vph`. Valida `ultimoExamenPap`/`tiempoPruebaVph` contra `rango_tiempo_examen`; rechaza si la fila del dispositivo no es `EXAMEN`/`APP`; desactiva `RECORDATORIO_NO_EXAMEN` |
| GET | `/sesion-chat/usuario/{publicId}` | JWT | Sesiones de una usuaria. La respuesta incluye `huboInteraccion` y `mensajesPaciente` |
| POST | `/sesion-chat/chatbot/inicio` | JWT | Marcar inicio de una sesión de chatbot (`sesiones_chatbot_totales += 1`) |
| PUT | `/sesion-chat/chatbot/{sessionPublicId}/fin` | JWT | Marcar fin. Body `{ fin, mensajesPaciente }` → actualiza `hubo_interaccion`, `mensajes_paciente` y `metrica_uso_paciente` |
| GET | `/sesion-chat/admin` | ADMIN | Listar sesiones |
| DELETE | `/sesion-chat/admin/{publicId}` | ADMIN | Eliminar sesión |
| POST | `/sesion-chat/admin/folleto` | ADMIN | Registrar paciente del grupo folleto (`clias-admin`). Acepta `informacionSocioeconomica` opcional (`ingresos`, `dependenciaUniversitaria`, `ocupacion`) |

*El intercambio de mensajes con el bot NO pasa por el backend: la app usa Socket.IO contra el servidor Rasa (ver [Chatbot](../chatbot/setup.md)).*

---

## Archivos y recursos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/archivo/nombre/{nombre}` | Público | Descargar archivo por nombre |
| POST / GET / PUT / DELETE | `/archivo/admin/**` | ADMIN | CRUD de archivos clínicos |
| POST | `/api/recursos/aumentar-vista` | JWT | Incrementar el contador de vistas de un recurso educativo |

---

## Recursos multimedia (`/recursos`)

Videos e imágenes administrables de **clias-app** (video de uso, videos educativos
de la pantalla Recursos, portadas de blog) y de **clias-web** (videos de portada,
videos instructivos de FAQ, capturas de la app). Binarios en disco
(`{app.recursos.dir}`), metadata en `recurso_multimedia`. Cada recurso lleva
`destino` (`APP` \| `WEB`), `categoria` y `descripcion`. Slugs conocidos: `video_uso_app`,
`video_tutorial_app`, `app_video_*`, `blog_*`, `web_video_*`, `captura_web_1..8`
(catálogo completo en `clias-admin`).

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/recursos?tipo={VIDEO\|IMAGEN}&destino={APP\|WEB}&soloActivos=true` | Público | Lista de metadata (`{ publicId, slug, tipo, destino, categoria, descripcion, nombreArchivo, contentType, tamano, activo, orden, url }`) |
| GET | `/recursos/{slug}` | Público | Sirve el binario (`inline`, `Cache-Control` 1 h) |
| POST | `/recursos` (multipart: `slug`, `tipo`, `destino`, `categoria?`, `descripcion?`, `archivo`) | ADMIN | Crear o reemplazar (upsert por `slug`). Límite 60 MB |
| PUT | `/recursos/{publicId}` (body `{ activo, orden, destino?, categoria?, descripcion? }`) | ADMIN | Editar metadata |
| DELETE | `/recursos/{publicId}` | ADMIN | Eliminar fila + archivo en disco |

---

## Métricas de uso (`/metricas`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/metricas/automuestreo/completado` (body `{ cuentaPublicId }`) | USER | Registra que la paciente completó el formulario de automuestreo (`sesiones_chatbot_exitosas += 1`) |
| GET | `/metricas/dashboard` | ADMIN | Indicadores agregados: pacientes registradas, automuestreos, pacientes que usaron el chatbot, sesiones de chatbot, mensajes, tiempo promedio de app / chatbot (`hh:mm:ss`), resultados disponibles |

---

## Catálogos (`/ocupaciones`, `/rango-tiempo-examen`)

Administrados desde `clias-admin` (página "Catálogos"). Lectura pública; escritura ADMIN.

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/ocupaciones?soloActivas=true&soloUniversidad=` | Público | Lista de ocupaciones |
| POST / PUT `/{publicId}` / DELETE `/{publicId}` | `/ocupaciones` | ADMIN | Crear / editar / **eliminar (borrado físico)** |
| GET | `/rango-tiempo-examen?soloActivos=true&pregunta=` | Público | Rangos de tiempo. `pregunta` (opcional) = `MENSTRUACION` \| `PAPANICOLAOU` \| `VPH` filtra al catálogo de esa pregunta |
| POST / PUT `/{publicId}` / DELETE `/{publicId}` | `/rango-tiempo-examen` | ADMIN | Crear / editar / **eliminar (borrado físico)**. Body incluye `pregunta` (solo se usa al crear); `pregunta` y `codigo` son inmutables al editar |

---

## Ubicaciones (`/api/ubicaciones`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/ubicaciones` | Público | Listar (`?establecimiento={tipo}`) |
| POST | `/api/ubicaciones` | Público | Crear ubicación |
| POST | `/api/ubicaciones/lote` | Público | Carga masiva (array JSON) |
| PUT / DELETE | `/api/ubicaciones/{publicId}` | Público | Editar / eliminar |

---

## Notificaciones (`/notificaciones`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/notificaciones` | Público | Crear notificación (dispara push FCM). Body con `cuentaUsuarioPublicId`, `tipoNotificacion`, `titulo`, `mensaje`, `tipoAccion`, `accion` |
| GET | `/notificaciones/{cuentaUsuarioPublicId}` | JWT | Listar notificaciones de una usuaria |
| PUT | `/notificaciones/{notificacionPublicId}/marcar-leida` | JWT | Marcar como leída |
| PUT | `/notificaciones/programada/desactivar-entrega/{cuentaUsuarioPublicId}` | JWT | Desactivar el recordatorio de entrega de dispositivo |

Ver [Notificaciones](../notificaciones/description.md) para tipos, plantillas programadas y el scheduler.

---

## Servicio

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Público | JSON de bienvenida de la API |
| GET | `/health` | Público | Estado del servicio |

---

## Colección Postman

El repo incluye `src/main/resources/registro.postman_collection` con los endpoints preconfigurados.

:::tip
Importa la colección y apunta la base a `http://localhost:9001`.
:::
