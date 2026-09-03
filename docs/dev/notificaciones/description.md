---
id: description
title: Introducción
sidebar_position: 1
---

# Notificaciones - Introducción

> Carpeta del workspace: **`clias-notificaciones/`** (script standalone Python para envío masivo de FCM)

## Tipos de notificación activos

En el backend solo existen automatizaciones para los **tres primeros** tipos.

**RESULTADO**

Se envía cuando la doctora sube el resultado en el frontend administrativo *(web)*. Dispara un push al/los dispositivo(s) del usuario y además **inicia un plan de notificaciones programadas** (recordatorios) relacionados a completar la encuesta SUS / revisar resultado.

**RECORDATORIO_NO_EXAMEN**

Recordatorio para usuarias que **aún no tienen un examen registrado**. Se envía de forma programada; si detecta que ya existe examen, **se desactiva automáticamente**.

:::info Corrección del corte
La detección de "ya tiene examen" navegaba `examen_vph → salud_sexual → paciente`, y
`salud_sexual.paciente_id` nunca se poblaba, así que el recordatorio nunca se cortaba.
Ahora navega `examen_vph → sesion_chat → paciente` (poblado), `SesionChatService`
desactiva las programadas de la paciente al completar el automuestreo, y
`registrarDispositivo` no re-arma el recordatorio si ya hay examen. Ver
[Migración](../backend/migracion-metricas.md) para el SQL de limpieza. Además, cada
notificación en la app muestra **fecha y hora** de envío.
:::

**RECORDATORIO_NO_ENTREGA_DISPOSITIVO**

Recordatorio para confirmar la **entrega del dispositivo** de automuestreo. Si el backend detecta que el examen ya fue entregado, **se desactiva automáticamente**.

**BIENVENIDA** *(sin automatizaciones en backend)*

La app móvil puede crear una notificación de bienvenida. El backend la persiste, pero **no tiene lógica programada asociada**.

> **NUEVO_RECURSO** está desactivado en el frontend móvil.

## Estructura de la notificación

Atributos de una notificación:

- `publicId` (UUID): Identificador público.
- `cuentaUsuarioPublicId` (UUID): A quién pertenece.
- `titulo` (String): Encabezado visible en el push/listado.
- `mensaje` (String): Contenido visible.
- `tipoNotificacion` (Enum): `RESULTADO`, `RECORDATORIO_NO_EXAMEN`, `RECORDATORIO_NO_ENTREGA_DISPOSITIVO`, `BIENVENIDA`.
- `tipoAccion` (Enum): Tipo de acción asociada.
- `accion` (String): Ruta interna o **URL externa** a abrir cuando la usuaria toca la notificación.
- `fechaCreacion` (DateTime): Momento en que se creó.
- `notificacionLeida` (Boolean): Estado de lectura.

## Plantilla programada (scheduler de recordatorios)

`NotificacionScheduler` corre con `@Scheduled(cron = "0 0 * * * *")` — **cada hora en punto** — e invoca `NotificacionService.procesarNotificacionesProgramadas()`.

Cada notificación recurrente es una **plantilla programada**:

- `fechaInicio`, `proxFecha`, `limiteFecha`: controlan el ciclo.
- `programacionActiva`: habilita/inhabilita la programación.

**Cadencia dinámica** (`diasTranscurridos` desde `fechaInicio`):

- **< 30 días**: cada **3 días**
- **30–59 días**: cada **7 días**
- **≥ 60 días** o pasada `limiteFecha`: `programacionActiva = false`

Para `RESULTADO`, al subir el resultado se crea la plantilla con `proxFecha = hoy + 1 día` y `limiteFecha = hoy + 14 días`.

**Reglas de apagado automático:**

- `RECORDATORIO_NO_EXAMEN`: si ya existe examen del paciente → desactivar.
- `RECORDATORIO_NO_ENTREGA_DISPOSITIVO`: si el examen consta entregado (`contenido != null`) → desactivar.
- `RESULTADO`: si la usuaria ya respondió la encuesta SUS (`encuestaSusRepository.existsByCuentaUsuarioPublicId`) → desactivar.

## Registro de dispositivos y envío de push

Para poder recibir push, la app móvil:

1. Solicita permisos FCM y obtiene **token FCM**.
2. Llama a `POST /dispositivo` con `usuarioPublicId` y `fcmToken`.
3. El backend asocia el token al usuario (puede haber **múltiples dispositivos**).
4. Al crear una notificación, el backend **envía el push a todos** los tokens activos del usuario.
