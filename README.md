# CodePanel — Frontend

Plataforma web de ejecución remota de código, embebida en Moodle LMS mediante iframe. Desarrollada como proyecto de servicio social en la **Universidad Autónoma de Yucatán (UADY)**.

Permite a profesores crear actividades de programación, a estudiantes ejecutar código desde un editor basado en Monaco, y a administradores gestionar lenguajes y códigos de acceso.

---

## Tech Stack

| Capa             | Tecnología                         |
| ---------------- | ---------------------------------- |
| Framework        | React 19                           |
| Lenguaje         | TypeScript 5.9                     |
| Build Tool       | Vite 8                             |
| Estilos          | Tailwind CSS 4 + tw-animate-css    |
| Componentes UI   | shadcn/ui (Radix UI) + Lucide      |
| Editor de Código | @monaco-editor/react (Monaco 0.55) |
| Routing          | React Router v7                    |
| HTTP Client      | Axios                              |
| Autenticación    | JWT (access + refresh tokens)      |
| Formularios      | React Hook Form + Zod              |
| Notificaciones   | Sonner (toast)                     |
| Drag & Drop      | @dnd-kit                           |
| Theming          | next-themes                        |

---

## Requisitos Previos

- **Node.js** 24+
- **npm** 10+

---

## Setup Local

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd code-panel-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y configurar VITE_API_BASE_URL
# Por defecto apunta a localhost:3000 para desarrollo

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Scripts Disponibles

| Comando                | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Iniciar servidor de desarrollo con Vite  |
| `npm run build`        | TypeCheck + build de producción          |
| `npm run preview`      | Previsualizar build de producción        |
| `npm run lint`         | Ejecutar ESLint                          |
| `npm run format`       | Formatear código con Prettier            |
| `npm run format:check` | Verificar formato sin modificar archivos |

---

## Estructura del Proyecto

```
src/
├── pages/               # Componentes de página (rutas)
│   ├── Login.tsx / Register.tsx / RecoverPassword.tsx
│   ├── Dashboard.tsx / DashboardLayout.tsx
│   ├── Subject.tsx / SubjectLayout.tsx / SubjectDetailView.tsx
│   ├── SubjectStudents.tsx / SubjectGrades.tsx
│   ├── CreateActivityView.tsx / EditActivityView.tsx
│   ├── EmbedEditor.tsx / EmbedActivity.tsx
│   ├── Student.tsx / Setting.tsx
│   ├── Access.tsx / Language.tsx / User.tsx
│
├── components/
│   ├── ui/               # Primitivas shadcn/ui
│   ├── editor/           # EditorToolbar, EditorPane, FileTabs,
│   │                     # OutputPanel, InputPanel, TestCasesPanel
│   ├── test-case/        # TestCaseModal, TestCaseList, TestCaseManager,
│   │                     # TestCaseManagementModal, TestSimulationResult
│   ├── EditorComponent.tsx   # Editor Monaco multiarchivo + paneles
│   ├── ActivityFormLayout.tsx / ActivityConfigCards.tsx
│   ├── SortableActivityItem.tsx / SubmissionDetailModal.tsx
│   ├── SidebarMenuApp.tsx / SubjectCard.tsx / CardInfo.tsx
│   ├── CreateSubjectModal.tsx / EditSubjectModal.tsx / DuplicateSubjectModal.tsx
│   ├── EmbedLoginForm.tsx / LoginForm.tsx / RegisterForm.tsx
│   ├── LanguageForm.tsx / LanguageTable.tsx
│   ├── InvitationTable.tsx / UserTable.tsx / EditUserModal.tsx
│   ├── ModeToggle.tsx / theme-provider.tsx / ErrorBoundary.tsx
│
├── service/              # Capa de servicios API
│   ├── AuthService / TokenService / SubjectService / ActivityService
│   ├── EditorService / EnrollmentService / LanguageService
│   ├── InvitationsService / UserService / TestCaseService / SettingsService
│
├── types/                # request/, response/, dto/, enum/
│                         # EditorProps, CourseProps, CodeFile
├── guards/               # ProtectedRoute, RoleGuard
├── lib/                  # axios, interceptorsConfig, activity-form-utils,
│                         # editor-files.util, error.util, logger, utils
├── assets/context/       # auth-context, AuthProvider, useAuth (sesión)
├── utils/                # base64.util, sanitize.util
└── hooks/                # use-mobile
```

---

## Arquitectura General

### Path Alias

`@/` mapea a `./src/` — configurado en `tsconfig.app.json` y `vite.config.ts`.

### API Layer

- Instancia de Axios configurada en `src/lib/axios.ts`.
- **Producción:** `https://codepanel.orchfr.duckdns.org/api/v1`
- **Local:** `http://localhost:3000/api/v1`
- Los interceptors (`src/lib/interceptorsConfig.ts`) manejan:
  1. Adjuntar el JWT access token a cada request (excepto login/register).
  2. Refresh token automático en respuestas 401.
  3. Toasts de error globales para 403, 404, 500. En 403 redirige a `/dashboard`.

### Autenticación

- JWT con access + refresh tokens almacenados en `localStorage`.
- El contexto de auth está dividido en tres archivos bajo `src/assets/context/`:
  - `auth-context.ts` — el objeto `AuthContext` + tipos `User`/`AuthContextType`.
  - `AuthProvider.tsx` — el componente `AuthProvider` (inicializa el usuario desde el JWT de forma perezosa).
  - `useAuth.ts` — el hook `useAuth()`.
- `useAuth()` expone `user`, `isAuthenticated`, `isLoading`, `loginState()`, `logoutState()`, `updateUserName()`.
- `ProtectedRoute` envuelve rutas autenticadas.
- `RoleGuard` restringe por rol de usuario.

### Ejecución de Código

1. El usuario escribe código en Monaco Editor (`EditorComponent`), que soporta **múltiples archivos** (pestañas en `FileTabs.tsx`).
2. Al presionar "Run", el código y stdin se codifican a **Base64** (UTF-8 seguro vía `TextEncoder`).
3. Se envía POST a `/api/v1/execution/run` (un archivo) o `/api/v1/execution/run-with-files` (varios archivos, con el **primer archivo** como `entryPoint`).
4. La respuesta incluye `status`, `stdout`, `stderr` y `timeMs`.
5. El panel de output muestra el resultado con formato según el estado.

### Estados de Ejecución

| Estado                | Significado                           |
| --------------------- | ------------------------------------- |
| `SUCCESS`             | Código ejecutado correctamente        |
| `COMPILE_ERROR`       | Error de compilación/sintaxis         |
| `RUNTIME_ERROR`       | Excepción en tiempo de ejecución      |
| `TIME_LIMIT_EXCEEDED` | El código excedió el límite de tiempo |

Adicionalmente, el código 429 (rate limit) se maneja con mensaje de "espera 5 minutos".

---

## Roles de Usuario

| Rol         | Permisos                                                                                                                                |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **God**     | Super admin — gestión de lenguajes, códigos de invitación y usuarios                                                                    |
| **Teacher** | Profesor — gestiona materias, actividades, estudiantes                                                                                  |
| **Student** | Estudiante — puede registrarse; al iniciar sesión ve un mensaje de confirmación (sin secciones administrativas). Actividades vía iframe |

---

## Rutas Principales

| Ruta                                     | Auth | Rol | Descripción                                              |
| ---------------------------------------- | :--: | :-: | -------------------------------------------------------- |
| `/login`                                 |  No  |  —  | Inicio de sesión                                         |
| `/register`                              |  No  |  —  | Registro                                                 |
| `/recover-password`                      |  No  |  —  | Recuperación de contraseña (3 pasos)                     |
| `/embed/editor`                          |  No  |  —  | Editor público (iframe Moodle)                           |
| `/embed/activity/:activityId`            |  No  |  —  | Actividad embebida (con acceso invitado)                 |
| `/dashboard`                             |  Sí  |  —  | Panel principal                                          |
| `/course`                                |  Sí  |  —  | Listado de materias                                      |
| `/subject/:id`                           |  Sí  |  —  | Layout de materia (Contenido / Alumnos / Calificaciones) |
| `/subject/:id/students`                  |  Sí  |  —  | Alumnos de la materia (tabla de inscritos)               |
| `/subject/:id/grades`                    |  Sí  |  —  | Calificaciones por actividad + detalle de envío          |
| `/subject/:id/activity/new`              |  Sí  |  —  | Crear actividad                                          |
| `/subject/:id/activity/:activityId/edit` |  Sí  |  —  | Editar actividad                                         |
| `/student`                               |  Sí  |  —  | Estudiantes (placeholder)                                |
| `/setting`                               |  Sí  |  —  | Configuración                                            |
| `/access`                                |  Sí  | God | Códigos de invitación                                    |
| `/language`                              |  Sí  | God | Gestión de lenguajes                                     |
| `/user`                                  |  Sí  | God | Gestión de usuarios                                      |
| `/403`                                   |  —   |  —  | Acceso denegado                                          |

---

## Funcionalidades Clave

### Editor multiarchivo

`EditorComponent` gestiona un arreglo de `EditorFile` (`{ id, nameFile, code, languageId }`) con pestañas (`FileTabs.tsx`):

- Seleccionar, cerrar, **añadir** y **renombrar** archivos (doble clic en la pestaña, con validación de nombre vacío/duplicado).
- El **primer archivo** es el **entry point**: se usa como `entryPoint` en `/execution/run-with-files` y como entrada en el submit del backend. Se marca con ▶ en su pestaña.
- Upload/download del archivo activo; la extensión de descarga sale de `LanguageResponse.fileExtension` (no de un mapa hardcodeado).

### Restricciones de actividad (Profesor)

| Campo                 | Efecto al deshabilitarlo                                        |
| --------------------- | --------------------------------------------------------------- |
| `allowCopy`           | Bloquea Ctrl+C / Ctrl+X en Monaco                               |
| `allowPaste`          | Bloquea Ctrl+V en Monaco                                        |
| `allowEdit`           | Pone Monaco en `readOnly: true`                                 |
| `allowLanguageChange` | Deshabilita el selector de lenguaje en el toolbar               |
| `allowUpload`         | Oculta el botón de subir archivo                                |
| `allowDownload`       | Oculta el botón de descargar archivo                            |
| `maxAttempts`         | Máx. intentos de envío (0 = ilimitado); se aplica al botón Test |

### Sistema de casos de prueba

- **Profesor** (Create/EditActivityView): gestión CRUD completa desde un modal, con casos privados (`isHidden`), simulación local de todos los casos contra el código actual, e IDs temporales negativos hasta guardar la actividad.
- **Estudiante** (EmbedActivity): solo ve los casos **públicos**; el botón **Test** envía contra todos los casos (públicos + ocultos) y muestra un resultado agregado `passedTests/totalTests (%)`. Los casos ocultos nunca se revelan.

### Duplicar materia

Desde el menú de tres puntos de cada `SubjectCard`, la opción **Duplicar** llama a `POST /subject/:id/duplicate`. Clona la materia **con sus actividades y casos de prueba** (no clona inscripciones ni envíos). Si no se renombra, usa `"<nombre> (copia)"`.

### Recuperación de contraseña

Wizard de 3 pasos en `/recover-password`:

1. `POST /auth/forgot-password` — envía un código de 6 dígitos por email (respuesta idéntica exista o no el email, anti-enumeración).
2. `POST /auth/verify-reset-code` — valida el código y devuelve un `resetToken` (JWT de 15 min).
3. `POST /auth/reset-password` — establece la nueva contraseña con el `resetToken` (nunca persistido en `localStorage`).

### Dominios de email permitidos (God)

En `/setting`, la tarjeta **"Dominios de correo permitidos"** gestiona la lista de dominios que pueden registrarse (chips con validación de dominio). Se guarda con `PUT /settings/email-domains`; una lista vacía (`[]`) significa que todos los dominios están permitidos.

### Flujo invitado en el iframe

El editor embebido (`/embed/activity/:activityId`) permite **"Continuar sin iniciar sesión"**:

- Carga el workspace público y usa solo el lenguaje de la actividad (sin selector de lenguaje).
- **Run** funciona normalmente; **Test** evalúa pero **no persiste** el envío para usuarios anónimos, y muestra un banner ámbar con CTA para iniciar sesión (el editor nunca se desmonta, conservando código/entrada/salida).

---

## Despliegue

### Docker

La app se despliega en un VPS de Oracle Cloud con Docker Compose detrás de Nginx.

```bash
# Build de imagen multi-stage (Node 24 → Nginx Alpine)
docker build -t code-panel-frontend .

# O usar la imagen pre-built de GitHub Container Registry
docker pull ghcr.io/<org>/code-panel-frontend:latest
```

### CI/CD (GitHub Actions)

| Workflow               | Disparador          | Acción                                      |
| ---------------------- | ------------------- | ------------------------------------------- |
| `cicd_docker.yml`      | Push de tag `v*`    | Build multi-arch + push a GHCR              |
| `cd_deploy_on_vps.yml` | Post-Docker publish | SSH al VPS → `docker compose pull && up -d` |

---

## Documentación Adicional

- [AGENTS.md](./AGENTS.md) — Guía para agentes de IA y asistentes de código
- [TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md) — Catálogo de deuda técnica y prioridades de refactorización
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Arquitectura detallada y flujos del sistema
- [docs/API.md](./docs/API.md) — Referencia de endpoints del backend
