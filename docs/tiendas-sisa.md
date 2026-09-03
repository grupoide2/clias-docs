---
id: tiendas-sisa
title: Publicación en Tiendas
sidebar_position: 11
---

# Guía — Publicación de SISA en App Store y Google Play

## Descripción General

Guía paso a paso para publicar **SISA – UCuenca** en **Google Play** (Android) y **App Store** (iOS).

**Stack base del proyecto:**

- **Flutter** (web/mobile)
- **Backend:** Spring Boot / Kotlin — dominio `clias.ucuenca.edu.ec`
- **Servicios:** Firebase

**Identificadores:**

- **Android (packageName):** `com.ucuenca.sisa`
- **iOS (Bundle ID):** `com.ucuenca.sisa`

## 1) Checklist inicial

- **Política de privacidad** (URL pública), **términos** y **soporte**.
- **Iconos**, **splash** y **nombre** de la app definitivos.
- **Versionado definido:** Android `versionCode` incremental; iOS `CFBundleShortVersionString` + Build incremental.
- **Capturas de pantalla por plataforma:** iOS (iPhone 6.5"; iPad si aplica), Android (teléfono; tablets 7" y 10").
- **Textos de listing:** título, descripciones (corta/larga), palabras clave.
- **Cuentas activas:** **Google Play Console** y **App Store Connect** (rol Admin/App Manager).

## 2) Configuración de proyecto Flutter

### 2.1 Actualizar versión

En `pubspec.yaml`:

```yaml
version: 1.0.0+1
```

### 2.2 Firma e identidades

**Android (keystore release):**
- Crear/usar `key.properties` y referenciarlo en `android/app/build.gradle` con `signingConfigs` y `release`.

**iOS:**
- Se gestionan con **Certificates / Identifiers / Profiles**. Xcode puede **manage signing** automáticamente con tu Apple ID/Team.

### 2.3 Pruebas locales rápidas

```bash
flutter clean
flutter pub get
flutter build apk --release
```

## 3) Publicación en Google Play (Android)

### 3.1 Preparar App Bundle (AAB)

Google Play **exige AAB**.

```bash
flutter clean && flutter pub get
flutter build appbundle --release
```

Salida: `build/app/outputs/bundle/release/app-release.aab`

### 3.2 Crear app en Play Console

- Play Console → **Crear app**.
- **Nombre:** SISA - UCuenca.
- **Idioma predeterminado:** Español.
- **Tipo:** Aplicación. **Precio:** Gratuita.
- **Política de Privacidad:** **URL pública obligatoria**.

### 3.3 Configuración de la tienda (Store listing)

- **Breve descripción** y **Descripción completa**.
- **Icono** alta resolución, **gráficos** y **capturas**.
- **Clasificación de contenido (IARC)**.
- **Seguridad de datos (Data safety):** completa el formulario indicando recopilación/compartición, propósito, cifrado, eliminación, etc.

### 3.4 Versionado

- Cada subida debe **incrementar** `versionCode` (entero).
- Ejemplo: `1.0.0+1` → `1.0.1+2`

## 4) Publicación en App Store (iOS)

### 4.1 Requisitos

- **Apple Developer** (individual u organización) **activa**.
- **Mac** con **Xcode** actualizado.

### 4.2 Configurar iOS en Flutter/Xcode

- Abrir `ios/Runner.xcworkspace` en **Xcode**.
- **Runner → Signing & Capabilities:** Team, Bundle Identifier `com.ucuenca.sisa`, Automatically manage signing activado.
- `Info.plist`: añadir descripciones de permisos (ej. `NSCameraUsageDescription`).

### 4.3 Generar IPA y subir (Xcode Organizer)

- **Product → Archive** (dispositivo: Any iOS Device arm64).
- Al terminar → **Organizer** → **Distribute App** → **App Store Connect** → **Upload**.

### 4.4 TestFlight

- Activar **Testing interno** (hasta 25 usuarios) o **Testing externo** (requiere breve revisión).

### 4.5 App Privacy (Nutrition Labels)

- Declarar datos **recopilados** / **relacionados** o **no relacionados** con el usuario.
- Alinear con Firebase/SDKs usados.

### 4.6 Rechazos comunes y cómo evitarlos

| Error | Solución |
|-------|---------|
| Crash al abrir | Probar en **modo release** y en **dispositivo físico** |
| Metadatos insuficientes | Proveer **credenciales demo** si hay login |
| Privacidad inconsistente | Alinear Privacy Policy, Labels y comportamiento real |
| URLs quebradas | Verificar endpoints/links dentro de la app |

## 5) Plantillas de texto

### Notas de versión (ejemplo)

- **Nuevo:** Flujo de registro optimizado; mejoras en carga de PDFs de resultados.
- **Mejoras:** Estabilidad; permisos de cámara; rendimiento en redes lentas.
- **Correcciones:** Crash al iniciar sesión en conexiones inestables.

### Descripción larga (ejemplo)

**SISA – UCuenca** es una aplicación educativa y de acompañamiento en salud que facilita el acceso a información y seguimiento de servicios. Incluye recursos sobre **automuestreo de VPH**, guía paso a paso y contacto con centros de atención. **SISA no reemplaza una consulta médica.**
