# ARCHITECTURE.md — CodePanel Frontend

Documentación detallada de la arquitectura, flujos de datos y decisiones de diseño del frontend de CodePanel.

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Flujo de Autenticación](#flujo-de-autenticación)
3. [Flujo de Ejecución de Código](#flujo-de-ejecución-de-código)
4. [Sistema de Roles y Guards](#sistema-de-roles-y-guards)
5. [Capa HTTP e Interceptors](#capa-http-e-interceptors)
6. [Componentes Principales](#componentes-principales)
7. [Embed Editor (Moodle iframe)](#embed-editor-moodle-iframe)
8. [Manejo de Estado](#manejo-de-estado)
9. [Decisiones de Diseño](#decisiones-de-diseño)

---

## Visión General

```
┌──────────────────────────────────────────────────────────┐
│                    CodePanel Frontend                     │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐      │
│  │  Auth    │  │  Editor  │  │  Course Management │      │
│  │  Module  │  │  Module  │  │  Module            │      │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘      │
│       │              │                │                   │
│  ┌────┴──────────────┴────────────────┴──────────┐      │
│  │              HTTP Layer (Axios)                │      │
│  │  - JWT attachment                             │      │
│  │  - Refresh token flow                         │      │
│  │  - Error handling                             │      │
│  └───────────────────────┬───────────────────────┘      │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                    ┌──────┴───────┐
                    │  Backend API │
                    │  /api/v1/*   │
                    └──────────────┘
```

---

## Flujo de Autenticación

```
┌──────────┐    POST /auth/login     ┌──────────┐
│  Login   │ ───────────────────────►│ Backend  │
│  Form    │ ◄───────────────────────│          │
└────┬─────┘  { token, refreshToken }└──────────┘
     │
     │ TokenService.setTokens(token, refreshToken)
     │ → localStorage
     │
     ▼
┌──────────────┐
│ AuthContext  │
│ loginState() │ → jwtDecode(token) → setUser({ id, name, role, identifier })
└──────┬───────┘
       │
       │ isAuthenticated = true
       ▼
┌──────────────┐
│ Dashboard    │
└──────────────┘
```

### Refresh Token Flow

```
1. Request con token expirado → 401
2. Interceptor detecta 401
3. POST /auth/refreshSession con refreshToken
4. Recibe nuevo { token, refreshToken }
5. Actualiza localStorage
6. Reintenta el request original
7. Si falla el refresh → logout + redirect a "/"
```

### Estructura del JWT (DecodedToken)

```ts
interface DecodedToken {
  id: number;       // ID del usuario
  identifier: string; // Identificador único (matrícula)
  role: string;     // "God" | "Teacher" | "Student"
  exp: number;      // Timestamp de expiración
  name: string;     // Nombre del usuario
}
```

### Almacenamiento

| Key              | Valor       |
| ---------------- | ----------- |
| `accesToken`     | JWT token   |
| `refreshToken`   | Refresh token |

---

## Flujo de Ejecución de Código

```
┌─────────────────────┐
│  EditorComponent    │
│                     │
│  1. Usuario escribe │
│     código en Monaco│
│  2. Opcional: stdin │
│  3. Presiona "Run"  │
└────────┬────────────┘
         │
         │ encodeToBase64(code + stdin)
         │ TextEncoder → btoa
         ▼
┌─────────────────────┐
│  EditorService      │
│  executionCode()    │
│                     │
│  Payload:           │
│  {                  │
│    languageId: int  │
│    code: Base64     │
│    stdin: Base64    │
│  }                  │
└────────┬────────────┘
         │
         │ POST /execution/run
         ▼
┌─────────────────────┐
│  Backend            │
│                     │
│  Ejecuta en Docker  │
│  container aislado  │
│  Timeout: ~10s      │
└────────┬────────────┘
         │
         │ Respuesta:
         │ { status, stdout, stderr, timeMs }
         ▼
┌─────────────────────┐
│  Output Panel       │
│                     │
│  Renderiza según    │
│  ExecutionStatus:   │
│  - SUCCESS → stdout │
│  - COMPILE_ERROR    │
│  - RUNTIME_ERROR    │
│  - TIME_LIMIT       │
│  - 429 (rate limit) │
└─────────────────────┘
```

### ¿Por qué Base64?

El código fuente puede contener caracteres especiales, binarios, emojis, o cualquier codificación que no viaja bien en JSON plano. Al codificar en Base64 con `TextEncoder` (UTF-8 seguro), se garantiza transporte binario seguro sin pérdida de datos.

```ts
// src/utils/base64.util.ts
encodeToBase64(text: string): string   // UTF-8 → Base64
decodeFromBase64(base64: string): string // Base64 → UTF-8
```

---

## Sistema de Roles y Guards

```
App.tsx Routes
│
├── Rutas públicas (sin auth)
│   ├── /login
│   ├── /register
│   ├── /embed/editor
│   └── /403
│
├── <ProtectedRoute>  ← Verifica isAuthenticated
│   │                   Si no → redirect a "/"
│   └── <DashboardLayout>  ← Sidebar + contenido
│       ├── /dashboard
│       ├── /course
│       ├── /subject/:id
│       ├── /student
│       ├── /setting
│       │
│       └── <RoleGuard allowedRole="God">  ← Verifica rol
│           │                                Si no → redirect a /403
│           ├── /access
│           └── /language
```

### Funcionamiento de Guards

**ProtectedRoute** (`src/guards/ProtectedRoute.tsx`):
- Usa `useAuth()` para leer `isAuthenticated` e `isLoading`
- Mientras carga → spinner "Cargando sistema..."
- Si no está autenticado → `<Navigate to="" replace />`
- Si está autenticado → renderiza `<Outlet />`

**RoleGuard** (`src/guards/RoleGuard.tsx`):
- Recibe prop `allowedRole: string`
- Mientras carga → spinner "Verificando permisos..."
- Si no está autenticado → redirect a `/`
- Si `user.role !== allowedRole` → redirect a `/403`
- Si coincide → renderiza `<Outlet />`

### Jerarquía de Roles

| Rol       | Valor en JWT | Acceso                                      |
| --------- | :----------: | ------------------------------------------- |
| God       | `"God"`      | Todo (incluye /access, /language)           |
| Teacher   | `"Teacher"`  | Dashboard, cursos, actividades, ajustes     |
| Student   | `"Student"`  | Solo puede registrarse (vistas no implementadas) |

---

## Capa HTTP e Interceptors

### Estructura

```
src/lib/
├── axios.ts              ← Instancia base (baseURL, headers)
└── interceptorsConfig.ts ← 3 interceptors
```

### Interceptor 1: Adjuntar JWT (Request)

```ts
// Corre en cada request saliente
// Excepción: /auth/login y /auth/register (no requieren token)
config.headers.Authorization = `Bearer ${token}`;
```

### Interceptor 2: Refresh Token (Response - Error)

```ts
// Al recibir 401:
// 1. Intenta POST /auth/refreshSession con el refreshToken
// 2. Si éxito → actualiza tokens en localStorage → reintenta request
// 3. Si falla → borra tokens → redirect a "/" → toast de error
```

### Interceptor 3: Manejo de Errores Globales (Response - Error)

| HTTP Status | Acción                                    |
| :---------: | ----------------------------------------- |
| 403         | Redirect a `/dashboard` + toast de error  |
| 404         | Toast "Recurso no encontrado"             |
| 500         | Toast "Error del servidor"                |

---

## Componentes Principales

### EditorComponent (`src/components/EditorComponent.tsx`)

El componente más complejo de la aplicación. Maneja 5 responsabilidades en 290 líneas:

```
┌─────────────────────────────────────────────┐
│  Toolbar                                    │
│  [Archivo] [Download] [Upload] [Font] [🌙] │
│  [Language Selector                  ▾]     │
├──────────────────────┬──────────────────────┤
│  Monaco Editor       │  Output Panel        │
│                      │  [Run Button]        │
│                      │  stdout/stderr       │
├──────────────────────┼──────────────────────┤
│  Input Panel         │  Test Cases          │
│  (stdin textarea)    │  (placeholder)       │
└──────────────────────┴──────────────────────┘
```

**Props:**
```ts
interface EditorPropsInfo {
  languages: EditorLanguage[];         // Lenguajes disponibles
  initialFiles?: EditorFile[];         // Archivos iniciales (multi-archivo)
  onChangeFiles?: (files: EditorFile[]) => void;
  onChangeLanguage?: (languageId: number) => void;
  // ... (restricciones del editor, test cases, submit)
}
```

El editor maneja un arreglo de `EditorFile` (`{ id, nameFile, code, languageId }`) con pestañas (`src/components/editor/FileTabs.tsx`). El **primer archivo** es el punto de entrada (entryPoint) tanto para `/execution/run-with-files` como para el submit. Los archivos pueden **renombrarse** con doble clic en la pestaña.

### DashboardLayout (`src/pages/DashboardLayout.tsx`)

Layout autenticado con sidebar de navegación. Envuelve todas las rutas protegidas. Renderiza `<SidebarMenuApp />` + `<Outlet />` para el contenido.

### SidebarMenuApp (`src/components/SidebarMenuApp.tsx`)

Sidebar con navegación basada en rol:
- **Todos:** Dashboard, Cursos, Ajustes
- **God:** + Acceso, Lenguajes, Usuarios
- Muestra nombre y rol del usuario (de `useAuth()`)

> **Nota:** El item "Alumnos" ya **no** está en el sidebar global. La vista de alumnos es una sub-sección de cada materia (`/subject/:id/students`), gestionada por `SubjectLayout.tsx`.

## Embed Editor (Moodle iframe)

**Ruta:** `/embed/editor` — **sin autenticación**

Diseñado para ser embebido como iframe en Moodle. Características especiales:

```ts
// src/pages/EmbedEditor.tsx

// Lenguajes hardcodeados (no consulta API)
const lenguajesSoportados = [
  { id: 1, name: "JavaScript", monacoId: "javascript" },
  { id: 2, name: "Python", monacoId: "python" },
  { id: 3, name: "TypeScript", monacoId: "typescript" },
];
```

- Usa el mismo `EditorComponent` pero en modo standalone.
- Recibe parámetros por query string (activity ID).
- No requiere login — el endpoint `/execution/run` acepta requests sin auth desde este contexto.

---

## Manejo de Estado

### AuthContext (`src/assets/context/`)

Estado global de autenticación, dividido en tres archivos:

- `auth-context.ts` — define el objeto `AuthContext` y los tipos `User` / `AuthContextType`.
- `AuthProvider.tsx` — el componente proveedor.
- `useAuth.ts` — el hook `useAuth()`.

```ts
interface AuthContextType {
  user: User | null;         // Datos del usuario decodificados del JWT
  isAuthenticated: boolean;  // !!user
  isLoading: boolean;        // true mientras se verifica el token inicial
  loginState: (token: string, refreshToken: string) => void;
  logoutState: () => void;
  updateUserName: (name: string) => void;
}
```

`AuthProvider` inicializa el usuario de forma perezosa desde el JWT en `localStorage`. Si existe y no ha expirado, establece el usuario automáticamente.

### Estado Local

La mayoría de los componentes usan `useState` y `useEffect` para estado local. No hay librería de manejo de estado global más allá del AuthContext. Los servicios se llaman directamente desde los componentes.

---

## Decisiones de Diseño

### ¿Por qué Axios singleton en lugar de fetch nativo?

- Soporte nativo de interceptors (adjuntar JWT, refresh token, errores globales).
- API más concisa para `get<T>()`, `post<T>()`, etc.
- El singleton es una instancia única compartida por todos los servicios — consistencia en configuración.

**Trade-off:** Dificulta el testing (acoplamiento). La deuda técnica #12 propone migrar a factory functions con inyección de dependencias.

### ¿Por qué Base64 para el código?

- Seguridad binaria: caracteres especiales, emojis, encoding arbitrario no rompen el JSON.
- UTF-8 seguro vía `TextEncoder`/`TextDecoder`.
- Es el estándar más portable para transporte de texto arbitrario.

### ¿Por qué localStorage para tokens?

- Simplicidad: no requiere backend de sesiones ni cookies HttpOnly.
- Compatible con el flujo SPA + API REST.
- **Riesgo:** Vulnerable a XSS. En producción se mitiga con Content-Security-Policy y sanitización.

**Trade-off:** Cookies HttpOnly serían más seguras pero requieren cambios en el backend y complican el flujo SPA.

### ¿Por qué estructura plana (pages/, components/, service/) en lugar de módulos por dominio?

Es la estructura inicial del proyecto. La deuda técnica #11 y la sección de "Propuesta de Arquitectura por Dominios" en TECHNICAL_DEBT.md documentan el plan de migración a una estructura modular:

```
src/modules/
├── auth/
├── subject/
├── activity/
├── editor/
├── admin/
└── dashboard/
```

---

## Deuda Técnica Relacionada

Para una lista completa de problemas arquitectónicos y código, consultar [TECHNICAL_DEBT.md](../TECHNICAL_DEBT.md). Los items más relevantes para arquitectura:

- **#1** — Sin Error Boundaries
- **#4** — 80% código duplicado Create/Edit Activity
- **#5** — EditorComponent mezcla 5 responsabilidades
- **#11** — Sin separación por pilares de negocio
- **#12** — Sin inyección de dependencias
- **#13** — Sin capa de repositorio/adaptador
