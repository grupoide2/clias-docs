---
id: description
title: Introducción
sidebar_position: 1
---

# Frontend Web - Introducción

## Descripción General

> Carpeta del workspace: **`clias-admin/`**

El **Frontend Web de Telemedicina** es una aplicación desarrollada en **Flutter Web**, diseñada para gestionar y operar el flujo de telemedicina enfocado en pruebas de **Virus del Papiloma Humano (VPH)** del proyecto **IA - VPH**.

Esta interfaz se orienta principalmente a dos perfiles de usuario:

- **ADMINISTRADOR**: encargado de la gestión de usuarios, dispositivos, códigos QR y localización de centros de servicios relacionados.
- **DOCTOR**: responsable de consultar dispositivos, subir o limpiar resultados clínicos en formato PDF y registrar diagnósticos e interpretaciones.

> Documentación técnica extensa: **[DeepWiki – telemedicina_web](https://deepwiki.com/midaro99/telemedicina_web)**

## Objetivos principales

- Proveer una **plataforma web centralizada** para la administración y operación del sistema de telemedicina.
- Facilitar la **gestión de dispositivos** con estados de registro, examen y resultados.
- Generar y administrar **códigos QR** para identificar y rastrear dispositivos de prueba.
- Garantizar que los médicos puedan **consultar pacientes** y adjuntar resultados interpretados.
- Ofrecer un **directorio de servicios relacionados** (ginecología, psicología, atención en caso de agresión).

## Funcionalidades principales

- **Autenticación y control de roles** (ADMIN, DOCTOR).
- **Gestión de usuarios**: crear, editar y eliminar administradores y médicos.
- **Panel de dispositivos**: monitoreo del estado, fechas clave y descarga de reportes en Excel.
- **Generación de códigos QR**: creación masiva de códigos en lotes con prefijo y fecha de expiración.
- **Módulo médico**: búsqueda de pacientes por dispositivo, gestión de resultados PDF, diagnóstico e interpretación de genotipos VPH.
- **Localización de servicios**: CRUD de centros de salud, protección y psicología, con soporte de carga masiva vía CSV.

## Tecnologías utilizadas

**Framework**: Flutter Web.

**Dependencias clave:**

- `http`, `dio`, `http_parser` (peticiones REST y multipart)
- `provider` (gestión de estado)
- `intl` (manejo de fechas y formatos)
- `excel`, `file_saver` (exportación de reportes)
- `pdf` (generación y manipulación de resultados)
- `qr_flutter`, `archive` (creación y empaquetado de QR)
- `csv`, `file_picker` (carga masiva de ubicaciones y selección de archivos)
- `syncfusion_flutter_datepicker` (selector de fechas)
- `url_launcher` (apertura de enlaces externos)
- `shared_preferences`, `universal_html` (almacenamiento local y utilidades web)

**Backend**: Spring Boot (expuesto vía REST API). **Base de datos**: PostgreSQL (en backend).

## Vista general del flujo

1. **Administrador inicia sesión** y accede al panel principal.
2. Puede **gestionar usuarios**, **monitorear dispositivos**, **generar códigos QR** o **administrar ubicaciones de servicios**.
3. **Médico inicia sesión** y consulta un dispositivo/paciente.
4. Sube el **PDF del resultado clínico**, agrega diagnóstico (alto, bajo, negativo) y genotipos detectados.
5. El sistema mantiene la trazabilidad de cada dispositivo y permite la **descarga de reportes consolidados**.

:::info
Este frontend no funciona de forma independiente: requiere estar integrado con el **[Backend de Telemedicina (Spring Boot)](https://github.com/chr1s23/TelemedicinaBE)**, que provee los servicios de autenticación, gestión de dispositivos, resultados y usuarios.
:::
