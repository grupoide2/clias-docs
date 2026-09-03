---
id: intro
title: Guía para Desarrolladores
sidebar_position: 1
---

# Guía para Desarrolladores

Bienvenido a la documentación técnica del proyecto **CLIAS** (IA en la Promoción de Automuestreo para la Detección Temprana de VPH).

## Estructura del Workspace

El proyecto está organizado en **8 carpetas independientes**, cada una con su propio ciclo de vida, dependencias y equipo responsable.

```
ucuenca/
├── clias-admin/           # Panel de administración (Flutter Web)
├── clias-app/             # App móvil SISA (Flutter)
├── clias-backend/         # API REST y lógica de negocio (Spring Boot + Kotlin)
├── clias-chatbot/         # Asistente virtual (Rasa + phi3-mini ONNX)
├── clias-chatbot-eval/    # Scripts de evaluación del chatbot (Python + ONNX)
├── clias-docs/            # Esta documentación (Docusaurus)
├── clias-notificaciones/  # Envío masivo de notificaciones FCM (Python)
└── clias-web/             # Sitio web informativo (Astro)
```

---

## Descripción por módulo

### `clias-backend`
**Spring Boot 3.4.2 + Kotlin 1.9.22** | Puerto: `9001` | JDK 17

API REST central del ecosistema. Gestiona autenticación JWT, pacientes, exámenes VPH, notificaciones PUSH (Firebase), chatbot, encuesta SUS y ubicaciones.

- Base de datos: **PostgreSQL 17**
- Seguridad: **Spring Security + JWT + BCrypt**
- Notificaciones: **Firebase Cloud Messaging (FCM)**

---

### `clias-admin`
**Flutter Web** | Desplegado junto al backend

Panel para administradores y médicos. Permite gestión de usuarios, dispositivos, códigos QR, resultados PDF de exámenes VPH y localización de servicios.

- Repositorio origen: `midaro99/telemedicina_web`
- Requiere backend activo en `http://localhost:9001`

---

### `clias-app`
**Flutter (Android)** | App móvil SISA

Aplicación para usuarias finales. Cubre automuestreo, contenidos educativos, mapa de servicios, notificaciones y chatbot integrado.

- Repositorio origen: `chr1s23/TelemedicinaApp`
- Requiere backend activo

---

### `clias-chatbot`
**Rasa 3.6.2 + phi3-mini-128k-onnx**

Asistente virtual conversacional para orientación sobre VPH y automuestreo. Entrenado con 212 preguntas validadas; usa LLM ONNX como fallback.

- La app móvil (`clias-app`) se conecta por **Socket.IO** al servidor Rasa (`appclias.ucuenca.edu.ec`)
- El backend solo persiste la metadata de la sesión (`SesionChat`)

---

### `clias-chatbot-eval`
**Python + ONNX Runtime**

Scripts de evaluación de rendimiento del modelo chatbot. Ejecuta 5 configuraciones de phi3-mini y genera reportes de métricas.

- Archivos: `cosine_eval_detach.py`, `dataset/questions_answers.json`
- Independiente del chatbot de producción

---

### `clias-notificaciones`
**Python 3 + requests + psycopg2**

Script standalone para envío **masivo** de notificaciones FCM. Conecta directamente a la BD, obtiene tokens FCM activos y llama al endpoint `/notificaciones`.

- Uso: operaciones y mantenimiento (no para desarrollo)
- Requiere `.env` con credenciales de BD y URL del backend

---

### `clias-web`
**Astro v5** | Puerto: `4321`

Sitio web informativo del proyecto CLIAS. Contiene páginas: inicio, proyecto, quiénes somos, contactos, preguntas frecuentes y política de privacidad.

- Separado del backend; deploy independiente

---

### `clias-docs`
**Docusaurus 3.10.1** | Puerto: `3000`

Esta documentación. Incluye manuales para administradores, usuarios y desarrolladores.

- Deploy: GitHub Pages vía GitHub Actions (`/.github/workflows/deploy.yml`)
- URL producción: `https://clias.ucuenca.edu.ec/docs/`

---

## Levantamiento en local

| Módulo | Comando | Puerto |
|--------|---------|--------|
| `clias-backend` | `./mvnw spring-boot:run` | `9001` |
| `clias-web` | `npm run dev` | `4321` |
| `clias-docs` | `npm run start` | `3000` |
| `clias-chatbot` | `docker compose up` | `5015` → Rasa `5005` |
| `clias-admin` | `flutter run -d chrome` | — |
| `clias-app` | `flutter run` | — |

:::tip
Para desarrollo del backend basta con levantar `clias-backend` + `clias-admin` o `clias-app`. El chatbot y las notificaciones son opcionales.
:::
