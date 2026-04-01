# T02 — Analisis de Licencias HubSpot

## Comparacion de planes: Free vs Starter vs Sales Pro

| Requerimiento | Free ($0) | Starter ($20/mes) | Sales Pro ($90/mes) |
|---|---|---|---|
| Pipelines de deals | 1 max | **2** | Hasta 15 |
| Propiedades custom | 10 por objeto | 1,000 por objeto | 1,000 por objeto |
| Usuarios | Ilimitados (limitados) | Ilimitados | Por licencia pagada |
| Vistas por equipo | Basicas | Basicas | Avanzadas |
| API (recibir datos de Clay) | 100 calls/10seg | 100 calls/10seg | 150 calls/10seg |
| Workflows (automatizaciones) | **NO** | **NO** | Hasta 300 |
| Secuencias de email | **NO** | **NO** | 5,000/cuenta, 500/dia |
| Informes personalizados | **NO** | 30 dashboards basicos | Hasta 100 custom, 75 dashboards |
| Equipos formales | **NO** | **NO** | Hasta 10 |
| Integracion Slack | SI | SI | SI |
| Integracion Salesforce | NO | NO | SI |
| Gestion de duplicados | NO | NO | SI |
| Llamadas (JustCall) | 0 min nativos | 500 min | 3,000 min |
| Fragmentos predefinidos | Limitados | Hasta 5,000 | Hasta 5,000 |

---

## Veredicto por requerimiento del sprint

| # | Requerimiento | Tarea | Free? | Starter? | Pro? |
|---|---|---|---|---|---|
| 1 | 2 pipelines (B2B + Creadores) | T02 | **NO** (solo 1) | **SI** | SI |
| 2 | 8 propiedades custom | T02 | SI (10 max) | SI | SI |
| 3 | Accesos para 8 usuarios | T02 | SI | SI | SI |
| 4 | API para recibir datos de Clay | T06, T11 | SI | SI | SI |
| 5 | Webhook Smartlead → HubSpot | T07 | SI (API contactos) | SI | SI |
| 6 | Webhook Expandi → HubSpot | T07 | SI (API contactos) | SI | SI |
| 7 | JustCall integracion nativa | T07 | SI | SI | SI |
| 8 | Relay.app triggers (alertas) | T03 | SI (API) | SI | SI |
| 9 | Sendspark integracion | T09 | SI (webhook) | SI | SI |
| 10 | ManyChat → HubSpot | T08, T12 | SI (via Zapier) | SI | SI |
| 11 | Workflows automaticos (Nurture 21d) | T11, T14 | **NO** | **NO** | **SI** |
| 12 | Secuencias email desde HubSpot | Plan estrategico | **NO** | **NO** | **SI** |
| 13 | Informes conversion por etapa | T19 | **NO** | **NO** | **SI** |
| 14 | Equipos formales (vistas por rol) | T02 | **NO** | **NO** | **SI** |
| 15 | Dashboard multiples | T19 | **NO** (1 max) | SI (30) | SI (75) |

### Resumen

- **Free:** Falla en requisito #1 (solo 1 pipeline). Descartado.
- **Starter ($20/mes):** Cubre Semana 1-2 completa (pipelines, propiedades, integraciones API, dashboards basicos). Falla en automatizaciones y reportes avanzados.
- **Sales Pro ($90/mes):** Cubre todo el sprint. Necesario desde Semana 3 para workflows de Nurture e informes de conversion.

---

## Estrategia recomendada: escalonada

### Semana 1-2: Starter ($20/mes)

Cubre: pipelines, propiedades, accesos, API para Clay/Smartlead/Expandi, Relay.app, dashboards basicos.

**Lo que NO cubre y como resolverlo temporalmente:**

| Funcionalidad faltante | Workaround temporal |
|---|---|
| Workflow "Nurture 21 dias" | Crear vista manual en HubSpot filtrada por "ultimo contacto > 21 dias". Gabriel mueve manualmente. |
| Informes de conversion | Dashboard basico de Starter (30 paneles con reportes estandar). No custom pero funcional. |
| Equipos formales | Crear vistas guardadas por equipo (pseudo-equipos). Cada lider filtra por `equipo_responsable`. |

### Semana 3: Upgrade a Sales Pro ($90/mes)

Trigger para upgrade: cuando T14 (testing E2E) este completo y los flujos de datos esten validados. En ese punto:
- Los workflows de Nurture se vuelven criticos (1,000 prospectos activos)
- Se necesitan informes reales de conversion por etapa
- Los equipos necesitan vistas formales

### Costo total sprint

| Periodo | Plan | Costo |
|---|---|---|
| Semana 1-2 (14 dias) | Starter | $20/mes |
| Semana 3-4 (16 dias) | Sales Pro | $90/mes |
| **Total mes 1** | | **~$110** |

---

## Funcionalidades NO encontradas — preguntar a ventas

Estas integraciones son necesarias para el sprint pero NO aparecen como features nativas en ningun plan de HubSpot:

| # | Funcionalidad | Para que | Workaround actual | Preguntar a ventas |
|---|---|---|---|---|
| 1 | Integracion nativa Smartlead | Sync status emails (enviado, abierto, respondido) a HubSpot | Smartlead tiene webhook outbound → HubSpot API `/contacts` | Existe app de Smartlead en HubSpot Marketplace? |
| 2 | Integracion nativa Expandi | Sync status LinkedIn (conectado, respondido) | Expandi webhook → HubSpot API `/contacts` | Existe app de Expandi en HubSpot Marketplace? |
| 3 | Webhook ENTRANTE nativo (recibir POST de Clay) | Clay push prospectos enriquecidos | Usar HubSpot API directamente (`POST /crm/v3/objects/contacts`) — funciona en todos los planes | No es necesario workflow para esto? Solo API? |
| 4 | Integracion ManyChat → HubSpot | Datos cualificacion creador WhatsApp | Via Zapier ($0 con Free tier, 100 tasks/mes) o Relay.app ($9/mes) | Existe integracion nativa ManyChat? |
| 5 | Rate limits API en Starter | Volumen de 1,000+ contactos sync en batch | 100 calls/10 seg = 600/min. Para 1,000 prospectos toma ~2 min. Suficiente. | Confirmar que Starter no tiene cap diario? |

**Template para contactar ventas HubSpot:**

```
Hola equipo HubSpot,

Estamos evaluando Sales Hub Starter → Pro para una operacion de
prospeccion B2B + onboarding de creadores. Necesitamos confirmar:

1. Con Starter: puedo recibir datos via API (POST /crm/v3/objects/contacts)
   desde herramientas externas (Clay, Smartlead, Expandi) sin limite diario?

2. Existe integracion nativa en el Marketplace para:
   - Smartlead (email outreach)
   - Expandi (LinkedIn automation)
   - ManyChat (WhatsApp chatbot)

3. Con Sales Pro: los workflows pueden triggerear webhooks salientes?
   (necesitamos disparar alertas a Telegram via Relay.app)

4. Hay periodo de prueba de 14 dias para Pro antes de comprometernos?

Gracias,
[Nombre] — La Neta
```

---

## Alternativas a HubSpot — analisis de viabilidad

Si HubSpot resulta limitante o costoso para el sprint, estas son las alternativas mencionadas en el plan estrategico:

### Alternativa 1: Pipedrive ($14-$49/usuario/mes)

| Aspecto | HubSpot Starter | Pipedrive Essential |
|---|---|---|
| Precio | $20/mes (ilimitados users) | $14/mes **por usuario** (x8 = $112/mes) |
| Pipelines | 2 | Ilimitados |
| Propiedades custom | 1,000 | Ilimitadas |
| API | Completa | Completa |
| Workflows | NO (necesita Pro $90) | SI (desde Professional $49/user) |
| Marketplace integraciones | 1,500+ apps | 400+ apps |
| Free tier | SI (limitado) | NO |

**Veredicto:** Mas caro por usuario. Para 8 usuarios, HubSpot Starter + Pro es mas barato ($20-$90/mes total vs $112-$392/mes Pipedrive). Descartado.

### Alternativa 2: Apollo.io ($49-$99/mes)

| Aspecto | HubSpot | Apollo.io |
|---|---|---|
| CRM | SI | SI (integrado con prospeccion) |
| Enriquecimiento datos | NO (usa Clay) | SI (nativo, reemplaza Clay parcialmente) |
| Email secuencias | Pro ($90) | Incluido desde $49 |
| LinkedIn integration | Pro ($90) | Incluido |
| Pipelines custom | SI | SI |

**Veredicto:** Interesante como reemplazo de HubSpot + Clay + Smartlead en uno. PERO: el equipo ya tiene Clay configurado (T06), Smartlead comprado (T07), y cambiarse implica rehacer todo el trabajo de Semana 1. No viable para este sprint. Evaluar para Mes 2.

### Alternativa 3: Supabase como CRM directo (CRM propio)

| Aspecto | HubSpot | Supabase (CRM Laneta) |
|---|---|---|
| Precio | $20-$90/mes | $0 (ya contratado) |
| Pipelines | UI lista | Hay que construir UI |
| Propiedades custom | Config manual | Schema SQL flexible |
| Workflows | Pro ($90) | Edge Functions custom |
| Integraciones | Marketplace nativo | HTTP webhooks custom |
| Tiempo de setup | 1 dia | 2-3 semanas |

**Veredicto:** Es el destino final (T02 lo menciona: "HubSpot es temporal para el sprint; el CRM propio es el destino final"). Pero construir UI de CRM toma semanas — no viable para arrancar el Dia 2. HubSpot es el puente correcto.

### Conclusion de alternativas

**HubSpot Starter → Pro sigue siendo la mejor opcion para el sprint.** El costo es el mas bajo ($20-$90/mes para todos los usuarios), el setup es el mas rapido (1 dia), y la migracion al CRM propio esta planeada para Mes 2-3.
