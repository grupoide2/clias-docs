---
id: hl7
title: FHIR/HL7
sidebar_position: 10
---

# FHIR/HL7 – Interoperabilidad de Datos Médicos

## ¿Qué es HL7/FHIR?

**HL7** (Health Level Seven) es el estándar internacional para intercambiar información clínica entre sistemas de salud. **FHIR R4** (Fast Healthcare Interoperability Resources) es su implementación moderna basada en REST + JSON.

En CLIAS, los endpoints FHIR permiten que **sistemas de salud externos** (hospitales, laboratorios, plataformas nacionales de salud) consuman los datos clínicos del proyecto en un formato estandarizado e interoperable.

---

## Implementación

Integrado directamente en **`clias-backend`** usando **HAPI FHIR R4** (`ca.uhn.hapi.fhir:hapi-fhir-structures-r4:6.2.0`). Son **7 controladores de solo lectura** en el paquete `controller` (`*FhirController.kt`), cada uno con un mapper en `model/mapper` (`*FhirMapper.kt`) que transforma la entidad JPA a recursos FHIR.

Cada controlador crea su propio `FhirContext.forR4()` y serializa con `newJsonParser().setPrettyPrint(true)`; devuelve un `String` con `Content-Type: application/fhir+json`.

---

## Endpoints disponibles

Cada endpoint devuelve un **FHIR Bundle** de tipo `collection` (`Bundle.BundleType.COLLECTION`):

- `GET /fhir/{recurso}/{publicId}` → bundle del recurso; **404** (`ResponseStatusException`) si el `publicId` no existe.
- `GET /fhir/{recurso}/all` → un bundle "maestro" que aplana las entradas de todos los registros.

| Recurso | Ruta base | Contenido del bundle |
|---------|-----------|----------------------|
| Paciente | `/fhir/paciente` | `Patient` |
| Médico | `/fhir/medico` | `Practitioner` |
| Examen VPH | `/fhir/examen-vph` | `DiagnosticReport` + `Observation` (riesgo) + `Observation` por cada genotipo |
| Salud sexual | `/fhir/salud-sexual` | `QuestionnaireResponse` + `Observation` (embarazo) + `Observation` (FUM) |
| Sesión de chat | `/fhir/sesion-chat` | `Encounter` + `Communication` |
| Evolución | `/fhir/evolucion` | `Observation` por cada signo vital presente |
| Archivo | `/fhir/archivo` | `DocumentReference` |

---

## Visor FHIR (`clias-web`)

La capa de exploración es la página **`/hl7`** del sitio **`clias-web`** (`src/pages/hl7.astro`): HTML + JavaScript, sin framework. Consume los mismos endpoints `/fhir/**` del backend.

- `API_BASE` está vacío (`''`) → usa rutas **relativas**, por lo que el visor debe servirse desde el mismo origen que la API (`https://clias.ucuenca.edu.ec`). Para desarrollo se puede fijar `const API_BASE = 'http://localhost:9001'`.
- **Login**: `POST ${API_BASE}/api/auth/login` con `{ usuario, contrasena }`; el usuario autenticado se guarda en `localStorage['authUser']`.
- **Consulta**: selector de **Entidad** (`paciente`, `medico`, `archivo`, `sesion-chat`, `salud-sexual`, `examen-vph` — nota: **`evolucion` no está en el selector**) + modo **Todos** (`/fhir/{entidad}/all`) o **Por UUID** (`/fhir/{entidad}/{uuid}`).
- La respuesta se muestra como **JSON crudo** y como **resumen legible** por cada entrada del Bundle.

:::warning
El `fetch` a `/fhir/**` **no adjunta** el header `Authorization`, aunque esos endpoints están bajo `authenticated()` en `SecurityConfig`. Funciona solo si el despliegue deja `/fhir/**` abierto; conviene alinear (enviar el token guardado o abrir la ruta explícitamente).
:::

### Inicio de sesión

![Pantalla de inicio de sesión del visor FHIR](/img/hl7/inicio_hl7.png)

### Pantalla principal (selección de entidad y tipo de consulta)

![Visor FHIR: selector de entidad y modo de consulta](/img/hl7/categorias_hl7.png)

### Ejemplo de resultado

![Visor FHIR: JSON y resumen de un recurso consultado](/img/hl7/ejemplo_hl7.png)

---

## Campos mapeados por recurso

### `Patient` ← `PacienteEntity` (`PacienteFhirMapper.mapPacienteToFhir`)

| Campo FHIR | Campo entidad | Notas |
|-----------|---------------|-------|
| `name` (given + family) | `nombre` | Divide por espacios; la última palabra es `family`, el resto `given` |
| `gender` | `sexo` | FEMENINO→`female`, MASCULINO→`male`, resto→`unknown` |
| `birthDate` | `fechaNacimiento` | — |
| `identifier` | `identificacion` (si existe) + `publicId` | El de `publicId` usa `system = https://example.com/paciente/public-id` |
| `maritalStatus` | `estadoCivil` | `system = http://terminology.hl7.org/CodeSystem/v3-MaritalStatus`; SOLTERO→`S`, CASADO→`M`, VIUDO→`W`, DIVORCIADO→`D`, UNION_LIBRE→`C` |
| `address.country` | `pais` | ISO 3166-1 alfa-2 (EC, CO, VE, PE, AR, BO, UY, CL, BR) |
| `text` | — | Narrative `generated` con un resumen |

:::note
El `system` del identificador `publicId` está como `https://example.com/...` (placeholder). Debería ser una URI real de CLIAS antes de exponer FHIR a terceros.
:::

### `Practitioner` ← `MedicoEntity` (`MedicoFhirMapper.mapMedicoToFhir`)

Devuelto dentro de un `Bundle` `collection`.

| Campo FHIR | Campo entidad | Notas |
|-----------|---------------|-------|
| `id` | `publicId` | `Practitioner/{publicId}` |
| `identifier` (type `MR`) | `publicId` | `system = https://clias.ucuenca.edu.ec/fhir/ids/medico` |
| `identifier` (type `PRN`) | `nRegistro` | Solo si no está en blanco. `system = https://clias.ucuenca.edu.ec/fhir/licenses/medico` |
| `name` (use `official`) | `nombre` | Última palabra = `family`, resto = `given` |
| `gender` | `sexo` | MASCULINO→`male`, FEMENINO→`female`, resto→`unknown` |
| `telecom` (email, use `work`) | `correo` | Solo si no está en blanco |
| `qualification.code` | `especializacion` | `text` = valor original; añade `Coding` SNOMED CT si coincide (ginecología `394586005`, cardiología `394579002`, pediatría `394537008`, dermatología `394582007`, neurología `394591006`, genética `1304107001`) |
| `active` | — | Siempre `true` |
| `text` | — | Narrative `generated` |

### `DiagnosticReport` + `Observation` ← `ExamenVphEntity` (`ExamenVphFhirMapper.toFhirBundle`)

- **`DiagnosticReport`** — `code.text = "HPV Panel Report"`, `category` `LAB` (`v2-0074`). `status` `preliminary`/`final` según `fechaResultado`. `effective` = `fechaExamen`, `issued` = `fechaResultado`. `identifier` con el código de `dispositivo` (`system = https://clias.ucuenca.edu.ec/identifiers/dispositivo`). `result[]` referencia (por `urn:uuid`) a las Observations. `text` con resumen (riesgo + genotipos).
- **`Observation`** — `code.text = "HPV Risk Category"`, `category` `laboratory`. `value` = `CodeableConcept.text` = `diagnostico` en MAYÚSCULAS. `status` `preliminary`/`final` según `fechaResultado`.
- **`Observation`** — `code.text = "HPV Genotype Detected"`, una por cada valor no vacío de `genotipos[]`; `value` = `CodeableConcept.text` = el genotipo.
- **Referencia al paciente**: `ExamenVph` no tiene FK directa; se resuelve por `saludSexual.paciente.publicId` o, en su defecto, `sesionChat.paciente.publicId`. Si no se resuelve, se emite un `Reference` con `display = "Paciente no resuelto"`.

### `QuestionnaireResponse` + `Observation` ← `SaludSexualEntity` (`SaludSexualFhirMapper.toFhirBundle`)

- **`QuestionnaireResponse`** — `status` `completed`. Un `item` por cada campo presente, con `linkId`: `esta-embarazada` (boolean), `fecha-ultima-menstruacion` (date), `ultimo-examen-pap` (string, enum `.name`), `tiempo-prueba-vph` (string, enum `.name`), `num-parejas-sexuales` (integer), `tiene-ets` (string, enum `.name`), `nombre-ets` (string).
- **`Observation`** — `code.text = "Pregnancy status"`, `category` `social-history`, `value` = `CodeableConcept.text` `Positive`/`Negative` según `estaEmbarazada`. Solo si `estaEmbarazada` no es nulo.
- **`Observation`** — `code.text = "Last menstrual period date"`, `category` `vital-signs`, `effective` y `value` = `fechaUltimaMenstruacion` (acepta `Date`, `LocalDate` o `String yyyy-MM-dd`). Solo si la fecha es parseable.

### `Encounter` + `Communication` ← `SesionChatEntity` (`SesionChatFhirMapper.toFhirBundle`)

- **`Encounter`** — `id = Encounter/{uuid}`, `status` `finished`, `subject` = `Patient/{paciente.publicId}`, `period.start` = `inicio`, `period.end` = `fin`. `text` con resumen.
- **`Communication`** — `status` `completed`, `subject` = paciente, `partOf` = referencia al `Encounter` (`urn:uuid`), `sent` = `inicio`, `received` = `fin`. `payload[].content` = `StringType(contenido)` (si no está en blanco). `text` con los primeros 140 caracteres del contenido.

### `Observation` ← `EvolucionEntity` (`EvolucionFhirMapper.toFhirBundle`)

Una `Observation` (`status` `final`, `category` `vital-signs`, `value` = `Quantity`) por **cada signo vital presente**; `effective` = `fecha`:

| Campo entidad | `code.text` | `unit` |
|---------------|-------------|--------|
| `temperatura` | Temperatura corporal | `°C` |
| `pulso` | Frecuencia cardíaca | `lpm` |
| `talla` | Talla | `cm` |
| `peso` | Peso | `kg` |

*El mapper no incluye referencia al paciente.*

### `DocumentReference` ← `ArchivoEntity` (`ArchivoFhirMapper.toFhirBundle`)

| Campo FHIR | Campo entidad | Notas |
|-----------|---------------|-------|
| `id` | — | `DocumentReference/{uuid}` |
| `status` | — | `current` |
| `docStatus` | — | `final` |
| `identifier` | `publicId` | `system = https://clias.ucuenca.edu.ec/identifiers/archivo` |
| `type.text` | — | `"Archivo clínico adjunto"` |
| `content[0].attachment.contentType` | `tipo` | Por defecto `application/octet-stream` |
| `content[0].attachment.title` | `nombre` | Por defecto `"archivo"` |
| `content[0].attachment.data` | `contenido` | Bytes del archivo (Base64 en el JSON) |
| `content[0].attachment.size` | `tamano` | Se recorta a `Int.MAX_VALUE` si excede |
| `text` | — | Narrative `generated` (nombre, tipo, tamaño) |

---

## Seguridad

Los endpoints `/fhir/**` **no tienen regla explícita** en `SecurityConfig` → caen bajo `anyRequest().authenticated()` y **requieren token JWT válido**. No hay restricción por rol.

Para limitarlos a administradores conviene usar seguridad a nivel de método (el backend ya tiene `@EnableMethodSecurity`):

```kotlin
@GetMapping("/all", produces = ["application/fhir+json"])
@PreAuthorize("hasRole('ADMIN')")
fun getAll(): ResponseEntity<String> { … }
```

---

## Dependencia en pom.xml

```xml
<dependency>
    <groupId>ca.uhn.hapi.fhir</groupId>
    <artifactId>hapi-fhir-structures-r4</artifactId>
    <version>6.2.0</version>
</dependency>
```

---

## Ejemplo de respuesta

`GET /fhir/paciente/{publicId}` devuelve:

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "fullUrl": "urn:uuid:...",
      "resource": {
        "resourceType": "Patient",
        "identifier": [
          { "value": "0102030405" },
          { "system": "https://example.com/paciente/public-id", "value": "a1b2c3d4-…" }
        ],
        "name": [{ "family": "González", "given": ["María"] }],
        "gender": "female",
        "birthDate": "1990-05-15",
        "maritalStatus": {
          "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus", "code": "S", "display": "Never Married" }]
        },
        "address": [{ "country": "EC" }]
      }
    }
  ]
}
```
