# CodePanel — Frontend

Plataforma web de ejecución remota de código, embebida en Moodle LMS mediante iframe. Desarrollada como proyecto de servicio social en la **Universidad Autónoma de Yucatán (UADY)**.

Permite a profesores crear actividades de programación, a estudiantes ejecutar código desde un editor basado en Monaco, y a administradores gestionar lenguajes y códigos de acceso.

---

## Tech Stack

| Capa              | Tecnología                         |
| ----------------- | ---------------------------------- |
| Framework         | React 19                           |
| Lenguaje          | TypeScript 5.9                     |
| Build Tool        | Vite 8                             |
| Estilos           | Tailwind CSS 4 + tw-animate-css    |
| Componentes UI    | shadcn/ui (Radix UI) + Lucide      |
| Editor de Código  | @monaco-editor/react (Monaco 0.55) |
| Routing           | React Router v7                    |
| HTTP Client       | Axios                              |
| Autenticación     | JWT (access + refresh tokens)      |
| Formularios       | React Hook Form + Zod              |
| Notificaciones    | Sonner (toast)                     |
| Drag & Drop       | @dnd-kit                           |
| Theming           | next-themes                        |

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

| Comando                | Descripción                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Iniciar servidor de desarrollo con Vite        |
| `npm run build`        | TypeCheck + build de producción                |
| `npm run preview`      | Previsualizar build de producción              |
| `npm run lint`         | Ejecutar ESLint                                |
| `npm run format`       | Formatear código con Prettier                  |
| `npm run format:check` | Verificar formato sin modificar archivos       |

---

## Estructura del Proyecto

```
src/
├── pages/               # Componentes de página (rutas)
│   ├── EmbedEditor.tsx   # Editor embebido público (iframe Moodle)
│   ├── Login.tsx / Register.tsx
│   ├── Dashboard.tsx / DashboardLayout.tsx
│   ├── Subject.tsx / SubjectDetailView.tsx
│   ├── CreateActivityView.tsx / EditActivityView.tsx
│   ├── Student.tsx / Setting.tsx
│   ├── Access.tsx / Language.tsx
│
├── components/
│   ├── ui/               # Primitivas shadcn/ui
│   ├── EditorComponent.tsx   # Editor Monaco + panel output
│   ├── SidebarMenuApp.tsx
│   ├── SubjectCard.tsx
│   └── ...
│
├── service/              # Capa de servicios API
├── types/                # Tipos (request, response, dto, enum)
├── guards/               # Guards de autenticación y roles
├── lib/                  # Axios, interceptors, utils
├── assets/context/       # AuthContext (estado de sesión)
├── utils/                # Utilidades (base64)
└── hooks/                # Hooks personalizados
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
- `AuthContext` expone `user`, `isAuthenticated`, `isLoading`, `loginState()`, `logoutState()`.
- `ProtectedRoute` envuelve rutas autenticadas.
- `RoleGuard` restringe por rol de usuario.

### Ejecución de Código

1. El usuario escribe código en Monaco Editor (`EditorComponent`).
2. Al presionar "Run", el código y stdin se codifican a **Base64** (UTF-8 seguro vía `TextEncoder`).
3. Se envía POST a `/api/v1/execution/run` con `{ languageId, code, stdin }`.
4. La respuesta incluye `status`, `stdout`, `stderr` y `timeMs`.
5. El panel de output muestra el resultado con formato según el estado.

### Estados de Ejecución

| Estado                | Significado                               |
| --------------------- | ----------------------------------------- |
| `SUCCESS`             | Código ejecutado correctamente            |
| `COMPILE_ERROR`       | Error de compilación/sintaxis             |
| `RUNTIME_ERROR`       | Excepción en tiempo de ejecución          |
| `TIME_LIMIT_EXCEEDED` | El código excedió el límite de tiempo     |

Adicionalmente, el código 429 (rate limit) se maneja con mensaje de "espera 5 minutos".

---

## Roles de Usuario

| Rol       | Permisos                                                        |
| --------- | --------------------------------------------------------------- |
| **God**   | Super admin — gestión de lenguajes, códigos de invitación       |
| **Teacher** | Profesor — gestiona materias, actividades, estudiantes        |
| **Student** | Estudiante — puede registrarse pero **no tiene vistas aún**   |

---

## Rutas Principales

| Ruta                                        | Auth | Rol      | Descripción                        |
| ------------------------------------------- | :--: | :------: | ---------------------------------- |
| `/login`                                    |  No  |    —     | Inicio de sesión                   |
| `/register`                                 |  No  |    —     | Registro                           |
| `/embed/editor`                             |  No  |    —     | Editor público (iframe Moodle)     |
| `/dashboard`                                |  Sí  |    —     | Panel principal                    |
| `/course`                                   |  Sí  |    —     | Listado de materias                |
| `/subject/:id`                              |  Sí  |    —     | Actividades de una materia         |
| `/subject/:id/activity/new`                 |  Sí  |    —     | Crear actividad                    |
| `/subject/:id/activity/:activityId/edit`    |  Sí  |    —     | Editar actividad                   |
| `/student`                                  |  Sí  |    —     | Estudiantes (placeholder)          |
| `/setting`                                  |  Sí  |    —     | Configuración                      |
| `/access`                                   |  Sí  |   God    | Códigos de invitación              |
| `/language`                                 |  Sí  |   God    | Gestión de lenguajes               |
| `/403`                                      |  —   |    —     | Acceso denegado                    |

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

| Workflow              | Disparador     | Acción                                      |
| --------------------- | -------------- | ------------------------------------------- |
| `cicd_docker.yml`     | Push de tag `v*` | Build multi-arch + push a GHCR             |
| `cd_deploy_on_vps.yml` | Post-Docker publish | SSH al VPS → `docker compose pull && up -d` |

---

## Documentación Adicional

- [AGENTS.md](./AGENTS.md) — Guía para agentes de IA y asistentes de código
- [TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md) — Catálogo de deuda técnica y prioridades de refactorización
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Arquitectura detallada y flujos del sistema
- [docs/API.md](./docs/API.md) — Referencia de endpoints del backend
