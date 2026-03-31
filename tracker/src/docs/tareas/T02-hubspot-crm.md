# T02 — HubSpot CRM Setup

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T02 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Daniel Ramírez |
| **Fecha Inicio** | Martes 7 Abril |
| **Fecha Entrega** | Martes 7 Abril |
| **Bloqueada por** | — |
| **Bloquea a** | T14, T17, DTO-OUT-01 |

## Objetivo
CRM central operativo con pipelines, propiedades y accesos para los 4 equipos.

## Detalle de Implementación

### Paso 1: Crear cuenta HubSpot (Free tier)
- Ir a hubspot.com → Sign up → Free CRM
- Email: herramientas@laneta.com (o la cuenta admin que usen)

### Paso 2: Pipeline B2B Ventas
Crear pipeline con estas etapas (en este orden):
1. Prospecto Nuevo
2. Contactado (email/LinkedIn/teléfono)
3. Cualificado (responde + cumple ICP)
4. Reunión Agendada
5. Propuesta Enviada
6. Negociación
7. Cerrado Ganado ✅
8. Cerrado Perdido ❌
9. Nurture (sin respuesta después de 21 días)

### Paso 3: Pipeline Creadores Onboarding
1. Lead (identificado por Social Blade/ManyChat)
2. Contactado (DM/WhatsApp/SMS)
3. Cualificado (cumple criterios ICP)
4. Demo/Pitch Realizado
5. Contrato Enviado
6. Firmado ✅
7. Onboarding Elevn
8. Activo
9. No Interesado ❌

### Paso 4: Propiedades Custom
Crear estas propiedades de contacto:
- `source` (dropdown): Clay, SmartScout, ManyChat, Referral, Inbound, Manual
- `icp_score` (number): 1-10
- `video_gap_score` (number): 1-10 (solo B2B)
- `canal_primer_contacto` (dropdown): Email, LinkedIn, Instagram, WhatsApp, Teléfono, SMS
- `equipo_responsable` (dropdown): Marketing Influencers, Creadores, Infraestructura, Contenido
- `creator_subscribers` (number): solo para pipeline Creadores
- `creator_platform` (dropdown): YouTube, TikTok, Instagram, Twitch
- `creator_language` (dropdown): Español, Inglés, Portugués, Otro

### Paso 5: Accesos
Invitar a cada líder de equipo:
- Pepe (Equipo 1 - Marketing): acceso pipeline B2B
- Mery (Equipo 2 - Creadores): acceso pipeline Creadores
- Líder Equipo 4 (Contenido): acceso ambos pipelines (lectura)
- Gabriel, Dayana, Eugenia, Lillian: acceso completo Equipo 3

### Paso 6: Verificación
- Crear 1 contacto de prueba en cada pipeline
- Mover por todas las etapas
- Verificar que las propiedades custom se guardan correctamente
- Confirmar que cada equipo tiene acceso (pedir confirmación por Telegram)

## Entregables
- [ ] Cuenta HubSpot creada
- [ ] Pipeline B2B Ventas con 9 etapas
- [ ] Pipeline Creadores Onboarding con 9 etapas
- [ ] 8 propiedades custom creadas
- [ ] Accesos dados a los 4 equipos
- [ ] Contacto de prueba en cada pipeline

## Criterios de Aceptación
- [ ] Los 4 líderes de equipo confirman acceso por Telegram
- [ ] Un contacto puede moverse por todas las etapas sin error
- [ ] Propiedades custom visibles al editar un contacto

## Costo
| Item | Costo |
|------|-------|
| HubSpot Free CRM | $0 |

## Notas para Daniel
- El Free tier tiene límite de 5 pipelines y propiedades custom limitadas. Si necesitas más, el Starter es $20/mes.
- Configura las vistas por equipo para que cada quien vea solo lo relevante.
- NO pierdas tiempo en automatizaciones avanzadas hoy — eso viene después del testing E2E.
- Nota sobre CRM propio: la estructura debe ser compatible con la BD del CRM a medida (creator_inventory, campaigns, etc.). HubSpot es temporal para el sprint; el CRM propio es el destino final.
