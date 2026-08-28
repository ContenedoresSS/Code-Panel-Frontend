# AGENTS.md — CodePanel Frontend

## Project Overview

**CodePanel** is a web platform for remote code execution, embedded into the Moodle LMS via an iframe. It is developed as a social service project at **UADY (Universidad Autónoma de Yucatán)**. The system allows teachers to create coding activities, students to execute code through a Monaco-based editor, and administrators to manage languages and access.

The frontend is deployed on an **Oracle Cloud VPS** using Docker Compose behind Nginx.

---

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | React 19                            |
| Language       | TypeScript 5.9                      |
| Build Tool     | Vite 8                              |
| Styling        | Tailwind CSS 4 + tw-animate-css     |
| UI Components  | shadcn/ui (radix-ui) + Lucide icons |
| Code Editor    | @monaco-editor/react (Monaco 0.55)  |
| Routing        | React Router v7                     |
| HTTP Client    | Axios                               |
| Auth           | JWT (access + refresh tokens)       |
| Forms          | React Hook Form + Zod               |
| Notifications  | Sonner (toast)                      |
| Drag & Drop    | @dnd-kit                            |
| Theming        | next-themes                         |

---

## Project Structure

```
src/
├── pages/               # Route-level page components
│   ├── EmbedActivity.tsx  # Embedded activity editor (iframe in Moodle, per-activity)
│   ├── Login.tsx         # Login page
│   ├── Register.tsx      # Registration page
│   ├── Dashboard.tsx     # Main dashboard (per-role: Teacher/God stats; Student sees registration message)
│   ├── DashboardLayout.tsx # Authenticated layout with sidebar
│   ├── Subject.tsx       # Course/subject listing & CRUD
│   ├── SubjectLayout.tsx # Subject layout with sub-nav (Contenido / Alumnos / Calificaciones) + Outlet
│   ├── SubjectDetailView.tsx  # "Contenido" of a subject (activities list, dnd)
│   ├── SubjectStudents.tsx    # "Alumnos" of a subject (enrolled students table)
│   ├── SubjectGrades.tsx      # "Calificaciones" of a subject (per-activity grades + submission details)
│   ├── CreateActivityView.tsx # Create new activity
│   ├── EditActivityView.tsx   # Edit existing activity
│   ├── Student.tsx       # Student view (placeholder — not implemented)
│   ├── RecoverPassword.tsx # 3-step password recovery wizard
│   ├── Setting.tsx       # User settings
│   ├── Access.tsx        # Invitation code management (God only)
│   ├── Language.tsx      # Programming language management (God only)
│   └── User.tsx          # User management (God only)
│
├── components/
│   ├── ui/               # shadcn/ui primitives (button, card, sidebar, etc.)
│   ├── editor/           # Editor subcomponents
│   │   ├── EditorToolbar.tsx  # Toolbar (upload, download, font, theme, language)
│   │   ├── EditorPane.tsx     # Monaco editor pane
│   │   ├── FileTabs.tsx       # File tabs (add, close, rename, entry-point marker)
│   │   ├── OutputPanel.tsx
│   │   ├── InputPanel.tsx
│   │   └── TestCasesPanel.tsx
│   ├── EditorComponent.tsx   # Monaco-based multi-file code editor + output panel
│   ├── SidebarMenuApp.tsx    # Main sidebar navigation
│   ├── SubjectCard.tsx       # Subject/course card in grid
│   ├── CreateSubjectModal.tsx
│   ├── EditSubjectModal.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── CardInfo.tsx          # Dashboard stat card
│   ├── LanguageTable.tsx
│   ├── LanguageForm.tsx
│   ├── InvitationTable.tsx
│   ├── UserTable.tsx          # User list table (God only)
│   ├── EditUserModal.tsx      # Edit user modal (role, active, password)
│   ├── SortableActivityItem.tsx # Draggable activity item
│   ├── ModeToggle.tsx        # Light/dark theme toggle
│   ├── theme-provider.tsx
│   ├── ActivityConfigCards.tsx  # Activity configuration card (restrictions, general info)
│   ├── SubmissionDetailModal.tsx # Modal with submission details (code snapshot, output, grade)
│   └── test-case/            # Test case management components
│       ├── TestCaseModal.tsx            # Create/edit single test case
│       ├── TestCaseList.tsx             # List of test cases
│       ├── TestCaseManager.tsx          # Button to open management modal
│       ├── TestCaseManagementModal.tsx  # Full management modal with multi-file simulation
│       ── TestSimulationResult.tsx     # Simulation results display
│
├── service/              # API service layer (one file per resource)
│   ├── AuthService.ts        # login, register, refreshSession, password recovery
│   ├── TokenService.ts       # JWT management (localStorage)
│   ├── SubjectService.ts     # Subject CRUD + students
│   ├── ActivityService.ts    # Activity CRUD + submitSolution + grades
│   ├── EditorService.ts      # Code execution (run + run-with-files)
│   ├── EnrollmentService.ts  # Student enrollments
│   ├── LanguageService.ts    # Language CRUD
│   ├── InvitationsService.ts # Invitation code CRUD (paginated)
│   ├── UserService.ts        # Profile + password + admin user management
│   ├── TestCaseService.ts    # Test case CRUD
│   └── SettingsService.ts    # Global settings (email domains allowed for registration)
│
├── types/
│   ├── request/          # Request DTOs
│   │   ├── CreateActivityRequest.ts  (includes ActivityRules)
│   │   ├── UpdateActivityRequest.ts
│   │   ├── CreateTestCaseRequest.ts
│   │   ├── UpdateTestCaseRequest.ts
│   │   ├── SubmitRequest.ts
│   │   ├── UpdateUserRequest.ts
│   │   ├── ForgotPasswordRequest.ts
│   │   ├── VerifyResetCodeRequest.ts
│   │   ├── ResetPasswordRequest.ts
│   │   ├── EditorExecutionRequest.ts  (includes RunCodeWithFilesRequest)
│   │   ── ...
│   ├── response/         # Response DTOs
│   │   ├── ActivityResponse.ts  (includes ActivityRulesResponse)
│   │   ├── TestCase.ts
│   │   ├── PublicTestCase.ts
│   │   ├── EvaluationResult.ts
│   │   ├── UserListItem.ts
│   │   ├── EnrolledStudent.ts
│   │   ├── StudentGrade.ts
│   │   ├── StudentSubmission.ts
│   │   ├── SubmissionDetail.ts
│   │   ├── MessageResponse.ts
│   │   ├── VerifyResetCodeResponse.ts
│   │   └── ...
│   ├── dto/              # General DTOs (InvitationDTO)
│   ├── enum/             # Constants (ExecutionStatus)
│   ├── EditorProps.ts    # EditorLanguage, EditorFile
│   ├── CourseProps.ts    # Course/subject type
│   └── CodeFile.ts
│
├── lib/
│   ├── axios.ts             # Axios instance (baseURL config)
│   ├── interceptorsConfig.ts # JWT attach, refresh token, error handling
│   ├── activity-form-utils.ts # Shared activity form logic
│   ├── editor-files.util.ts  # EditorFile[] <-> CodeFile[] conversion
│   ├── error.util.ts         # Axios error helpers (status, message)
│   └── utils.ts             # shadcn cn() utility
│
├── guards/
│   ├── ProtectedRoute.tsx    # Auth guard (redirect to /login if not authenticated)
│   └── RoleGuard.tsx         # Role check (redirect to /403 if wrong role)
│
├── assets/
│   └── context/
│       ├── auth-context.ts   # AuthContext + User/AuthContextType types
│       ├── AuthProvider.tsx  # AuthProvider component
│       └── useAuth.ts        # useAuth hook
│
├── utils/
│   └── base64.util.ts       # encodeToBase64 / decodeFromBase64 (UTF-8 safe)
│
├── hooks/
│   └── use-mobile.ts        # Mobile detection hook
│
├── main.tsx                 # Entry point (BrowserRouter + AuthProvider)
├── App.tsx                  # Route definitions
└── index.css                # Global styles + Tailwind
```

---

## Common Commands

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `npm run dev`            | Start Vite dev server                |
| `npm run build`          | TypeCheck + Vite production build    |
| `npm run preview`        | Preview production build locally     |
| `npm run lint`           | Run ESLint                           |
| `npm run format`         | Format code with Prettier            |
| `npm run format:check`   | Check formatting without writing     |

---

## Architecture & Conventions

### Path Alias

`@/` maps to `./src/` (configured in `tsconfig.app.json` and `vite.config.ts`).

### API Layer

- The Axios instance is created in `src/lib/axios.ts` with the base URL hardcoded.
  - **Production:** `https://codepanel.orchfr.duckdns.org/api/v1`
  - **Local:** `http://localhost:3000/api/v1` (commented out, swap as needed)
- Interceptors (`src/lib/interceptorsConfig.ts`) handle:
  1. Attaching the JWT access token to every request (except login/register).
  2. Automatic refresh token flow on 401 responses.
  3. Global error toasts for 403, 404, and 500 responses. On 403 the user is redirected to `/dashboard`.

### Authentication

- JWT-based with access + refresh tokens stored in `localStorage`.
- The auth context is split across three files under `src/assets/context/`:
  - `auth-context.ts` — the `AuthContext` object + `User`/`AuthContextType` types.
  - `AuthProvider.tsx` — the `AuthProvider` component (lazy-initializes user from the JWT).
  - `useAuth.ts` — the `useAuth()` hook.
- `useAuth()` provides `user`, `isAuthenticated`, `isLoading`, `loginState()`, `logoutState()`, `updateUserName()`.
- `ProtectedRoute` wraps authenticated routes. `RoleGuard` further restricts by user role.

### Services

Each backend resource has a dedicated service file exporting async functions. All return parsed response data (not raw Axios responses). Example:

```ts
// src/service/EditorService.ts
export const executionCode = async (payload: EditorExecutionRequest): Promise<EditorExecutionResponse> => {
  const response = await api.post<EditorExecutionResponse>("execution/run", payload);
  return response.data;
};
```

### Forms

Use **React Hook Form** with **Zod** validation. Form components (LoginForm, RegisterForm, LanguageForm, etc.) use `@hookform/resolvers` for schema validation.

### Code Execution Flow

1. User writes code in the Monaco Editor (`EditorComponent`), which now supports **multiple files** (tabs in `FileTabs.tsx`).
2. On "Run", the code and stdin are encoded to **Base64** (UTF-8 safe via `TextEncoder`).
3. A POST request is sent to `/api/v1/execution/run` (single file) or `/api/v1/execution/run-with-files` (multiple files, with the **first file** as `entryPoint`).
4. The response includes `status` (one of the execution statuses below), `stdout`, `stderr`, and `timeMs`.
5. The output panel renders the result with appropriate formatting for each status.

---

## User Roles

| Role      | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `God`     | Super admin — full access including language management, invitation codes and user management |
| `Teacher` | Professor — manages subjects, activities, students (including per-activity grades in `/subject/:id/grades`) |
| `Student` | Student — can register; on login the Dashboard shows a registration-confirmation message (no admin content). Activities are done inside the Moodle iframe |

---

## Routes Overview

| Path                                        | Auth Required | Role Required | Description                |
| ------------------------------------------- | :-----------: | :-----------: | -------------------------- |
| `/login`                                    | No            | —             | Login page                 |
| `/register`                                 | No            | —             | Registration page          |
| `/embed/editor`                             | No            | —             | Public embedded editor (for Moodle iframe) |
| `/embed/activity/:activityId`              | No            | —             | Embedded activity editor with workspace + restrictions |
| `/dashboard`                                | Yes           | —             | Main dashboard             |
| `/course`                                   | Yes           | —             | Subject listing            |
| `/subject/:id`                              | Yes           | —             | Subject layout with sub-nav (Contenido / Alumnos / Calificaciones) + Outlet |
| `/subject/:id/students`                     | Yes           | —             | "Alumnos" of a subject — enrolled students table |
| `/subject/:id/grades`                       | Yes           | —             | "Calificaciones" of a subject — per-activity grades + submission detail modal |
| `/subject/:id/activity/new`                 | Yes           | —             | Create new activity        |
| `/subject/:id/activity/:activityId/edit`    | Yes           | —             | Edit existing activity     |
| `/student`                                  | Yes           | —             | Student list (placeholder) |
| `/setting`                                  | Yes           | —             | User settings (profile info + change password) |
| `/access`                                   | Yes           | `God`         | Invitation code management |
| `/language`                                 | Yes           | `God`         | Language management        |
| `/user`                                     | Yes           | `God`         | User management            |
| `/403`                                      | —             | —             | Access denied page         |

---

## Execution Statuses

```ts
// src/types/enum/ExecutionStatus.ts
SUCCESS                // Code ran successfully
COMPILE_ERROR          // Compilation/syntax error
RUNTIME_ERROR          // Runtime exception
TIME_LIMIT_EXCEEDED    // Code exceeded time limit (10s)
```

Additionally, HTTP 429 (rate limiting) is handled client-side with a "wait 5 minutes" message.

---

## Docker & Deployment

### Dockerfile (multi-stage)

1. **Stage 1 (builder):** Node 24 slim — installs dependencies and runs `npm run build`.
2. **Stage 2 (runtime):** Nginx Alpine — serves the `dist/` folder with custom `nginx/nginx.conf`.

Nginx config uses `try_files $uri $uri/ /index.html` for SPA routing support.

### CI/CD (GitHub Actions)

1. **`cicd_docker.yml`** — Triggers on tag push (`v*`):
   - Builds multi-arch Docker image (linux/amd64, linux/arm64)
   - Pushes to **GitHub Container Registry** (ghcr.io)
2. **`cd_deploy_on_vps.yml`** — Triggers after successful Docker publish:
   - SSHs into the Oracle Cloud VPS
   - Runs `docker compose pull && docker compose up -d --remove-orphans` in `/opt/code-panel-front`
   - Prunes unused images

---

## Important Notes

- **The `/embed/editor` route is public** (no auth required) — it is designed to be embedded as an iframe in Moodle. It hardcodes the supported languages locally (not fetched from the API).
- **The `/embed/activity/:activityId` route** is the activity-specific embedded editor. It fetches the workspace from the API, enforces teacher-configured restrictions, and fetches all languages from `/programming-language` when language switching is allowed.
- **Code and stdin are sent to the backend in Base64** to support special characters and binary-safe transport.
- **The `Student` role has no admin views.** After logging in to the main app, the Dashboard shows a registration-confirmation message ("¡Registro exitoso!") instead of stats; the sidebar hides "Cursos". Activities are done inside the Moodle iframe.
- **The sidebar is role-dynamic** (`SidebarMenuApp.tsx`): the whole **ADMIN** group (Invitaciones / Lenguaje / Usuarios) renders **only for `God`**, and **Cursos** is hidden for `Student`.
- The **invitation system** (`/access`) generates one-time-use codes to register teachers. Only `God` role can access this.
- **Theme support** is provided via `next-themes` (light/dark) with a `ModeToggle` component.
- The API base URL comment in `src/lib/axios.ts` shows the local alternative for development — swap the comment when working locally.
- **The iframe code** copied from the activity list (`SortableActivityItem.tsx`, button "Iframe") generates `<iframe src="<origin>/embed/activity/<id>" width="100%" height="800px" ...>`.

### Guest / Anonymous Access in the iframe (EmbedActivity)

- `EmbedLoginForm` includes a **"Continuar sin iniciar sesión"** button (`onGuestMode` prop) that activates `guestMode` in `EmbedActivity`.
- In guest mode the page loads the **public workspace** (`GET /activity/:id/workspace`) but **does not** call `getAllLanguages` (God-only endpoint); the editor uses only the workspace language (`allowLanguageChange` effectively off).
- **Run** works normally (public endpoint, rate-limited). **Test** submits via `POST /activity/:id/submit` (auth optional): the evaluation is returned but **not persisted** for anonymous users.
- After a guest submit, an **amber banner** appears: "No iniciaste sesión: tu envío se evaluó, pero no se guardó en la plataforma" with a single login CTA (the header "Iniciar sesión" button is hidden while `evaluationResult` is present to avoid duplication).
- Clicking "Iniciar sesión" opens `EmbedLoginForm` as an **overlay on top of the editor** (the editor is never unmounted, so code/stdin/output/active tab are preserved). On successful login the overlay closes and only the languages are (re)loaded — a `workspaceLoaded` ref prevents re-fetching the workspace and avoids the loading screen remounting the editor.

### Activity Restrictions (Profesor-controlled)

Teachers can configure the following restrictions per activity. These flow from the editor configuration UI → `CreateActivityRequest`/`UpdateActivityRequest` → backend → `WorkspaceResponse` → `EmbedActivity` → `EditorComponent`:

| Field                 | Default | Effect when disabled                                          |
| --------------------- | :-----: | ------------------------------------------------------------- |
| `allowCopy`           | `true`  | Blocks Ctrl+C / Ctrl+X in Monaco via `addCommand` no-ops     |
| `allowPaste`          | `true`  | Blocks Ctrl+V in Monaco via `addCommand` no-op               |
| `allowEdit`           | `true`  | Sets Monaco `options.readOnly: true` (code unmodifiable)     |
| `allowLanguageChange` | `true`  | Disables the language selector dropdown in `EditorToolbar`. When enabled, `EmbedActivity` fetches all languages from `/programming-language` |
| `allowUpload`         | `true`  | Hides the file upload button in `EditorToolbar`              |
| `allowDownload`       | `true`  | Hides the file download button in `EditorToolbar`            |
| `maxAttempts`         | `0`     | Maximum execution attempts (0 = unlimited). **Enforced client-side** — blocks the Test button when limit is reached. Backend returns 403 if exceeded. |

### Editor File Upload/Download

- **Upload:** Hidden `<input type="file">` triggered by button click. Reads file content via `FileReader` and loads into the **active file** in Monaco.
- **Download:** Creates a `Blob` from the active file's code and triggers download via a temporary `<a>` element. File extension comes from `LanguageResponse.fileExtension` (not a hardcoded map).

### Multi-file Editor

`EditorComponent` now manages an array of `EditorFile` (`{ id, nameFile, code, languageId }`) plus an `activeFileId`:

- **Tabs** (`src/components/editor/FileTabs.tsx`) allow: selecting a file, closing it (only if more than one), adding a new file (`+`), and **renaming** via double-click on the tab (inline input with validation against empty/duplicate names).
- The **first file** in the list is the **entry point**: it is used as `entryPoint` for `/execution/run-with-files` and, because the backend submit uses `files[0]` as the entry, it is also the entry on submit. It is marked with a ▶ indicator on its tab. New files default to `main.<ext>` (first) / `archivo<N>.<ext>` (subsequent).
- `src/lib/editor-files.util.ts` exports `toCodeFiles(EditorFile[]): CodeFile[]` to build submit/run payloads.
- The teacher activity form (`ActivityFormLayout` + `activity-form-utils.ts`) stores `starterCode` as an `EditorFile[]` list, decodes **all** workspace files on edit/duplicate, and builds the `CodeFile[]` payload on save.
- **`EditorComponent` keeps `files`/`activeFileId` as its own internal state** (no reactive sync with `initialFiles`). `initialFiles` is only the initial value of the `useState`. To force a fresh mount when loading a specific activity, `ActivityFormLayout` passes an `activityKey` (the activity UUID) as the `key` of `EditorComponent`; `EditActivityView` uses `activityId` and `CreateActivityView` uses `duplicateId` (or `"new"`).

### Language Editing

`LanguageForm.tsx` supports both creation and editing modes:
- **Creation:** `POST /programming-language` — all fields required
- **Editing:** `PUT /programming-language/:id` — all fields optional, form pre-filled with existing data. Triggered via edit icon in `LanguageTable.tsx`.
- The form field "Identifier Monaco" (`monacoName` in schema) maps to `editorIdentifier` in the API.

### Test Case System

The test case system has two modes: **teacher management** and **student evaluation**.

**Teacher management** (CreateActivityView / EditActivityView):
1. Teacher clicks "Gestionar casos de prueba" button in the left sidebar
2. Modal opens with full CRUD management (create, edit, delete)
3. Each test case has: input (Base64), expected output (Base64), and isHidden flag
4. "Ejecutar tests" button simulates all test cases against current code (uses `/execution/run-with-files` with all editor files, no intent consumption)
5. Test cases are stored 100% offline during editing — only synced to backend when saving the activity
6. New test cases get temporary negative IDs (`-1`, `-2`, ...) during editing
7. On save: new (ID < 0) → create, modified (ID > 0 with changes) → update, removed → delete

**Student evaluation** (EmbedActivity):
1. Student sees only **public** test cases in the UI (hidden ones filtered out)
2. "Test" button calls `POST /activity/:id/submit` which evaluates against ALL test cases (public + hidden)
3. Result is aggregate: `passedTests/totalTests (percentage%)` — no individual test results shown
4. Hidden test cases are never revealed to the student
5. `maxAttempts` is enforced client-side — button is disabled when limit reached

### Editor Button Layout

| Button | Location | Behavior | Attempts |
| ------ | -------- | -------- | -------- |
| **Run** | OutputPanel header | Executes code with user-provided stdin via `/execution/run` (single file) or `/execution/run-with-files` (multi-file) | No limit |
| **Test** | TestCasesPanel header | Submits solution against all test cases via `/activity/:id/submit` | Consumes 1 attempt |
| **+ Añadir** | TestCasesPanel header (teacher only) | Opens test case management modal | N/A |

### Subject Duplicate (Teacher/God)

From the subject grid (`Subject.tsx`), the "3 puntitos" dropdown on each `SubjectCard` includes a **"Duplicar"** option (`src/components/SubjectCard.tsx`). It opens `DuplicateSubjectModal.tsx`, which lets the teacher optionally rename the copy (empty → backend default `"<nombre> (copia)"`).

- Calls `POST /subject/:id/duplicate` via `duplicateSubject()` in `src/service/SubjectService.ts`.
- Clones the subject **with its activities and test cases**; it does **not** clone enrollments or submissions.
- On success the new subject is prepended to the grid and a toast shows the count of cloned activities and test cases (`DuplicateSubjectResponse`).

### Subject "Alumnos" / "Calificaciones" Views (Teacher)

The global sidebar no longer has an "Alumnos" item. Instead, each subject (`/subject/:id`) is a **layout** (`SubjectLayout.tsx`) with a sub-navigation ("Contenido" / "Alumnos" / "Calificaciones") and nested routes:

- `/subject/:id` → **Contenido** (activity list, `SubjectDetailView.tsx`)
- `/subject/:id/students` → **Alumnos** (`SubjectStudents.tsx`)
- `/subject/:id/grades` → **Calificaciones** (`SubjectGrades.tsx`)

`SubjectStudents.tsx` is a **simple table** of enrolled students:
1. Loads enrolled students (`GET /subject/:id/students`, all enrolled, not filtered by submissions).
2. Each row shows name, email/matrícula, and enrollment date.
3. Filter: text search (name, email, matrícula) done client-side.

`SubjectGrades.tsx` is a **per-activity grade view** with drill-down:
1. Loads the subject's activities (`GET /activity` filtered by subject) and preselects the **first activity**.
2. For the selected activity, loads its grades (`GET /activity/:id/grades`).
3. Each student row expands to show their **submission history** (fecha, hora, estado, calificación, passedTests/totalTests, executionTimeMs) and a "Ver detalles" button.
4. "Ver detalles" opens `SubmissionDetailModal`, which fetches `GET /activity/:id/submissions/:submissionId` to show the full code snapshot (multi-file, Base64-decoded), compiler output, language, grade, tests and timestamp.
5. Filter: text search (name, email, matrícula) and a dropdown to select the activity.

> **Note:** The backend currently exposes grades only per-activity (`GET /activity/:id/grades`), not aggregated by subject. The "Calificaciones" view selects an activity and fetches grades per activity. A backend endpoint for "grades by subject" is a pending improvement.

---

## Backend API Consumption

### API Reference

The canonical, detailed endpoint reference is in `docs/API.md` — it contains full request/response schemas for every endpoint. Always consult it when creating or modifying services.

The complete OpenAPI 3.1 spec (`openapi.yaml`) lives in the backend repo: https://github.com/ContenedoresSS/Code-Panel-Backend

### Base URLs

| Environment | URL                                              |
| ----------- | ------------------------------------------------ |
| Development | `http://localhost:3000/api/v1`                   |
| Production  | `https://codepanel.orchfr.duckdns.org/api/v1`    |

### Authentication (JWT)

1. **POST `/auth/login`** — Send `{ identifier, password }`, receive `{ token, refreshToken }`.
2. **POST `/auth/refreshSession`** — Send the refresh token as plain text body, receive a new `{ token, refreshToken }`.
3. All authenticated requests include the header `Authorization: Bearer <token>`.

Token lifetimes:
- Access token: **4 hours**
- Refresh token: **7 days**

The Axios interceptor (`src/lib/interceptorsConfig.ts`) handles automatic token attachment and refresh on 401.

### Password Recovery (no auth)

Implemented in `src/pages/RecoverPassword.tsx` as a 3-step wizard (request code → verify code → new password):
1. **POST `/auth/forgot-password`** — `{ email }` → `{ message }`. Sends a 6-digit code by email. Response is identical whether or not the email exists (anti-enumeration), so the UI must not reveal account existence. Returns 500 if no email provider is configured.
2. **POST `/auth/verify-reset-code`** — `{ email, code }` → `{ resetToken }`. The `resetToken` is a JWT valid for 15 minutes.
3. **POST `/auth/reset-password`** — `{ resetToken, newPassword }` → `{ message }`.

Notes:
- The `resetToken` is held in component state only (never persisted to `localStorage`).
- `min` 8 chars for the new password, confirm field must match (Zod `refine`).

### Base64 Encoding

All code/content fields sent to and received from the backend use **Base64** encoding (UTF-8 safe via `TextEncoder`). This includes:
- `code` and `stdin` in execution requests
- `content` in `CodeFile[]` (starter code, activity files)
- `input` and `expectedOutput` in test cases

Helper functions are in `src/utils/base64.util.ts`:
```ts
encodeToBase64(str: string): string   // TextEncoder → Base64
decodeFromBase64(b64: string): string // Base64 → TextDecoder
```

### Rate Limiting

| Endpoints                                  | Limit                                |
| ------------------------------------------ | ------------------------------------ |
| `/execution/run`, `/execution/run-with-files` | 2 requests per 5 minutes per IP      |
| `/activity/:id/submit`                     | 2 requests per 5 minutes per IP      |

When rate-limited, the backend returns **HTTP 429**. The frontend shows a "wait 5 minutes" message in the output panel (`EditorComponent`).

### ID Conventions

| Resource            | ID Type |
| ------------------- | :-----: |
| Activity (`/activity/:id`) | UUID (string) |
| User                | UUID (string) |
| Subject             | integer |
| Language             | integer |
| Invitation           | integer |
| TestCase             | integer |

### Key Endpoints Summary

| Method | Route                        | Auth     | Description                            |
| ------ | ---------------------------- | :------: | -------------------------------------- |
| POST   | `/auth/login`                | No       | Login                                  |
| POST   | `/auth/register`             | No       | Registration                           |
| POST   | `/auth/refreshSession`       | No       | Refresh token pair                     |
| POST   | `/auth/forgot-password`      | No       | Send password reset code by email      |
| POST   | `/auth/verify-reset-code`    | No       | Verify reset code, issue reset token   |
| POST   | `/auth/reset-password`       | No       | Set new password with reset token      |
| GET    | `/subject`                   | Yes      | List subjects (paginated)              |
| GET    | `/subject/:id`               | Yes      | Get subject by ID                      |
| POST   | `/subject`                   | Yes      | Create subject                         |
| POST   | `/subject/:id/duplicate`     | Yes      | Duplicate subject with activities and test cases (Teacher/God) |
| PUT    | `/subject/:id`               | Yes      | Update subject                         |
| DELETE | `/subject/:id`               | Yes      | Delete subject                         |
| GET    | `/activity`                  | Yes      | List all activities                    |
| GET    | `/activity/:id`              | Yes      | Get activity (with starterCode)        |
| POST   | `/activity`                  | Yes      | Create activity                        |
| PUT    | `/activity/:id`              | Yes      | Update activity                        |
| DELETE | `/activity/:id`              | Yes      | Delete activity                        |
| GET    | `/activity/:id/workspace`    | No       | Public workspace for embedded editor   |
| POST   | `/activity/:id/submit`       | Optional | Submit solution for evaluation         |
| GET    | `/activity/:id/grades`       | Yes      | Per-activity student grades (Teacher/God) |
| GET    | `/activity/:id/submissions/:submissionId` | Yes | Submission detail with code snapshot (Teacher/God) |
| GET    | `/subject/:id/students`      | Yes      | Enrolled students of a subject (Teacher/God) |
| POST   | `/enrollment`                | Yes      | Enroll a student in a subject          |
| GET    | `/enrollment`                | Yes      | List enrollments (Student/Teacher/God) |
| DELETE | `/enrollment/:id`            | Yes      | Remove an enrollment                   |
| GET    | `/activity/:id/test-case`    | Yes      | List test cases (Teacher only)         |
| POST   | `/activity/:id/test-case`    | Yes      | Create test case (Teacher only)        |
| PUT    | `/activity/:id/test-case/:id`| Yes      | Update test case (Teacher only)        |
| DELETE | `/activity/:id/test-case/:id`| Yes      | Delete test case (Teacher only)        |
| POST   | `/execution/run`             | No       | Execute code (rate-limited)            |
| POST   | `/execution/run-with-files`  | No       | Execute multiple files (rate-limited)  |
| GET    | `/programming-language`      | Yes      | List languages (God only)              |
| POST   | `/programming-language`      | Yes      | Create language (God only)             |
| PUT    | `/programming-language/:id`  | Yes      | Update language (God only)             |
| DELETE | `/programming-language/:id`  | Yes      | Delete language (God only)             |
| GET    | `/invitation`                | Yes      | List invitations, paginated (God only) |
| POST   | `/invitation`                | Yes      | Create invitation code (God only)      |
| PUT    | `/invitation/:id`            | Yes      | Update invitation (God only)           |
| DELETE | `/invitation/:id`            | Yes      | Delete invitation (God only)           |
| GET    | `/user/profile`              | Yes      | Get authenticated user profile         |
| PATCH  | `/user/profile`              | Yes      | Update profile (name, lastName, etc.)  |
| PATCH  | `/user/password`             | Yes      | Change password                        |
| GET    | `/user`                      | Yes      | List users, paginated (God only)       |
| PATCH  | `/user/:id`                  | Yes      | Manage user: password, isActive, role (God only) |
| GET    | `/settings/email-domains`    | Yes      | List allowed registration email domains (God only) |
| PUT    | `/settings/email-domains`    | Yes      | Replace allowed registration email domains (God only) |

### Error Response Format

All backend errors follow this structure:
```json
{ "error": "Descriptive error message" }
```

HTTP codes and their handling (via Axios interceptors):

| Code | Behavior                                           |
| :--: | -------------------------------------------------- |
| 400  | Invalid parameters — surfaced per-request          |
| 401  | Token invalid/expired → refresh attempt → logout   |
| 403  | Insufficient permissions → redirect to `/dashboard` + toast |
| 404  | Resource not found → toast                         |
| 429  | Rate limit → "wait 5 minutes" message              |
| 500  | Server error → toast                               |

### Service File Mapping

| Endpoint                    | Service File                     |
| --------------------------- | -------------------------------- |
| `/auth/*`                   | `src/service/AuthService.ts`     |
| `/subject/*`                | `src/service/SubjectService.ts`  |
| `/activity/*`               | `src/service/ActivityService.ts` |
| `/activity/:id/test-case/*` | `src/service/TestCaseService.ts` |
| `/execution/run`, `/execution/run-with-files` | `src/service/EditorService.ts` |
| `/enrollment/*`             | `src/service/EnrollmentService.ts` |
| `/programming-language/*`   | `src/service/LanguageService.ts` |
| `/invitation/*`             | `src/service/InvitationsService.ts` |
| `/user/*`                   | `src/service/UserService.ts`        |
| `/settings/*`               | `src/service/SettingsService.ts`    |

---

## Settings Page

The `/setting` page (`src/pages/Setting.tsx`) is split into two sections:

- **Configuración del Perfil** — visible to all authenticated users (profile information + change password).
- **Configuración Global del Sistema** — visible **only to `God`** (allowed registration email domains).

### Profile Information
- Fetched from `GET /user/profile` on mount
- Editable fields: **name**, **lastName**
- Read-only fields: **email**, **identifier**, **role** (shown as badge)
- Saved via `PATCH /user/profile` — only changed fields are sent
- On success, `useAuth().updateUserName()` refreshes the name in the sidebar in real time

### Change Password
- Form with 3 fields: current password, new password, confirm password
- Validated with Zod: min 8 chars for new password, must match confirmation
- Calls `PATCH /user/password`
- On success, all password fields are cleared
- On HTTP 401, shows "La contraseña actual es incorrecta"

Both forms use React Hook Form + Zod (same pattern as `LoginForm`).

### Global System Settings (God only)

- Fetched from `GET /settings/email-domains` on mount (only when `user.role === "God"`).
- The **"Dominios de correo permitidos"** card lets the admin manage the list of email domains
  allowed to register on the platform.
- Domains are added one by one via an input + `Badge` chips (with remove buttons). Input is
  validated with a domain regex, lowercased and deduplicated client-side.
- Saved via `PUT /settings/email-domains` (replaces the whole list).
- An empty list (`{"domains": []}`) means **all domains are allowed** — the UI shows a hint for this.
- The response/request schema is `{ domains: string[] }` (no `{ success, data }` wrapper).

---

## Pending Work

### Backend / Deployment
- **Server is currently unreachable** — `https://codepanel.orchfr.duckdns.org` (IP `139.177.97.29`) times out on `/api/health`, `/api/v1` and `/`. DNS resolves but the VPS/containers are not responding. Needs VPS access to diagnose (Docker, Nginx, ports) and restart services. Until resolved, no data loads in the frontend.
- **Grades aggregated by subject** — the backend exposes grades only per-activity (`GET /activity/:id/grades`). The "Calificaciones" view (`SubjectGrades.tsx`) selects an activity and fetches grades per activity. A backend endpoint for "grades by subject" would simplify this (requested, pending).
- **Student enrollment flow** — the `/enrollment` endpoints exist but the Student UI (self-enroll, list own enrollments) is not built. The Dashboard shows "Mis Materias" for Student via `GET /enrollment`, but the full student flow is pending.

### Frontend
- **Block Student login on the main platform** — the Student role should only log in inside the iframe, not on the main web app (they share `localStorage`). Approach (detect iframe + role guard) was discussed but left pending.
- **Interceptor bug** — `src/lib/interceptorsConfig.ts:28` accesses `error.response.status` without guarding for network errors (timeout/offline), which crashes the whole app when the backend is unreachable. Fix: add `if (!error.response) return Promise.reject(error)` at the start of the refresh-token error handler (mirroring the safe pattern at line 62).

### Deuda técnica / Quality
- No automated tests configured (see `TECHNICAL_DEBT.md`).
- Lint: **0 errores**, solo 4 warnings `react-refresh/only-export-components` en primitivas shadcn/ui (`theme-provider`, `badge`, `button`, `sidebar`) que intencionalmente exportan variantes/helpers.
- Architectural debt (domain separation, dependency injection, repository layer, caching) documented in `TECHNICAL_DEBT.md`.
