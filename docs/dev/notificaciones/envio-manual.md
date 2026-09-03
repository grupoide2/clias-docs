---
id: envio-manual
title: Envío manual (Script)
sidebar_position: 2
---

# Notificaciones - Envío manual (Script)

> Carpeta del workspace: **`clias-notificaciones/`** — script `notificaciones_masivas.py`.

## ¿Para qué sirve?

Este script permite **enviar notificaciones masivas** a las usuarias **de forma inmediata** (no programada) cuando se requiere comunicar algo urgente u oportuno (por ejemplo, **actualización de la app**, avisos operativos, mantenimiento, etc.).

**Cuándo usarlo:**

- Avisos globales no cubiertos por las automatizaciones.
- Campañas puntuales (ej. actualización de app).
- Casos donde **no** se desea crear ni mantener una notificación programada.

## Flujo de alto nivel

1. Carga variables de entorno (`.env`): credenciales de BD y URLs.
2. Consulta la tabla `dispositivo_app_usuario` y reúne **`usuario_public_id` únicos** con `fcm_token` no nulo ni vacío.
3. Construye el **payload** por usuaria (título, mensaje, tipo, acción).
4. Si `DRY_RUN` está activo (**valor por defecto**), solo imprime el payload; si no, envía **un `POST /notificaciones`** por usuaria.
5. Pausa `SLEEP_SECONDS` (0.6 s por defecto) entre envíos para no saturar al backend/FCM.
6. Imprime un **resumen final** (total, simulados/exitosos/fallidos).

## Requisitos

- Python 3.10+
- `requirements.txt`: `python-dotenv==1.0.1`, `psycopg2-binary==2.9.9`, `requests==2.32.3`
- `.env` con `SPRING_DATASOURCE_URL` (y opcionalmente `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD`)

```bash
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
python notificaciones_masivas.py
```

## Variables de entorno reconocidas

| Variable | Por defecto | Uso |
|----------|-------------|-----|
| `SPRING_DATASOURCE_URL` | — | Cadena `postgresql://…` para `psycopg2` |
| `APP_ENV` | `dev` | `prod` usa `PROD_BASE_URL`, si no `DEV_BASE_URL` |
| `DEV_BASE_URL` | `http://localhost:9001` | Base en desarrollo |
| `PROD_BASE_URL` | `https://clias.ucuenca.edu.ec` | Base en producción |
| `NOTIFICACIONES_ENDPOINT` | `<BASE_URL>/notificaciones` | Endpoint destino |
| `API_TOKEN` | *(vacío)* | Si se define, añade `Authorization: Bearer …` |
| `DRY_RUN` | `true` | En `true` **no** envía nada, solo simula |
| `SLEEP_SECONDS` | `0.6` | Pausa entre envíos |
| `REQUEST_TIMEOUT` | `20` | Timeout HTTP en segundos |

:::warning
`DRY_RUN` está en `true` por defecto. Ponlo en `false` explícitamente para un envío real.
:::

## Rutas internas vs externas

- Si `accion` **empieza** con el dominio propio de la app, se navega **dentro** de la app.
- En caso contrario, la app abre un **diálogo** con botón **Navegar** para abrir la **URL externa** en el navegador del dispositivo.

## Partes clave del script

**Consulta de destinatarias** (`obtener_usuarios`):

```python
query = """
    SELECT DISTINCT usuario_public_id::text
    FROM dispositivo_app_usuario
    WHERE fcm_token IS NOT NULL AND fcm_token != ''
"""
```

**Contenido del mensaje** (constantes al inicio del archivo — editar aquí):

```python
TITULO      = "Actualiza tu App SISA"
MENSAJE     = (
    f"Ya está disponible la nueva versión de la app. Ingresa a {BASE_URL}/ "
    "y ve al apartado 'Descarga la Aplicación Móvil'."
)
TIPO        = "NUEVO_RECURSO"       # TipoNotificacionEnum
TIPO_ACCION = "VENTANA_RECURSOS"    # TipoAccionNotificacionEnum
ACCION      = BASE_URL + "/"
```

:::warning
`TIPO` debe ser un valor de `TipoNotificacionEnum` (`RESULTADO`, `RECORDATORIO_NO_EXAMEN`, `RECORDATORIO_NO_ENTREGA_DISPOSITIVO`, `BIENVENIDA`, `NUEVO_RECURSO`) y `TIPO_ACCION` un valor de `TipoAccionNotificacionEnum` (`VER_RESULTADOS`, `VER_VIDEO`, `VENTANA_EMERGENTE`, `VENTANA_RECURSOS`, `AUTOMUESTREO`). El backend rechaza otros valores.
:::

**Payload por usuaria** (`construir_payload`):

```python
{
    "cuentaUsuarioPublicId": public_id,
    "tipoNotificacion": TIPO,
    "titulo": TITULO,
    "mensaje": MENSAJE,
    "tipoAccion": TIPO_ACCION,
    "accion": ACCION,
}
```

**Envío** (`enviar_notificacion`): `POST` a `NOTIFICACIONES_ENDPOINT` con `HEADERS` (JSON, y `Authorization: Bearer` si `API_TOKEN`), timeout `REQUEST_TIMEOUT`. Con `DRY_RUN=true` solo imprime el payload. El `main` itera, cuenta resultados y muestra un resumen final.

## Buenas prácticas

- **Probar en entorno de staging** con una muestra pequeña antes del envío masivo.
- **Autorización**: si la API lo requiere, usar JWT con privilegios adecuados.
- Registrar un **log** de resultados por `public_id` para auditoría y reintentos.
- En campañas grandes, considerar **lotes** (batching) y métricas de entrega/lectura.

## Variantes útiles

- **Filtro por cohorte**: agregar cláusulas a la consulta SQL (por fecha de registro, provincia, etc.).
- **Lista acotada**: leer `public_id` desde un archivo CSV/JSON para envíos segmentados.
- **Mensaje templado**: cargar `TITULO/MENSAJE` desde un `.env` o un JSON de plantillas.
