---
id: security
title: Seguridad (JWT)
sidebar_position: 5
---

# Frontend Web - Seguridad (JWT)

El frontend web implementa la autenticación y autorización utilizando **JSON Web Tokens (JWT)**, gestionados por el backend en **Spring Boot**.

Los tokens se transmiten en cada petición protegida mediante el encabezado `Authorization: Bearer <token>`.

## Flujo de autenticación

1. El usuario inicia sesión desde el **login**.
2. El frontend envía usuario y contraseña al endpoint `POST /api/auth/login`.
3. El backend valida las credenciales y devuelve el perfil del usuario y un **JWT**.
4. El frontend guarda el token en `localStorage` y lo incluye en cada llamada posterior.

```
GET /api/estado-dispositivos?page=0&size=50 HTTP/1.1
Host: clias.ucuenca.edu.ec
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
Accept: application/json
```

## Implementación en el Backend

- **JwtAuthenticationFilter**: extrae y valida el token en cada petición.
- **JwtUtil**: genera y firma los tokens con el algoritmo HS512.
- **SecurityConfig**: define rutas públicas y rutas protegidas.

## Rutas públicas (no requieren token)

- Recursos estáticos: `/web/**`
- Autenticación: `/api/auth/login`
- Preflight CORS: `OPTIONS /**`
- Algunos endpoints abiertos por compatibilidad: `/api/codigosqr`, `/prueba/medico/**`, `/api/dispositivos_registrados/**`

## Rutas protegidas (requieren JWT)

**ADMIN:**
- `/api/users/**`
- `/api/medicos/**`
- `/api/estado-dispositivos`
- `/api/ubicaciones/**`
- `/api/codigosqr` (en despliegues seguros)

**DOCTOR:**
- `/prueba/medico/**`
- `/api/patients/**/results`

## Almacenamiento del token en el Frontend

- El token JWT se guarda en `localStorage['jwt']`.
- Si el token expira, el backend devuelve **401 Unauthorized** y el frontend redirige al login.

## Recomendaciones de seguridad

- No dejar rutas abiertas en producción (`/prueba/medico/**`, `/api/codigosqr`, etc.).
- Configurar un **tiempo de expiración corto** para los tokens (ej. 15-30 minutos).
- Habilitar **refresh tokens** para extender sesiones de manera segura.
- Restringir **CORS** solo a los dominios del frontend autorizado.
- Usar HTTPS en todos los entornos productivos.
