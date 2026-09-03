---
id: enviroment-configuration
title: Configuración de Entorno
sidebar_position: 4
---

# Frontend Web - Configuración de Entorno

El **frontend web** necesita apuntar a un **backend** distinto según el entorno de ejecución. Para esto se utiliza el archivo `lib/config/env.dart`.

## Archivo `env.dart`

```dart
class AppConfig {
  static const bool isDevelopment = false; // CAMBIA A FALSE si es producción

  static String get baseUrl {
    if (isDevelopment) {
      return "http://localhost:9001";        // Backend en local
    } else {
      return "https://clias.ucuenca.edu.ec"; // Backend en producción
    }
  }
}
```

## Opciones de entorno

**Desarrollo (`isDevelopment = true`)**

- El frontend apunta a un backend en ejecución local.
- URL: `http://localhost:9001`
- Requiere que el backend esté levantado en la máquina local.

**Producción (`isDevelopment = false`)**

- El frontend apunta al backend desplegado en un servidor remoto.
- URL: `https://clias.ucuenca.edu.ec`
- Generalmente servido desde la ruta `/web/` del backend Spring Boot.

## Dependencias relacionadas

Librerías que dependen de la configuración de entorno:

- **http** / **dio** → peticiones REST al backend.
- **universal_html** → acceso a `localStorage` del navegador (token JWT, perfil).
- **shared_preferences** → preferencias locales.
- **intl** → formateo de fechas según zona horaria configurada.
- **provider** → gestión de estado.
- **csv** → parseo de CSV en el cliente para la carga masiva de ubicaciones.
- **file_picker** → selección de archivos (PDF de resultados, CSV).

## Cambio de entorno

1. Editar `lib/config/env.dart`.
2. Modificar la variable `isDevelopment`: `true` para local, `false` para producción.
3. Reconstruir el proyecto:

```bash
flutter pub get
flutter run -d chrome  # Para desarrollo

# Para build de producción:
flutter build web --base-href /web/
```

## Recomendaciones

- Mantener siempre **separados** los entornos (local vs producción).
- Verificar que el backend tenga habilitado **CORS** para permitir llamadas desde el dominio del frontend.
- Usar **variables de entorno del sistema** o un archivo `.env` externo en futuros despliegues para evitar cambios manuales en código fuente.
