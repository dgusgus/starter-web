# starter-web

Frontend base (**Nivel 1**) para proyectos pequeños y medianos. Se usa como **Template repository** de GitHub y se conecta al backend [`starter-api`](../starter-api) por HTTP (contrato: los tipos de `src/api/types.ts`).

**Stack:** Node 22 · pnpm 10 · Vue 3 · Vite · TypeScript · Pinia · Vue Router · Tailwind CSS 4 · Axios · Vitest · Docker (Nginx) · GitHub Actions.

## Qué incluye

| Pieza                                     | Para qué sirve                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| Login + sesión (`stores/auth.ts`)         | Guardar token y usuario; restaurar la sesión al recargar                    |
| Guards de ruta (`router/index.ts`)        | Proteger páginas por sesión y por rol (`meta.requiresAuth`, `meta.roles`)   |
| Cliente HTTP (`api/http.ts`)              | Pega el token a cada petición y cierra la sesión si el backend responde 401 |
| `parseApiError` (`api/errors.ts`)         | Convierte cualquier error en mensaje + errores por campo del formulario     |
| Layouts (`AuthLayout`, `DashboardLayout`) | Estructura de páginas públicas y del panel (sidebar responsive)             |
| Componentes UI (`components/ui`)          | Botón, input, modal, paginación y avisos (toasts) reutilizables             |
| Módulo `products` (ejemplo)               | Lista + búsqueda + filtro + paginación + crear/editar/eliminar              |
| Módulo `users` (solo ADMIN)               | Crear usuarios, cambiar rol, activar/desactivar, eliminar                   |
| Dockerfile + Nginx, CI                    | Despliegue como sitio estático y verificación automática                    |

## Estructura

```
src/
├── api/             http.ts · errors.ts · types.ts   (todo lo que habla con el backend)
├── features/        una carpeta por funcionalidad:
│   ├── auth/        auth.api.ts · LoginView.vue
│   ├── products/    products.api.ts · ProductsView.vue · ProductFormModal.vue  ← ejemplo para copiar
│   ├── users/
│   ├── home/ · errors/
├── components/ui/   componentes reutilizables sin lógica de negocio
├── layouts/         AuthLayout · DashboardLayout
├── router/          rutas + guard global
├── stores/          auth (sesión) · toast (avisos)
├── lib/             session · format · debounce
└── main.ts · App.vue · style.css
tests/               pruebas de lógica pura
```

Regla de oro: cada **feature** tiene su capa `*.api.ts` (HTTP) y sus vistas/componentes. Las vistas nunca llaman a `axios` directo.

## Primer arranque

```bash
pnpm install
cp .env.example .env      # VITE_API_URL debe apuntar a tu starter-api
pnpm dev                  # http://localhost:5173
```

Con `starter-api` corriendo y su seed aplicado: `admin@example.com` / `Admin12345!`.

## Cómo agregar una funcionalidad nueva (ej. `clients`)

1. Agrega el tipo en `src/api/types.ts` (espejo del DTO del backend).
2. Copia `src/features/products/` a `src/features/clients/` y renombra.
3. Ajusta `clients.api.ts` (rutas), el formulario y las columnas de la tabla.
4. Registra la ruta en `src/router/index.ts` (con `roles` si es restringida).
5. Agrega el enlace en `layouts/DashboardLayout.vue`.

## Scripts

| Comando                   | Qué hace                                               |
| ------------------------- | ------------------------------------------------------ |
| `pnpm dev`                | Servidor de desarrollo                                 |
| `pnpm build`              | Typecheck (`vue-tsc`) + build de producción en `dist/` |
| `pnpm lint` · `pnpm test` | Lo mismo que corre el CI                               |
| `pnpm format`             | Prettier                                               |

## Despliegue

```bash
docker build -t mi-web --build-arg VITE_API_URL=https://api.midominio.com/api/v1 .
docker run -p 8080:80 mi-web
```

Las variables `VITE_*` se incrustan **al compilar** y son públicas: no pongas secretos. En la API, agrega el dominio del frontend a `CORS_ORIGIN`.

## Límites conocidos del Nivel 1 (a propósito)

- El token se guarda en `localStorage` (vulnerable si hay una falla XSS). Nivel 2: cookie httpOnly + refresh token.
- Los roles solo ocultan la interfaz; **la seguridad real la aplica el backend**.
- Los tipos de la API se mantienen a mano. Nivel 2: generarlos desde OpenAPI.
- Sin registro público, recuperación de contraseña, TanStack Query ni librería de componentes.
- Los formularios se validan a mano (el backend vuelve a validar siempre).
- Confirmaciones con `window.confirm` y estados de carga simples ("Cargando...").
- Tests solo de lógica pura: no hay pruebas de componentes ni end-to-end.

## Checklist antes de entregar un proyecto a un cliente

- [ ] `VITE_API_URL` apunta a la API real (HTTPS) y el dominio está en `CORS_ORIGIN` del backend.
- [ ] `VITE_APP_NAME`, título, favicon y colores del cliente.
- [ ] Probar en celular real (el sidebar, las tablas y los formularios).
- [ ] Probar cada rol: lo que **no** debe ver, no aparece, y el backend igual lo rechaza.
- [ ] Probar sesión vencida (borrar el token): debe volver al login sin pantallas rotas.
- [ ] Páginas 403 y 404 revisadas; mensajes de error claros para el usuario.
- [ ] `pnpm build` sin avisos y `pnpm audit` revisado.
- [ ] HTTPS y cabeceras de seguridad en el servidor (Nginx/hosting).

## Roadmap: Nivel 2 y Nivel 3

**Regla de oro:** no agregues nada "por si acaso". Una pieza sube a este template solo cuando **2 o más proyectos reales la necesitaron**. Mientras tanto, guárdala en una rama o carpeta `recipes/` y cópiala solo al proyecto que la pide.

**Señales para pasar de nivel:** copias el mismo componente en dos proyectos; escribes a mano la misma lógica de carga/errores en cada vista; un cliente pide algo que hoy requiere parches.

### Nivel 2 — Estándar profesional (cuando un proyecto lo pida)

#### Datos y conexión con la API

| Pieza                                       | Para qué / por qué                                                                                           | Cómo                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **TanStack Query** (`@tanstack/vue-query`)  | Caché, reintentos, estados de carga/error y refresco automático; elimina los `load()` manuales de cada vista | `useQuery` para leer, `useMutation` + invalidación de caché para escribir                   |
| **Cliente y tipos generados desde OpenAPI** | Hoy los tipos se copian a mano; si el backend cambia un campo, el compilador te avisa                        | `openapi-typescript` (solo tipos) u `orval` (cliente completo) con un script `pnpm gen:api` |
| Refresh automático de sesión                | Evita sacar al usuario cuando el token vence                                                                 | Interceptor que pide `/auth/refresh` una vez y reintenta las peticiones pendientes          |
| Cookies httpOnly                            | El token deja de ser legible desde JavaScript (mejor contra XSS)                                             | Requiere cambios en el backend (cookie + CSRF)                                              |
| Cancelación de peticiones                   | Evita respuestas viejas pisando las nuevas al buscar                                                         | `AbortController` (TanStack Query lo hace solo)                                             |

#### Autenticación y permisos

| Pieza                                    | Para qué / por qué                                      | Cómo                                                                                        |
| ---------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Registro, recuperar y cambiar contraseña | Autoservicio del usuario                                | Vistas `RegisterView`, `ForgotPasswordView`, `ResetPasswordView`; flujo con token por email |
| **Permisos granulares**                  | Mostrar u ocultar acciones por permiso, no solo por rol | Helper `can("products:delete")`, directiva `v-can` y guards por `meta.permissions`          |
| Perfil de usuario                        | Cambiar nombre, contraseña, preferencias                | `ProfileView` con su store                                                                  |
| Redirección tras login y "recordarme"    | Mejor experiencia                                       | Ya hay `redirect`; sumar duración de sesión configurable                                    |

#### Interfaz y experiencia

| Pieza                                             | Para qué / por qué                                                                               | Cómo                                                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Librería de componentes** o completar la propia | Tablas avanzadas, selectores con búsqueda, fechas, menús: construirlos desde cero cuesta semanas | PrimeVue, shadcn-vue / Reka UI o Naive UI; o ampliar `components/ui` (Select, Checkbox, Tabs, Dropdown, DatePicker) |
| `ConfirmDialog` propio                            | Reemplaza `window.confirm` con un diálogo coherente                                              | Componente + composable `useConfirm()`                                                                              |
| Estados de carga, vacío y error consistentes      | Que ninguna pantalla se vea "rota"                                                               | `Skeleton`, `EmptyState`, `ErrorState` reutilizables                                                                |
| **Tabla reutilizable**                            | Cada listado repite búsqueda, paginación, orden y filtros                                        | `DataTable` genérica con columnas declarativas                                                                      |
| Filtros y página en la URL                        | Recargar o compartir enlace conserva la vista                                                    | Sincronizar `page`, `search`, `sort` con `route.query`                                                              |
| Formularios con VeeValidate + Zod                 | Menos validación manual; reglas reutilizables                                                    | `vee-validate` + `@vee-validate/zod`; componentes de campo genéricos                                                |
| Accesibilidad básica                              | Teclado y lectores de pantalla                                                                   | Focus trap y devolución de foco en modales, `aria-*`, contraste revisado                                            |
| Tema oscuro                                       | Comodidad y requisito frecuente                                                                  | Variables CSS + clase `dark` de Tailwind                                                                            |
| Internacionalización                              | Textos en un solo lugar                                                                          | `vue-i18n`; hoy los textos están en español dentro de los componentes                                               |

#### Calidad y pruebas

| Pieza                          | Para qué / por qué                                           | Cómo                                                               |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| Tests de componentes y stores  | Hoy solo se prueba lógica pura                               | Vitest + `@vue/test-utils` + jsdom                                 |
| **Mock de la API**             | Probar sin backend real y de forma estable                   | MSW (Mock Service Worker) en tests y en desarrollo                 |
| Tests end-to-end               | Probar el flujo completo como usuario (login, crear, editar) | Playwright contra _staging_ o contra API local                     |
| Husky + lint-staged            | No subir código sin formato ni lint                          | pre-commit con `eslint --fix` y `prettier`                         |
| Dependabot / Renovate          | Actualizaciones y parches                                    | `.github/dependabot.yml`                                           |
| Reglas de ESLint más estrictas | Atrapar errores de Vue y de accesibilidad                    | `eslint-plugin-vue` (config `recommended`) + `vuejs-accessibility` |

#### Operación y despliegue

| Pieza                                    | Para qué / por qué                                           | Cómo                                                                           |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Configuración en tiempo de ejecución** | Hoy `VITE_*` se incrusta al compilar: una imagen por entorno | Servir un `config.js` desde Nginx y leerlo con `window.__CONFIG__`             |
| CD automático                            | Publicar con un push o un tag                                | GitHub Actions → Cloudflare Pages / Netlify / Vercel, o imagen a GHCR + deploy |
| Cabeceras de seguridad y caché           | Protección y velocidad                                       | En Nginx: `Content-Security-Policy`, `X-Frame-Options`, caché de `assets/`     |
| Errores en producción                    | Enterarte de fallos del navegador                            | Sentry (`@sentry/vue`) con _source maps_                                       |
| Análisis del tamaño del bundle           | Evitar que la app engorde sin darte cuenta                   | `rollup-plugin-visualizer`, presupuesto de tamaño en CI                        |
| Manejo global de errores                 | Que un error de un componente no tumbe la app                | `app.config.errorHandler` y `onErrorCaptured`                                  |

### Nivel 3 — Solo con necesidad real (no antes)

#### Producto y negocio

| Pieza                                  | Para qué / por qué                                                        | Cómo                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Tiempo real en la interfaz**         | Pantallas de turnos en vivo, notificaciones, estado compartido            | SSE o WebSocket con reconexión automática; store que aplica los eventos |
| **PWA**                                | Instalable en el celular, funciona con mala conexión, notificaciones push | `vite-plugin-pwa`; _service worker_; Web Push                           |
| Pantallas públicas / modo kiosco       | TV de sala de espera o tótem de autoatención                              | Ruta sin login, fuente grande, pantalla completa, actualización por SSE |
| Escáner de QR                          | Check-in por código desde el celular o el tótem                           | API del navegador con la cámara (`BarcodeDetector` / `qr-scanner`)      |
| **Multi-tenant visual (marca blanca)** | Logo, colores y nombre por cliente con un solo código                     | Variables CSS por tenant cargadas desde la API; subdominio por cliente  |
| Gráficos y dashboards                  | Reportes visuales para el administrador                                   | ECharts o Chart.js; filtros por fecha; exportar a imagen/PDF            |
| Impresión y exportación                | Comprobantes, listados, constancias                                       | Vistas con CSS `@media print`; PDF desde el backend                     |
| Editor de roles y permisos             | Que el cliente administre sus propios roles                               | Pantalla con matriz rol × permiso                                       |
| App móvil nativa                       | Presencia en tiendas o acceso a hardware                                  | Capacitor sobre la misma base Vue                                       |

#### Escala y rendimiento

| Pieza                            | Para qué / por qué                     | Cómo                                                                     |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| Listas virtualizadas             | Tablas con miles de filas sin lentitud | `@tanstack/vue-virtual`                                                  |
| Prefetch y optimización de carga | Navegación instantánea                 | Precargar rutas probables; imágenes optimizadas; división de código fina |
| Medición de rendimiento real     | Detectar lentitud de usuarios reales   | Web Vitals enviados a un servicio                                        |
| Pruebas visuales                 | Detectar cambios de diseño no deseados | Playwright screenshots o Chromatic                                       |

#### Arquitectura y equipo

| Pieza                            | Para qué / por qué                                 | Cómo                                                                                        |
| -------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Design system propio**         | Misma interfaz en varios proyectos sin copiar      | Paquete de componentes + Storybook, versionado. **Solo** si 4 o más proyectos usan lo mismo |
| Renderizado en servidor (Nuxt)   | SEO o páginas públicas con buen posicionamiento    | Nuxt para la parte pública; el panel puede seguir como SPA                                  |
| Feature flags                    | Activar funciones por cliente o gradualmente       | Flags desde la API o Unleash/Flagsmith                                                      |
| Accesibilidad auditada (WCAG AA) | Requisito de clientes públicos o educativos        | Auditoría con axe y pruebas con lector de pantalla                                          |
| Micro-frontends                  | Casi nunca: solo con varios equipos independientes | Evitar mientras trabajes solo                                                               |
