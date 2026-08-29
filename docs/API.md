# API.md — Endpoints del Backend

Referencia de todos los endpoints consumidos por el frontend de CodePanel.

**Base URL:** `https://codepanel.orchfr.duckdns.org/api/v1` (producción) / `http://localhost:3000/api/v1` (desarrollo)

---

## Autenticación

La mayoría de los endpoints requieren el header:

```
Authorization: Bearer <accessToken>
```

Excepto: `/auth/login`, `/auth/register`, y el endpoint de ejecución desde el editor embebido.

---

## Auth

### `POST /auth/login`

Inicia sesión con identificador y contraseña.

**Body:**
```json
{
  "identifier": "string",
  "password": "string"
}
```

**Response:** `AuthResponse`
```json
{
  "token": "string (JWT access token)",
  "refreshToken": "string"
}
```

---

### `POST /auth/register`

Registra un nuevo usuario.

**Body:**
```json
{
  "name": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "identifier": "string",
  "invitationCode": "string (opcional)"
}
```

**Response:** `RegisterResponse`
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "lastName": "string",
  "role": "string (God | Teacher | Student)"
}
```

---

### `POST /auth/refreshSession`

Renueva el access token usando el refresh token.

**Body:** `string` — refresh token como string plano (no JSON)

**Response:** `AuthResponse`
```json
{
  "token": "string (nuevo JWT access token)",
  "refreshToken": "string (nuevo refresh token)"
}
```

---

## Subject (Materias/Cursos)

### `GET /subject`

Obtiene todas las materias del usuario autenticado.

**Response:** `PaginatedResponse<SubjectResponse>`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Programación Estructurada",
      "userId": "string"
    }
  ],
  "totalCount": 5
}
```

---

### `GET /subject/:id`

Obtiene una materia por ID.

**Response:** `SubjectResponse`
```json
{
  "id": 1,
  "name": "Programación Estructurada",
  "userId": "string"
}
```

---

### `POST /subject`

Crea una nueva materia.

**Body:**
```json
{
  "name": "string"
}
```

**Response:** `SubjectResponse`

---

### `PUT /subject/:id`

Actualiza una materia existente.

**Body:**
```json
{
  "name": "string"
}
```

**Response:** `SubjectResponse`

---

### `DELETE /subject/:id`

Elimina una materia.

**Response:** `void` (204 No Content)

---

### `POST /subject/:id/duplicate`

Duplica una materia junto con sus actividades y casos de prueba (para un nuevo periodo escolar). No clona inscripciones ni envíos. Solo el profesor propietario (o God) puede duplicarla.

**Body:** `DuplicateSubjectRequest` (opcional)
```json
{
  "name": "Programación Estructurada (copia)"
}
```

| Campo  | Tipo   | Requerido | Descripción                                                  |
| ------ | ------ | :-------: | ------------------------------------------------------------ |
| `name` | string |    No     | Nombre de la copia (default: `"<original> (copia)"`)        |

**Response:** `DuplicateSubjectResponse`
```json
{
  "subject": {
    "id": 2,
    "userId": "uuid-string",
    "name": "Programación Estructurada (copia)",
    "imageUrl": null
  },
  "activitiesCloned": 3,
  "testCasesCloned": 12
}
```

| Campo               | Tipo   | Descripción                       |
| ------------------- | ------ | --------------------------------- |
| `subject`           | object | Materia duplicada creada          |
| `activitiesCloned`  | number | Cantidad de actividades clonadas  |
| `testCasesCloned`   | number | Cantidad de casos de prueba clonados |

### `GET /subject/:id/students`

Obtiene los estudiantes inscritos de una materia (Teacher/God).

**Query Params:**

| Param    | Tipo   | Default | Descripción                       |
| -------- | ------ | :-----: | --------------------------------- |
| `skip`   | number |    0    | Registros a omitir                |
| `take`   | number |   100   | Límite de registros               |
| `search` | string |   —     | Filtro por nombre, email o matrícula |

**Response:** `PaginatedResponse<EnrolledStudent>`
```json
{
  "data": [
    {
      "id": "uuid-string",
      "name": "Juan",
      "lastName": "Pérez",
      "email": "juan@uady.mx",
      "identifier": "A123456",
      "enrolledAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalCount": 1
}
```

| Campo         | Tipo           | Descripción                    |
| ------------- | -------------- | ------------------------------ |
| `id`          | string (UUID)  | ID del estudiante              |
| `name`        | string         | Nombre                         |
| `lastName`    | string         | Apellido                       |
| `email`       | string         | Email                          |
| `identifier`  | string \| null | Matrícula / identificador      |
| `enrolledAt`  | string         | Fecha de inscripción (ISO 8601)|

---

## Activity (Actividades)

### `GET /activity`

Obtiene todas las actividades. El frontend filtra por `subjectId` del lado del cliente.

**Response:** Lista de `ActivitySummaryResponse[]`
```json
[
  {
    "id": "string",
    "professorId": "string",
    "languageId": 1,
    "subjectId": 1,
    "title": "Hola Mundo en Python",
    "description": "Escribe tu primer programa",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### `GET /activity/:id`

Obtiene una actividad por ID (incluye `starterCode` y configuración completa).

**Response:** `ActivityResponse`
```json
{
  "id": "string",
  "professorId": "string",
  "subjectId": 1,
  "languageId": 1,
  "title": "Hola Mundo en Python",
  "description": "Escribe tu primer programa",
  "starterCode": [
    {
      "name": "main.py",
      "content": "print('Hello')"
    }
  ],
  "maxAttempts": 5,
  "allowCopy": true,
  "allowPaste": false,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### `POST /activity`

Crea una nueva actividad.

**Body:**
```json
{
  "subjectId": 1,
  "languageId": 1,
  "title": "string",
  "description": "string (opcional)",
  "starterCode": [
    {
      "name": "string",
      "content": "string"
    }
  ],
  "maxAttempts": 5,
  "allowCopy": true,
  "allowPaste": false
}
```

| Campo          | Tipo          | Requerido | Descripción                              |
| -------------- | ------------- | :-------: | ---------------------------------------- |
| `subjectId`    | number        |    Sí     | ID de la materia                         |
| `languageId`   | number        |    Sí     | ID del lenguaje de programación          |
| `title`        | string        |    Sí     | Título de la actividad                   |
| `description`  | string        |    No     | Descripción/instrucciones                |
| `starterCode`  | CodeFile[]    |    No     | Archivos de código inicial               |
| `maxAttempts`  | number        |    No     | Límite de intentos                       |
| `allowCopy`    | boolean       |    No     | Permitir copiar en el editor             |
| `allowPaste`   | boolean       |    No     | Permitir pegar en el editor              |

**CodeFile:**
```json
{
  "name": "main.py",
  "content": "print('Hello')"
}
```

**Response:** `ActivityResponse`

---

### `PUT /activity/:id`

Actualiza una actividad existente (todos los campos son opcionales).

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "starterCode": [ { "name": "string", "content": "string" } ],
  "maxAttempts": 5,
  "allowCopy": true,
  "allowPaste": false
}
```

**Response:** `ActivityResponse`

---

### `DELETE /activity/:id`

Elimina una actividad.

**Response:** `void` (204 No Content)

---

### `GET /activity/:id/grades`

Obtiene las calificaciones por estudiante de una actividad (Teacher/God).

**Query Params:**

| Param    | Tipo   | Default | Descripción                       |
| -------- | ------ | :-----: | --------------------------------- |
| `skip`   | number |    0    | Registros a omitir                |
| `take`   | number |   100   | Límite de registros               |
| `search` | string |   —     | Filtro por nombre, email o matrícula |

**Response:** `PaginatedResponse<StudentGrade>`
```json
{
  "data": [
    {
      "student": {
        "id": "uuid-string",
        "name": "Juan",
        "lastName": "Pérez",
        "email": "juan@uady.mx",
        "identifier": "A123456"
      },
      "finalGrade": 80,
      "submissions": [
        {
          "id": "uuid-string",
          "finalGrade": 80,
          "passedTests": 4,
          "totalTests": 5,
          "executionTimeMs": 1200,
          "status": "WRONG_ANSWER",
          "submittedAt": "2024-01-15T10:30:00Z"
        }
      ]
    }
  ],
  "totalCount": 1
}
```

| Campo          | Tipo                  | Descripción                                |
| -------------- | --------------------- | ------------------------------------------ |
| `student`      | object                | Datos del estudiante (id, name, lastName, email, identifier) |
| `finalGrade`   | number \| null        | Mejor calificación sobre 100               |
| `submissions`  | `StudentSubmission[]` | Historial de envíos del estudiante         |

`StudentSubmission`:
- `id` (string UUID), `finalGrade` (number \| null), `passedTests` (number), `totalTests` (number), `executionTimeMs` (number \| null), `status` (`SubmissionStatus`), `submittedAt` (ISO 8601)

---

### `GET /activity/:id/submissions/:submissionId`

Obtiene el detalle completo de un envío, incluyendo el código fuente (Teacher/God).

**Response:** `SubmissionDetail`
```json
{
  "id": "uuid-string",
  "studentId": "uuid-string",
  "activityId": "uuid-string",
  "languageId": 1,
  "codeSnapshot": [
    {
      "name": "main.cpp",
      "content": "I2luY2x1ZGUgPGlvc3RyZWFtPgo="
    }
  ],
  "finalGrade": 80,
  "passedTests": 4,
  "totalTests": 5,
  "executionTimeMs": 1200,
  "status": "WRONG_ANSWER",
  "compilerOutput": null,
  "submittedAt": "2024-01-15T10:30:00Z"
}
```

| Campo             | Tipo                | Descripción                                    |
| ----------------- | ------------------- | ---------------------------------------------- |
| `id`              | string (UUID)       | ID del envío                                   |
| `studentId`       | string (UUID)       | ID del estudiante                              |
| `activityId`      | string (UUID)       | ID de la actividad                             |
| `languageId`      | number              | ID del lenguaje de programación                |
| `codeSnapshot`    | `CodeFile[]`        | Código enviado (Base64), multi-archivo         |
| `finalGrade`      | number \| null      | Calificación sobre 100                         |
| `passedTests`     | number              | Casos de prueba superados                      |
| `totalTests`      | number              | Total de casos de prueba                       |
| `executionTimeMs` | number \| null      | Tiempo de ejecución en ms                      |
| `status`          | `SubmissionStatus`  | Estado de la evaluación (ver tabla abajo)      |
| `compilerOutput`  | string \| null      | Error de compilación si hubo                   |
| `submittedAt`     | string              | Fecha/hora del envío (ISO 8601)                |
| `languageName`    | string \| null      | *(opcional, preparado)* nombre del lenguaje     |
| `stdout`          | string \| null      | *(opcional, preparado)* salida estándar         |

> **Nota:** `languageName` y `stdout` son campos opcionales preparados para cambios futuros del backend. Actualmente el frontend usa `languageId` (mapeado vía `GET /programming-language`) y muestra `compilerOutput`.

---

## Test Case (Casos de Prueba)

### `GET /activity/:id/test-case`

Obtiene todos los casos de prueba de una actividad (solo Teacher).

**Response:** `TestCase[]`
```json
[
  {
    "id": 1,
    "activityId": "uuid-string",
    "input": "cHJpbnQoJ0hlbGxvIFdvcmxkJyk=",
    "expectedOutput": "SGVsbG8gV29ybGQ=",
    "isHidden": false
  }
]
```

| Campo            | Tipo              | Descripción                                      |
| ---------------- | ----------------- | ------------------------------------------------ |
| `id`             | number            | ID único del caso de prueba                      |
| `activityId`     | string (UUID)     | ID de la actividad asociada                      |
| `input`          | string \| null    | Entrada codificada en Base64 (UTF-8)             |
| `expectedOutput` | string            | Salida esperada codificada en Base64 (UTF-8)     |
| `isHidden`       | boolean           | Si es true, el estudiante no ve este caso        |

---

### `POST /activity/:id/test-case`

Crea un nuevo caso de prueba para una actividad (solo Teacher).

**Body:** `CreateTestCaseRequest`
```json
{
  "input": "cHJpbnQoJ0hlbGxvIFdvcmxkJyk=",
  "expectedOutput": "SGVsbG8gV29ybGQ=",
  "isHidden": false
}
```

| Campo            | Tipo              | Requerido | Descripción                                      |
| ---------------- | ----------------- | :-------: | ------------------------------------------------ |
| `input`          | string \| null    |    No     | Entrada codificada en Base64 (UTF-8)             |
| `expectedOutput` | string            |    Sí     | Salida esperada codificada en Base64 (UTF-8)     |
| `isHidden`       | boolean           |    No     | Si es true, el estudiante no ve este caso        |

**Response:** `TestCase`

---

### `PUT /activity/:id/test-case/:testCaseId`

Actualiza un caso de prueba existente (solo Teacher).

**Body:** `UpdateTestCaseRequest`
```json
{
  "input": "cHJpbnQoJ0hlbGxvIFdvcmxkJyk=",
  "expectedOutput": "SGVsbG8gV29ybGQ=",
  "isHidden": false
}
```

Todos los campos son opcionales.

**Response:** `TestCase`

---

### `DELETE /activity/:id/test-case/:testCaseId`

Elimina un caso de prueba (solo Teacher).

**Response:** `void` (204 No Content)

---

### `POST /activity/:id/submit`

Envía una solución para evaluación automática contra todos los casos de prueba (públicos y ocultos).

**Auth:** Opcional (usuarios no autenticados pueden ejecutar pero no se persiste)
**Rate Limit:** 2 peticiones cada 5 minutos por IP

**Body:** `SubmitRequest`
```json
{
  "files": [
    {
      "name": "main.py",
      "content": "cHJpbnQoJ0hlbGxvIFdvcmxkJyk="
    }
  ],
  "languageId": 1
}
```

| Campo        | Tipo         | Requerido | Descripción                                      |
| ------------ | ------------ | :-------: | ------------------------------------------------ |
| `files`      | CodeFile[]   |    Sí     | Archivos de código en Base64                     |
| `languageId` | number       |    No     | Lenguaje (solo si `allowLanguageChange: true`)   |

**Response:** `EvaluationResult`
```json
{
  "status": "ACCEPTED",
  "finalGrade": 100,
  "passedTests": 3,
  "totalTests": 5,
  "executionTimeMs": 1450,
  "compilerOutput": null,
  "languageId": 1
}
```

| Campo              | Tipo                  | Descripción                                      |
| ------------------ | --------------------- | ------------------------------------------------ |
| `status`           | SubmissionStatus      | Estado de la evaluación (ver tabla abajo)        |
| `finalGrade`       | number                | Calificación sobre 100 (0 si hubo error)         |
| `passedTests`      | number                | Número de casos de prueba pasados                |
| `totalTests`       | number                | Número total de casos de prueba                  |
| `executionTimeMs`  | number                | Tiempo total de ejecución en milisegundos        |
| `compilerOutput`   | string \| null        | Mensaje de error si hubo fallo de compilación    |
| `languageId`       | number                | ID del lenguaje de programación                  |

### SubmissionStatus

| Valor                  | Significado                                            |
| ---------------------- | ------------------------------------------------------ |
| `PENDING`              | Evaluación en progreso                                 |
| `ACCEPTED`             | Solución correcta                                      |
| `WRONG_ANSWER`         | Salida incorrecta                                      |
| `TIME_LIMIT_EXCEEDED`  | Tiempo límite excedido                                 |
| `COMPILE_ERROR`        | Error de compilación                                   |
| `RUNTIME_ERROR`        | Error en tiempo de ejecución                           |

**Errores especiales:**
- **403:** Límite máximo de intentos alcanzado o regla de actividad impide la entrega
- **429:** Rate limit excedido

---

## Execution (Ejecución de Código)

### `POST /execution/run`

Ejecuta código en un contenedor Docker aislado. El código y stdin deben enviarse codificados en **Base64**.

**Body:** `EditorExecutionRequest`
```json
{
  "languageId": 1,
  "code": "cHJpbnQoJ0hlbGxvIFdvcmxkJyk=",
  "stdin": "dXNlciBpbnB1dA=="
}
```

| Campo        | Tipo   | Requerido | Descripción                                      |
| ------------ | ------ | :-------: | ------------------------------------------------ |
| `languageId` | number |    Sí     | ID del lenguaje (1=JS, 2=Python, 3=TypeScript)   |
| `code`       | string |    Sí     | Código fuente codificado en Base64 (UTF-8)       |
| `stdin`      | string |    No     | Entrada estándar codificada en Base64 (UTF-8)    |

**Response:** `EditorExecutionResponse`
```json
{
  "status": "SUCCESS",
  "stdout": "Hello World\n",
  "stderr": "",
  "timeMs": 42
}
```

| Campo    | Tipo   | Descripción                                                   |
| -------- | ------ | ------------------------------------------------------------- |
| `status` | string | Estado de ejecución (ver tabla abajo)                         |
| `stdout` | string | Salida estándar del programa                                  |
| `stderr` | string | Salida de error (compilación o runtime)                       |
| `timeMs` | number | Tiempo de ejecución en milisegundos                           |

### ExecutionStatus

| Valor                  | Significado                                            |
| ---------------------- | ------------------------------------------------------ |
| `SUCCESS`              | Ejecución exitosa                                      |
| `COMPILE_ERROR`        | Error de compilación o sintaxis                        |
| `RUNTIME_ERROR`        | Error en tiempo de ejecución (excepción)               |
| `TIME_LIMIT_EXCEEDED`  | El código excedió el límite de tiempo (~10 segundos)   |

### Rate Limiting

Si se excede el límite de ejecuciones, el backend responde con **HTTP 429**. El frontend muestra:

> "Límite de ejecuciones excedido. Por favor, espera cinco minutos antes de volver a intentarlo."

---

## Programming Language (Admin - Solo God)

### `GET /programming-language`

Obtiene todos los lenguajes de programación registrados.

**Response:** `LanguageResponse[]`
```json
[
  {
    "id": 1,
    "name": "JavaScript",
    "version": "20.x",
    "dockerImage": "node:20-alpine",
    "executionCommand": "node {file}",
    "fileExtension": ".js",
    "editorIdentifier": "javascript"
  }
]
```

---

### `POST /programming-language`

Crea un nuevo lenguaje de programación.

**Body:**
```json
{
  "name": "Java",
  "version": "21",
  "dockerImage": "openjdk:21-slim",
  "executionCommand": "javac {file} && java {class}",
  "fileExtension": ".java",
  "editorIdentifier": "java"
}
```

| Campo               | Tipo   | Descripción                                    |
| ------------------- | ------ | ---------------------------------------------- |
| `name`              | string | Nombre del lenguaje                            |
| `version`           | string | Versión del compilador/intérprete              |
| `dockerImage`       | string | Imagen Docker usada para ejecución             |
| `executionCommand`  | string | Comando de ejecución (placeholders: `{file}`)  |
| `fileExtension`     | string | Extensión de archivo (ej: `.py`, `.js`)        |
| `editorIdentifier`  | string | Identificador de Monaco (ej: `python`, `java`) |

**Response:** `LanguageResponse`

---

### `DELETE /programming-language/:id`

Elimina un lenguaje de programación.

**Response:**
```json
{
  "message": "Lenguaje eliminado correctamente"
}
```

---

## Invitation (Códigos de Invitación - Admin, Solo God)

### `GET /invitation?page=1&limit=10`

Obtiene códigos de invitación paginados.

**Query Params:**

| Param  | Tipo   | Default | Descripción          |
| ------ | ------ | :-----: | -------------------- |
| `page` | number |    1    | Número de página     |
| `limit`| number |   10    | Items por página     |

**Response:** `PaginatedInvitationResponse`
```json
{
  "data": [
    {
      "id": 1,
      "code": "ABC123",
      "roleId": 3,
      "isUsed": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "role": {
        "name": "Teacher"
      }
    }
  ],
  "totalCount": 25
}
```

---

### `POST /invitation`

Crea un nuevo código de invitación.

**Body:**
```json
{
  "roleId": 3
}
```

| Campo    | Tipo   | Descripción                                   |
| -------- | ------ | --------------------------------------------- |
| `roleId` | number | ID del rol (3 = Teacher en el frontend actual)|

**Response:** `InvitationDTO`

---

### `PUT /invitation/:id`

Actualiza un código de invitación (marcar como usado, cambiar rol).

**Body:**
```json
{
  "roleId": 3,
  "isUsed": true
}
```

**Response:** `InvitationDTO`

---

### `DELETE /invitation/:id`

Elimina un código de invitación.

**Response:** `void` (204 No Content)

---

## Settings (Configuración Global - Solo God)

### `GET /settings/email-domains`

Obtiene la lista de dominios de correo permitidos para el registro.

**Response:** `EmailDomains`
```json
{
  "domains": ["uady.mx", "correo.uady.mx"]
}
```

Una lista vacía (`{"domains": []}`) significa que se permiten todos los dominios.

---

### `PUT /settings/email-domains`

Reemplaza por completo la lista de dominios permitidos para el registro.

**Body:** `UpdateEmailDomainsRequest`
```json
{
  "domains": ["uady.mx", "correo.uady.mx"]
}
```

| Campo     | Tipo     | Requerido | Descripción                                         |
| --------- | -------- | :-------: | --------------------------------------------------- |
| `domains` | string[] |    Sí     | Nuevos dominios permitidos (vacío = todos permitidos) |

**Response:** `EmailDomains` (la lista actualizada)

---

## Manejo de Errores

El frontend maneja los siguientes códigos HTTP globalmente vía interceptors:

| Código | Comportamiento                          |
| :----: | --------------------------------------- |
|  401   | Intentar refresh token → si falla, logout y redirect a `/` |
|  403   | Redirect a `/dashboard` + toast de error |
|  404   | Toast "Recurso no encontrado"            |
|  429   | Mensaje de rate limit en panel de output |
|  500   | Toast "Error del servidor"               |

---

## Servicios Correspondientes

| Endpoint                    | Archivo del Servicio            |
| --------------------------- | ------------------------------- |
| `/auth/*`                   | `src/service/AuthService.ts`    |
| `/subject/*`                | `src/service/SubjectService.ts` |
| `/activity/*`               | `src/service/ActivityService.ts` |
| `/activity/:id/test-case/*` | `src/service/TestCaseService.ts` |
| `/activity/:id/grades`      | `src/service/ActivityService.ts` |
| `/activity/:id/submissions/:submissionId` | `src/service/ActivityService.ts` |
| `/subject/:id/students`     | `src/service/SubjectService.ts` |
| `/execution/run`            | `src/service/EditorService.ts`  |
| `/programming-language/*`   | `src/service/LanguageService.ts` |
| `/invitation/*`             | `src/service/InvitationsService.ts` |
| `/settings/*`               | `src/service/SettingsService.ts`    |
