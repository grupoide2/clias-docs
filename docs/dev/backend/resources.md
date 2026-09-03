---
id: resources
title: Recursos
sidebar_position: 5
---

# Backend - Recursos

Esta sección explica **lo imprescindible** para que, al **clonar el proyecto**, sepas **qué archivos configurar** y **qué NO viene** en el repo.

## ¿Qué viene y qué no viene?

**Incluido en `src/main/resources/`:**

- `application.properties` → configuración para **desarrollo local** (puerto `9001`, PostgreSQL en `localhost:5433`).
- `logback.xml` → configuración de logs.
- `static/` → versionado solo `favicon.ico`. Sin Thymeleaf. En despliegue se copia el build de `clias-admin` en `static/web/` (ver *"Frontend Web – Despliegue"*); el `JwtAuthenticationFilter` deja pasar `/web/**` sin token.
- `registro.postman_collection` → colección Postman para probar endpoints.

**NO incluido (intencional):**

- **Credencial de Firebase (FCM)**: el archivo JSON de servicio **no se versiona**.

:::warning
Si no agregas el JSON de Firebase, los endpoints/tareas de **Notificaciones PUSH** fallarán con error de credenciales.
:::

## application.properties — ¿qué tocar al clonar?

Trae la configuración lista para local. Lo que normalmente se ajusta:

```properties
server.port=9001
spring.datasource.url=jdbc:postgresql://localhost:5433/postgres
spring.datasource.username=postgres
spring.datasource.password=postgres
```

- Para producción, no edites este archivo: las credenciales las provee el sistema (variables de entorno `SPRING_DATASOURCE_*`).
- Ver *"Despliegue del Backend"* para los `environment` de Docker Compose.

:::note Otros parámetros
- `spring.jpa.hibernate.ddl-auto=update` está pensado para desarrollo. En producción se recomienda `none` + migraciones.
- Multipart limitado a `10MB` (`spring.servlet.multipart.max-file-size`).
- `spring.web.resources.static-locations=classpath:/static/` (solo sirve el `favicon.ico`).
:::

## Páginas informativas

Las páginas públicas del proyecto (inicio, proyecto, contactos, etc.) **ya no viven en el backend**: se sirven desde el proyecto **Astro `clias-web/`**. Este backend expone solo la API REST más `/` y `/health`, que devuelven un JSON de estado.

## Logging

- `logback.xml` ya viene configurado para mostrar logs en consola.
- En producción puedes activar archivo rotativo diario y enviar a un directorio (`LOG_DIR`).
