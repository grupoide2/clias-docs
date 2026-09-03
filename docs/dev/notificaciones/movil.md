---
id: movil
title: Manejo en la app móvil
sidebar_position: 3
---

# Notificaciones - Manejo en la app móvil

## Clics y pantallas

Cuando llega una notificación push:

- La app registra callbacks FCM y, si está en primer plano, **muestra también una local** con `FlutterLocalNotifications`.
- Al **tocar** la notificación:
  - Se **marca como leída** en el backend.
  - La app **navega** según `tipoNotificacion` y/o `accion`.

## Flujos principales por tipo

**`RESULTADO`**

Verifica ficha socioeconómica y encuesta SUS:
- Si falta ficha → redirige al formulario obligatorio.
- Si falta encuesta → redirige a **SUS**.
- Si todo OK → **muestra el resultado** (utilidad en `ResultadoUtils`).

**`RECORDATORIO_NO_EXAMEN`**

Lleva al **Dashboard** y enfoca la pestaña principal para retomar el proceso.

**`RECORDATORIO_NO_ENTREGA_DISPOSITIVO`**

Muestra diálogo de confirmación; si la usuaria confirma, la app llama al backend para **desactivar** futuros recordatorios.

**Otros (informativos):**
- Si `accion` es **URL externa**, la abre con `url_launcher`.
- Si `accion` es una **ruta interna**, navega en la app (p. ej., pestaña "Recursos").

## El campo `accion` y la escalabilidad

El campo **`accion`** se diseñó como un parámetro flexible:

- **Rutas internas**: se reconocen porque la acción comienza con el patrón `https://miapp.com/`. Esto indica que el destino está dentro de la propia aplicación móvil.
- **URLs externas**: si `accion` no empieza con el dominio interno, se interpreta como un **enlace web externo**. Se abre un `AlertDialog` con un botón **Navegar** que redirige al navegador del dispositivo.

## Ejemplo: notificación de actualización de app

```python
TITULO = "Actualiza tu App SISA"
MENSAJE = (
    "Ya está disponible la nueva versión de la app. Ingresa a https://clias.ucuenca.edu.ec/ "
    "y ve al apartado 'Descarga la Aplicación Móvil'."
)
TIPO = "NUEVO_RECURSO"           # TipoNotificacionEnum
TIPO_ACCION = "VENTANA_RECURSOS" # TipoAccionNotificacionEnum
ACCION = "https://clias.ucuenca.edu.ec/"
```

## Buenas prácticas

- Mantener `accion` coherente con el **destino real** (ruta interna vs URL externa).
- Para enlaces externos, siempre verificar que sean **seguros (HTTPS)**.
- Evitar "spam": confiar en las **reglas de autocancelación** y `limiteFecha`.
- Mantener **múltiples tokens** por usuario actualizados.
- Usar `marcarNotificacionComoLeida` al abrir para mantener el **estado sincronizado**.
- Centralizar los **textos** (`titulo`/`mensaje`) en constantes o plantillas para consistencia.
