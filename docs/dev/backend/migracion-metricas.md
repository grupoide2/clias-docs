---
id: migracion-metricas
title: Migración — Métricas, Catálogos y Recursos
sidebar_position: 7
---

# Migración: métricas de uso, catálogos dinámicos y recursos multimedia

Resumen de los cambios de base de datos y despliegue introducidos en el bloque de
mejoras **métricas / catálogos / automuestreo / recursos**. Sirve como guía para
subir la versión a producción.

El backend usa `spring.jpa.hibernate.ddl-auto=update`: al desplegar, Hibernate crea
las tablas y columnas nuevas automáticamente. Las secciones **DDL explícito** son
la alternativa recomendada para producción; los **backfill** hay que ejecutarlos a
mano una sola vez.

## 0. Script consolidado para producción

**Orden de despliegue:**

1. Subir el nuevo JAR del backend y dejarlo **arrancar una vez**. Hibernate
   (`ddl-auto=update`) crea: tablas `metrica_uso_paciente`, `ocupacion`,
   `rango_tiempo_examen`, `recurso_multimedia`; columnas `sesion_chat.hubo_interaccion`,
   `sesion_chat.mensajes_paciente`, `sesion_chat.tipo`, `sesion_chat.origen`,
   `rango_tiempo_examen.pregunta`, `recurso_multimedia.destino/categoria/descripcion`,
   `informacion_socioeconomica.ocupacion`. `CatalogoSeeder` siembra `ocupacion` (6)
   y `rango_tiempo_examen` (11) **si están vacías**.
2. Correr este script (una sola vez; es **idempotente** y re-ejecutable).
3. Ajustes de `application.properties` en el servidor: `app.recursos.dir` (carpeta
   con permisos de escritura y respaldada), `spring.servlet.multipart.max-file-size=60MB`
   y `max-request-size=60MB`.

```sql
-- ===========================================================================
-- MIGRACIÓN A PRODUCCIÓN — métricas / catálogos / automuestreo / recursos
-- PostgreSQL 12+ (prod: 17). Ejecutar tras el primer arranque del nuevo backend.
-- ===========================================================================
BEGIN;

-- 1) salud_sexual — quitar los CHECK fósiles del antiguo enum RangoTiempoEnum.
--    (rechazan los códigos nuevos PAP_* / VPH_* → "Ha ocurrido un error inesperado")
ALTER TABLE salud_sexual DROP CONSTRAINT IF EXISTS salud_sexual_tiempo_prueba_vph_check;
ALTER TABLE salud_sexual DROP CONSTRAINT IF EXISTS salud_sexual_ultimo_examen_pap_check;

-- 2) rango_tiempo_examen — catálogo por pregunta (11 filas prefijadas).
--    El seeder ya lo hace si la tabla estaba vacía; esto lo deja correcto
--    aunque hubiera filas viejas.
DELETE FROM rango_tiempo_examen
WHERE codigo IN ('MENOS_1_ANIO','DE_1_A_3_ANIOS','MAS_3_ANIOS','NUNCA',
                 'DE_3_A_6_MESES','DE_6_A_12_MESES','MAS_12_MESES');

INSERT INTO rango_tiempo_examen (public_id, pregunta, codigo, etiqueta, activo, orden) VALUES
  (gen_random_uuid(), 'MENSTRUACION', 'MENST_3_A_6_MESES',  'Entre 3 y 6 meses',  true, 10),
  (gen_random_uuid(), 'MENSTRUACION', 'MENST_6_A_12_MESES', 'Entre 6 y 12 meses', true, 20),
  (gen_random_uuid(), 'MENSTRUACION', 'MENST_MAS_12_MESES', 'Más de 12 meses',    true, 30),
  (gen_random_uuid(), 'PAPANICOLAOU', 'PAP_MENOS_1_ANIO',   'Menos de 1 año',     true, 10),
  (gen_random_uuid(), 'PAPANICOLAOU', 'PAP_1_A_3_ANIOS',    'De 1 a 3 años',      true, 20),
  (gen_random_uuid(), 'PAPANICOLAOU', 'PAP_MAS_3_ANIOS',    'Más de 3 años',      true, 30),
  (gen_random_uuid(), 'PAPANICOLAOU', 'PAP_NUNCA',          'Nunca',              true, 40),
  (gen_random_uuid(), 'VPH',          'VPH_MENOS_1_ANIO',   'Menos de 1 año',     true, 10),
  (gen_random_uuid(), 'VPH',          'VPH_1_A_3_ANIOS',    'De 1 a 3 años',      true, 20),
  (gen_random_uuid(), 'VPH',          'VPH_MAS_3_ANIOS',    'Más de 3 años',      true, 30),
  (gen_random_uuid(), 'VPH',          'VPH_NUNCA',          'Nunca',              true, 40)
ON CONFLICT (codigo) DO NOTHING;

UPDATE rango_tiempo_examen SET pregunta = 'MENSTRUACION' WHERE codigo LIKE 'MENST%';
UPDATE rango_tiempo_examen SET pregunta = 'PAPANICOLAOU' WHERE codigo LIKE 'PAP%';
UPDATE rango_tiempo_examen SET pregunta = 'VPH'          WHERE codigo LIKE 'VPH%';

-- 3) ocupacion — semilla (por si el seeder no corrió; UNIQUE(nombre))
INSERT INTO ocupacion (public_id, nombre, activo, solo_universidad, orden) VALUES
  (gen_random_uuid(), 'CONTRATO DE SERVICIO',    true, true, 10),
  (gen_random_uuid(), 'TRABAJADORA',             true, true, 20),
  (gen_random_uuid(), 'EMPLEADA',                true, true, 30),
  (gen_random_uuid(), 'SERVICIOS PROFESIONALES', true, true, 40),
  (gen_random_uuid(), 'DOCENTE',                 true, true, 50),
  (gen_random_uuid(), 'ADMINISTRATIVA',          true, true, 60)
ON CONFLICT (nombre) DO NOTHING;

-- 4) metrica_uso_paciente — backfill histórico desde las columnas congeladas
--    de cuentas_usuario. Re-ejecutable por el NOT EXISTS.
INSERT INTO metrica_uso_paciente
  (public_id, cuenta_usuario_id, paciente_id, sesiones_chatbot_totales, sesiones_chatbot_exitosas,
   total_mensajes_paciente, tiempo_uso_chat_seg, tiempo_uso_app_seg,
   primer_uso_app, ultimo_uso_app, creado_en, actualizado_en)
SELECT
  gen_random_uuid(), c.id, c.paciente_id,
  COALESCE(c.sesiones_exitosas,0) + COALESCE(c.sesiones_no_exitosas,0),
  COALESCE(c.sesiones_exitosas,0),
  0,
  ROUND(COALESCE(c.tiempo_uso_chat,0) * 60)::bigint,
  ROUND(COALESCE(c.tiempo_uso_app,0)  * 60)::bigint,
  c.inicio_uso_app, c.fin_uso_app, now(), now()
FROM cuentas_usuario c
WHERE c.paciente_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM metrica_uso_paciente m WHERE m.cuenta_usuario_id = c.id);

-- 5) metrica_uso_paciente — columnas generadas de lectura hh:mm:ss.
--    Hibernate NO las crea (no están en la entidad).
ALTER TABLE metrica_uso_paciente
  ADD COLUMN IF NOT EXISTS tiempo_uso_app_hms  interval
    GENERATED ALWAYS AS (make_interval(secs => tiempo_uso_app_seg))  STORED,
  ADD COLUMN IF NOT EXISTS tiempo_uso_chat_hms interval
    GENERATED ALWAYS AS (make_interval(secs => tiempo_uso_chat_seg)) STORED;

-- 6) recurso_multimedia — marcar destino WEB en los slugs del sitio
--    (no-op si la tabla está vacía / recién creada).
UPDATE recurso_multimedia
SET destino = 'WEB'
WHERE destino <> 'WEB'
  AND (slug LIKE 'captura_web%' OR slug LIKE 'web_%');

-- 7) sesion_chat — clasificar filas históricas: Hibernate añade tipo/origen con
--    default 'EXAMEN'/'APP'; las sesiones viejas de chatbot no tienen examen.
UPDATE sesion_chat SET tipo = 'CHATBOT'
WHERE examen_vph_id IS NULL AND tipo = 'EXAMEN';

-- 8) notificacion_programada — cortar "realízate el examen" para pacientes
--    que ya tienen un examen registrado.
UPDATE notificacion_programada np
SET programacion_activa = false
WHERE np.tipo_notificacion = 'RECORDATORIO_NO_EXAMEN'
  AND np.programacion_activa = true
  AND EXISTS (
      SELECT 1 FROM cuentas_usuario cu
      JOIN sesion_chat sc ON sc.paciente_id = cu.paciente_id
      JOIN examen_vph ev  ON ev.sesion_chat_id = sc.id
      WHERE cu.id = np.cuenta_usuario_id
  );

COMMIT;
```

**Verificación (fuera de la transacción):**

```sql
-- Solo deben quedar los CHECK legítimos de enum
SELECT conname FROM pg_constraint
WHERE conrelid = 'salud_sexual'::regclass AND contype = 'c';   -- esta_menstruando, tiene_ets

SELECT pregunta, codigo, etiqueta, activo
FROM rango_tiempo_examen ORDER BY pregunta, orden;             -- 11 filas (3/4/4)

SELECT count(*) AS filas_metrica FROM metrica_uso_paciente;
SELECT tiempo_uso_app_seg, tiempo_uso_app_hms,
       tiempo_uso_chat_seg, tiempo_uso_chat_hms
FROM metrica_uso_paciente ORDER BY id LIMIT 10;               -- 378 → 00:06:18

SELECT destino, count(*) FROM recurso_multimedia GROUP BY destino;
SELECT tipo, count(*)    FROM sesion_chat        GROUP BY tipo;
```

Las secciones siguientes son el detalle por área.

## 1. Tabla nueva `metrica_uso_paciente`

Una fila por paciente. Reemplaza a las columnas de métricas de `cuentas_usuario`,
que quedan **congeladas** (ya no se escriben; se conservan los valores históricos).

```sql
ALTER TABLE sesion_chat
  ADD COLUMN hubo_interaccion  boolean NOT NULL DEFAULT false,
  ADD COLUMN mensajes_paciente integer NOT NULL DEFAULT 0;

CREATE TABLE metrica_uso_paciente (
  id                        bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  public_id                 uuid   NOT NULL UNIQUE,
  cuenta_usuario_id         bigint NOT NULL UNIQUE REFERENCES cuentas_usuario(id),
  paciente_id               bigint NOT NULL UNIQUE REFERENCES pacientes(id),
  sesiones_chatbot_totales  integer NOT NULL DEFAULT 0,
  sesiones_chatbot_exitosas integer NOT NULL DEFAULT 0,
  total_mensajes_paciente   integer NOT NULL DEFAULT 0,
  tiempo_uso_chat_seg       bigint  NOT NULL DEFAULT 0,
  tiempo_uso_app_seg        bigint  NOT NULL DEFAULT 0,
  primer_uso_app            timestamp(6),
  ultimo_uso_app            timestamp(6),
  creado_en                 timestamp(6),
  actualizado_en            timestamp(6)
);
```

### Backfill (una vez, tras crear el esquema)

```sql
INSERT INTO metrica_uso_paciente
  (public_id, cuenta_usuario_id, paciente_id, sesiones_chatbot_totales, sesiones_chatbot_exitosas,
   total_mensajes_paciente, tiempo_uso_chat_seg, tiempo_uso_app_seg,
   primer_uso_app, ultimo_uso_app, creado_en, actualizado_en)
SELECT
  gen_random_uuid(), c.id, c.paciente_id,
  COALESCE(c.sesiones_exitosas,0) + COALESCE(c.sesiones_no_exitosas,0),
  COALESCE(c.sesiones_exitosas,0),
  0,
  ROUND(COALESCE(c.tiempo_uso_chat,0) * 60)::bigint,
  ROUND(COALESCE(c.tiempo_uso_app,0)  * 60)::bigint,
  c.inicio_uso_app, c.fin_uso_app, now(), now()
FROM cuentas_usuario c
WHERE c.paciente_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM metrica_uso_paciente m WHERE m.cuenta_usuario_id = c.id);
```

### Columnas de lectura `hh:mm:ss` (opcional, solo para consultar en la BD)

`tiempo_uso_app_seg` / `tiempo_uso_chat_seg` se guardan en **segundos** (BIGINT)
porque son la métrica: se promedian y suman (`AVG`, `SUM`). Para leerlas como
tiempo en un cliente SQL se agregan dos **columnas generadas** `interval`,
derivadas automáticamente de las de segundos:

```sql
ALTER TABLE metrica_uso_paciente
  ADD COLUMN tiempo_uso_app_hms  interval GENERATED ALWAYS AS (make_interval(secs => tiempo_uso_app_seg))  STORED,
  ADD COLUMN tiempo_uso_chat_hms interval GENERATED ALWAYS AS (make_interval(secs => tiempo_uso_chat_seg)) STORED;
```

- Se muestran como `00:06:18`, `00:25:26`, … y siempre están en sync (las calcula
  Postgres a partir de `*_seg`; no se escriben a mano).
- **No están mapeadas en `MetricaUsoPacienteEntity`** — el backend las ignora;
  `spring.jpa.hibernate.ddl-auto=update` no las toca. Si en el futuro se quieren
  exponer por API, mapearlas como `@Column(insertable = false, updatable = false)`.
- Requiere PostgreSQL 12+ (columnas generadas STORED). En este proyecto: PG 17.
- Verificación:
  ```sql
  SELECT tiempo_uso_app_seg, tiempo_uso_app_hms,
         tiempo_uso_chat_seg, tiempo_uso_chat_hms
  FROM metrica_uso_paciente ORDER BY id;
  ```

### Columnas congeladas en `cuentas_usuario`

`sesiones_exitosas`, `sesiones_no_exitosas`, `tiempo_uso_chat`, `inicio_uso_app`,
`fin_uso_app`, `tiempo_uso_app`. Ya no se escriben. Su eliminación se decidirá más
adelante, cuando el panel y los reportes dependan solo de `metrica_uso_paciente`.

### Reglas de escritura

| Evento | Efecto |
|--------|--------|
| Ingreso al chatbot (`POST /sesion-chat/chatbot/inicio`) | `sesiones_chatbot_totales += 1` |
| Fin de sesión de chatbot (`PUT /sesion-chat/chatbot/{id}/fin`, body `{ fin, mensajesPaciente }`) | `sesion_chat.hubo_interaccion = mensajesPaciente ≥ 1`; `sesion_chat.mensajes_paciente`; `total_mensajes_paciente += mensajesPaciente`; `tiempo_uso_chat_seg += (fin - inicio)`; `sesiones_chatbot_exitosas += 1` si `mensajesPaciente ≥ 1` |
| Formulario de automuestreo completado (`POST /metricas/automuestreo/completado`) | `sesiones_chatbot_exitosas += 1` (contador combinado) |
| Tiempo de app (`PUT /usuarios/app-time/{publicId}`) | `tiempo_uso_app_seg += tiempo`; `primer_uso_app` se fija una sola vez; `ultimo_uso_app` se actualiza |

## 2. Catálogos dinámicos

### `ocupacion`

```sql
CREATE TABLE ocupacion (
  id                bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  public_id         uuid   NOT NULL UNIQUE,
  nombre            varchar NOT NULL UNIQUE,
  activo            boolean NOT NULL DEFAULT true,
  solo_universidad  boolean NOT NULL DEFAULT false,
  orden             integer NOT NULL DEFAULT 0,
  creado_en         timestamp(6),
  actualizado_en    timestamp(6)
);
```

Se siembra **solo si la tabla está vacía** (`CatalogoSeeder`, bootstrap de primer
arranque): `CONTRATO DE SERVICIO`, `TRABAJADORA`, `EMPLEADA`, `SERVICIOS
PROFESIONALES`, `DOCENTE`, `ADMINISTRATIVA` (todas `solo_universidad = true`). Si
ya hay al menos una fila, el seeder no toca nada — las altas/bajas del admin
persisten entre reinicios.

### `rango_tiempo_examen`

Reemplaza al enum `RangoTiempoEnum`. Los campos `salud_sexual.ultimo_examen_pap` y
`salud_sexual.tiempo_prueba_vph` pasan de enum a **string con el código del
catálogo** (misma columna `varchar`).

:::danger Borrar los CHECK viejos del enum
Cuando esos campos eran `@Enumerated`, Hibernate creó CHECK constraints con los
valores del enum (`MENOS_1_ANIO`, `DE_1_A_3_ANIOS`, `MAS_3_ANIOS`, `NUNCA`).
`ddl-auto=update` **no los borra**. Con los códigos por pregunta (`PAP_NUNCA`,
`VPH_NUNCA`, …) el insert de `salud_sexual` falla con
`violates check constraint "salud_sexual_tiempo_prueba_vph_check"` → el chatbot /
"Automuestreo completado" muestra "Ha ocurrido un error inesperado".

```sql
-- 1. Ver los CHECK existentes (por si los nombres difieren)
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'salud_sexual'::regclass AND contype = 'c';

-- 2. Borrar solo los de pap / vph (NO los de esta_menstruando / tiene_ets)
ALTER TABLE salud_sexual DROP CONSTRAINT IF EXISTS salud_sexual_tiempo_prueba_vph_check;
ALTER TABLE salud_sexual DROP CONSTRAINT IF EXISTS salud_sexual_ultimo_examen_pap_check;
```

No hace falta reiniciar el backend: la columna ya es `varchar` y Hibernate no
recrea el CHECK sobre un `String`.
:::

```sql
CREATE TABLE rango_tiempo_examen (
  id             bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  public_id      uuid    NOT NULL UNIQUE,
  pregunta       varchar(20) NOT NULL DEFAULT 'PAPANICOLAOU',
  codigo         varchar NOT NULL UNIQUE,
  etiqueta       varchar NOT NULL,
  activo         boolean NOT NULL DEFAULT true,
  orden          integer NOT NULL DEFAULT 0,
  creado_en      timestamp(6),
  actualizado_en timestamp(6)
);
```

**Hay un catálogo por pregunta** (`pregunta` = `MENSTRUACION` \| `PAPANICOLAOU` \|
`VPH`). El `codigo` lleva prefijo de la pregunta para seguir siendo único global,
así no hace falta tocar la constraint `UNIQUE(codigo)`. Seed (`CatalogoSeeder`,
**solo si `rango_tiempo_examen` está vacía**; si ya hay filas no siembra nada, para
que las eliminaciones del admin persistan entre reinicios):

| `pregunta` | `codigo` / `etiqueta` |
|---|---|
| `MENSTRUACION` | `MENST_3_A_6_MESES` "Entre 3 y 6 meses" · `MENST_6_A_12_MESES` "Entre 6 y 12 meses" · `MENST_MAS_12_MESES` "Más de 12 meses" |
| `PAPANICOLAOU` | `PAP_MENOS_1_ANIO` "Menos de 1 año" · `PAP_1_A_3_ANIOS` "De 1 a 3 años" · `PAP_MAS_3_ANIOS` "Más de 3 años" · `PAP_NUNCA` "Nunca" |
| `VPH` | `VPH_MENOS_1_ANIO` "Menos de 1 año" · `VPH_1_A_3_ANIOS` "De 1 a 3 años" · `VPH_MAS_3_ANIOS` "Más de 3 años" · `VPH_NUNCA` "Nunca" |

El backend valida el código recibido contra el catálogo activo (cualquier
pregunta) al registrar la sesión de automuestreo (app y folleto). Tanto
`clias-app` (chat guiado offline, `form_chat.dart` + `RangoTiempoService`) como
`clias-admin` (folleto) cargan las opciones con
`GET /rango-tiempo-examen?pregunta=...&soloActivos=true`, con fallback embebido y
caché si no hay red. La app reescribe las `quick_replies` de `offline_form.json`
con el catálogo al abrir el formulario y al volver del segundo plano; el folleto
recarga los catálogos al reenfocar la pestaña o con el botón ↻.

La pregunta de menstruación agrega en la UI la opción fija **"Escribir la fecha
exacta"** (no sale del catálogo). Su valor —la fecha escrita, o la etiqueta del
rango elegido— se guarda como texto libre en `salud_sexual.fecha_ultima_menstruacion`.

#### Migración de un catálogo ya existente (una sola vez)

Si la tabla ya tenía filas (las viejas sin prefijo, o las 11 prefijadas ya
sembradas), `ddl-auto=update` solo agrega la columna `pregunta` (con default
`'PAPANICOLAOU'`) y **el seeder no vuelve a insertar nada** porque la tabla no está
vacía. Hay que dejar el catálogo correcto a mano — una sola vez:

1. Borra las filas viejas sin prefijo (botón de papelera en `clias-admin` →
   Catálogos → Rangos de tiempo, o con SQL):

   ```sql
   DELETE FROM rango_tiempo_examen
   WHERE codigo IN ('MENOS_1_ANIO','DE_1_A_3_ANIOS','MAS_3_ANIOS','NUNCA',
                    'DE_3_A_6_MESES','DE_6_A_12_MESES','MAS_12_MESES');
   ```

2. Si faltan las 11 filas nuevas, insértalas (o crea cada una desde `clias-admin`):

   ```sql
   INSERT INTO rango_tiempo_examen (public_id, pregunta, codigo, etiqueta, activo, orden) VALUES
     (gen_random_uuid(), 'MENSTRUACION', 'MENST_3_A_6_MESES',  'Entre 3 y 6 meses',  true, 10),
     (gen_random_uuid(), 'MENSTRUACION', 'MENST_6_A_12_MESES', 'Entre 6 y 12 meses', true, 20),
     (gen_random_uuid(), 'MENSTRUACION', 'MENST_MAS_12_MESES', 'Más de 12 meses',    true, 30),
     (gen_random_uuid(), 'PAPANICOLAOU', 'PAP_MENOS_1_ANIO',   'Menos de 1 año',     true, 10),
     (gen_random_uuid(), 'PAPANICOLAOU', 'PAP_1_A_3_ANIOS',    'De 1 a 3 años',      true, 20),
     (gen_random_uuid(), 'PAPANICOLAOU', 'PAP_MAS_3_ANIOS',    'Más de 3 años',      true, 30),
     (gen_random_uuid(), 'PAPANICOLAOU', 'PAP_NUNCA',          'Nunca',              true, 40),
     (gen_random_uuid(), 'VPH',          'VPH_MENOS_1_ANIO',   'Menos de 1 año',     true, 10),
     (gen_random_uuid(), 'VPH',          'VPH_1_A_3_ANIOS',    'De 1 a 3 años',      true, 20),
     (gen_random_uuid(), 'VPH',          'VPH_MAS_3_ANIOS',    'Más de 3 años',      true, 30),
     (gen_random_uuid(), 'VPH',          'VPH_NUNCA',          'Nunca',              true, 40)
   ON CONFLICT (codigo) DO NOTHING;
   ```

Los registros históricos de `salud_sexual` que guardaron los códigos viejos **no se
revalidan** ni se tocan; solo las sesiones nuevas exigen un código del catálogo
actual.

## 3. Recursos multimedia

```sql
CREATE TABLE recurso_multimedia (
  id             bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  public_id      uuid    NOT NULL UNIQUE,
  slug           varchar NOT NULL UNIQUE,
  tipo           varchar NOT NULL,               -- TipoArchivoEnum (VIDEO / IMAGEN)
  destino        varchar(10) NOT NULL DEFAULT 'APP', -- DestinoRecursoEnum (APP / WEB)
  categoria      varchar(40),
  descripcion    text,
  nombre_archivo varchar NOT NULL,
  content_type   varchar NOT NULL,
  tamano         bigint  NOT NULL DEFAULT 0,
  activo         boolean NOT NULL DEFAULT true,
  orden          integer NOT NULL DEFAULT 0,
  creado_en      timestamp(6),
  actualizado_en timestamp(6)
);
```

Si la tabla ya existía, `ddl-auto=update` agrega `destino` (con default `'APP'`),
`categoria` y `descripcion`. Las filas previas quedan como `destino = 'APP'`; ajusta
las de web con `UPDATE recurso_multimedia SET destino='WEB' WHERE slug LIKE 'captura_web%' OR slug LIKE 'web_%';`.

- El **binario vive en disco**, no en la BD: `{app.recursos.dir}/{public_id}`.
  Propiedad `app.recursos.dir` (por defecto `storage/recursos`). Añadir `storage/`
  a `.gitignore` y a la política de respaldos del servidor.
- Multipart subido a **60 MB** (`spring.servlet.multipart.max-file-size` y
  `max-request-size`) porque los videos pesan 12–33 MB.
- `destino` distingue para quién es cada recurso: `APP` (clias-app) o `WEB`
  (clias-web). `clias-admin` → Recursos multimedia muestra el catálogo completo de
  slugs conocidos agrupado por destino, con `descripcion` y si ya tienen archivo.
- Slugs: `video_uso_app` (video guía del automuestreo — chatbot y dashboard),
  `video_tutorial_app` (tutorial general de uso — botón de ayuda "?" de la
  barra superior), `app_video_*` y `blog_*` (los consume la app);
  `web_video_*` y `captura_web_1..8` (los consume `clias-web`). Ambos
  `video_uso_app` y `video_tutorial_app` tienen fallback embebido en el APK
  (`assets/videos/automuestreo.mp4` y `assets/videos/sample.mp4`
  respectivamente) si el backend no tiene el recurso publicado — ver
  `RecursoService` en `clias-app`.

## 4. Corte del recordatorio "realízate el examen"

Corrección: `RECORDATORIO_NO_EXAMEN` ya no se sigue enviando tras completar el
automuestreo.

- `ExamenVphRepository.existsExamenByPacienteId` ahora navega `e.sesionChat.paciente.id`
  (poblado) en vez de `e.saludSexual.paciente.id` (siempre `NULL`).
- `SesionChatService.crearSesionChat` desactiva de inmediato las programadas
  `RECORDATORIO_NO_EXAMEN` de la paciente al completar el automuestreo.
- `PacienteService.registrarDispositivo` no crea el recordatorio si la paciente ya
  tiene un examen.

### Limpieza única en producción

```sql
UPDATE notificacion_programada np
SET programacion_activa = false
WHERE np.tipo_notificacion = 'RECORDATORIO_NO_EXAMEN'
  AND np.programacion_activa = true
  AND EXISTS (
      SELECT 1 FROM cuentas_usuario cu
      JOIN sesion_chat sc ON sc.paciente_id = cu.paciente_id
      JOIN examen_vph ev  ON ev.sesion_chat_id = sc.id
      WHERE cu.id = np.cuenta_usuario_id
  );
```
