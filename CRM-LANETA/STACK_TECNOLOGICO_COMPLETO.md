# STACK TECNOLOGICO COMPLETO - CRM LANETA V2

> **Documentacion tecnica del stack de desarrollo**
> Version 1.0 | Actualizado: 18 de Diciembre, 2025

---

## RESUMEN EJECUTIVO

| Capa | Tecnologia Principal | Version |
|------|---------------------|---------|
| **Frontend** | React + TypeScript | 18.3.1 |
| **Build Tool** | Vite | 5.4.1 |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | Latest |
| **Styling** | Tailwind CSS + shadcn/ui | 3.4.11 |
| **State Management** | TanStack Query | 5.56.2 |
| **Auth** | Supabase Auth (GoTrue) | Built-in |

---

## 1. FRONTEND

### 1.1 Framework Principal

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **React** | 18.3.1 | Biblioteca UI principal |
| **React DOM** | 18.3.1 | Renderizado DOM |
| **TypeScript** | 5.5.3 | Tipado estatico |
| **Vite** | 5.4.1 | Build tool y dev server |

```typescript
// Configuracion Vite (vite.config.ts)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  server: { host: "::", port: 8080 },
  plugins: [react()],
  resolve: { alias: { "@": "./src" } },
});
```

### 1.2 UI Components & Styling

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **Tailwind CSS** | 3.4.11 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Componentes UI accesibles |
| **Radix UI** | Various | Primitivos headless |
| **Lucide React** | 0.462.0 | Iconografia |
| **tailwindcss-animate** | 1.0.7 | Animaciones CSS |

#### Componentes Radix UI Instalados

```
@radix-ui/react-accordion      @radix-ui/react-alert-dialog
@radix-ui/react-avatar         @radix-ui/react-checkbox
@radix-ui/react-collapsible    @radix-ui/react-context-menu
@radix-ui/react-dialog         @radix-ui/react-dropdown-menu
@radix-ui/react-hover-card     @radix-ui/react-label
@radix-ui/react-menubar        @radix-ui/react-navigation-menu
@radix-ui/react-popover        @radix-ui/react-progress
@radix-ui/react-radio-group    @radix-ui/react-scroll-area
@radix-ui/react-select         @radix-ui/react-separator
@radix-ui/react-slider         @radix-ui/react-slot
@radix-ui/react-switch         @radix-ui/react-tabs
@radix-ui/react-toast          @radix-ui/react-toggle
@radix-ui/react-toggle-group   @radix-ui/react-tooltip
```

### 1.3 State Management & Data Fetching

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **TanStack Query** | 5.56.2 | Server state management |
| **React Router DOM** | 6.26.2 | Routing SPA |
| **React Hook Form** | 7.53.0 | Manejo de formularios |
| **Zod** | 3.23.8 | Validacion de schemas |
| **@hookform/resolvers** | 3.9.0 | Integracion Zod + React Hook Form |

```typescript
// Ejemplo de uso tipico
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

### 1.4 Internacionalizacion (i18n)

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **i18next** | 25.3.2 | Core i18n |
| **react-i18next** | 15.6.1 | React bindings |
| **i18next-browser-languagedetector** | 8.2.0 | Deteccion de idioma |
| **i18next-http-backend** | 3.0.2 | Carga de traducciones |

**Idiomas soportados:** Espanol (ES), Ingles (EN), Portugues (PT)

### 1.5 Utilidades Frontend

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **date-fns** | 3.6.0 | Manipulacion de fechas |
| **clsx** | 2.1.1 | Conditional classnames |
| **tailwind-merge** | 2.5.2 | Merge Tailwind classes |
| **class-variance-authority** | 0.7.1 | Variantes de componentes |
| **cmdk** | 1.0.0 | Command palette |
| **sonner** | 1.5.0 | Toast notifications |
| **vaul** | 0.9.3 | Drawer component |

### 1.6 Componentes Especializados

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **recharts** | 2.12.7 | Graficos y visualizaciones |
| **react-day-picker** | 8.10.1 | Date picker |
| **react-quill** | 2.0.0 | Editor Rich Text WYSIWYG |
| **react-signature-canvas** | 1.1.0-alpha.2 | Captura de firmas |
| **react-phone-number-input** | 3.4.12 | Input telefonico internacional |
| **react-world-flags** | 1.6.0 | Banderas de paises |
| **embla-carousel-react** | 8.3.0 | Carrusel de imagenes |
| **react-resizable-panels** | 2.1.3 | Paneles redimensionables |
| **input-otp** | 1.2.4 | Input OTP/codigo |
| **next-themes** | 0.3.0 | Dark/Light mode |

### 1.7 Drag & Drop

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **@dnd-kit/core** | 6.3.1 | Core drag and drop |
| **@dnd-kit/sortable** | 10.0.0 | Listas ordenables |
| **@dnd-kit/modifiers** | 9.0.0 | Modificadores de comportamiento |
| **@dnd-kit/utilities** | 3.2.2 | Utilidades DnD |

### 1.8 Exportacion de Documentos

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **jspdf** | 3.0.3 | Generacion PDF cliente |
| **jspdf-autotable** | 5.0.2 | Tablas en PDF |
| **xlsx** | 0.18.5 | Exportacion Excel |

---

## 2. BACKEND - SUPABASE

### 2.1 Supabase Core

| Componente | Tecnologia | Proposito |
|------------|------------|-----------|
| **Database** | PostgreSQL 15 | Base de datos relacional |
| **API** | PostgREST | API REST auto-generada |
| **Auth** | GoTrue | Autenticacion y usuarios |
| **Realtime** | Realtime Server | WebSockets para subscripciones |
| **Storage** | S3-compatible | Almacenamiento de archivos |
| **Edge Functions** | Deno Runtime | Funciones serverless |

```typescript
// Cliente Supabase (Frontend)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xxx.supabase.co',
  'public-anon-key'
);
```

### 2.2 Supabase Client

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **@supabase/supabase-js** | 2.53.0 | Cliente JavaScript |

### 2.3 Extensiones PostgreSQL

| Extension | Proposito |
|-----------|-----------|
| **pg_cron** | Tareas programadas |
| **pg_net** | HTTP requests desde SQL |
| **pgcrypto** | Funciones criptograficas |
| **uuid-ossp** | Generacion de UUIDs |
| **pgjwt** | Generacion de JWT |

### 2.4 Estructura de Base de Datos

```
ESTADISTICAS:
├── Migraciones:     449
├── Tablas:          55+
├── Views:           10+
├── Funciones RPC:   35+
├── Triggers:        35+
├── Enums:           15+
└── Policies RLS:    100+
```

---

## 3. EDGE FUNCTIONS (Deno)

### 3.1 Runtime

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **Deno** | Latest | Runtime JavaScript/TypeScript |
| **Supabase Functions** | v2 | Hosting serverless |

### 3.2 Lista de Edge Functions (25 funciones)

#### Autenticacion y Usuarios
| Funcion | Proposito |
|---------|-----------|
| `create-user` | Crear usuarios en Supabase Auth |
| `update-user` | Actualizar datos de usuario |
| `list-users` | Listar usuarios del sistema |
| `add-user-to-company` | Asignar usuario a empresa |
| `create-creator-silent` | Crear creador sin notificacion |
| `validate-auth-token` | Validar tokens de autenticacion |
| `send-magic-link` | Enviar magic link de login |
| `send-client-magic-link` | Magic link para clientes |

#### Notificaciones
| Funcion | Proposito | Servicio Externo |
|---------|-----------|------------------|
| `send-notification-emails` | Enviar emails de notificacion | **Resend** |
| `mailjet` | Email legacy | **Mailjet** |
| `send-whatsapp-notification` | Notificaciones WhatsApp | **Respond.io** |
| `process-whatsapp-notifications` | Procesar cola WhatsApp | **Respond.io** |
| `create-respondio-contact` | Crear contacto en Respond.io | **Respond.io** |

#### Procesamiento de Video
| Funcion | Proposito | Servicio Externo |
|---------|-----------|------------------|
| `mux-process-video` | Enviar video a MUX | **MUX** |
| `mux-webhook` | Recibir eventos de MUX | **MUX** |
| `mux-download-outputs` | Descargar outputs de MUX | **MUX** |
| `ffmpeg-process` | Procesar clips y escenas | **Railway FFmpeg API** |
| `transcribe-video` | Transcribir audio | **Deepgram** |
| `ml-analyze-video` | Analisis ML de imagenes | **OpenRouter** |
| `pipeline-orchestrator` | Orquestar pipeline completo | pg_net |

#### Firma Electronica
| Funcion | Proposito | Servicio Externo |
|---------|-----------|------------------|
| `whatsapp-video-bot` | Bot para recibir videos | **WhatsApp Cloud API** |
| `generate-signature-link` | Generar link de firma | Interno |
| `process-signature` | Procesar firma y generar PDF | **pdf-lib** + **Resend** |

#### Otros
| Funcion | Proposito |
|---------|-----------|
| `creator-socials` | APIs de redes sociales |
| `url-redirect` | Redirects de URLs cortas |

---

## 4. INTEGRACIONES EXTERNAS

### 4.1 Email

| Servicio | Proposito | Endpoint |
|----------|-----------|----------|
| **Resend** | Email transaccional moderno | `https://api.resend.com/emails` |
| **Mailjet** | Email legacy | `https://api.mailjet.com/v3.1/send` |

```typescript
// Ejemplo Resend
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'notifications@notifications.laneta.com',
    to: email,
    subject: subject,
    html: htmlContent,
  }),
});
```

### 4.2 WhatsApp

| Servicio | Proposito | Uso |
|----------|-----------|-----|
| **WhatsApp Cloud API** | Recibir mensajes y videos | Bot de ingestion |
| **Respond.io** | Enviar notificaciones | Mensajes salientes |

```
Variables de entorno:
- WHATSAPP_ACCESS_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- WHATSAPP_VERIFY_TOKEN
- RESPONDIO_API_KEY
- RESPONDIO_WORKSPACE_ID
- RESPONDIO_CHANNEL_ID
```

### 4.3 Procesamiento de Video

| Servicio | Proposito | Caracteristicas |
|----------|-----------|-----------------|
| **MUX** | Video hosting y transcoding | Thumbnails, HLS, MP4 renditions |
| **Railway FFmpeg API** | Procesamiento local | Clips, scene detection, audio extraction |

```
MUX Features:
- Asset creation desde URL
- Static renditions (MP4)
- Thumbnail generation
- Playback IDs
- Webhooks para status

FFmpeg API Features:
- Video clips (inicio/fin)
- Scene detection
- Audio extraction
- Formato configurable
```

### 4.4 AI/ML

| Servicio | Proposito | Modelos Disponibles |
|----------|-----------|---------------------|
| **OpenRouter** | Gateway multi-modelo | GPT-4o, Claude 3.5, Gemini, Llama |
| **Deepgram** | Transcripcion de audio | Nova-2 (multiidioma) |

```typescript
// Modelos OpenRouter disponibles
const OPENROUTER_MODELS = {
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
  'claude-3-haiku': 'anthropic/claude-3-haiku',
  'gemini-pro-vision': 'google/gemini-pro-vision',
  'gemini-flash': 'google/gemini-flash-1.5',
  'llama-3.2-vision': 'meta-llama/llama-3.2-90b-vision-instruct',
};
```

### 4.5 Etiquetado de Datos

| Servicio | Proposito | Hosting |
|----------|-----------|---------|
| **Label Studio** | Plataforma de etiquetado | Railway |

```
Caracteristicas:
- Interfaz de etiquetado
- Proyectos por categoria
- Export JSON/COCO
- Sync bidireccional
```

---

## 5. UPLOAD DE ARCHIVOS

### 5.1 Protocolo TUS

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **tus-js-client** | 4.3.1 | Cliente TUS protocol |
| **@uppy/core** | 5.1.1 | Upload orchestration |
| **@uppy/react** | 5.1.0 | React components |
| **@uppy/tus** | 5.0.2 | TUS plugin para Uppy |

```typescript
// Configuracion tipica
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';

const uppy = new Uppy()
  .use(Tus, {
    endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
    headers: { authorization: `Bearer ${accessToken}` },
    chunkSize: 6 * 1024 * 1024, // 6MB chunks
  });
```

### 5.2 Supabase Storage

```
Buckets configurados:
├── avatars          # Fotos de perfil
├── briefs           # Archivos de briefs (PDF, PPT)
├── campaign-drafts  # Drafts de creadores
├── ai-training      # Videos para entrenamiento AI
├── signatures       # Firmas electronicas
└── ffmpeg-outputs   # Clips procesados
```

---

## 6. MOBILE (Capacitor)

### 6.1 Capacitor Plugins

| Plugin | Version | Proposito |
|--------|---------|-----------|
| **@capacitor/app** | 7.1.0 | App lifecycle |
| **@capacitor/network** | 7.0.2 | Estado de red |
| **@capacitor/preferences** | 7.0.2 | Storage local |
| **@whiteguru/capacitor-plugin-video-editor** | 7.1.0 | Edicion de video |

---

## 7. TESTING

### 7.1 Framework de Testing

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **Vitest** | 3.2.4 | Test runner |
| **@testing-library/react** | 16.3.0 | Testing React components |
| **@testing-library/user-event** | 14.6.1 | Simulacion de eventos |
| **@testing-library/jest-dom** | 6.9.1 | Matchers DOM |
| **jsdom** | 26.1.0 | DOM environment |

```typescript
// vitest.config.ts
export default {
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
};
```

### 7.2 Comandos de Testing

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:ui       # Vitest UI
```

---

## 8. DESARROLLO Y BUILD

### 8.1 Linting

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **ESLint** | 9.9.0 | Linting JavaScript/TypeScript |
| **eslint-plugin-react-hooks** | 5.1.0-rc.0 | Rules para hooks |
| **eslint-plugin-react-refresh** | 0.4.9 | Fast refresh rules |
| **typescript-eslint** | 8.0.1 | ESLint para TypeScript |

### 8.2 CSS Processing

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **PostCSS** | 8.4.47 | CSS processing |
| **Autoprefixer** | 10.4.20 | Vendor prefixes |
| **@tailwindcss/typography** | 0.5.15 | Prose styling |

### 8.3 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev           # Start dev server (port 8080)
npm run build         # Production build
npm run build:dev     # Development build
npm run preview       # Preview production build

# Calidad
npm run lint          # Run ESLint
```

---

## 9. VARIABLES DE ENTORNO

### 9.1 Frontend (.env)

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Label Studio (opcional)
VITE_LABEL_STUDIO_URL=https://label-studio.example.com
VITE_LABEL_STUDIO_API_TOKEN=xxx
```

### 9.2 Edge Functions (Supabase Secrets)

```env
# Supabase (automaticos)
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Email
RESEND_API_KEY
MJ_APIKEY_PUBLIC
MJ_APIKEY_PRIVATE

# WhatsApp
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN
RESPONDIO_API_KEY
RESPONDIO_WORKSPACE_ID
RESPONDIO_CHANNEL_ID

# Video Processing
MUX_TOKEN_ID
MUX_TOKEN_SECRET
MUX_WEBHOOK_SECRET
FFMPEG_API_URL
FFMPEG_API_SECRET

# AI/ML
OPENROUTER_API_KEY
DEEPGRAM_API_KEY

# Misc
PROJECT_URL
```

---

## 10. ARQUITECTURA DE CARPETAS

```
crm-laneta-v2-02/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # shadcn/ui components
│   │   ├── admin/          # Admin-specific components
│   │   ├── creators-inventory/
│   │   └── dashboard/
│   ├── pages/              # Page components
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── client/
│   │   ├── creator/
│   │   └── sign/           # Public signature pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic
│   ├── integrations/       # External integrations
│   │   └── supabase/
│   ├── locales/            # i18n translations
│   │   ├── en/
│   │   ├── es/
│   │   └── pt/
│   ├── lib/                # Utilities
│   └── test/               # Test setup
├── supabase/
│   ├── functions/          # Edge Functions (25)
│   ├── migrations/         # SQL migrations (449)
│   └── config.toml
├── public/                 # Static assets
├── docs/                   # Documentation
└── requirements/           # Requirements specs
```

---

## 11. FLUJO DE DATOS

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  React 18 + TypeScript + Vite + TanStack Query + React Router   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLIENT                             │
│              @supabase/supabase-js v2.53.0                       │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgREST     │  │   Realtime      │  │   Storage       │
│   (REST API)    │  │   (WebSocket)   │  │   (S3-compat)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL 15                               │
│    Tables + Views + Functions + Triggers + RLS Policies         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EDGE FUNCTIONS (Deno)                        │
│                      25 Functions                                │
└─────────────────────────────────────────────────────────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
┌──────────┐           ┌──────────┐            ┌──────────┐
│  Resend  │           │   MUX    │            │OpenRouter│
│  Email   │           │  Video   │            │   AI/ML  │
└──────────┘           └──────────┘            └──────────┘
     │                        │                        │
     ▼                        ▼                        ▼
┌──────────┐           ┌──────────┐            ┌──────────┐
│Respond.io│           │  FFmpeg  │            │ Deepgram │
│ WhatsApp │           │  Railway │            │Transcript│
└──────────┘           └──────────┘            └──────────┘
```

---

## 12. ESTADISTICAS DEL PROYECTO

```
Lineas de Codigo:        ~90,000
Archivos TypeScript:     400+
Componentes React:       70+
Custom Hooks:            45+
Services:                25+
Edge Functions:          25
SQL Migrations:          449
Dependencias (prod):     75
Dependencias (dev):      20
```

---

**Ultima actualizacion:** 18 de Diciembre, 2025
**Version:** 1.0
**Autor:** Equipo ELEVN / Laneta

