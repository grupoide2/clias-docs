# clias-docs

Documentación del sistema **CLIAS** (telemedicina — automuestreo de VPH, Universidad de Cuenca).
Sitio construido con [Docusaurus 3](https://docusaurus.io/).

Reúne la documentación técnica y funcional de todos los componentes:
`clias-backend`, `clias-app`, `clias-admin`, `clias-web` y `clias-chatbot`.

## Contenido

| Sección | Qué cubre |
|---|---|
| **Introducción / Arquitectura** | Visión general del sistema y cómo se relacionan los repos |
| **dev/backend** | API REST (`endpoints.md`), modelo de datos (`db.md`), FHIR/HL7, migraciones |
| **dev/backend/migracion-metricas.md** | Guía de despliegue a producción: DDL, backfill de métricas, catálogos, recursos, constraints |
| **dev/notificaciones** | Push (FCM), notificaciones programadas y el scheduler |
| **Funcional** | Flujo de automuestreo, catálogos dinámicos, folleto, panel administrativo |

## Requisitos

- Node.js ≥ 18
- npm

## Puesta en marcha (desarrollo)

```bash
npm install
npm start          # servidor local con recarga en caliente → http://localhost:3000
```

## Compilar

```bash
npm run build      # genera el sitio estático en build/
npm run serve      # sirve build/ localmente para verificar
```

> El build falla si hay enlaces internos rotos: útil como validación.

## Estructura

```
docs/                 Contenido en Markdown/MDX
  dev/                Documentación para el equipo de desarrollo
  ...
src/                  Componentes y páginas propias del sitio
static/               Recursos estáticos (imágenes, capturas)
sidebars.js           Definición de la barra lateral
docusaurus.config.js  Configuración del sitio
```

## Relación con el resto de CLIAS

```
clias-backend   API REST + FCM + FHIR (Spring Boot / Kotlin, :9001)
clias-app       App de la paciente "SISA" (Flutter)
clias-admin     Panel administrativo (Flutter Web)
clias-web       Sitio informativo público (Astro)
clias-chatbot   Chatbot Rasa
clias-docs      Este repo — documenta todo lo anterior
```
