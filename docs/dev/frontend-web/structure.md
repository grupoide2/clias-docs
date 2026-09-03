---
id: structure
title: Estructura del Proyecto
sidebar_position: 2
---

# Frontend Web - Estructura del Proyecto

El proyecto sigue la organización típica de una aplicación en **Flutter Web**, con carpetas separadas para configuración, servicios, modelos y pantallas.

## Vista general

```
telemedicina_web/
├─ Dockerfile                      # Alternativa de despliegue con Nginx
├─ assets/                         # Imágenes, fuentes y otros recursos estáticos
├─ lib/
│  ├─ main.dart                    # Punto de entrada, define rutas y localización
│  ├─ config/
│  │  └─ env.dart                  # Configuración de entornos (dev/prod)
│  ├─ models/                      # Definición de modelos de datos
│  │  ├─ estado_dispositivo.dart   # Estado de dispositivos
│  │  ├─ paciente.dart             # Información de pacientes
│  │  ├─ profile.dart              # Perfil de usuario autenticado
│  │  ├─ result.dart               # Resultados de pruebas VPH
│  │  ├─ ubicacion_model.dart      # Servicios relacionados (ubicaciones)
│  │  └─ user.dart                 # Usuarios (admin y médicos)
│  ├─ pages/                       # Interfaces de usuario (pantallas principales)
│  │  ├─ login_page.dart           # Autenticación
│  │  ├─ home_page.dart            # Panel principal con accesos
│  │  ├─ users_page.dart           # Gestión de usuarios
│  │  ├─ device_status_page.dart   # Estado de dispositivos + exportación Excel
│  │  ├─ codes_page.dart           # Generación de códigos QR
│  │  ├─ ubicaciones_admin_page.dart
│  │  ├─ ubicaciones_tab.dart      # Administración de servicios relacionados
│  │  ├─ folleto_registro_page.dart # Registro de pacientes del grupo folleto
│  │  ├─ search_page.dart          # Búsqueda de pacientes (módulo médico)
│  │  └─ resultados_vph_page.dart  # Gestión de resultados PDF y diagnóstico
│  └─ services/                    # Servicios REST y lógica de negocio
│     ├─ api_service.dart          # Cliente para dispositivos, códigos QR, VPH
│     ├─ auth_service.dart         # Login y gestión de sesión
│     └─ ubicacion_service.dart    # CRUD de ubicaciones de servicios
└─ pubspec.yaml                    # Definición de dependencias Flutter
```

## Detalle por componentes

### `main.dart`

Define la **ruta inicial** (`/login`) y el mapa de rutas:

```dart
routes: {
  '/login': (_) => const LoginPage(),
  '/home': (_) => const HomePage(),
  '/admin/users': (_) => const UsersPage(),
  '/admin/results': (_) => const DeviceStatusPage(),
  '/admin/codes': (_) => const QRGeneratorPage(),
  '/admin/ubicaciones': (_) => const UbicacionesAdminPage(),
  '/admin/folleto': (_) => const FolletoRegistroPage(),
  '/doctor/search': (_) => const SearchPage(),
  '/doctor/resultados': (_) => const ResultadosVphPage(),
}
```

### `config/env.dart`

Define las **URLs base** para desarrollo (`http://localhost:9001`) y producción (`https://clias.ucuenca.edu.ec`).

### `models/`

Clases de datos que reflejan las entidades del backend:

- `User`: usuarios del sistema (admins y médicos).
- `Profile`: datos del usuario autenticado en sesión.
- `EstadoDispositivo`: estado de un dispositivo (registro, examen, resultado).
- `Paciente`: representación de un paciente vinculado a un dispositivo.
- `Result`: resultados VPH (diagnóstico, genotipos, PDF).
- `Ubicacion`: centros de salud, protección y psicología.

### `pages/`

Todas las **pantallas del frontend**:

- `LoginPage`: autenticación inicial.
- `HomePage`: menú principal para ADMIN.
- `UsersPage`: gestión de usuarios (CRUD de admins y médicos).
- `DeviceStatusPage`: listado de dispositivos, filtros, descarga de reportes Excel.
- `CodesPage`: generación de códigos QR (en lote, con fecha de expiración).
- `UbicacionesAdminPage` y `UbicacionesTab`: gestión de servicios relacionados con carga masiva vía CSV.
- `FolletoRegistroPage`: registro de pacientes del grupo folleto (ruta `/admin/folleto`).
- `SearchPage`: búsqueda de dispositivos para el rol DOCTOR.
- `ResultadosVphPage`: carga/limpieza de resultados PDF, interpretación y registro de genotipos.

### `services/`

Encapsula la **comunicación REST** (todo el HTTP vive aquí; las páginas no llaman endpoints directamente, salvo `UsersPage` que consume `/api/users` y `/api/medicos`):

- `ApiService`: dispositivos, códigos QR, resultados VPH, notificaciones puntuales, folleto, reporting.
- `AuthService`: login y gestión de sesión (token en `localStorage['jwt']`).
- `UbicacionService`: CRUD y carga por lote de ubicaciones de servicios.

### `assets/`

- `assets/images/`: logos institucionales (`logoucuenca`, `logoucuencaprincipal`, `clias`, `idcr`, `iecs`, `firma`).
- `assets/fonts/`: `Lora-Regular.ttf`, `arialnarrow.ttf`.

## Flujo modular

**ADMIN:**
1. Ingresa al sistema.
2. Accede a gestión de usuarios, dispositivos, QR o servicios relacionados.

**DOCTOR:**
1. Busca dispositivos/pacientes.
2. Sube/limpia resultados PDF.
3. Registra diagnóstico y genotipos.
