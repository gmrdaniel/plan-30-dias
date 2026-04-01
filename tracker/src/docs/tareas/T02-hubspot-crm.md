# T02 — HubSpot CRM Setup

## Informacion General
| Campo | Valor |
|-------|-------|
| **ID** | T02 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Daniel Ramirez |
| **Fecha Inicio** | Martes 7 Abril |
| **Fecha Entrega** | Martes 7 Abril (config base) — Semana 3 para integraciones completas |
| **Bloqueada por** | B19 (confirmar plan HubSpot), B20 (integraciones no nativas) |
| **Bloquea a** | T03, T06, T07, T14, T17, DTO-OUT-01 |

## Objetivo
CRM central operativo con pipelines, propiedades custom, accesos para 4 equipos, y estructura de API lista para recibir datos de Clay, Smartlead, Expandi, ManyChat y JustCall.

## Contexto
- **Plan minimo requerido:** Starter ($20/mes) — Free solo permite 1 pipeline, necesitamos 2
- **Upgrade a Sales Pro ($90/mes):** Necesario en Semana 3 para workflows de Nurture e informes de conversion
- **HubSpot es temporal:** El CRM propio (Supabase/Laneta) es el destino final. HubSpot es puente para el sprint.
- Ver tab **"Licencias"** para comparacion detallada de planes y alternativas

---

## SEMANA 1 — Dia 2 (7 Abril): Config base

### Paso 1: Crear cuenta HubSpot (Starter $20/mes)
- Ir a hubspot.com → Sign up → Seleccionar **Sales Hub Starter**
- Email: herramientas@laneta.com (cuenta admin)
- Pago: tarjeta de empresa, facturacion anual = $15/mes (o mensual = $20/mes)

> **Nota:** Free solo permite 1 pipeline. Starter permite 2 (exactamente lo que necesitamos). Ver tab "Licencias" para detalle.

### Paso 2: Pipeline B2B Ventas
Crear pipeline con estas etapas (en este orden):
1. Prospecto Nuevo
2. Contactado (email/LinkedIn/telefono)
3. Cualificado (responde + cumple ICP)
4. Reunion Agendada
5. Propuesta Enviada
6. Negociacion
7. Cerrado Ganado
8. Cerrado Perdido
9. Nurture (sin respuesta despues de 21 dias)

### Paso 3: Pipeline Creadores Onboarding
1. Lead (identificado por Social Blade/ManyChat)
2. Contactado (DM/WhatsApp/SMS)
3. Cualificado (cumple criterios ICP)
4. Demo/Pitch Realizado
5. Contrato Enviado
6. Firmado
7. Onboarding Elevn
8. Activo
9. No Interesado

### Paso 4: Propiedades Custom
Crear estas propiedades de contacto (8 total — Starter permite 1,000):
- `source` (dropdown): Clay, SmartScout, ManyChat, Referral, Inbound, Manual
- `icp_score` (number): 1-10
- `video_gap_score` (number): 1-10 (solo B2B)
- `canal_primer_contacto` (dropdown): Email, LinkedIn, Instagram, WhatsApp, Telefono, SMS
- `equipo_responsable` (dropdown): Marketing Influencers, Creadores, Infraestructura, Contenido
- `creator_subscribers` (number): solo para pipeline Creadores
- `creator_platform` (dropdown): YouTube, TikTok, Instagram, Twitch
- `creator_language` (dropdown): Espanol, Ingles, Portugues, Otro

### Paso 5: Accesos
Invitar a cada lider de equipo (en Starter, usuarios adicionales son gratis pero sin features Pro):
- Pepe (Equipo 1 - Marketing): acceso pipeline B2B
- Mery (Equipo 2 - Creadores): acceso pipeline Creadores
- Lider Equipo 4 (Contenido): acceso ambos pipelines (lectura)
- Gabriel, Dayana, Eugenia, Lillian: acceso completo Equipo 3

### Paso 6: Verificacion
- Crear 1 contacto de prueba en cada pipeline
- Mover por todas las etapas
- Verificar que las propiedades custom se guardan correctamente
- Confirmar que cada equipo tiene acceso (pedir confirmacion por Telegram)

---

## SEMANA 1 — Dia 3-5 (8-10 Abril): Preparar integraciones

### Paso 7: Obtener API key y documentar endpoints
1. Settings → Integrations → Private Apps → Create private app
2. Nombre: "Clay-Smartlead-Integration"
3. Scopes necesarios: `crm.objects.contacts.write`, `crm.objects.contacts.read`, `crm.objects.deals.write`
4. Copiar API key y guardar en 1Password / vault seguro
5. Documentar endpoints para Gabriel (T06):

```
Crear contacto:
POST https://api.hubapi.com/crm/v3/objects/contacts
Header: Authorization: Bearer {HUBSPOT_API_KEY}
Body: {
  "properties": {
    "email": "...",
    "firstname": "...",
    "lastname": "...",
    "company": "...",
    "source": "Clay",
    "icp_score": "8",
    "video_gap_score": "9",
    "canal_primer_contacto": "Email",
    "equipo_responsable": "Marketing Influencers"
  }
}

Actualizar contacto (status de Smartlead/Expandi):
PATCH https://api.hubapi.com/crm/v3/objects/contacts/{contactId}
Header: Authorization: Bearer {HUBSPOT_API_KEY}
Body: {
  "properties": {
    "hs_lead_status": "CONTACTED"
  }
}
```

### Paso 8: Preparar estructura para integraciones externas

| Herramienta | Integracion nativa? | Mecanismo | Config necesaria |
|---|---|---|---|
| Clay → HubSpot | NO nativa, API directa | Clay HTTP enrichment → HubSpot API | API key en Clay |
| Smartlead → HubSpot | **NO nativa** | Smartlead webhook → Zapier → HubSpot API | Zapier Free (100 tasks/mes) o Relay.app |
| Expandi → HubSpot | **NO nativa** | Expandi webhook → Zapier → HubSpot API | Zapier Free o Relay.app |
| JustCall → HubSpot | **SI nativa** | App del Marketplace | Instalar app en HubSpot |
| ManyChat → HubSpot | Via Zapier | ManyChat trigger → Zapier → HubSpot | Zapier Free |
| Sendspark → HubSpot | Revisar Marketplace | Posible nativa | Buscar en Marketplace |
| Calendly → HubSpot | **SI nativa** | App del Marketplace | Instalar app |

**Accion:** Instalar JustCall y Calendly desde el Marketplace el mismo Dia 3. Las demas se configuran cuando T07 y T08 esten listas.

---

## SEMANA 2 — Dia 9-11 (15-17 Abril): Validar syncs

### Paso 9: Validar sync Clay → HubSpot
1. Gabriel (T06) hace push de 20 prospectos de prueba a HubSpot via API
2. Verificar que llegan con todas las propiedades custom correctas
3. Verificar que caen en pipeline B2B en etapa "Prospecto Nuevo"
4. Si fallan: revisar API key, scopes, formato de propiedades

### Paso 10: Validar syncs Smartlead/Expandi → HubSpot
1. Gabriel (T07) envia 1 email de prueba desde Smartlead
2. Verificar que el status (enviado/abierto) llega a HubSpot via webhook
3. Verificar que Expandi reporta conexion de LinkedIn
4. Si no hay integracion directa: configurar Zapier como puente

---

## SEMANA 3 — Dia 16+ (18+ Abril): Upgrade a Pro + automatizaciones

### Paso 11: Upgrade a Sales Hub Pro ($90/mes)
**Trigger:** Despues de que T14 (testing E2E) confirme que todos los syncs funcionan.

1. Settings → Account & Billing → Upgrade to Sales Hub Professional
2. Costo: $90/mes/licencia (con facturacion anual baja a $90)

### Paso 12: Configurar workflows
1. **Workflow "Nurture automatico":**
   - Trigger: Contacto en pipeline B2B con etapa "Contactado" + ultimo contacto > 21 dias
   - Accion: Mover a etapa "Nurture"
2. **Workflow "Lead caliente → alerta":**
   - Trigger: Contacto creado con `icp_score >= 7`
   - Accion: Webhook a Relay.app → Telegram #leads-b2b-calientes
3. **Workflow "Score bajo → Nurture":**
   - Trigger: Contacto con `icp_score < 6`
   - Accion: Agregar a lista "Nurture" automaticamente

### Paso 13: Configurar informes de conversion
1. Dashboard "Pipeline B2B": conversion por etapa, tiempo promedio por etapa, leads por source
2. Dashboard "Pipeline Creadores": conversion por etapa, creadores por plataforma, idioma
3. Dashboard "Integraciones": contactos creados por fuente (Clay vs ManyChat vs Manual)

---

## Timeline de sincronizacion de datos a HubSpot

```
DIA 2 (7 Abr) — T02: Config base
  └─ Manual: 2 contactos de prueba (1 por pipeline)

DIA 2 (7 Abr) — T03: Relay.app conectado
  └─ Saliente: HubSpot → Telegram (alertas automaticas)

DIA 7-9 (11-13 Abr) — T06: Clay listo
  └─ Entrante: Clay → HubSpot (50 prospectos de prueba)
  └─ Via: Clay HTTP enrichment → POST /crm/v3/objects/contacts

DIA 10 (14 Abr) — T07: Outreach activo
  └─ Entrante: Smartlead → HubSpot (status emails)
  └─ Entrante: Expandi → HubSpot (status LinkedIn)
  └─ Entrante: JustCall → HubSpot (llamadas)

DIA 12 (16 Abr) — T08/T12: ManyChat activo
  └─ Entrante: ManyChat → HubSpot (creadores cualificados)

DIA 16-17 (18-19 Abr) — T14: Testing E2E
  └─ Validacion: TODOS los syncs funcionan
  └─ Trigger: upgrade a Sales Pro si E2E OK

DIA 18-21 (20-23 Abr) — T11: 1,000 prospectos
  └─ Masivo: Clay → HubSpot (1,000 contactos)
  └─ Workflows de Nurture activos
  └─ Dashboards de conversion activos

DIA 22-30 — Operacion continua
  └─ Flujo continuo de todas las fuentes
  └─ Reportes semanales de conversion
```

---

## Entregables
- [ ] Cuenta HubSpot Starter creada y pagada
- [ ] Pipeline B2B Ventas con 9 etapas
- [ ] Pipeline Creadores Onboarding con 9 etapas
- [ ] 8 propiedades custom creadas
- [ ] Accesos dados a los 4 equipos (8 usuarios)
- [ ] API key generada y documentada
- [ ] Estructura de integraciones documentada (Paso 8)
- [ ] JustCall y Calendly instalados desde Marketplace
- [ ] Contacto de prueba en cada pipeline

## Criterios de Aceptacion
- [ ] Los 4 lideres de equipo confirman acceso por Telegram
- [ ] Un contacto puede moverse por todas las etapas sin error
- [ ] Propiedades custom visibles al editar un contacto
- [ ] API key funciona (test con curl o Postman)
- [ ] Clay puede crear contacto en HubSpot via API (validado con Gabriel)

## Costo
| Item | Costo | Cuando |
|------|-------|--------|
| HubSpot Sales Starter | $20/mes (o $15/mes anual) | Dia 2 |
| HubSpot Sales Pro (upgrade) | $90/mes | Semana 3 (despues de T14) |
| Zapier Free (puente Smartlead/Expandi) | $0 (100 tasks/mes) | Dia 10 |

## Notas para Daniel
- **No comprar Pro el Dia 1.** Starter cubre todo para Semana 1-2. Pro se activa cuando los workflows de Nurture se vuelven criticos (Semana 3).
- Configura las vistas por equipo para que cada quien vea solo lo relevante (filtrar por `equipo_responsable`).
- La API key es CRITICA — sin ella T06 no puede hacer push a HubSpot. Generarla el Dia 2 o 3.
- Smartlead y Expandi NO tienen integracion nativa con HubSpot. Usa Zapier Free como puente (100 tasks/mes es suficiente para testing). Si el volumen crece, upgrade Zapier a Starter ($19.99/mes).
- HubSpot es temporal para el sprint; el CRM propio (Supabase) es el destino final. La estructura de propiedades custom debe ser compatible con la BD del CRM a medida.
