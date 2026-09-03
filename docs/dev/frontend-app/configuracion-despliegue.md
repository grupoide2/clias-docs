---
id: configuracion-despliegue
title: Configuración y Despliegue
sidebar_position: 6
---

# Configuración y Despliegue

Esta guía explica cómo **configurar, compilar y desplegar** la app móvil **SISA** (Flutter/Dart) enfocada en **Android**.

## Requisitos previos

- **Flutter SDK** instalado y en *PATH*
- **Dart SDK** (incluido en Flutter)
- **Git 2.40+**
- **VS Code** (IDE recomendado)
- **Android Studio** (únicamente para emuladores/SDK Manager)
- Accesos y artefactos:
  - **URL del backend** (desarrollo / producción)
  - **Firebase (FCM)**: archivo `google-services.json` para Android

```bash
flutter doctor -v
flutter --version
flutter devices
```

## Ejecución local

```bash
git clone https://github.com/chr1s23/TelemedicinaApp.git
cd TelemedicinaApp
flutter pub get
```

Selecciona un dispositivo desde **VS Code**: `Ctrl + Shift + P` → **Flutter: Select Device**

```bash
flutter run
```

## Configuración del backend en la app

La app SISA usa `lib/config/env.dart` para alternar entre **desarrollo** y **producción**:

```dart
class AppConfig {
  static const bool isDevelopment = false; // TRUE en desarrollo, FALSE en producción
  static const bool usingEmulator  = false; // TRUE en emulador Android, FALSE en dispositivo real

  static String get baseUrl {
    if (isDevelopment) {
      return usingEmulator
          ? "http://10.0.2.2:9001"          // Emulador Android (loopback del host)
          : "http://192.168.10.122:9001";   // Dispositivo real (IP local de tu PC)
    } else {
      return "https://clias.ucuenca.edu.ec"; // Producción
    }
  }

  static String get appVersion {
    return "1.0.11"; // Ir actualizando con cada versión
  }
}
```

:::warning
- El backend escucha en el puerto **9001** (no 8080).
- En emulador Android la IP del host es **`10.0.2.2`**; en dispositivo real usa la IP LAN de tu PC.
- La app envía `AppConfig.appVersion` en el login para validar compatibilidad; es **independiente** de `version:` de `pubspec.yaml` (`1.2.1+112`).
:::

**Firebase (Android):**

- Copia `google-services.json` en `android/app/`.
- Asegúrate de inicializar la lógica de FCM en el arranque (ver `FirebaseMessagingHandler.initializeFCM()`).

## Variables de entorno y credenciales

- **Base URL**: definida en `AppConfig.baseUrl`.
- **Token JWT**: manejado en servicios y almacenado de forma segura (**SecureStorage**).
- **FCM Token**: registrado/actualizado contra backend tras login.
- **Banderas de entorno**: `isDevelopment`, `usingEmulator`.
- **Versión de app**: `appVersion` en `env.dart` (sincronizada con el *release*).

:::warning
No imprimir **tokens** ni credenciales en logs. Limitar los datos sensibles en notificaciones y payloads de red.
:::

## Compilación y empaquetado (Android)

```bash
# Debug rápido
flutter run

# APK release
flutter build apk --release
```

El binario quedará en: `build/app/outputs/flutter-apk/app-release.apk`

```bash
# Instalación local vía ADB
adb install -r build/app/outputs/flutter-apk/app-release.apk
```

### Firma y publicación (resumen)

- Configura *signing* en `android/app/build.gradle` (keystore, alias, storePassword).
- Verifica `minSdkVersion` / `targetSdkVersion` y `versionName` / `versionCode`.
- Prueba en dispositivo físico y emulador antes de distribuir.

## Checklist de despliegue

- `AppConfig.isDevelopment` / `usingEmulator` configurados correctamente.
- `AppConfig.baseUrl` apunta al entorno objetivo (prod/dev).
- `appVersion` incrementada y comunicada al backend.
- `google-services.json` presente en `android/app/` (si FCM).
- Login, encuestas y notificaciones validadas en **foreground**, **background** y **terminated**.
- Errores de red manejados (offline, timeouts, 401/403).
- Resultado compilado `app-release.apk` verificado en dispositivo real.

## Notas

- **Android Studio** solo es necesario para crear emuladores / gestionar SDK, no para compilar.
- Mantén consistencia entre `appVersion` y la versión comunicada a usuarios/servidor.
- Si cambias **baseUrl**, limpia caché y reinstala para evitar sesiones huérfanas.
