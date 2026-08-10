# Habit Tracker

Progressive Web App para registrar hábitos y actividades diarias: categorías, etiquetas, duración, valoración y reportes filtrados. Interfaz bilingüe (inglés / español), tema claro-oscuro y funcionamiento instalable como PWA.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Supabase](#supabase)
  - [Configuración del proyecto](#configuración-del-proyecto)
  - [Variables de entorno](#variables-de-entorno)
  - [Autenticación](#autenticación)
  - [Esquema de base de datos](#esquema-de-base-de-datos)
  - [Row Level Security](#row-level-security)
  - [Triggers](#triggers)
  - [Seeding diferido (bootstrap)](#seeding-diferido-bootstrap)
- [API interna](#api-interna)
- [Multi-idioma](#multi-idioma)
- [PWA y seguridad](#pwa-y-seguridad)
- [Puesta en marcha local](#puesta-en-marcha-local)
- [Scripts](#scripts)
- [Testing](#testing)
- [Despliegue en Vercel](#despliegue-en-vercel)

---

## Stack tecnológico

| Capa | Tecnología | Versión | Rol |
|---|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | ^15.0.0 | Rutas, Server Components, Route Handlers |
| UI | React | ^19.0.0 | Componentes cliente |
| Lenguaje | TypeScript | ^5.0.0 | `strict: true`, `noEmit`, alias `@/*` |
| Estilos | Tailwind CSS + PostCSS + Autoprefixer | ^3.3.0 | Design system por tokens |
| Estado servidor | TanStack Query | ^5.101.4 | Cache, invalidación, mutaciones |
| Estado UI | Zustand | ^4.4.0 | Fecha seleccionada, filtros de reportes |
| Backend | Supabase (`@supabase/supabase-js`) | ^2.38.0 | Postgres + Auth + RLS |
| Animación | GSAP + `@gsap/react` | ^3.15.0 | Transiciones |
| Temas | `next-themes` | ^0.2.1 | light / dark / system |
| Fechas | `date-fns` | ^2.30.0 | Formato por locale |
| PWA | `next-pwa` (Workbox) | ^5.6.0 | Service worker, manifest, instalación |
| Utilidades | `clsx` | ^2.0.0 | Composición de clases |
| Testing | Jest + Testing Library + ts-jest | ^29.7.0 | Unit + integración |
| Runtime | Node.js | >= 22.0.0 | Requisito de `engines` |

Sin ORM: el acceso a datos se hace con el cliente de Supabase tipado a mano en [lib/types.ts](lib/types.ts).

## Arquitectura

```
Navegador (React 19 + TanStack Query + Zustand)
   │
   ├── supabase-js  ──────────────► Supabase Auth   (login, signup, refresh de token)
   │                                    │
   │                              access_token (JWT)
   │                                    │
   └── fetch /api/*  ──────────────► Route Handlers (Next.js, Node runtime)
         Authorization: Bearer <JWT>          │
                                              │ cliente Supabase por request
                                              │ con el JWT del usuario
                                              ▼
                                         Postgres + RLS
```

Puntos clave del diseño:

- **El navegador nunca escribe en Postgres directamente.** Habla con Supabase Auth para la sesión, y con `/api/*` para los datos.
- **Cada request de API crea su propio cliente Supabase** con el token del usuario (`createRequestClient` en [lib/supabase.ts](lib/supabase.ts)). No hay cliente compartido entre requests ni service role key en el servidor: RLS es la única frontera de autorización.
- **Toda la lógica de consulta vive en [lib/db-server.ts](lib/db-server.ts)**; los handlers solo autentican, validan y serializan.
- **Validación de entrada centralizada** en [lib/validation.ts](lib/validation.ts) antes de tocar la base.

## Estructura del proyecto

```
app/
├── (app)/                     # Rutas autenticadas
│   ├── page.tsx               # Día actual, lista de actividades
│   ├── dashboard/             # Resumen
│   ├── activities/add/        # Alta de actividad
│   ├── activities/[id]/edit/  # Edición
│   ├── categories/            # Gestión de categorías y etiquetas
│   ├── reports/               # Reportes filtrados
│   └── settings/              # Idioma y tema
├── auth/login|signup/         # Pantallas de acceso
├── api/                       # Route Handlers (ver "API interna")
├── layout.tsx
└── globals.css

components/
├── atoms/                     # Button, Input, Select, DatePicker, TimePicker, RatingStars, Badge, Icon…
├── molecules/                 # ActivityCard, ActivityForm, CategorySelector, TagSelector, ReportFilters…
├── organisms/                 # AuthForm, CategoriesPanel, DailyActivitiesList, ReportResults…
├── AppShell.tsx, NavBar.tsx, AddActivityFab.tsx
├── BootstrapGate.tsx          # Dispara POST /api/bootstrap tras autenticar
├── QueryProvider.tsx, ThemeProvider.tsx, ToastProvider.tsx, Toast.tsx

lib/
├── supabase.ts                # Cliente browser, cliente por request, authenticateRequest
├── db-server.ts               # Todas las consultas a Postgres
├── db-queries.ts              # Hooks de TanStack Query
├── api-client.ts              # fetch con Authorization: Bearer
├── api-response.ts            # jsonOk / jsonError / unauthorized / serverError
├── query-client.ts, query-keys.ts
├── store.ts                   # Zustand (UI)
├── types.ts, validation.ts, locale-utils.ts
├── i18n/                      # LanguageContext, useLanguage
└── translations/              # en.json, es.json, categoryNames.ts

.claude-spec/                  # Especificaciones vivas (esquema, design system, testing, i18n)
__tests__/                     # Jest
public/                        # manifest.json, iconos, service worker generado
```

---

## Supabase

### Configuración del proyecto

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Copiar **Project URL** y **anon public key** desde *Project Settings → API*.
3. Ejecutar el SQL de [.claude-spec/DATABASE_SCHEMA.md](.claude-spec/DATABASE_SCHEMA.md) en el *SQL Editor*, en este orden:
   1. Tablas globales `default_categories` y `default_tags` + sus `INSERT` de seed.
   2. Tablas de usuario `categories`, `tags`, `activities`, `user_settings`.
   3. Políticas RLS.
   4. Función `update_updated_at_column()` y sus triggers.
4. En *Authentication → Providers*, dejar habilitado **Email**. Para desarrollo local conviene desactivar la confirmación por correo (*Confirm email*), o el usuario no tendrá sesión inmediata tras el signup.
5. En *Authentication → URL Configuration*, añadir la URL del sitio (`http://localhost:3000` y el dominio de Vercel).

El repositorio incluye [.mcp.json](.mcp.json) con el servidor MCP de Supabase apuntando al `project_ref` del proyecto, para trabajar el esquema desde herramientas de agente.

### Variables de entorno

Copiar el ejemplo y rellenar:

```bash
cp .env.local.example .env.local
```

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto, p. ej. `https://xxxx.supabase.co`. También define el origen permitido en `connect-src` del CSP. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Clave anónima pública. Segura de exponer: RLS la limita. |
| `NEXT_PUBLIC_APP_URL` | Sí | URL base de la app (`http://localhost:3000` en local). |

No existe ni se necesita `SUPABASE_SERVICE_ROLE_KEY`. Si falta alguna de las dos primeras, [lib/supabase.ts](lib/supabase.ts) lanza en el arranque en lugar de fallar silenciosamente en runtime.

### Autenticación

- Signup y login con email/contraseña vía `supabase.auth`, desde [components/organisms/AuthForm.tsx](components/organisms/AuthForm.tsx).
- La sesión se persiste y refresca en el navegador; el token de acceso se adjunta a cada llamada de API en [lib/api-client.ts](lib/api-client.ts).
- En el servidor, `authenticateRequest()` lee la cabecera `Authorization: Bearer …`, valida el token con `auth.getUser()` y devuelve `{ client, userId }`. Cualquier ruta sin token válido responde `401`.

### Esquema de base de datos

**Tablas globales de solo lectura**

| Tabla | Contenido |
|---|---|
| `default_categories` | 4 categorías base: `study`, `exercise`, `personals`, `spaces`. Campos: `id`, `key` (único), `name`, `color`, `created_at`. |
| `default_tags` | Etiquetas base, 1:N con `default_categories` (`ON DELETE CASCADE`). Único por `(default_category_id, name)`. Índice `idx_default_tags_category`. |

**Tablas por usuario** (todas con `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`)

| Tabla | Detalles |
|---|---|
| `categories` | `name`, `color`, `is_default`. Único `(user_id, name)`. Índice `idx_categories_user`. |
| `tags` | 1:N con `categories` (`ON DELETE CASCADE`). Único `(user_id, category_id, name)`. Índice `idx_tags_category`. |
| `activities` | `title` (nullable, 255), `start_time`, `end_time`, `duration_minutes` **columna generada** `(end_time - start_time)` en minutos, `rating` 0–5 (`0` = sin valorar), `notes`, `activity_date`. `tag_id` es `ON DELETE SET NULL`. Constraint `end_after_start`. Índices: `(user_id, activity_date DESC)`, `category_id`, `(user_id, rating)`, `(user_id, title)`. |
| `user_settings` | `user_id` único, `language` en `('en','es')` (default `en`), `theme` en `('light','dark','system')` (default `system`). |

**Reglas de negocio**

- 4 categorías por defecto copiadas a cada usuario, más un máximo de 3 personalizadas: **7 en total** (`MAX_CATEGORIES_PER_USER` en [lib/validation.ts](lib/validation.ts)).
- `notes` máximo 5000 caracteres; búsqueda por título máximo 100; máximo 100 ids por filtro.
- Título en blanco se guarda como `NULL`.
- Los listados se acotan a `MAX_ROWS = 1000` en [lib/db-server.ts](lib/db-server.ts): todavía no hay paginación en los endpoints, y sin ese tope una cuenta con historial largo devolvería respuestas de tamaño arbitrario.

### Row Level Security

RLS está habilitado en `categories`, `tags`, `activities` y `user_settings`, con una política `FOR ALL USING (auth.uid() = user_id)` en cada una. Como el servidor usa siempre el JWT del usuario y nunca la service role key, el aislamiento entre cuentas lo garantiza Postgres, no el código de aplicación.

### Triggers

`update_updated_at_column()` actualiza `updated_at` en cada `UPDATE`, con un trigger `BEFORE UPDATE FOR EACH ROW` en las cuatro tablas de usuario.

### Seeding diferido (bootstrap)

No hay trigger sobre `auth.users` ni seed en el momento del signup: en ese instante la sesión aún no existe, `auth.uid()` es `null` y RLS rechazaría los inserts.

En su lugar, [components/BootstrapGate.tsx](components/BootstrapGate.tsx) llama a `POST /api/bootstrap` en el primer render autenticado. Para entonces la sesión existe y cada insert pasa RLS como el usuario. Detalles del endpoint ([app/api/bootstrap/route.ts](app/api/bootstrap/route.ts)):

- **Verificación por tabla:** comprueba categorías y etiquetas de forma independiente. Una ejecución interrumpida a medias deja categorías sin sus etiquetas, y un chequeo basado solo en categorías nunca lo repararía.
- **Orden obligatorio:** primero se insertan las categorías `is_default = true` que falten y se capturan sus ids reales; solo después se insertan las etiquetas contra esos ids. Si falla la inserción de categorías, la ejecución se detiene y no se toca ninguna etiqueta.
- **Nada de joins por nombre:** la correspondencia se resuelve por el nombre inglés almacenado junto con `is_default = true`, y de ahí a ids reales. Un usuario que renombre una categoría copiada rompería un join por nombre y acabaría con etiquetas huérfanas o duplicadas.
- **Idempotente:** corre en cada montaje autenticado. Si los datos están completos no inserta nada; si estaban incompletos, los repara. Las categorías y etiquetas creadas por el usuario nunca se comparan ni se modifican.
- **Respuesta:** `{ seeded: boolean, categoriesCreated: number, tagsCreated: number }`.

---

## API interna

Todas las rutas viven bajo `app/api/`, exigen `Authorization: Bearer <access_token>` y responden JSON. Errores mediante los helpers de [lib/api-response.ts](lib/api-response.ts): `401` sin token válido, `400` en validación, `500` en error de base.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/bootstrap` | Seed idempotente de categorías y etiquetas por defecto |
| `GET` | `/api/activities?date=YYYY-MM-DD` | Actividades del usuario, opcionalmente por fecha |
| `POST` | `/api/activities` | Crear actividad (`201`) |
| `PUT` | `/api/activities/[id]` | Actualizar actividad |
| `DELETE` | `/api/activities/[id]` | Eliminar actividad |
| `GET` | `/api/categories` | Listar categorías |
| `POST` | `/api/categories` | Crear categoría (tope de 7) |
| `PUT` | `/api/categories/[id]` | Actualizar categoría |
| `DELETE` | `/api/categories/[id]` | Eliminar categoría (cascada a sus etiquetas) |
| `GET` | `/api/tags` | Listar etiquetas |
| `POST` | `/api/tags` | Crear etiqueta |
| `PUT` | `/api/tags/[id]` | Actualizar etiqueta |
| `DELETE` | `/api/tags/[id]` | Eliminar etiqueta |
| `GET` | `/api/settings/language` | Idioma persistido |
| `PUT` | `/api/settings/language` | Cambiar idioma (`en` / `es`) |
| `POST` | `/api/reports/filter` | Reporte filtrado + resumen |

`POST /api/reports/filter` acepta `{ startDate, endDate, categoryIds[], tagIds[], minRating, titleSearch }` y devuelve `{ activities, summary: { total, totalMinutes, averageRating } }`, donde la media ignora las actividades sin valorar (`rating = 0`).

En el cliente, cada recurso tiene su clave de cache en [lib/query-keys.ts](lib/query-keys.ts) y sus hooks en [lib/db-queries.ts](lib/db-queries.ts).

---

## Multi-idioma

Idiomas soportados: `en` (por defecto) y `es`.

**Regla central: la base de datos almacena inglés, el frontend traduce para mostrar.** Los nombres de categorías y etiquetas por defecto se copian en inglés y se mapean al idioma de la interfaz mediante [lib/translations/categoryNames.ts](lib/translations/categoryNames.ts). Todo lo que escribe el usuario (categorías propias, etiquetas propias, títulos, notas) se guarda y se muestra literal.

Orden de resolución del idioma:

1. `user_settings.language`, si existe la fila.
2. `navigator.language` — empieza por `es` resuelve a `es`, cualquier otro a `en`.
3. Fallback `en`.

Al cambiar de idioma se persiste en `user_settings.language` y se recarga la página: sin re-render en vivo ni actualización optimista. Las fechas se guardan en ISO y se formatean por locale ([lib/locale-utils.ts](lib/locale-utils.ts)).

---

## PWA y seguridad

Configurado en [next.config.mjs](next.config.mjs):

- **Service worker** generado por `next-pwa` en `public/` (`register`, `skipWaiting`). Está **desactivado en desarrollo**: `next-pwa` es webpack-based y `next dev` no puede generarlo; la PWA se prueba contra `next build`.
- **Caché de API deshabilitada a propósito.** El runtime caching por defecto guarda las respuestas de `/api/` en una caché `apis`; como todos los endpoints son por usuario y autenticados, una respuesta cacheada podría reproducirse tras el logout o para otra cuenta. Ese entry se filtra y la API va siempre a red.
- **Manifest** en [public/manifest.json](public/manifest.json): `standalone`, orientación vertical, iconos 192/512 y variante maskable.
- **Cabeceras de seguridad** en todas las rutas: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (cámara, micrófono, geolocalización y pagos denegados), `Cross-Origin-Opener-Policy`, y HSTS solo en producción (sobre localhost envenenaría el dominio).
- **CSP:** `default-src 'self'`, con el origen de Supabase añadido a `connect-src` porque el navegador habla directamente con Auth. `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`. Se mantiene `'unsafe-inline'` en scripts porque Next inyecta su bootstrap y el payload de Flight como `<script>` inline: emitir un nonce por request exigiría middleware y sacaría todas las páginas del render estático.
- `poweredByHeader: false`, `reactStrictMode: true`.

---

## Puesta en marcha local

Requisitos: Node.js >= 22 y un proyecto de Supabase con el esquema aplicado.

```bash
git clone <repo>
cd habits-tracker
npm install
cp .env.local.example .env.local   # rellenar URL y anon key
npm run dev                        # http://localhost:3000
```

Primer uso: registrarse en `/auth/signup`; al entrar, `BootstrapGate` siembra las 4 categorías por defecto con sus etiquetas.

Para probar la PWA:

```bash
npm run build && npm start
```

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (genera el service worker) |
| `npm start` | Servir el build |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Jest |
| `npm run test:watch` | Jest en watch |
| `npm run test:coverage` | Cobertura |

## Testing

Jest con entorno `jsdom`, `ts-jest` y alias `@/*`. Las variables de entorno de test se inyectan en `jest.env.ts`, de modo que el cliente de Supabase no rompe al importarse.

Cobertura recolectada de `lib/**`, `app/api/**` y `components/**` (excluyendo traducciones). Helpers en `__tests__/helpers/`: mock del cliente Supabase, fixtures, constructor de `Request` y wrapper de TanStack Query.

```bash
npm test
npm run test:coverage
```

---

## Despliegue en Vercel

El repositorio incluye un workflow de GitHub Actions en [.github/workflows/deploy.yml](.github/workflows/deploy.yml) que ejecuta lint, type-check y tests, y luego despliega con la CLI de Vercel: *preview* en pull requests y *production* en `main`.

### 1. Crear el proyecto en Vercel

```bash
npm i -g vercel
vercel link
```

Esto genera `.vercel/project.json` con `orgId` y `projectId`.

### 2. Variables de entorno en Vercel

En *Project → Settings → Environment Variables*, para los entornos **Production**, **Preview** y **Development**:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima |
| `NEXT_PUBLIC_APP_URL` | Dominio del despliegue (por ejemplo `https://habits-tracker.vercel.app`) |

Son variables `NEXT_PUBLIC_*`: se inlinean en tiempo de build, así que hay que redeployar tras cambiarlas.

### 3. Secrets de GitHub

En *Settings → Secrets and variables → Actions* del repositorio:

| Secret | De dónde sale |
|---|---|
| `VERCEL_TOKEN` | Vercel → *Account Settings → Tokens* |
| `VERCEL_ORG_ID` | `.vercel/project.json` (`orgId`) |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` (`projectId`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Igual que en Vercel (el build de CI también la necesita) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Igual que en Vercel |

### 4. Supabase para producción

En *Authentication → URL Configuration* añadir el dominio de producción como **Site URL** y las URLs de preview (`https://*.vercel.app`) como **Redirect URLs**. Sin esto, los enlaces de confirmación de correo apuntan a localhost.

### 5. Despliegue manual

```bash
vercel                 # preview
vercel --prod          # producción
```

### Notas del despliegue

- El service worker se genera durante `next build`; `public/sw.js` y `public/workbox-*.js` están en `.gitignore` y se producen en cada build.
- No hay variables de servidor secretas: el runtime solo usa la anon key, y la autorización la impone RLS.
- La app corre en el runtime Node de Vercel (no Edge): los Route Handlers usan `@supabase/supabase-js` con un cliente por request.
