---
id: setup
title: Despliegue
sidebar_position: 2
---

# Backend - Despliegue

En este apartado se explica cómo **levantar el backend de CLIAS en local** y cómo se despliega en producción con Docker.

## Requisitos

- **JDK 17 o superior** (Amazon Corretto o Temurin). El `pom.xml` compila a bytecode 17; la imagen Docker usa Temurin/Corretto **21**.
- **Maven 3.9+** (el proyecto incluye `mvnw`)
- **PostgreSQL 17**
- **Git 2.40+**
- **Docker / Docker Compose**
- IDE recomendado: **IntelliJ IDEA** (Community o Ultimate)

Verifica versiones:

```bash
java -version
./mvnw -v
psql --version
docker --version
docker compose version
```

## Despliegue Local

### Clonar el proyecto

```bash
git clone https://github.com/grupoide2/TelemedicinaBE.git clias-backend
cd clias-backend
```

:::info Workspace
En el workspace del proyecto esta carpeta se llama **`clias-backend/`**. Si ya clonaste el workspace completo, omite este paso.
:::

Recomendamos abrir la carpeta en **IntelliJ IDEA**, ya que resuelve las dependencias de Maven automáticamente.

### PostgreSQL local

Asegúrate de tener PostgreSQL corriendo en `localhost:5433` (el puerto que espera `application.properties`).

Puedes trabajar directamente con la BD `postgres` y el usuario `postgres`. Si necesitas crear un usuario/BD específicos:

```sql
-- Opcional: solo si quieres una BD propia
CREATE DATABASE clias;
CREATE USER clias WITH ENCRYPTED PASSWORD 'clias';
GRANT ALL PRIVILEGES ON DATABASE clias TO clias;
```

### Configuración de `application.properties`

El repo trae una configuración lista para local:

```properties
server.port=9001
spring.datasource.url=jdbc:postgresql://localhost:5433/postgres
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
spring.web.resources.static-locations=classpath:/static/
```

En **producción** las credenciales se inyectan por variables de entorno (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`) desde el `docker-compose.yml`.

### Ejecutar la app de forma local

**Con IntelliJ IDEA:**

1. Abre `RegistroApplication.kt` (anotada con `@SpringBootApplication`, `@EnableJpaAuditing`, `@EnableScheduling`).
2. Ejecuta Run (o `Shift+F10`).

La API queda en `http://localhost:9001` (raíz `/` y `/health` devuelven un JSON de estado).

## Despliegue en Producción con Docker Compose

El repo incluye dos archivos:

- **`docker-compose.yml`** — solo el backend; se conecta a una red y a un PostgreSQL externos (`clean_default`, `postgres_db`).
- **`docker-compose.full.yml`** — backend **+** PostgreSQL 17 en contenedores.

### `docker-compose.full.yml`

```yaml
version: "3.9"

services:
  db:
    image: postgres:17
    container_name: postgres_db
    restart: always
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    # Sin exposición al host — el backend accede por red interna Docker
    volumes:
      - clean_postgres_data:/var/lib/postgresql/data

  app_be:
    build: .
    container_name: telemedicina_be
    restart: always
    depends_on:
      - db
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/postgres
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      TZ: America/Guayaquil
    ports:
      - "127.0.0.1:9001:9001"   # solo accesible desde el nginx del host
    volumes:
      - /etc/localtime:/etc/localtime:ro

volumes:
  clean_postgres_data:
    external: true
```

El `Dockerfile` construye con `maven:3.9.4-eclipse-temurin-21`, empaqueta `target/registro-0.0.1.jar` y lo ejecuta sobre `amazoncorretto:21`, exponiendo el puerto **9001**.

### Crear el volumen externo (requerido)

```bash
docker volume create clean_postgres_data
```

### Construir e iniciar

```bash
docker compose -f docker-compose.full.yml up -d --build
```

- La BD **no** se expone al host (solo red interna Docker).
- La API queda en `127.0.0.1:9001` (pensada para quedar detrás de un nginx).

### Logs y salud

```bash
docker compose -f docker-compose.full.yml logs -f app_be
docker compose -f docker-compose.full.yml logs -f db
```
