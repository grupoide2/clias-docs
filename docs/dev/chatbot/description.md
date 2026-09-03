---
id: description
title: Descripción y Funcionalidades
sidebar_position: 1
---

# Chatbot - Descripción y Funcionalidades

## Descripción General

> Carpeta del workspace: **`clias-chatbot/`** | Evaluación de modelos: **`clias-chatbot-eval/`**

El **Chatbot** es un **asistente virtual conversacional** diseñado para apoyar a mujeres de **30 a 65 años** en la prevención del **Virus del Papiloma Humano (VPH)**.

Su objetivo principal es **promover el automuestreo** y **ofrecer información confiable** sobre salud sexual y reproductiva en un lenguaje accesible y culturalmente adaptado.

### Características clave

- Implementado con **Rasa** como motor principal de diálogo.
- Entrenado con un **dataset de 212 preguntas** validadas por expertos en salud.
- Incluye un **modelo de lenguaje (LLM)** (`phi3-mini-128k-onnx`) como *fallback* para preguntas fuera del dominio.
- Soporta **modo offline** mediante reglas, optimizado para dispositivos Android de gama media-baja.
- La **app móvil SISA (Flutter)** se conecta directamente por **socket.io** (`https://appclias.ucuenca.edu.ec`); el **backend Spring Boot** solo persiste la metadata de sesión (`SesionChat`) en PostgreSQL.

## Funcionalidades Soportadas

- **Atención de preguntas frecuentes** relacionadas con:
  - Virus del Papiloma Humano (VPH).
  - Procedimiento de automuestreo.
  - Salud sexual y reproductiva.
- **Guía** sobre el examen de automuestreo.
- **Respuestas en lenguaje coloquial** adaptadas al contexto cultural ecuatoriano.
- **Fallback con LLM** para responder consultas no previstas en el dataset de Rasa.
- **Historial de sesiones**: cada interacción se almacena en la base de datos (tabla `SesionChat`).
- **Modo offline**: disponible en la app móvil, responde mediante un conjunto reducido de reglas cuando no hay conexión a internet.

## Validación

Se realizaron pruebas de laboratorio y con usuarios reales.

**System Usability Scale (SUS): 90.6/100** → calificación de "excelente"

Los usuarios destacaron:
- Claridad y comprensión de respuestas.
- Valor educativo del asistente.

Áreas de mejora:
- Mayor fluidez en la conversación.
- Implementar memoria de contexto entre preguntas.
