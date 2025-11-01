    # Plantilla SaaS de Next.js con Claude Code

Una plantilla SaaS lista para producción con Next.js, autenticación de Supabase y pagos de suscripción de Stripe.

## 🚀 Estado

✅ **Estructura del Proyecto Creada**
- Configuración de Next.js 16
- Configuración de TypeScript
- Tailwind CSS configurado
- Clientes de Supabase (navegador, servidor, middleware)
- Definiciones de tipos (esquema de base de datos)
- Habilidades de Claude Code (6 Habilidades + 2 Comandos)
- Flujo de trabajo OpenSpec integrado

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar instancia local de Supabase
npm run supabase:start

# Copiar variables de entorno
cp .env.example .env

# Seguir las instrucciones de configuración en el archivo .env
```

## 🤖 Integración con Claude Code

Esta plantilla incluye Habilidades de Proyecto de Claude Code:

- **stripe-webhooks-simulator** - Probar flujos de webhooks
- **stripe-config-and-prices** - Gestionar productos/precios
- **supabase-migrations-and-rls** - Migraciones de base de datos
- **security-hardening** - Auditorías de seguridad
- **nextjs-frontend-scaffolder** - Andamiaje de UI
- **docs-syncer** - Mantener documentos sincronizados

### Comandos Disponibles

- `/setup-skills` - Inicializar andamiaje de Habilidades
- `/audit-security` - Ejecutar revisión de seguridad

## 🏗️ Próximos Pasos

### 1. Completar la Implementación de la Plantilla

Ejecuta lo siguiente para generar los archivos restantes:

```bash
# La plantilla tiene la estructura base pero necesita:
# - Páginas completas de app/* (auth/login, dashboard, pricing)
# - Rutas de API (stripe checkout, webhooks)
# - Migraciones de Supabase
# - Scripts de configuración
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar el Entorno

```bash
# Iniciar Supabase
npm run supabase:start

# Obtener credenciales
supabase status

# Actualizar .env con valores reales
```

### 4. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

## 📁 Estructura Actual

```
/
├── .claude/              # Habilidades y Comandos de Claude Code
├── openspec/             # Especificaciones y cambios de OpenSpec
├── app/                  # Next.js App Router
│   ├── layout.tsx       ✅
│   ├── page.tsx         ✅
│   └── globals.css      ✅
├── lib/                  # Utilidades
│   └── supabase/        ✅ (client, server, middleware)
├── types/                ✅
│   └── database.ts      # Tipos de TypeScript
├── middleware.ts         ✅
├── package.json          ✅
├── tsconfig.json         ✅
├── tailwind.config.ts    ✅
└── .env.example          ✅
```

## 🔧 Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Autenticación**: Supabase Auth
- **Base de Datos**: Supabase (PostgreSQL)
- **Pagos**: Stripe
- **Estilos**: Tailwind CSS
- **Lenguaje**: TypeScript

## 📖 Documentación

- Ver `plan.md` para detalles de implementación
- Ver `next-boilerplate-saas.txt` para contenido completo de archivos
- Ver `openspec/` para flujo de trabajo basado en especificaciones

## 🎯 Características (Planificadas)

- [ ] Autenticación con enlace mágico
- [ ] Panel de control protegido
- [ ] Suscripciones de Stripe (Pro, Enterprise)
- [ ] Manejo de webhooks
- [ ] Políticas RLS
- [ ] Renderizado del lado del servidor
- [ ] API con tipado seguro

## 🔐 Seguridad

Todas las Habilidades usan `allowed-tools` mínimos:
- Habilidades de Auditoría: Solo Read, Grep, Glob
- Habilidades de Andamiaje: Write, Edit cuando sea necesario
- Sin secretos en variables `NEXT_PUBLIC_*`

---

**¿Necesitas ayuda?** Consulta `.claude/skills/` para automatizaciones disponibles o ejecuta `/audit-security` para revisión de seguridad.
