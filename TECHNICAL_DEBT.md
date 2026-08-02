# TECHNICAL_DEBT.md — CodePanel Frontend

## Resumen

| Severidad | Cantidad |
|-----------|----------|
| Crítica    | 3        |
| Alta       | 6        |
| Media      | 12       |
| Baja       | 8        |
| **Total**  | **29**   |

---

## CRÍTICA

### 1. Sin Error Boundaries

**Archivos afectados:** Todo el proyecto

No existe ningún `ErrorBoundary` de React en la aplicación. Cualquier error no capturado durante el renderizado crashea toda la app a una pantalla blanca. Esto es especialmente riesgoso en componentes complejos como `EditorComponent` (265 líneas, integración con Monaco) y `SubjectDetailView` (dnd-kit).

**Componentes de mayor riesgo:**
- `src/components/EditorComponent.tsx` — Monaco Editor, 5 sub-paneles
- `src/pages/CreateActivityView.tsx` — 224 líneas, integración con editor
- `src/pages/EditActivityView.tsx` — 200 líneas
- `src/pages/SubjectDetailView.tsx` — 169 líneas, dnd-kit

**Recomendación:** Envolver al menos `DashboardLayout` y `EmbedEditor` en `ErrorBoundary` con recuperación graceful.

---

### 2. `starterCode: any | null` rompe type safety

**Archivo:** `src/types/response/ActivityResponse.ts:8`

```ts
starterCode: any | null;
```

El tipo `any` en la respuesta de actividad se propaga por todo el flujo: carga (`EditActivityView.tsx:73`), decodificación (`EditActivityView.tsx:80`), y renderizado. Al usar `any`, TypeScript no puede verificar nada de lo que se hace con este campo.

**Recomendación:** Tiparlo correctamente como:
```ts
starterCode: CodeFile[] | null;
```

---

### 3. `api.get<any>` en ActivityService

**Archivo:** `src/service/ActivityService.ts:10`

```ts
const response = await api.get<any>('/activity');
```

El `any` como genérico anula completamente el type checking de TypeScript para toda la respuesta de actividades. Si la API cambia su formato, el compilador no advertirá nada.

**Recomendación:** Usar el tipo correcto:
```ts
const response = await api.get<PaginatedResponse<ActivitySummaryResponse>>('/activity');
```

---

## ALTA

### 4. ~80% de código duplicado entre CreateActivity y EditActivity

**Archivos:**
- `src/pages/CreateActivityView.tsx` (241 líneas)
- `src/pages/EditActivityView.tsx` (222 líneas)

**Duplicación comprobada:**

| Elemento | CreateActivityView | EditActivityView |
|----------|-------------------|------------------|
| FormData state | Líneas 40-48 | Líneas 33-41 |
| Mapeo de lenguajes | Líneas 59-63 | Líneas 60-64 |
| Payload starterCode | Líneas 93-96 | Líneas 121-124 |
| JSX layout | Líneas 109-241 | Líneas 142-222 |
| Cards de configuración | Líneas 164-219 | Líneas 182-207 |

El comentario en `EditActivityView.tsx:142` lo reconoce: _"El JSX es casi idéntico al de crear"_.

**Recomendación:** Extraer un componente compartido `<ActivityFormLayout>` y un hook `useActivityForm()`.

---

### 5. EditorComponent (265 líneas) — mezcla 5 responsabilidades

**Archivo:** `src/components/EditorComponent.tsx`

El componente maneja simultáneamente:
1. Barra de herramientas (tema, fuente, descargar, subir)
2. Selector de lenguaje
3. Editor Monaco
4. Panel de output + ejecución
5. Panel de input + panel de test cases

Además contiene estado local para `darkMode` del editor que es independiente del tema global de la app.

**Recomendación:** Dividir en subcomponentes:
- `EditorToolbar.tsx`
- `EditorPane.tsx`
- `OutputPanel.tsx`
- `InputPanel.tsx`
- `TestCasesPanel.tsx`

---

### 6. 18 declaraciones console.log/error en producción

**Archivos y líneas:**

| Archivo | Línea | Declaración |
|---------|-------|-------------|
| `utils/base64.util.ts` | 7 | `console.error("Error codificando a Base64:", error)` |
| `utils/base64.util.ts` | 18 | `console.error("Error decodificando de Base64:", error)` |
| `lib/interceptorsConfig.ts` | 41 | `console.error("Token refresh failed:", error)` |
| `components/LoginForm.tsx` | 45 | `console.log(error)` |
| `components/RegisterForm.tsx` | 62 | `console.log(error)` |
| `components/LanguageForm.tsx` | 52 | `console.error(error)` |
| `pages/CreateActivityView.tsx` | 71 | `console.error("Error al cargar lenguajes:", error)` |
| `pages/CreateActivityView.tsx` | 103 | `console.error("Error al guardar la actividad:", error)` |
| `pages/EditActivityView.tsx` | 83 | `console.error("No se pudo extraer el starterCode:", e)` |
| `pages/EditActivityView.tsx` | 99 | `console.error("Error al cargar la actividad:", error)` |
| `pages/EditActivityView.tsx` | 132 | `console.error("Error al actualizar la actividad:", error)` |
| `pages/Language.tsx` | 22 | `console.error("Error cargando lenguajes", error)` |
| `pages/Language.tsx` | 40 | `console.error("Error al eliminar:", error)` |
| `pages/Language.tsx` | 70 | `console.log("Editar", lang)` |
| `pages/SubjectDetailView.tsx` | 61 | `console.error("Error al cargar la información:", error)` |
| `pages/SubjectDetailView.tsx` | 91 | `console.log("Editar actividad:", activityId)` |
| `pages/SubjectDetailView.tsx` | 105 | `console.error("Error al eliminar la actividad:", error)` |
| `pages/Subject.tsx` | 43 | `` console.log(`Accediendo al curso: ${id}`) `` |

**Riesgo:** Filtran stack traces y detalles internos en producción. Ya se usa `toast` para errores de usuario — los `console.*` son redundantes.

**Recomendación:** Crear un logger centralizado condicionado a `import.meta.env.DEV` o eliminar todos y confiar en los toasts.

---

### 7. URLs hardcodeadas en código fuente

**Archivos:**
- `src/lib/axios.ts:5` — `"https://codepanel.orchfr.duckdns.org/api/v1"`
- `src/components/SortableActivityItem.tsx:39` — `"https://codepanel.orchfr.duckdns.org/embed/activity/..."`

Cambiar de entorno (local → staging → producción) requiere modificar código fuente.

**Recomendación:** Usar variables de entorno de Vite (`import.meta.env.VITE_API_BASE_URL`) con fallback a localhost para desarrollo.

---

### 8. Strings de roles y números mágicos

| Ubicación | Valor | Tipo |
|-----------|-------|------|
| `App.tsx:46` | `"God"` | String mágico de rol |
| `SidebarMenuApp.tsx:89` | `'God'` | String mágico de rol |
| `SidebarMenuApp.tsx:100` | `'God'` | String mágico de rol |
| `Access.tsx:19` | `PROFESOR_ROLE = 3` | Número mágico de rol |

**Recomendación:** Crear un enum `UserRole`:
```ts
export const UserRole = {
  GOD: 'God',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
} as const;
```

---

### 9. Sin tests

No existe ningún test en el proyecto. No hay configuración de Vitest, Jest, React Testing Library ni Playwright/Cypress.

**Recomendación:** Empezar con tests unitarios para servicios y hooks, luego tests de integración para flujos críticos (login, ejecución de código).

---

## MEDIA

### 10. useEffect con dependencias incompletas

| Archivo | Línea | Problema |
|---------|-------|----------|
| `assets/context/AuthContext.tsx` | 35 | `checkToken` no está en deps |
| `pages/Access.tsx` | 21 | `fetchInvitations` no está en deps |
| `pages/CreateActivityView.tsx` | 50 | `subjectId` no está en deps (array vacío `[]`) |
| `pages/Language.tsx` | 16 | `fetchLanguages` no está en deps |
| `pages/Subject.tsx` | 25 | `fetchSubjects` no está en deps |
| `pages/Subject.tsx` | 187 | Sin dependency array (código comentado) |

**Riesgo:** Stale closures — las funciones dentro del efecto pueden leer valores desactualizados.

**Recomendación:** Mover las funciones dentro del `useEffect` o usar `useCallback`. Activar la regla `react-hooks/exhaustive-deps` como error en ESLint.

---

### 11. Sin separación por pilares de negocio (dominios)

La estructura actual es puramente técnica (carpetas por tipo de archivo):

```
src/
  pages/        ← Auth, Subject, Activity, Admin, Editor — todo mezclado
  components/   ← Forms, Cards, Editor, UI — sin agrupar por dominio
  service/      ← Todos los servicios planos
  types/        ← Tipos planos en request/, response/, dto/
```

**Problemas:**
- Un desarrollador nuevo no sabe qué archivos pertenecen a qué funcionalidad
- Los límites entre módulos no son visibles
- Riesgo de acoplamiento accidental entre dominios

**Recomendación:** Migrar a estructura por dominio (ver sección "Propuesta de Arquitectura por Dominios").

---

### 12. Sin inyección de dependencias

Todos los servicios importan directamente el singleton `api`:

```ts
// src/service/SubjectService.ts (y todos los demás)
import api from "@/lib/axios";
```

**Problemas:**
- Imposible testear servicios con un mock HTTP sin hacks de módulo
- No se puede cambiar el cliente HTTP sin modificar cada archivo
- No se pueden configurar múltiples instancias (ej. una con y sin auth)

**Recomendación:** Implementar un contenedor DI ligero — un React Context que provea las instancias de servicios, o factory functions:

```ts
// En lugar de exportar funciones sueltas:
export const SubjectService = (api: AxiosInstance) => ({
  getSubjectsByUser: async () => { ... },
  createSubject: async (data) => { ... },
  // ...
});
```

---

### 13. Sin capa de repositorio/adaptador

Los servicios son a la vez lógica de negocio y capa HTTP. Si el backend cambia (REST → GraphQL, o cambian endpoints), hay que modificar cada servicio.

**Recomendación:** Separar en 3 capas:
```
api/         ← Cliente HTTP puro (endpoints)
repository/  ← Adaptador (transforma DTOs de API a modelos de dominio)
service/     ← Lógica de negocio (usa repository, no api directamente)
```

---

### 14. Sin caché ni deduplicación de requests

`getSubjectById` se llama en `CreateActivityView`, `EditActivityView` y `SubjectDetailView` sin compartir resultados. Si el usuario navega entre estas vistas, se repiten requests idénticos.

**Recomendación:** Implementar una capa de caché simple (Map con TTL) o usar React Query/TanStack Query para manejar fetching, caché y revalidación.

---

### 15. Dashboard con datos fake

**Archivo:** `src/pages/Dashboard.tsx:23,31`

```tsx
<StatCard title="Total de Cursos" value="7" ... />
<StatCard title="Total de Plantillas" value="55" ... />
```

Los valores están hardcodeados. No hay fetch real de estadísticas.

---

### 16. Panel de test cases es UI muerta

**Archivo:** `src/components/EditorComponent.tsx:252-282`

Todo el panel de test cases es JSX estático con datos de ejemplo (Case 1 aprobado, Case 2 pendiente). Los botones "+ Añadir caso" y "Test" no tienen handlers.

---

### 17. RegisterForm — mensajes de error inconsistentes

**Archivo:** `src/components/RegisterForm.tsx`

Los campos `email`, `password` y `confirmPassword` muestran errores de validación visualmente, pero `name` (línea 81-84), `lastName` (línea 91-94), `identifier` (línea 149-150), e `invitationCode` (línea 158-160) no tienen el bloque `{form.formState.errors.* && ...}`.

---

### 18. EmbedEditor hardcodea lenguajes

**Archivo:** `src/pages/EmbedEditor.tsx:5-9`

```ts
const lenguajesSoportados = [
  { id: 1, name: "JavaScript", monacoId: "javascript" },
  { id: 2, name: "Python", monacoId: "python" },
  { id: 3, name: "TypeScript", monacoId: "typescript" },
];
```

No consulta la API de lenguajes. Si se añade un lenguaje nuevo en el backend, el editor embebido no lo mostrará.

---

### 19. Sin paginación real en Access

**Archivo:** `src/pages/Access.tsx:28`

```ts
const response = await getAllInvitations(1, 50);
```

La paginación está hardcodeada a página 1, 50 items. No hay UI para navegar páginas ni se consulta `totalCount`.

---

### 20. Botones Download/Upload sin handler

**Archivo:** `src/components/EditorComponent.tsx:6,131-137`

Los iconos `Download` y `Upload` de Lucide están importados y renderizados con estilos hover, pero sus botones no tienen `onClick`.

---

### 21. Sin sanitización del output de ejecución

**Archivo:** `src/components/EditorComponent.tsx:230`

```tsx
<div className="... whitespace-pre-wrap">
  {output}
</div>
```

El output del backend se renderiza directamente como HTML. Si el backend no sanitiza, hay riesgo de XSS si un usuario logra que el código ejecutado produzca HTML/scripts en el output.

**Recomendación:** Sanitizar el output antes de renderizar, o asegurar que el backend siempre escape el contenido.

---

## BAJA

### 22. Código muerto comentado

**Archivo:** `src/pages/Subject.tsx:175-209`

35 líneas de un componente `Course` alternativo comentado (incluye `EditorComponent` y `SUPPORTED_LANGUAGES`).

### 23. Interfaces vacías sin uso

**Archivo:** `src/types/EditorProps.ts:14,16`

```ts
export interface EditorConfig {}
export interface EditorTestCase {}
```

### 24. Tipos de request duplicados

`CreateActivityRequest` y `UpdateActivityRequest` comparten `title`, `description`, `maxAttempts`, `allowCopy`, `allowPaste`, `starterCode` pero son interfaces independientes. Deberían heredar de `BaseActivityRequest`.

### 25. Acceso directo a localStorage fuera de servicio

**Archivo:** `src/components/theme-provider.tsx:30,54`

El theme provider accede a `localStorage` directamente en lugar de usar una abstracción común como `TokenService`.

### 26. Número mágico en media query

**Archivo:** `src/hooks/use-mobile.ts:3`

```ts
const MOBILE_BREAKPOINT = 768;
```

### 27. Typos en nombres

| Archivo | Línea | Actual | Correcto |
|---------|-------|--------|----------|
| `service/SubjectService.ts` | 25 | `updateSuject` | `updateSubject` |
| `guards/RoleGuard.tsx` | 4 | `RoleCuardProps` | `RoleGuardProps` |

### 28. Páginas placeholder sin implementar

- `src/pages/Student.tsx` — `<h1>Estoy en alumnos</h1>`
- `src/pages/Setting.tsx` — `<h1>Estoy en settings</h1>`

### 29. `onEdit` de Language sin implementar

**Archivo:** `src/pages/Language.tsx:70`

```tsx
onEdit={(lang) => console.log("Editar", lang)}
```

---

## Deuda Arquitectónica

### 1. Sin Inyección de Dependencias

**Situación actual:** Cada servicio importa `api` (un singleton de Axios) directamente.

```
┌──────────────────────────────────────────────┐
│  pages/ ──► services/ ──► api (singleton)    │
│  (todo fuertemente acoplado)                 │
└──────────────────────────────────────────────┘
```

**Problemas:**
- Imposible testear servicios sin el singleton real
- Cambiar de Axios a fetch nativo requiere tocar cada servicio
- Diferentes contextos (auth vs no-auth) usan la misma instancia

**Solución propuesta — Factory Functions con Context:**

```ts
// src/shared/api/types.ts
export interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
  put<T>(url: string, data: unknown): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

// src/modules/subject/services/SubjectService.ts
export const createSubjectService = (http: HttpClient) => ({
  getSubjectsByUser: () => http.get<SubjectResponse[]>("/subject"),
  createSubject: (data: CreateSubjectRequest) => http.post<SubjectResponse>("/subject", data),
  // ...
});

// src/shared/context/ServicesContext.tsx
const ServicesContext = createContext<Services | null>(null);

export const useServices = () => {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("ServicesContext no encontrado");
  return ctx;
};
```

---

### 2. Sin separación por pilares del negocio (dominios)

**Situación actual:** Estructura plana por tipo técnico de archivo.

**Propuesta de Arquitectura por Dominios:**

```
src/
├── modules/
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── services/
│   │   │   └── AuthService.ts
│   │   ├── guards/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RoleGuard.tsx
│   │   └── types/
│   │       ├── LoginRequest.ts
│   │       ├── RegisterRequest.ts
│   │       └── AuthResponse.ts
│   │
│   ├── subject/
│   │   ├── pages/
│   │   │   ├── Subject.tsx
│   │   │   └── SubjectDetailView.tsx
│   │   ├── components/
│   │   │   ├── SubjectCard.tsx
│   │   │   ├── CreateSubjectModal.tsx
│   │   │   └── EditSubjectModal.tsx
│   │   ├── services/
│   │   │   └── SubjectService.ts
│   │   └── types/
│   │       ├── CreateSubjectRequest.ts
│   │       └── SubjectResponse.ts
│   │
│   ├── activity/
│   │   ├── pages/
│   │   │   ├── CreateActivityView.tsx
│   │   │   └── EditActivityView.tsx
│   │   ├── components/
│   │   │   ├── SortableActivityItem.tsx
│   │   │   └── ActivityFormLayout.tsx    ← nuevo (extraído del código duplicado)
│   │   ├── services/
│   │   │   └── ActivityService.ts
│   │   ├── hooks/
│   │   │   └── useActivityForm.ts        ← nuevo (lógica compartida)
│   │   └── types/
│   │       ├── CreateActivityRequest.ts
│   │       ├── UpdateActivityRequest.ts
│   │       └── ActivityResponse.ts
│   │
│   ├── editor/
│   │   ├── pages/
│   │   │   └── EmbedEditor.tsx
│   │   ├── components/
│   │   │   ├── EditorComponent.tsx
│   │   │   ├── EditorToolbar.tsx         ← extraído
│   │   │   ├── OutputPanel.tsx           ← extraído
│   │   │   ├── InputPanel.tsx            ← extraído
│   │   │   └── TestCasesPanel.tsx        ← extraído
│   │   ├── services/
│   │   │   └── EditorService.ts
│   │   ├── utils/
│   │   │   └── base64.util.ts
│   │   └── types/
│   │       ├── EditorProps.ts
│   │       ├── CodeFile.ts
│   │       └── ExecutionStatus.ts
│   │
│   ├── admin/
│   │   ├── pages/
│   │   │   ├── Language.tsx
│   │   │   └── Access.tsx
│   │   ├── components/
│   │   │   ├── LanguageTable.tsx
│   │   │   ├── LanguageForm.tsx
│   │   │   └── InvitationTable.tsx
│   │   ├── services/
│   │   │   ├── LanguageService.ts
│   │   │   └── InvitationsService.ts
│   │   └── types/
│   │       ├── CreateLanguageRequest.ts
│   │       ├── LanguageResponse.ts
│   │       ├── InvitationDTO.ts
│   │       └── UserRole.ts              ← nuevo (enum de roles)
│   │
│   └── dashboard/
│       ├── pages/
│       │   └── Dashboard.tsx
│       └── components/
│           └── CardInfo.tsx
│
├── shared/
│   ├── components/
│   │   ├── ui/                  ← shadcn/ui primitives
│   │   ├── DashboardLayout.tsx
│   │   ├── SidebarMenuApp.tsx
│   │   ├── ModeToggle.tsx
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   ├── http-client.ts       ← abstracción del cliente HTTP
│   │   ├── interceptors.ts
│   │   ├── logger.ts            ← nuevo (logger centralizado)
│   │   └── utils.ts
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ServicesContext.tsx   ← nuevo (DI container)
│   └── types/
│       └── common.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

**Beneficios:**
- Cada módulo tiene límites claros y puede evolucionar independientemente
- Nuevos desarrolladores localizan rápido el código relevante a su tarea
- Se reduce el riesgo de acoplamiento accidental entre dominios
- Facilita code splitting por módulo (lazy loading de rutas)

---

## Prioridades de Refactorización Recomendadas

### Fase 1 (Seguridad y estabilidad)
1. Agregar `ErrorBoundary` al menos en `DashboardLayout` y `EmbedEditor`
2. Eliminar o condicionar los 18 `console.log/error`
3. Sanitizar el output del editor antes de renderizar

### Fase 2 (Type safety)
4. Corregir `starterCode: any | null` → `starterCode: CodeFile[] | null`
5. Eliminar `api.get<any>` en ActivityService
6. Crear `UserRole` enum y reemplazar strings/números mágicos

### Fase 3 (Eliminar duplicación)
7. Extraer `ActivityFormLayout` y `useActivityForm` de Create/Edit
8. Dividir `EditorComponent` en subcomponentes
9. Extraer mapeo de lenguajes a función utilitaria

### Fase 4 (Arquitectura)
10. Mover `api` a `HttpClient` abstraído con factory functions
11. Reorganizar en estructura por dominios (migración progresiva)
12. Configurar TanStack Query para manejo de estado servidor

### Fase 5 (Calidad)
13. Configurar Vitest + React Testing Library
14. Agregar tests unitarios para servicios
15. Agregar tests de integración para flujos críticos
16. Activar `exhaustive-deps` como error en ESLint
