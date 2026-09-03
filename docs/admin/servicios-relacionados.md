---
id: servicios-relacionados
title: Localización de Servicios Relacionados
sidebar_position: 5
---

# Localización de Servicios Relacionados

Administra centros de atención en Ginecología, Psicología y casos de agresión, con carga manual o CSV masivo.

## Introducción

La sección **Localización de Servicios Relacionados** permite al administrador registrar y gestionar las ubicaciones de **centros de atención en salud y apoyo** que estarán disponibles para los usuarios de la aplicación móvil **SISA**.

Esta información se muestra en el mapa de la app, de acuerdo al **tipo de servicio requerido**, y puede ser administrada manualmente o mediante **carga masiva de archivos CSV**.

Los tipos de servicios disponibles son:

- **Ginecología**
- **En caso de agresión**
- **Psicología**

## Acceso a la Funcionalidad

Desde la página principal del sistema, se puede acceder a **Localización de Servicios Relacionados** mediante el botón correspondiente.

![Acceso a Localización de Servicios](/img/admin_web/localizacion-servicios-home.png)

## Vista de Ubicaciones

Dentro de la sección, se presenta una tabla con todas las ubicaciones registradas, la cual incluye la siguiente información:

- **Nombre del centro o servicio**
- **Dirección**
- **Teléfono**
- **Horario de Atención**
- **Sitio Web**
- **Coordenadas de Latitud y Longitud**

Cada registro permite editar o eliminar el centro de atención (ubicación) mediante los íconos de lápiz y papelera.

![Lista de ubicaciones registradas](/img/admin_web/localizacion-servicios-lista.png)

## Agregar Nueva Ubicación Manualmente

El administrador puede añadir un nuevo centro de atención llenando un formulario con los siguientes campos:

- **Nombre** *(obligatorio)*
- **Dirección** *(obligatorio)*
- **Teléfono**
- **Horario de Atención**
- **Sitio Web**
- **Latitud y Longitud** *(obligatorio para geolocalización en el mapa)*

![Formulario de nueva ubicación](/img/admin_web/localizacion-servicios-formulario.png)

## Carga Masiva mediante CSV

Para registrar múltiples ubicaciones de manera más rápida, el sistema permite subir un archivo en formato **CSV** con el siguiente modelo:

```csv
nombre,direccion,telefono,horario,sitio_web,latitud,longitud
```

Los archivos de plantilla disponibles:

- `GINECOLOGIA.csv`
- `ENCASODEAGRESION.csv`
- `PSICOLOGIA.csv`

> Estos archivos pueden usarse como **plantillas** para garantizar que la información se cargue en el formato correcto.

## Resultado de Carga CSV

Una vez subido el archivo, el sistema mostrará un resumen de la importación:

- Número de ubicaciones cargadas correctamente.
- Ubicaciones que no se cargaron por estar duplicadas o cercanas a registros ya existentes.

![Resultado de carga CSV](/img/admin_web/localizacion-servicios-csv.png)

## Ubicaciones Cargadas por Categoría

Cada archivo CSV debe ser cargado en la **sección correspondiente**:

- **Ginecología** → `GINECOLOGIA.csv`
- **En caso de agresión** → `ENCASODEAGRESION.csv`
- **Psicología** → `PSICOLOGIA.csv`

Una vez importadas, las ubicaciones se mostrarán en la tabla de la categoría seleccionada y estarán disponibles en el mapa de la app **SISA**.

![Ubicaciones cargadas por categoría](/img/admin_web/localizacion-servicios-carga.png)

## Funciones Disponibles

- **Agregar ubicaciones manualmente**
- **Editar o eliminar ubicaciones existentes**
- **Carga masiva de ubicaciones mediante CSV**
- **Validación de duplicados por proximidad geográfica**
- **Visualización organizada por tipo de servicio**

![Vista por categoría de servicio](/img/admin_web/localizacion-servicios-categoria.png)

## Conclusión

El módulo **Localización de Servicios Relacionados** asegura que los usuarios de la app **SISA** puedan acceder fácilmente a centros de atención de **Ginecología, Psicología y servicios en casos de agresión**. Gracias a la carga manual o masiva, los administradores mantienen actualizada la información de manera eficiente.
