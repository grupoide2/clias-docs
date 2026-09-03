---
id: db
title: Base de Datos
sidebar_position: 3
---

# Backend - Base de Datos

## Modelo de Datos

La base de datos del proyecto **IA - VPH** se implementa en **PostgreSQL 17** y organiza la información en varias tablas especializadas.

Aquí encontrarás la descripción de su estructura y los **atributos principales** de cada entidad.

## Tablas

### Atributos Comunes

Todas las tablas incluyen:

- **id** → Identificador secuencial interno *(PRIMARY KEY, AUTOINCREMENTAL)*
- **publicId** → Identificador único universal *(UUID, NOT NULL, UNIQUE)*

### CuentaUsuario

Gestión de credenciales y control de acceso de la **app móvil**.

- **nombreUsuario** → Nombre único de la cuenta *(UNIQUE, NOT NULL)*
- **contrasena** → Contraseña cifrada con BCrypt *(NOT NULL)*
- **rol** → Rol asignado *(USER / ADMIN / DOCTOR, DEFAULT USER)*
- **aceptaConsentimiento** → Aceptación de términos y condiciones *(NOT NULL)*
- **ultimaSesion** → Última petición autenticada de la cuenta
- **appVersion** → Versión del cliente móvil al momento del último login

:::caution Columnas de métricas congeladas
`sesionesExitosas`, `sesionesNoExitosas`, `tiempoUsoChat`, `inicioUsoApp`, `finUsoApp`
y `tiempoUsoApp` **ya no se escriben**. Las métricas de uso viven ahora en la tabla
**MetricaUsoPaciente**. Se conservan los valores históricos.
Ver [Migración — Métricas, Catálogos y Recursos](./migracion-metricas.md).
:::

### Administrador

Cuentas de la **web de administración** (`clias-admin`), independientes de `CuentaUsuario`.

- **nombre** → Nombre del administrador *(NOT NULL)*
- **usuario** → Usuario de acceso *(UNIQUE, NOT NULL)*
- **contrasenaHash** → Contraseña BCrypt *(NOT NULL)*
- **rol** → Rol *(DEFAULT `ADMIN`)*
- **lastLogin** → Último inicio de sesión
- **createdAt / updatedAt** → Auditoría de la cuenta

### Paciente

Información personal del usuario.

- **nombre** → Nombre completo *(NOT NULL)*
- **fechaNacimiento** → Fecha de nacimiento *(NOT NULL)*
- **pais** → País de origen *(PaisEnum, NOT NULL)*
- **lenguaMaterna** → Idioma principal *(IdiomaEnum, NOT NULL)*
- **estadoCivil** → Estado civil *(EstadoCivilEnum, NOT NULL)*
- **sexo** → Sexo *(SexoEnum, NOT NULL)*
- **identificacion** → Documento de identidad

### InformacionSocioeconomica

Contexto social y económico del usuario.

- **instruccion** → Nivel de estudios *(InstruccionEnum)*
- **ingresos** → Rango de ingresos mensuales *(IngresoEnum)*
- **trabajoRemunerado** → ¿Tiene empleo remunerado? *(OpcionesEnum)*
- **dependenciaUniversitaria** → ¿Pertenece a la Universidad de Cuenca? *(OpcionesSiNoEnum, DEFAULT NO)*
- **ocupacion** → Ocupación laboral *(texto libre; cuando pertenece a la U. proviene del catálogo [`Ocupacion`](#ocupacion))*
- **recibeBono** → ¿Recibe ayuda económica? *(OpcionesEnum)*

### DispositivoRegistrado

Asociación de kits de automuestreo a los pacientes.

- **dispositivo** → Código QR del kit *(NOT NULL)*
- **pacienteId** → FK al paciente *(NOT NULL)* + relación `paciente`
- **fechaRegistro** → Fecha en que fue registrado *(NOT NULL)*

### CodigoQR

Lotes de códigos generados desde `clias-admin` para los kits.

- **codigo** → Código único *(UNIQUE, NOT NULL)*
- **fechaExpiracion** → Fecha límite de validez *(NOT NULL)*
- **creadoEn** → Momento de generación *(NOT NULL)*

### Recurso

Material educativo referenciado por la app.

- **codigo** → Identificador del recurso *(UNIQUE, NOT NULL)*
- **tipo** → Tipo de recurso *(NOT NULL)*
- **contador_vistas** → Número de veces visto *(Long, DEFAULT 0)*

### Anamnesis

Antecedentes médicos del usuario.

- **edadPrimeraRelacionSexual** → Edad de la primera relación sexual
- **edadPrimerExamenPap** → Edad en el primer examen Papanicolaou

### SesionChat

Historial de sesiones de chat (proceso de automuestreo y chatbot Rasa).

- **tipo** → `EXAMEN` (formulario de automuestreo) o `CHATBOT` (chatbot Rasa) *(varchar, DEFAULT `EXAMEN`)*
- **origen** → `APP` o `FOLLETO` *(varchar, DEFAULT `APP`)*
- **inicio** → Momento de inicio *(NOT NULL)*
- **fin** → Momento de fin *(NOT NULL)*
- **contenido** → Información estructurada de la sesión *(TEXT)*. Para `tipo = EXAMEN` guarda las respuestas del automuestreo. Para `tipo = CHATBOT` permanece en **NULL** (no se almacena el contenido de las conversaciones, por protección de datos).

:::note Cuándo se crea una fila `EXAMEN`
La app (`form_chat.dart`) solo llama `POST /sesion-chat/usuario` al tocar
**"Automuestreo completado"**. Nunca se persisten respuestas parciales, ni al
abandonar el chat, ni al llegar a una descalificación. `SesionChatMapper.toEntity`
crea la fila siempre con `tipo = EXAMEN` y `origen = APP` (explícito); si al
reutilizar la fila del dispositivo esta no es `EXAMEN`/`APP`, `crearSesionChat`
rechaza con `BadRequestException`. Grupo folleto: `tipo = EXAMEN`, `origen = FOLLETO`.
:::
- **huboInteraccion** → Indica si la paciente hizo al menos una consulta durante la sesión de chatbot *(BOOLEAN, NOT NULL, DEFAULT false)*
- **mensajesPaciente** → Nº de mensajes/consultas de la paciente en la sesión *(INTEGER, NOT NULL, DEFAULT 0)* — no se guarda el texto

### ExamenVph

Registro de automuestreos y resultados.

- **fechaExamen** → Fecha del automuestreo *(NOT NULL)*
- **fechaResultado** → Fecha del resultado
- **dispositivo** → Código QR del kit *(UNIQUE, NOT NULL)*
- **tipo** → Tipo de archivo del resultado
- **contenido** → Archivo en bytes
- **tamano** → Tamaño del archivo en bytes
- **nombre** → Nombre del archivo *(UNIQUE)*

### SaludSexual

Datos relacionados con salud sexual y reproductiva.

- **estaEmbarazada** → Si el usuario está embarazada *(NOT NULL)*
- **fechaUltimaMenstruacion** → Fecha del primer día de la última menstruación *(NOT NULL)*
- **ultimoExamenPap** → Código del rango de tiempo del último Papanicolaou *(String, NOT NULL — código del catálogo [`RangoTiempoExamen`](#rangotiempoexamen))*
- **tiempoPruebaVph** → Código del rango de tiempo de la última prueba de VPH *(String, NOT NULL — código del catálogo [`RangoTiempoExamen`](#rangotiempoexamen))*
- **numParejasSexuales** → Número de parejas sexuales *(NOT NULL)*
- **tieneEts** → Diagnóstico o sospecha de ETS *(OpcionesEnum, NOT NULL)*
- **nombreEts** → Nombre de la ETS en caso afirmativo
- **estaMenstruando** → Si está con el período en este momento *(OpcionesSiNoEnum, opcional)*

### Evolucion

Registros de signos vitales.

- **temperatura** → Valor de la temperatura
- **pulso** → Valor del pulso
- **talla** → Valor de la talla
- **peso** → Valor del peso

### Medico

Datos de médicos registrados en la aplicación.

- **nombre** → Nombre completo *(NOT NULL)*
- **sexo** → Sexo *(SexoEnum, NOT NULL)*
- **correo** → Correo electrónico *(NOT NULL)*
- **especializacion** → Especialidad médica *(NOT NULL)*

### Archivo

Gestión de archivos en el servidor.

- **nombre** → Nombre del archivo (con extensión) *(UNIQUE, NOT NULL)*
- **tipo** → Tipo de archivo *(NOT NULL)*
- **contenido** → Contenido en bytes *(NOT NULL)*
- **tamano** → Tamaño en bytes *(NOT NULL)*

### Ubicaciones

Centros de salud, protección y atención psicológica.

- **nombre** → Nombre del establecimiento *(NOT NULL)*
- **direccion** → Dirección física *(NOT NULL)*
- **telefono** → Número telefónico *(opcional)*
- **horario** → Horario de atención *(opcional)*
- **sitioWeb** → Sitio web *(opcional)*
- **latitud / longitud** → Coordenadas geográficas *(NOT NULL)*
- **establecimiento** → Tipo de centro *(EstablecimientoEnum, DEFAULT CENTRO_SALUD)*

### DispositivoAppUsuario

Gestión de dispositivos móviles que instalan la aplicación.

- **usuarioPublicId** → Identificador del usuario asociado al dispositivo *(UUID, NOT NULL)*
- **fcmToken** → Token único generado por Firebase Cloud Messaging (FCM) *(String, NOT NULL)*
- **fechaRegistro** → Fecha en que se instaló la aplicación *(NOT NULL)*

### Notificacion

Historial de notificaciones enviadas a los usuarios.

- **cuentaUsuario** → Relación hacia la cuenta que recibe la notificación *(FOREIGN KEY → CuentaUsuario, NOT NULL)*
- **tipo_notificacion** → Clasificación de la notificación *(TipoNotificacionEnum, NOT NULL)*
- **titulo** → Título breve mostrado en la aplicación *(NOT NULL)*
- **mensaje** → Contenido completo de la notificación *(NOT NULL)*
- **tipo_accion** → Acción asociada al clic en la notificación *(TipoAccionNotificacionEnum, NOT NULL)*
- **accion** → Información extra que requiere la acción *(Opcional)*
- **fecha_creacion** → Momento en que se generó la notificación *(NOT NULL)*
- **notificacion_leida** → Estado de lectura de la notificación *(Boolean, NOT NULL)*

### EncuestaSus

Almacena las respuestas de usabilidad del sistema (escala SUS de 14 ítems).

- **item1 … item14** → Respuestas individuales *(Int, escala 1–5)*
- **cuentaUsuario** → Relación uno-a-uno con la cuenta del usuario *(FOREIGN KEY → CuentaUsuario, NOT NULL)*

:::note
Cada usuario puede completar la encuesta **una sola vez**. El endpoint `GET /api/encuesta_sus/completada/{id}` verifica si ya fue respondida.
:::

### NotificacionProgramada

Mecanismo para la planificación de notificaciones recurrentes.

- **cuentaUsuario** → Relación hacia la cuenta que recibirá la notificación *(FOREIGN KEY → CuentaUsuario, NOT NULL)*
- **tipo_notificacion** → Clasificación de la notificación *(TipoNotificacionEnum, NOT NULL)*
- **titulo** → Título breve mostrado en la aplicación *(NOT NULL)*
- **mensaje** → Contenido completo de la notificación *(NOT NULL)*
- **tipo_accion** → Acción asociada al clic en la notificación *(TipoAccionNotificacionEnum, NOT NULL)*
- **accion** → Información extra que requiere la acción *(Opcional)*
- **programacionActiva** → Indica si la programación está activa o deshabilitada *(Boolean, NOT NULL)*
- **fechaInicio** → Fecha de inicio de la programación *(NOT NULL)*
- **proxFecha** → Próxima fecha/hora programada *(NOT NULL)*
- **limiteFecha** → Fecha límite de validez de la programación *(Opcional)*

### MetricaUsoPaciente

Métricas de uso acumuladas por paciente (chatbot + app). Una fila por paciente.
Reemplaza a las columnas de métricas de `CuentaUsuario`. Ver
[Migración](./migracion-metricas.md).

- **cuentaUsuario** → Relación uno-a-uno con la cuenta *(FK → CuentaUsuario, NOT NULL, UNIQUE)*
- **paciente** → Relación uno-a-uno con el paciente *(FK → Paciente, NOT NULL, UNIQUE)*
- **sesionesChatbotTotales** → Nº de veces que la paciente entró al chatbot *(INT, DEFAULT 0)*
- **sesionesChatbotExitosas** → Sesiones con ≥ 1 mensaje de la paciente + formularios de automuestreo completados *(INT, DEFAULT 0)*
- **totalMensajesPaciente** → Total de mensajes enviados por la paciente al chatbot *(INT, DEFAULT 0)*
- **tiempoUsoChatSeg** → Tiempo acumulado de uso del chatbot, en segundos *(BIGINT, DEFAULT 0)*
- **tiempoUsoAppSeg** → Tiempo acumulado de uso de la app, en segundos *(BIGINT, DEFAULT 0)*
- **primerUsoApp** → Primer ingreso a la app *(se fija una sola vez)*
- **ultimoUsoApp** → Último ingreso/salida de la app
- **tiempo_uso_app_hms / tiempo_uso_chat_hms** *(solo BD)* → columnas generadas `interval` (`00:06:18`) derivadas de las de segundos, para consultar el tiempo legible en un cliente SQL. No están en la entidad; el backend no las usa. Ver [Migración](./migracion-metricas.md#columnas-de-lectura-hhmmss-opcional-solo-para-consultar-en-la-bd).

### Ocupacion

Catálogo de ocupaciones para la ficha socioeconómica, administrado desde `clias-admin`.

- **nombre** → Nombre de la ocupación *(UNIQUE, NOT NULL)*
- **activo** → Si aparece en los formularios *(BOOLEAN, DEFAULT true)*
- **soloUniversidad** → Aplica cuando la paciente pertenece a la Universidad de Cuenca *(BOOLEAN, DEFAULT false)*
- **orden** → Orden de aparición *(INT, DEFAULT 0)*

### RangoTiempoExamen

Catálogo de rangos de tiempo de las preguntas de salud sexual. Reemplaza al enum
`RangoTiempoEnum`. Administrado desde `clias-admin`. **Hay un catálogo por
pregunta**, discriminado por la columna `pregunta`; el `codigo` lleva prefijo de
la pregunta para mantenerse único global.

- **pregunta** → `MENSTRUACION` \| `PAPANICOLAOU` \| `VPH` *(varchar(20), NOT NULL, DEFAULT `'PAPANICOLAOU'`)*
- **codigo** → Código estable persistido en `SaludSexual` (ej. `PAP_MENOS_1_ANIO`, `VPH_NUNCA`, `MENST_3_A_6_MESES`) *(UNIQUE, NOT NULL)*
- **etiqueta** → Texto mostrado al usuario (ej. "Menos de 1 año") *(NOT NULL)*
- **activo** → Si aparece en los formularios *(BOOLEAN, DEFAULT true)*
- **orden** → Orden de aparición *(INT, DEFAULT 0)*

Endpoint `GET /rango-tiempo-examen` acepta `?pregunta=MENSTRUACION|PAPANICOLAOU|VPH`
para traer solo el catálogo de esa pregunta.

| Pregunta | Códigos seed |
|---|---|
| `MENSTRUACION` | `MENST_3_A_6_MESES`, `MENST_6_A_12_MESES`, `MENST_MAS_12_MESES` |
| `PAPANICOLAOU` | `PAP_MENOS_1_ANIO`, `PAP_1_A_3_ANIOS`, `PAP_MAS_3_ANIOS`, `PAP_NUNCA` |
| `VPH` | `VPH_MENOS_1_ANIO`, `VPH_1_A_3_ANIOS`, `VPH_MAS_3_ANIOS`, `VPH_NUNCA` |

La pregunta de menstruación agrega en la UI la opción fija **"Escribir la fecha
exacta"** (no sale del catálogo); su valor se guarda como texto libre en
`SaludSexual.fechaUltimaMenstruacion`, igual que la etiqueta elegida cuando no es
fecha exacta.

### RecursoMultimedia

Recursos multimedia administrados (video de uso de la app, capturas del sitio web).
El binario vive en disco (`{app.recursos.dir}/{public_id}`); aquí solo va la metadata.

- **slug** → Identificador estable (ej. `video_uso_app`, `blog_vph`, `captura_web_1`) *(UNIQUE, NOT NULL)*
- **tipo** → `VIDEO` / `IMAGEN` *(TipoArchivoEnum, NOT NULL)*
- **destino** → Para quién es: `APP` (clias-app) \| `WEB` (clias-web) *(DestinoRecursoEnum, NOT NULL, DEFAULT `APP`)*
- **categoria** → Agrupador libre (`Video educativo`, `Portada de blog`, `Captura de la app`…) *(varchar(40), opcional)*
- **descripcion** → Texto para el admin: qué es y en qué pantalla aparece *(text, opcional)*
- **nombreArchivo** → Nombre original del archivo *(NOT NULL)*
- **contentType** → MIME type *(NOT NULL)*
- **tamano** → Tamaño en bytes *(BIGINT, DEFAULT 0)*
- **activo** → Si se sirve públicamente *(BOOLEAN, DEFAULT true)*
- **orden** → Orden de aparición *(INT, DEFAULT 0)*

El admin (`clias-admin` → Recursos multimedia) trae un catálogo estático de todos
los slugs conocidos de app y web, agrupados por `destino`, con su descripción y si
ya tienen archivo subido o siguen usando el asset embebido.

## Tipos Enumerados (Enums)

| Enum | Valores |
|------|---------|
| **IdiomaEnum** | ESPANOL, INGLES, OTRO |
| **SexoEnum** | MASCULINO, FEMENINO, OTRO |
| **EstadoCivilEnum** | SOLTERO, CASADO, VIUDO, DIVORCIADO, UNION_LIBRE |
| **ZonaResidencialEnum** | RURAL, URBANA |
| **PaisEnum** | ECUADOR, COLOMBIA, VENEZUELA, PERU, ARGENTINA, BOLIVIA, URUGUAY, CHILE, BRAZIL |
| **InstruccionEnum** | NINGUNO, CENTRO_DE_ALFABETIZACION, PRIMARIA, SECUNDARIA, UNIVERSITARIA |
| **IngresoEnum** | MENOR_450, ENTRE_450_900, ENTRE_901_1350, MAYOR_1350 |
| **OpcionesEnum** | SI, NO, NOSE |
| **OpcionesSiNoEnum** | SI, NO |
| **EstablecimientoEnum** | CENTRO_SALUD, CENTRO_PROTECCION, ATENCION_PSICOLOGICA |
| **TipoNotificacionEnum** | RESULTADO, RECORDATORIO_NO_EXAMEN, RECORDATORIO_NO_ENTREGA_DISPOSITIVO, BIENVENIDA, NUEVO_RECURSO |
| **TipoAccionNotificacionEnum** | VER_RESULTADOS, VER_VIDEO, VENTANA_EMERGENTE, VENTANA_RECURSOS, AUTOMUESTREO |
| **TipoArchivoEnum** | ZIP, IMAGEN, PDF, EXCEL, WORD, VIDEO, DESCONOCIDO |
| **DestinoRecursoEnum** | APP, WEB |

:::note `RangoTiempoEnum` fue reemplazado
Los rangos de tiempo ahora son la tabla **RangoTiempoExamen** (catálogo editable
desde `clias-admin`), no un enum. Hay **un catálogo por pregunta** (columna
`pregunta`): `MENSTRUACION`, `PAPANICOLAOU` y `VPH`, cada uno con sus propios
códigos prefijados. Ver [RangoTiempoExamen](#rangotiempoexamen).
:::

## Modelo Entidad-Relación

Diagrama entidad-relación (ER) de la base de datos:

![Modelo ER](/img/modelo-er.png)

:::note
Imagen reescalada para la documentación. El archivo original a resolución completa está en el repositorio del backend (`clias-backend/`) y puede solicitarse al equipo de desarrollo.
:::
