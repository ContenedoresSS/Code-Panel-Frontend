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
│   ├── EmbedEditor.tsx   # Public embedded editor (for Moodle iframe)
│   ├── Login.tsx         # Login page
│   ├── Register.tsx      # Registration page
│   ├── Dashboard.tsx     # Main dashboard (overview)
│   ├── DashboardLayout.tsx # Authenticated layout with sidebar
│   ├── Subject.tsx       # Course/subject listing & CRUD
│   ├── SubjectDetailView.tsx  # Activities within a subject
│   ├── CreateActivityView.tsx # Create new activity
│   ├── EditActivityView.tsx   # Edit existing activity
│   ├── Student.tsx       # Student view (placeholder — not implemented)
│   ├── Setting.tsx       # User settings
│   ├── Access.tsx        # Invitation code management (God only)
│   └── Language.tsx      # Programming language management (God only)
│
├── components/
│   ├── ui/               # shadcn/ui primitives (button, card, sidebar, etc.)
│   ├── EditorComponent.tsx   # Monaco-based code editor with output panel
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
│   ├── SortableActivityItem.tsx # Draggable activity item
│   ├── ModeToggle.tsx        # Light/dark theme toggle
│   └── theme-provider.tsx
│
├── service/              # API service layer (one file per resource)
│   ├── AuthService.ts        # login, register, refreshSession
│   ├── TokenService.ts       # JWT management (localStorage)
│   ├── SubjectService.ts     # Subject CRUD
│   ├── ActivityService.ts    # Activity CRUD
│   ├── EditorService.ts      # Code execution endpoint
│   ├── LanguageService.ts    # Language CRUD
│   └── InvitationsService.ts # Invitation code CRUD
│
├── types/
│   ├── request/          # Request DTOs (CreateActivityRequest, LoginRequest, etc.)
│   ├── response/         # Response DTOs (ActivityResponse, AuthResponse, etc.)
│   ├── dto/              # General DTOs (InvitationDTO)
│   ├── enum/             # Constants (ExecutionStatus)
│   ├── EditorProps.ts    # EditorLanguage, EditorCodeFile interfaces
│   ├── CourseProps.ts    # Course/subject type
│   └── CodeFile.ts
│
├── lib/
│   ├── axios.ts             # Axios instance (baseURL config)
│   ├── interceptorsConfig.ts # JWT attach, refresh token, error handling
│   └── utils.ts             # shadcn cn() utility
│
├── guards/
│   ├── ProtectedRoute.tsx    # Auth guard (redirect to /login if not authenticated)
│   └── RoleGuard.tsx         # Role check (redirect to /403 if wrong role)
│
├── assets/
│   └── context/
│       └── AuthContext.tsx   # React context for auth state (user, loginState, logoutState)
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
- `AuthContext` provides `user`, `isAuthenticated`, `isLoading`, `loginState()`, `logoutState()`.
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

1. User writes code in the Monaco Editor (`EditorComponent`).
2. On "Run", the code and stdin are encoded to **Base64** (UTF-8 safe via `TextEncoder`).
3. A POST request is sent to `/api/v1/execution/run` with `{ languageId, code, stdin }`.
4. The response includes `status` (one of the execution statuses below), `stdout`, `stderr`, and `timeMs`.
5. The output panel renders the result with appropriate formatting for each status.

---

## User Roles

| Role      | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `God`     | Super admin — full access including language management and invitation codes |
| `Teacher` | Professor — manages subjects, activities, students                |
| `Student` | Student — can register but **no views have been implemented yet** (the `/student` page is a placeholder) |

---

## Routes Overview

| Path                                        | Auth Required | Role Required | Description                |
| ------------------------------------------- | :-----------: | :-----------: | -------------------------- |
| `/login`                                    | No            | —             | Login page                 |
| `/register`                                 | No            | —             | Registration page          |
| `/embed/editor`                             | No            | —             | Public embedded editor (for Moodle iframe) |
| `/dashboard`                                | Yes           | —             | Main dashboard             |
| `/course`                                   | Yes           | —             | Subject listing            |
| `/subject/:id`                              | Yes           | —             | Subject detail with activities |
| `/subject/:id/activity/new`                 | Yes           | —             | Create new activity        |
| `/subject/:id/activity/:activityId/edit`    | Yes           | —             | Edit existing activity     |
| `/student`                                  | Yes           | —             | Student list (placeholder) |
| `/setting`                                  | Yes           | —             | User settings              |
| `/access`                                   | Yes           | `God`         | Invitation code management |
| `/language`                                 | Yes           | `God`         | Language management        |
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
- **Code and stdin are sent to the backend in Base64** to support special characters and binary-safe transport.
- **The `Student` role exists for registration but has no dedicated UI yet** — the `/student` page is a placeholder.
- The **invitation system** (`/access`) generates one-time-use codes to register teachers. Only `God` role can access this.
- **Theme support** is provided via `next-themes` (light/dark) with a `ModeToggle` component.
- The API base URL comment in `src/lib/axios.ts` shows the local alternative for development — swap the comment when working locally.

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
| GET    | `/subject`                   | Yes      | List subjects (paginated)              |
| GET    | `/subject/:id`               | Yes      | Get subject by ID                      |
| POST   | `/subject`                   | Yes      | Create subject                         |
| PUT    | `/subject/:id`               | Yes      | Update subject                         |
| DELETE | `/subject/:id`               | Yes      | Delete subject                         |
| GET    | `/activity`                  | Yes      | List all activities                    |
| GET    | `/activity/:id`              | Yes      | Get activity (with starterCode)        |
| POST   | `/activity`                  | Yes      | Create activity                        |
| PUT    | `/activity/:id`              | Yes      | Update activity                        |
| DELETE | `/activity/:id`              | Yes      | Delete activity                        |
| GET    | `/activity/:id/workspace`    | No       | Public workspace for embedded editor   |
| POST   | `/activity/:id/submit`       | Optional | Submit solution for evaluation         |
| POST   | `/execution/run`             | No       | Execute code (rate-limited)            |
| POST   | `/execution/run-with-files`  | No       | Execute multiple files (rate-limited)  |
| GET    | `/programming-language`      | Yes      | List languages (God only)              |
| POST   | `/programming-language`      | Yes      | Create language (God only)             |
| DELETE | `/programming-language/:id`  | Yes      | Delete language (God only)             |
| GET    | `/invitation`                | Yes      | List invitations, paginated (God only) |
| POST   | `/invitation`                | Yes      | Create invitation code (God only)      |
| PUT    | `/invitation/:id`            | Yes      | Update invitation (God only)           |
| DELETE | `/invitation/:id`            | Yes      | Delete invitation (God only)           |

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

| Endpoint                  | Service File                     |
| ------------------------- | -------------------------------- |
| `/auth/*`                 | `src/service/AuthService.ts`     |
| `/subject/*`              | `src/service/SubjectService.ts`  |
| `/activity/*`             | `src/service/ActivityService.ts` |
| `/execution/run`          | `src/service/EditorService.ts`   |
| `/programming-language/*` | `src/service/LanguageService.ts` |
| `/invitation/*`           | `src/service/InvitationsService.ts` |
