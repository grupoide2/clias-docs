---
id: generacion-codigos
title: Generación de Códigos QR
sidebar_position: 4
---

# Generación de Códigos QR

Genera lotes de códigos QR configurables con prefijo, lote, cantidad y fecha de expiración.

## Introducción

La sección **Generación de Códigos QR** permite al administrador crear **códigos únicos** asociados a los dispositivos médicos dentro del proyecto **IA - VPH**.

Estos códigos se utilizan para identificar de manera rápida y precisa cada dispositivo mediante un **QR escaneable**.

El sistema facilita la creación de lotes de códigos, con prefijos, series y fechas de expiración configurables.

## Acceso a la Funcionalidad

Desde la página principal del sistema, se puede acceder a **Generación de Códigos QR** mediante el botón correspondiente.

![Acceso a Generación de Códigos QR](/img/admin_web/generacion-codigos-home.png)

## Formulario de Generación

Al ingresar en la sección, se despliega un formulario que permite configurar la creación de los códigos.

Los campos disponibles son:

- **Prefijo**: Identificador inicial del código (hasta 8 caracteres). Por lo general va el código postal de la parroquia.
- **Lote (A-Z)**: Letra que distingue un grupo de códigos.
- **Cantidad de códigos (1-999)**: Número de códigos a generar.
- **Fecha de expiración**: Límite de validez de los códigos generados.

![Formulario de generación de códigos](/img/admin_web/generacion-codigos-formulario.png)

## Selección de Fecha de Expiración

El sistema permite escoger la fecha de expiración desde un calendario interactivo o ingresando la fecha manualmente.

![Selección de fecha - vista 1](/img/admin_web/generacion-codigos-fecha1.png)

![Selección de fecha - vista 2](/img/admin_web/generacion-codigos-fecha2.png)

## Ejemplo de Configuración

Un ejemplo de configuración podría ser:

- **Prefijo**: `010201`
- **Lote**: `C`
- **Cantidad**: `10`
- **Fecha de Expiración**: `2025-08-28`

![Ejemplo de configuración](/img/admin_web/generacion-codigos-ejemplo.png)

## Generación y Descarga

Al hacer clic en **Generar**, el sistema procesa la solicitud y genera un archivo **ZIP descargable** con todos los códigos en formato **PNG**.

![Generación exitosa](/img/admin_web/generacion-codigos-exito.png)

## Archivos Generados

El archivo descargado contiene todos los **códigos QR en formato imagen**, listos para impresión y colocación en los dispositivos de automuestreo.

Cada archivo incluye el prefijo, lote y número de secuencia.

Ejemplo de archivos generados:

- `010201-C001.png`
- `010201-C002.png`
- ...
- `010201-C010.png`

![Archivos generados en el ZIP](/img/admin_web/generacion-codigos-archivos.png)

## Funciones Disponibles

- **Generación de códigos QR únicos**
- **Configuración de prefijo, lote y cantidad**
- **Definición de fecha de expiración**
- **Descarga masiva de códigos en formato ZIP**

## Conclusión

El módulo **Generación de Códigos QR** optimiza la gestión de dispositivos dentro del sistema de telemedicina del proyecto **IA - VPH**. Gracias a esta funcionalidad, los administradores pueden generar, organizar y distribuir de manera ágil códigos escaneables que garantizan la trazabilidad y control de los dispositivos.
