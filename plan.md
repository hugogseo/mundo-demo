### Plan maestro: “AI SaaS sin esfuerzo” con Claude Code + Agent Skills + MCP (sobre tu Next.js + Supabase + Stripe)

A continuación te dejo:
1) Auditoría técnica de tu repo (bugs, riesgos y mejoras).
2) Diseño de agentes/subagentes y Skills para Claude Code que se activan solos al trabajar sobre tu carpeta.
3) Integraciones MCP recomendadas (Supabase/DB, GitHub, Vercel, etc.).
4) Pasos de implementación con ejemplos de SKILL.md para pegar en tu repo.

He validado las rutas y lógica clave dentro del archivo que compartiste y cito paths exactos del proyecto cuando aplica.

Referencias oficiales de Agent Skills:
- Visión general de Skills: [Introducing Agent Skills](https://www.anthropic.com/news/skills)
- Diseño técnico y buenas prácticas: [Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- Guía de Skills para Claude Code: [Claude Code – Agent Skills](https://docs.claude.com/en/docs/claude-code/skills)
- MCP (Model Context Protocol): [Model Context Protocol](https://modelcontextprotocol.io/)


#### 1) Auditoría técnica (bugs, riesgos y quick wins)

- Desfase de puertos para webhooks de Stripe
  - Archivo: `stripe-webhook.sh` reenvía a `localhost:4000/api/webhooks/stripe`, pero toda tu doc y handlers usan `:3000` ([STRIPE_QUICKSTART.md, QUICK_START.md, PAYMENTS.md]).
  - Impacto: si alguien arranca con ese script, Stripe CLI no pegará en tu endpoint real.
  - Fix: unificar a 3000.
    - Cambia en `stripe-webhook.sh`:
      ```
      stripe listen --forward-to localhost:3000/api/webhooks/stripe
      ```
    - Ajusta `STRIPE_QUICKSTART.md` de igual forma si lo vas a seguir usando en paralelo.

- Versión API de Stripe inconsistente
  - Archivo: `lib/stripe/server.ts` usa `apiVersion: '2025-09-30.clover'`, mientras tu guía rápida dice cuenta en `2025-05-28.basil` (STRIPE_QUICKSTART.md).
  - Riesgo: ligeras diferencias de payload/eventos. Conviene alinear con la versión de cuenta o eliminar pin si no es imprescindible.

- Inconsistencia de variables env de Supabase
  - Tienes dos estilos:
    - SSR/Client: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `lib/supabase/{client,server,middleware}.ts` (bien para Next SSR/CSR).
    - Otro cliente genérico: `lib/supabase.ts` usa `SUPABASE_URL`/`SUPABASE_ANON_KEY`.
  - Recomendación: decide un patrón único por contexto. Mantén:
    - App (SSR/CSR): `NEXT_PUBLIC_*`.
    - Admin (server-only): `SUPABASE_SERVICE_ROLE_KEY` (no público).
  - Si no usas `lib/supabase.ts`, elimínalo para evitar confusión. Si lo usas en scripts Node, documenta su uso como “CLI only”.

- Política de lectura pública de perfiles (privacidad)
  - Migration: `supabase/migrations/..._user_authentication_and_memberships.sql` crea una policy:
    - “Public profiles are viewable by everyone”.
  - Si no quieres que cualquiera lea perfiles, comenta o quítala. El resto de RLS está bien (SELECT propio, UPDATE propio, subs solo service_role).

- Estado “paused” de Stripe mapeado a “canceled”
  - En `app/api/webhooks/stripe/route.ts` mapeas `paused` → `canceled`.
  - Recomendación: agrega `paused` a tu enum o mapea a un estado neutral (no “canceled”) para no cortar acceso involuntariamente. Si quieres soportarlo:
    - Extiende enum `subscription_status` y el typing en `types/database.ts`.
    - Ajusta `mapSubscriptionStatus()` y lógica de sincronización.

- CSR/CSRF y rate limit para `/api/stripe/checkout`
  - Ruta valida sesión con Supabase (bien), pero añade:
    - Verificación de `Origin`/`Referer` para CSRF en POST.
    - Rate-limit (p.ej., simple token bucket por `user.id`) para evitar spam de sesiones.

- Idempotencia de webhooks y cola
  - Haces `upsert` por `stripe_subscription_id` (bien). Para robustez adicional:
    - Guarda `event.id` de Stripe en tabla `stripe_events_processed` y haz short-circuit si ya se procesó (evita efectos duplicados en eventos no-subscription).
    - O usa una cola (p.ej., Supabase Functions o un worker) si prevés picos.

- RevalidatePath en webhooks
  - `revalidatePath('/dashboard')` está bien, pero puede ser costoso si hay alto volumen. Observa métricas y considera notificaciones push/WS o invalidaciones más granulares.

- Mejora menor en headers del webhook
  - En el handler usas `headers()` de Next; es más directo y claro:
    ```
    const signature = request.headers.get('stripe-signature');
    ```
  - Añade `export const dynamic = 'force-dynamic'` en el webhook route file para evitar caching accidental.

- Regla de negocio “cancel_at_period_end”
  - Tu código ya calcula `effectiveTier` y no baja a `free` hasta `canceled`. En docs se ve un ejemplo donde el perfil quedó en `free` mientras `cancel_at_period_end = true`.
  - Confirma tu intención:
    - Acceso hasta fin de periodo → no cambiar a `free` hasta que status sea `canceled`.
    - Si lo prefieres inmediato, deja claro en docs y UI (ahora mismo mezclado).

En general, arquitectura sólida: RLS activa, verificación de firma en webhooks, `service_role` solo en server, triggers para sincronizar tier; buen baseline.


#### 2) Arquitectura de Agentes y Subagentes (Claude Code-first)

Modelo propuesto: un “Agente Principal” en Claude Code que, al conectarse a tu carpeta, invoca automáticamente Skills especializadas (model-invoked) en función de la tarea. Estos grupos de Skills actúan como “subagentes” de facto (cada uno encapsula un dominio). Claude los activa por descripción y progresive disclosure, según la guía oficial.

Subagentes/Skills por dominio:
- Agente Pagos (Stripe)
  - Skills: checkout & webhook, creador/gestor de productos/precios, tests locales, auditor de versión y puertos.
- Agente DB (Supabase/Postgres)
  - Skills: migraciones con RLS/Triggers, verificador de policies, reparación de drift, seeds.
- Agente Auth & Sesión
  - Skills: flujos de magic link, middleware SSR/CSR, hardening cookies, CSRF guard.
- Agente Frontend (Next.js)
  - Skills: scaffolding de pages/routes, estados de plan/tier en UI, pricing toggle UX, copy y tests visuales.
- Agente SecOps
  - Skills: escáner de secretos, revisión de envs, CSP y headers, rate limiting, mapeo de permisos.
- Agente Release/DevEx
  - Skills: Vercel deploy, Stripe prod webhooks, healthchecks, checklists previas a producción y canary notes.
- Agente Docs
  - Skills: sincronizar doc técnica (PAYMENTS.md, IMPLEMENTATION_SUMMARY.md), changelogs, guías QA.

Claves para que “corra solo”:
- Skills con descripciones muy específicas de cuándo aplican (model-invoked).
- Usar allowed-tools para restringir alcance por Skill (ej: solo Read/Grep en auditorías).
- Scripts auxiliares en `scripts/` dentro de cada Skill para operaciones determinísticas (Claude decide cuándo ejecutarlos).
- Versionado de Skills en git (Project Skills) y personales (Personal Skills) por desarrollador/operador.


#### 3) Skills concretas para colocar en `.claude/skills/`

Crea estos directorios dentro del repo: `.claude/skills/<skill-name>/SKILL.md`. Claude Code detecta Skills de proyecto automáticamente. Ejemplos (puedes copiarlos tal cual y ajustar):

1) Skill: stripe-webhooks-simulator
```
---
name: stripe-webhooks-simulator
description: Start/stop Stripe CLI listener and verify local webhook delivery to Next.js. Use when testing subscription flows, checking invalid signatures, or diagnosing missing events. Ensures port 3000 and prints signing secret guidance.
allowed-tools: Read, Grep, Glob
---

# Stripe Webhooks Simulator

## Tasks
- Verify that local listener forwards to http://localhost:3000/api/webhooks/stripe
- Start listener if not running; stop/restart as needed
- Tail logs and surface errors (invalid signature, 400/500)

## Steps
1. Read `stripe-webhook.sh` and `STRIPE_QUICKSTART.md`.
2. If script points to :4000, propose fix to :3000 and open a minimal PR.
3. If user asks to run: show exact commands to start/stop and where to copy whsec.
4. Tail and summarize `/tmp/stripe-webhook.log` for recent errors.
```

2) Skill: stripe-config-and-prices
```
---
name: stripe-config-and-prices
description: Create/update Stripe products and prices, sync IDs into /lib/stripe/config.ts and docs. Use when adding tiers, changing pricing, or fixing API version mismatches.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Stripe Config & Prices

## Tasks
- Create products/prices (CLI or dashboard instructions)
- Update environment variables and /lib/stripe/config.ts
- Check apiVersion alignment in lib/stripe/server.ts vs account
- Add test plan changes to PAYMENTS.md

## Steps
1. Read `/lib/stripe/config.ts` to map new price IDs.
2. Verify `lib/stripe/server.ts` apiVersion matches account version; propose alignment.
3. Update `PAYMENTS.md` tables and examples.
4. If upgrading plans, adjust `/app/api/stripe/checkout/route.ts` validations.
```

3) Skill: supabase-migrations-and-rls
```
---
name: supabase-migrations-and-rls
description: Generate safe SQL migrations for profiles/subscriptions with RLS, triggers and policies. Use when creating new tables, adding columns, or adjusting auth/row policies.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Supabase Migrations & RLS

## Tasks
- Create migrations under /supabase/migrations with PL/pgSQL
- Ensure RLS and minimal policies
- Keep triggers (updated_at, sync membership) consistent
- Offer downgrade script if needed

## Steps
1. Inspect current migration file for enums, triggers, grants.
2. Draft a new migration with: CREATE TABLE, RLS ENABLE, SELECT/UPDATE own row policies, service_role policies.
3. Propose removing "Public profiles viewable" policy if privacy required.
4. Generate verification SQL (SELECTs) and add it to docs.
```

4) Skill: security-hardening
```
---
name: security-hardening
description: Security pass on Next.js routes and middleware. Use when adding API endpoints or before production deployments. Focus on CSRF, rate limit, headers, secret hygiene.
allowed-tools: Read, Grep, Glob
---

# Security Hardening

## Checklist
- POST routes: verify Origin/Referer and authenticated session
- Add basic rate limit for /api/stripe/checkout
- Webhook: dynamic = 'force-dynamic', minimal logging (no secrets)
- Env sanity: service role only on server, no NEXT_PUBLIC_* secrets
- Optional: CSP/security headers in Next config/middleware

## Steps
1. Scan /app/api/* for POST handlers without origin checks.
2. Propose patch snippets for each.
3. Document changes in README/SECURITY.md.
```

5) Skill: nextjs-frontend-scaffolder
```
---
name: nextjs-frontend-scaffolder
description: Scaffold Next.js pages/routes/layouts with Tailwind, wiring to Supabase auth and current tier UI states. Use when creating new pages or updating pricing/dashboard UX.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Next.js Frontend Scaffolder

## Tasks
- Create /app/* pages with SSR-safe components
- Reuse pricing toggles and tier checks
- Integrate "Manage Subscription" flows

## Steps
1. Reuse components/patterns from /app/pricing/page.tsx and /app/dashboard/page.tsx.
2. Generate skeleton with feature flags by membership_tier.
3. Add tests/manual checklist to QUICK_START.md.
```

6) Skill: docs-syncer
```
---
name: docs-syncer
description: Keep PAYMENTS.md, QUICK_START.md, IMPLEMENTATION_SUMMARY.md consistent with code. Use after any change affecting prices, endpoints, or flows.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Docs Syncer

## Steps
1. Read code changes and update doc tables/examples.
2. Ensure webhook URLs and ports are consistent across docs.
3. Add troubleshooting tips encountered in recent runs.
```

Puedes añadir más (Auth flows, DevEx/Release y Auditores de Secrets), siguiendo las mismas pautas. Importante: mantén descripciones muy concretas (Claude activará el Skill cuando detecte el “trigger” semántico).


#### 4) Integraciones MCP (Model Context Protocol)

Objetivo: dar a Claude acceso seguro y estandarizado a servicios externos/controlados.

Recomendados:
- DB via MCP
  - Conecta a Postgres/Supabase con un MCP server para:
    - run_sql (read-only por defecto)
    - schema_introspect
    - apply_migration (solo en entornos seguros)
  - Úsalo para: healthchecks, ver políticas RLS, ver tablas y estados tras webhooks.
- GitHub MCP
  - Listar branches, abrir PRs con cambios de Skills/Docs/config, review diffs. Ideal para que Claude proponga PRs mínimos (puertos Stripe, policies, etc.).
- Vercel MCP (o HTTP genérico si no hay conector)
  - Despliegue, seteo de envs y ver logs.
- Notion/Confluence MCP
  - Sincroniza documentación y playbooks con tu fuente corporativa.
- HTTP MCP genérico
  - Consumir APIs internas (si tu empresa las tiene) con definiciones declarativas por endpoint.

El patrón: “leer primero” (read-only) y elevar permisos cuando explícitamente lo pidas. Evita exponer `SUPABASE_SERVICE_ROLE_KEY` o `STRIPE_SECRET_KEY` al agente; en su lugar, ancla esos secretos en el server MCP.


#### 5) Cambios concretos sugeridos (snippets rápidos)

- Webhook de Stripe – fuerza ejecución dinámica y headers directos:
```ts
// app/api/webhooks/stripe/route.ts
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  // ...
}
```

- CSRF básico en `/api/stripe/checkout`:
```ts
// app/api/stripe/checkout/route.ts
const origin = request.headers.get('origin');
const allowed = [process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'];
if (!origin || !allowed.includes(origin)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

- Rate limit (elige tu lib/estrategia favorita; p.ej. Upstash) y logs sin PII.

- Unificar puerto en `stripe-webhook.sh`:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

- Revisar policy de perfiles públicos en migration y remover si no aplica:
```sql
-- DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
```

- Extender enum si quieres soportar `paused`:
```sql
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'paused';
```
Y ajustar `mapSubscriptionStatus()`.

- Alinear apiVersion de Stripe:
  - O bien elimina `apiVersion` y hereda el de la cuenta.
  - O fíjalo a la versión de la cuenta para consistencia.


#### 6) Sinergia con Claude Code en tu carpeta

- Coloca los Skills en `.claude/skills/`.
- Claude Code cargará el `name` y `description` de cada Skill (progressive disclosure) y decidirá cuándo leer el `SKILL.md` completo y archivos referenciados. Ver docs: [Claude Code – Agent Skills](https://docs.claude.com/en/docs/claude-code/skills).
- Usa `allowed-tools` para limitar capacidades por Skill (p.ej., auditar solo con Read/Grep/Glob; scaffolding con Write/Edit).
- Scripts deterministas en `scripts/` dentro del Skill para tareas repetibles (por ejemplo arrancar/validar Stripe CLI, generar migraciones, etc.).
- Comparte Skills al equipo commiteando `.claude/skills/*` al repo (Project Skills). Claude los verá automáticamente al clonar/actualizar.

Consejo: empieza con 3–5 Skills “core” (Stripe simulator, Supabase RLS, Security Hardening, Docs Syncer y Frontend Scaffolder). Itera viendo qué usa más el equipo y dónde Claude requiere más contexto.


#### 7) Checklist breve de adopción

- [ ] Crear `.claude/skills/` y añadir los 4–6 Skills base de arriba.
- [ ] Unificar puerto de Stripe CLI a 3000 en script y docs.
- [ ] Endurecer `/api/stripe/checkout` (Origin check + rate limit).
- [ ] Añadir `dynamic = 'force-dynamic'` al webhook.
- [ ] Decidir política de perfiles públicos; ajustar migration/Policies.
- [ ] Alinear versión de Stripe API.
- [ ] Valida negocio de `cancel_at_period_end` vs acceso inmediato.
- [ ] Conectar MCP (DB read-only + GitHub) para flujos de verificación y PRs.
- [ ] Documentar en `IMPLEMENTATION_SUMMARY.md` cómo correr los Skills (aunque Claude los invoca solo, ayuda a onboard).


#### 8) ¿Por qué esto te da “AI SaaS sin esfuerzo”?

- Skills model-invoked: Claude detecta cuándo usar cada capacidad sin que tengas que recordarle comandos o documentos, y carga justo lo necesario (principio de “progressive disclosure”) [ver: Skills overview](https://www.anthropic.com/news/skills), [engineers’ blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills).
- Repite tareas determinísticas con scripts empaquetados en cada Skill (menos “prompt wrangling” y resultados más predecibles).
- Seguridad por diseño: `allowed-tools`, MCP con secretos del lado servidor, RLS en DB, y hardening en endpoints.
- Sin vendor lock-in en la orquestación: Skills viajan contigo entre Claude Code, apps y API.

Si quieres, en el siguiente paso te dejo:
- Parches exactos para los pequeños fixes (ports, apiVersion, CSRF).
- Un PR de ejemplo con los cuatro Skills base listos para commit.


#### 9) Scaffolding preliminar (Claude Code + Skills + MCP)

- **Objetivo**: dejar listo `.claude/` para que Claude invoque Skills del proyecto automáticamente y puedas generar módulos AI SaaS sin fricción.

- **Árbol de directorios**:

```
.claude/
  commands/
    setup-boilerplate.md
    setup-skills.md
    audit-security.md
  skills/
    stripe-webhooks-simulator/
      SKILL.md
    stripe-config-and-prices/
      SKILL.md
    supabase-migrations-and-rls/
      SKILL.md
    security-hardening/
      SKILL.md
    nextjs-frontend-scaffolder/
      SKILL.md
    docs-syncer/
      SKILL.md
```

- **Plantillas**: disponibles como bloques `FILE:` en `next-boilerplate-saas.txt` (secciones `.claude/commands/*` y `.claude/skills/*`).

- **MCP (primer corte)**:
  - DB MCP: `run_sql` (read-only), `schema_introspect`, `apply_migration` (solo en entorno seguro).
  - GitHub MCP: listar branches/PRs y abrir PRs mínimos.
  - Vercel MCP: deploy/logs opcional.
  - Política: “read-first”; elevar permisos on-demand. Secretos anclados en el server MCP.

- **Slash commands** (mapeo a Skills/Workflows):
  - `/setup-skills` → inicializa estructura y SKILL.md base.
  - `/audit-security` → corre checklist y propone parches mínimos.
  - `/stripe-simulate-webhooks`, `/update-prices`, `/supabase-migrate`, `/sync-docs`, `/new-ai-saas` → orquestan Skills según contexto.

- **Pasos inmediatos**:
  - [ ] Crear `.claude/` con los archivos anteriores (o ejecutar `/setup-skills`).
  - [ ] Commit de `.claude/` al repo (Project Skills para todo el equipo).
  - [ ] Probar auto-invocación abriendo Claude Code en la carpeta y pidiendo una auditoría puntual (p.ej., checkout Stripe).
  - [ ] Conectar MCP DB (read-only) y GitHub para verificación y PRs.
  - [ ] Enlazar en README la sección de Skills y comandos.