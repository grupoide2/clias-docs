---
id: web-thymeleaf
title: Web (Thymeleaf) — histórico
sidebar_position: 7
---

# Backend - Web (Thymeleaf) & Static Assets (histórico)

:::warning Documento histórico
El backend actual (**`clias-backend`**) es **solo API REST**: no incluye `spring-boot-starter-thymeleaf`, no tiene carpeta `templates/` y su `static/` solo contiene `favicon.ico`. Las páginas informativas se sirven ahora desde el proyecto Astro **`clias-web/`**.

Esta página se conserva como referencia de cómo estaba organizada la web ligera en el **backend anterior** (`TelemedicinaBE` con Thymeleaf), por si hay que mantener ese despliegue.
:::

## Estructura de `src/main/resources/`

```
resources/
├─ static/
│  ├─ css/
│  │  ├─ pages/
│  │  └─ site.css
│  ├─ images/
│  ├─ web/
│  └─ favicon.ico
├─ templates/
│  ├─ _fragments/
│  ├─ contactos.html
│  ├─ index.html
│  ├─ proyecto.html
│  └─ quienes-somos.html
├─ application.properties
├─ logback.xml
└─ registro.postman_collection
```

## Ruteo: ¿cuándo usar Controller y cuándo HTML estático?

### Páginas con Thymeleaf

Controladas por `PagesController`

- **Rutas:** `/`, `/proyecto`, `/quienes-somos`, `/contactos`
- **Ventajas:** fragmentos reutilizables, variables de modelo

### Páginas estáticas puras

- **Rutas:** `/web/`, `/docs/`
- **Ventajas:** cero lógica, ideales para micrositios de administración o documentación generada.

## Fragmentos y layout

Usamos **Thymeleaf + fragmentos** (`head`, `navbar`, `footer`):

- **DRY**: una sola fuente de verdad para `<head>`, navegación y footer.
- **Consistencia**: misma marca y estructura en todas las páginas.
- **Bootstrap listo**: estilos y JS se cargan en los fragmentos (CDN).

### Fragmentos

- **Head** — título, favicon, Bootstrap, fuente y **slot `extra`**.
- **Navbar** — logos, enlaces, dropdown con **"split" y estado `activo`**.
- **Footer** — créditos y JS de Bootstrap.

### ¿Cómo se usa en una página?

**Con extra vacío (solo layout + global):**

```html
<html lang="es">
  <head th:replace="_fragments/head :: head('CLIAS | Inicio', null)"></head>
  <body>
    <header th:replace="_fragments/navbar :: navbar(${active})"></header>
    <main class="container">...</main>
    <footer th:replace="_fragments/footer :: footer"></footer>
  </body>
</html>
```

**Inyectando CSS solo para esta página:**

```html
<th:block th:fragment="pageExtra">
  <link rel="stylesheet" th:href="@{/css/pages/proyecto.css}"/>
</th:block>

<html lang="es">
  <head th:replace="_fragments/head :: head('CLIAS | Proyecto', ~{::pageExtra})"></head>
  ...
</html>
```

## Agregar una nueva página Thymeleaf

1. Crea `templates/faq.html`.
2. (Opcional) Declara `pageExtra` con `faq.css` y pásalo al `head`.
3. En el controlador:

```kotlin
@GetMapping("/recursos")
fun faq(model: Model): String {
    model.addAttribute("active", "faq")
    return "faq"
}
```

4. Agrega el enlace en `navbar.html` si debe aparecer en el menú.
