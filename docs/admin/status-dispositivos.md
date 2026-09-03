---
id: status-dispositivos
title: Status de Dispositivos
sidebar_position: 3
---

# Status de Dispositivos

Consulta en tiempo real los estados de los dispositivos: generado, registrado, en proceso y resultado listo.

## Introducción

La sección **Status de Dispositivos** permite al administrador del sistema consultar el **estado actual de los dispositivos registrados** en la plataforma de telemedicina del proyecto **IA - VPH**.

Este módulo facilita la visualización del flujo de un dispositivo desde que es **generado**, pasando por el registro, proceso de análisis y finalizando con el **resultado listo**.

Los posibles estados de un dispositivo son:

- **Generado**
- **Registrado**
- **En proceso**
- **Resultado listo**

## Acceso a la Funcionalidad

Desde la página principal del sistema, se puede acceder a **Status de Dispositivos** mediante el botón correspondiente.

![Acceso a Status de Dispositivos](/img/admin_web/status-dispositivos-home.png)

## Vista de Dispositivos

Al ingresar a la sección, se despliega una tabla con todos los dispositivos registrados en el sistema.

Cada registro incluye la siguiente información:

- **Código del dispositivo**
- **Estado actual**
- **Fecha de Registro**
- **Fecha de Examen**
- **Fecha del Resultado listo**

![Lista de dispositivos](/img/admin_web/status-dispositivos-lista.png)

## Filtrar por Estado

El administrador puede filtrar los dispositivos según su estado actual: **Generado**, **Registrado**, **En proceso** o **Resultado listo**.

![Filtro por estado](/img/admin_web/status-dispositivos-filtro.png)

## Búsqueda por Fechas

También es posible acotar la búsqueda seleccionando un **rango de fechas** de registro.

Esto permite obtener únicamente los dispositivos procesados dentro de un período específico.

![Búsqueda por rango de fechas](/img/admin_web/status-dispositivos-fechas.png)

## Ejemplo de Reporte Filtrado

Una vez aplicados los filtros, la tabla se actualizará mostrando únicamente los dispositivos que cumplen con los criterios seleccionados.

El sistema permite **descargar** un reporte en formato **Excel** con los registros filtrados, y adicional implementa una columna para que el administrador pueda colocar la fecha de entrega de los dispositivos en el GAD.

![Reporte filtrado](/img/admin_web/status-dispositivos-reporte.png)

![Descarga en Excel](/img/admin_web/status-dispositivos-excel.png)

## Funciones Disponibles

- **Visualización del estado de cada dispositivo**
- **Filtrado por estado**
- **Búsqueda por rango de fechas**
- **Descarga de reportes de dispositivos**

## Conclusión

El módulo **Status de Dispositivos** es una herramienta clave para el seguimiento y control de los equipos dentro del sistema de telemedicina. Permite a los administradores conocer en tiempo real el progreso de los dispositivos, garantizando un manejo eficiente y transparente de la información en el marco del proyecto **IA - VPH**.
