---
id: setup
title: Despliegue
sidebar_position: 3
---

# Frontend Web - Despliegue de la App Web (Flutter Web)

## Requisitos

- **Flutter SDK** instalado y configurado para web (Chrome o Edge).
- **Git** 2.40+
- IDE recomendado: **VS Code**

```bash
flutter doctor
flutter --version
flutter devices   # Debe listar "Chrome" / "Edge" como dispositivo web
```

## Ejecución local

```bash
git clone https://github.com/midaro99/telemedicina_web.git
cd telemedicina_web
flutter pub get
flutter run
```

## Compilación para Producción

```bash
flutter build web --base-href /web/
```

:::info ¿Por qué `--base-href /web/`?
La app se sirve desde `/web/` dentro del backend (Spring Boot la sirve desde `static/web`). Sin este flag, el navegador intentará cargar los assets desde la raíz del dominio y dará 404.
:::

Al finalizar, Flutter genera la carpeta: `telemedicina_web/build/web`

## Ajustes necesarios post-build

Dependiendo de la versión de Flutter y de cómo estén declarados los assets en `pubspec.yaml`, puede generarse una estructura anidada `assets/assets/...`. Normaliza las rutas:

- **Mover fuentes**: `build/web/assets/assets/fonts/` → `build/web/assets/fonts/`
- **Mover imágenes**: `build/web/assets/assets/images/` → `build/web/assets/`

Si alguna carpeta no existe (por ejemplo, no hay `images/`), omite ese paso.

## Integración con el backend

La app web se sirve desde el backend (Spring Boot), en la ruta `/web`:

1. Ir a `<BACKEND>/src/main/resources/static/web`
2. Copiar el contenido de `telemedicina_web/build/web` dentro de esa carpeta.
3. Reemplazar los archivos existentes (siempre son 12).
4. Reiniciar/reconstruir el backend: en local desde IntelliJ basta re-ejecutar; en producción con Docker, reconstruye la imagen del backend y levántala.

## Verificación

- **Local:** `http://localhost:9001/web`
- **Producción:** `https://clias.ucuenca.edu.ec/web`

## Problemas comunes

| Error | Posible causa | Solución |
|-------|--------------|---------|
| `404` en assets | No usaste `--base-href /web/` | Reconstruir con la opción correcta |
| `assets/assets/...` duplicados | Versión de Flutter | Mover manualmente a `assets/` |
| Error CORS en llamadas al backend | Backend no acepta origen del frontend | Configurar CORS en Spring Boot |
| `401 Unauthorized` | Token JWT expirado o ausente | Reautenticar al usuario |

## Recomendaciones de seguridad

- Servir **siempre bajo HTTPS** en entornos productivos.
- Restringir **CORS** solo a los dominios del frontend autorizado.
- Mantener separados los entornos (local vs producción).
