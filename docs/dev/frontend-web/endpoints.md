---
id: endpoints
title: Endpoints Principales
sidebar_position: 6
---

# Frontend Web - Endpoints Principales

El proyecto **IA - VPH** utiliza un **backend en Spring Boot** que expone endpoints REST para usuarios administradores y médicos.

:::note
Este catálogo refleja los endpoints que **realmente consume** `clias-admin` (`lib/services/api_service.dart`, `auth_service.dart`, `ubicacion_service.dart` y `pages/users_page.dart`). La columna base es `AppConfig.baseUrl` (dev `http://localhost:9001`, prod `https://clias.ucuenca.edu.ec`).
:::

**Leyenda de autenticación:**

- ✗ → No requiere autenticación (público).
- ✓ → Requiere token JWT válido (header `Authorization: Bearer <jwt>`).
- △ → Acceso restringido según rol (ADMIN o DOCTOR).

## Autenticación

| Método | Endpoint | Body | Respuesta | Auth |
|--------|---------|------|-----------|------|
| POST | `/api/auth/login` | `{ "usuario": string, "contrasena": string }` | `{ token, nombre, usuario, role }` | ✗ |

El `token` se guarda en `localStorage['jwt']`; `nombre`, `usuario` y `role` se guardan como `profile_*` para restaurar la sesión tras un refresh.

## Usuarios y Médicos (ADMIN)

| Método | Endpoint | Body | Descripción | Auth |
|--------|---------|------|-------------|------|
| GET | `/api/users` | — | Lista de administradores | ✓ |
| POST | `/api/users` | `{ nombre, usuario, contrasena }` | Crear administrador | ✓ |
| PUT | `/api/users/{id}` | `{ nombre, usuario, contrasena }` | Actualizar administrador | ✓ |
| DELETE | `/api/users/{id}` | — | Eliminar administrador | ✓ |
| GET | `/api/medicos` | — | Lista de médicos | ✓ |
| GET | `/api/medicos/{id}` | — | Médico por id | ✓ |
| POST | `/api/medicos` | `{ usuario, contrasena, nombre, correo, especializacion?, sexo, n_registro }` | Crear médico | ✓ |
| PUT | `/api/medicos/{id}` | `{ usuario, contrasena, nombre, correo, especializacion?, sexo, n_registro }` | Actualizar médico | ✓ |
| DELETE | `/api/medicos/{id}` | — | Eliminar médico | ✓ |

## Estado de dispositivos (ADMIN)

| Método | Endpoint | Params | Respuesta | Auth |
|--------|---------|--------|-----------|------|
| GET | `/api/estado-dispositivos` | `page`, `size`, `estado?`, `fechaInicio?`, `fechaFin?` | Lista paginada de dispositivos (código, estado, fechas) | ✓ |
| GET | `/prueba/admin` | — | Datos de reporting del panel de administrador | ✓ |

## Códigos QR (ADMIN)

| Método | Endpoint | Body/Params | Respuesta | Auth |
|--------|---------|------------|-----------|------|
| POST | `/api/codigosqr` | multipart: `codigo`, `fechaExpiracion` | Confirma creación | ✓/△ |
| GET | `/api/codigosqr` | `status?` = `todos\|registrado\|resultado_listo` | Lista de códigos QR y estados | ✓/△ |

## Ubicaciones (ADMIN)

Gestionadas por `UbicacionService`. La carga masiva **parsea el CSV en el cliente** (paquete `csv`) y envía un **array JSON** a `/lote`.

| Método | Endpoint | Body / Params | Descripción | Auth |
|--------|---------|---------------|-------------|------|
| GET | `/api/ubicaciones` | `?establecimiento={tipo}` | Lista ubicaciones filtradas por tipo de establecimiento | ✗ |
| POST | `/api/ubicaciones` | `{ nombre, direccion, telefono, horario, sitioWeb, latitud, longitud, establecimiento }` | Crear ubicación | ✓ |
| PUT | `/api/ubicaciones/{publicId}` | igual que POST | Editar ubicación | ✓ |
| DELETE | `/api/ubicaciones/{publicId}` | — | Eliminar ubicación | ✓ |
| POST | `/api/ubicaciones/lote` | `[ { …ubicacion }, … ]` | Carga masiva (array JSON, no multipart) | ✓ |

## Módulo médico (DOCTOR)

| Método | Endpoint | Descripción | Auth |
|--------|---------|-------------|------|
| GET | `/prueba/medico/prefixes` | Lista de prefijos válidos | ✓/△ |
| GET | `/prueba/medico/nombre/{codigo}` | Nombre de paciente asociado a dispositivo | ✗ |
| POST | `/prueba/medico/subir` | Subir resultado — multipart: `file` (PDF) + `nombre`, `dispositivo`, `diagnostico`, `genotipos` (JSON) | ✓/△ |
| PATCH | `/prueba/medico/clear-fields/{codigo}` | Limpiar diagnóstico y archivo asociados | ✓ |
| GET | `/prueba/medico/pdf/{codigo}` | Descargar el PDF del resultado (bytes) | ✓ |

## Pacientes, resultados y notificaciones

| Método | Endpoint | Body / Respuesta | Auth |
|--------|---------|------------------|------|
| GET | `/api/dispositivos_registrados/{codigo}` | Paciente vinculado a un dispositivo | ✗/✓ |
| GET | `/api/paciente/usuario/{publicId}` | Información de paciente por `publicId` | ✓ |
| GET | `/usuarios/public-indent/{idInterno}` | Resolver `publicId` a partir del id interno | ✓ |
| GET | `/api/patients/{patientId}/results` | Lista de resultados del paciente | ✓ |
| POST | `/api/patients/{patientId}/results` | Subir resultado — multipart `file` (PDF) | ✓ |
| POST | `/notificaciones` | `{ cuentaUsuarioPublicId, tipoNotificacion, titulo, mensaje, tipoAccion, accion }` — envío puntual desde el admin | ✓ |
| POST | `/sesion-chat/admin/folleto` | Registro de paciente del grupo folleto (`/admin/folleto`) | ✓ |

:::warning
Algunos endpoints (`/prueba/medico/**`, `/api/codigosqr`, `/api/dispositivos_registrados/**`, `GET /api/ubicaciones`) pueden estar accesibles sin token en ciertos despliegues. En producción, la recomendación es asegurar todos con roles ADMIN o DOCTOR.
:::
