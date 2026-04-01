# T07 — Smartlead + Expandi + JustCall + Conexiones

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T07 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Gabriel (Smartlead + JustCall), Dayana (Expandi), Daniel (conexiones) |
| **Fecha Inicio** | Jueves 9 Abril |
| **Fecha Entrega** | Viernes 10 Abril |
| **Bloqueada por** | T01 (emails en warmup), T05 (cuentas LinkedIn), T06 (Clay) |
| **Bloquea a** | T14 (testing E2E), DTO-OUT-04 (Smartlead → Eq4), DTO-OUT-05 (Expandi → Eq4) |

## Objetivo
Los 3 canales de outreach (email, LinkedIn, teléfono) configurados y conectados a HubSpot. HubSpot es el hub central donde convergen todos los datos.

## Flujo general de datos

```
                    ┌→ Smartlead (email sequences)
                    │     ↕ (webhook/API)
Clay (enriquece) →  HubSpot (hub central)
                    │     ↕ (integración nativa)
                    ├→ Expandi (LinkedIn sequences)
                    │
                    └→ JustCall (llamadas Día 18)
```

### Dos opciones según plan de Clay (ver bloqueante B11)

**Opción A — Con Launch $185 (recomendada):**
```
Clay → Smartlead (nativo) → HubSpot (webhook Smartlead)
                                ↕ (sync bidireccional nativo)
                             Expandi (toma prospectos con LinkedIn de HubSpot)
```
HubSpot es el puente. Clay pushea a Smartlead, Smartlead syncea a HubSpot, Expandi syncea desde HubSpot.

**Opción C — Con Growth $495:**
```
Clay → Smartlead (nativo)
Clay → Expandi (HTTP API directo)
Clay → HubSpot (webhook directo)
```
Todo sale de Clay. Más directo pero depende de licencia Growth.

> **Nota:** Opción A no requiere que Clay se conecte a Expandi. Expandi obtiene los prospectos de HubSpot via su integración nativa.

---

## Gabriel: Smartlead Config (Jue 9 Abr)

### Pasos
1. Login Smartlead (comprado en T01)
2. Verificar que las 15 cuentas de email están conectadas y en warmup
3. **Configurar rotación de cuentas:**
   - Activar "Auto-rotate" entre las 15 cuentas
   - Configurar horario de envío: 8 AM - 12 PM (zona horaria del prospecto)
   - Límite: 30 emails/día por cuenta (durante warmup), escalar a 50 después
4. **Cargar template de secuencia placeholder:**
   - Email 1: [PLACEHOLDER - Equipo 4 reemplaza con copy final]
   - Email 2: [PLACEHOLDER]
   - Email 3: [PLACEHOLDER]
   - Email 4: [PLACEHOLDER - Breakup]
   - Delays: 3d, 2d, 5d, 3d entre emails
5. **Configurar tracking:** open tracking ON, click tracking ON
6. **Configurar conexión Smartlead → HubSpot:**
   - Smartlead tiene webhook nativo para reportar: email sent, opened, clicked, replied, bounced
   - Configurar webhook URL de HubSpot para recibir estos eventos
   - Verificar que los contactos se crean/actualizan en HubSpot

### Entregable: 15 cuentas rotando + secuencia placeholder + HubSpot recibiendo eventos

---

## Gabriel: JustCall Config (Jue 9 Abr)

### Pasos
1. Daniel compra licencia JustCall ($30/mes)
2. Login JustCall
3. Configurar número de teléfono (US o MX según ICP)
4. Importar lista de 50 prospectos de prueba desde Clay (CSV)
5. Configurar ventana de llamada: 4-5 PM (hora del prospecto)
6. Configurar integración JustCall → HubSpot (nativa)

### Entregable: JustCall con lista importada, ventana configurada, HubSpot conectado

---

## Dayana: Expandi Config (Jue 9 - Vie 10 Abr)

### Pasos
1. Daniel compra licencia Expandi ($99/mes)
2. Login Expandi
3. **Conectar cuentas LinkedIn** (las que creaste en T05):
   - Conectar cuenta 1 (B2B)
   - Conectar cuenta 2 (Creadores)
4. **Configurar seguridad:**
   - IP residencial: SÍ (obligatorio)
   - Delays aleatorios: SÍ
   - Horario de actividad: 9 AM - 5 PM
   - **Límites conservadores (primeras 2 semanas):**
     - Conexiones/día: 15 (NO 25)
     - Mensajes/día: 30
     - Profile views/día: 50
5. **Cargar secuencia placeholder:**
   - Conexión + nota: [PLACEHOLDER]
   - Follow-up 1 (3 días después): [PLACEHOLDER]
   - Follow-up 2 (5 días después): [PLACEHOLDER]
6. **Configurar integración Expandi ↔ HubSpot (CRITICO):**
   - Ir a Workspace > Integrations > HubSpot
   - Autenticar con credenciales de HubSpot
   - Mapear campos:
     - first_name → First Name
     - last_name → Last Name
     - email → Email
     - job_title → Job Title
     - company → Company
     - profile_link → LinkedIn URL (**obligatorio** para evitar duplicados)
   - Activar triggers de sync:
     - ☑ Connection request accepted
     - ☑ Message received (reply)
     - ☑ Interest level changed
     - ☑ Profile visited
   - Activar "Overwrite existing data": SI (para mantener datos actualizados)
   - Ref: https://intercom.help/expandi/en/articles/11697776-hubspot-integration

### Cómo llegan los prospectos a Expandi (Opción A — via HubSpot)

Con Opción A (Launch $185), Expandi NO recibe datos de Clay directo. El flujo es:
1. Clay enriquece prospecto → push a Smartlead (nativo)
2. Smartlead crea contacto en HubSpot (webhook)
3. **Expandi syncea desde HubSpot:** los contactos que tienen `linkedin_url` en HubSpot se importan a Expandi
4. Opción de import: manual desde Expandi (buscar contactos en HubSpot con LinkedIn) o batch de 10

> **Nota:** Expandi no tiene "auto-import desde HubSpot". El sync es bidireccional para DATOS pero la importación de leads a campañas es manual o por batch. Dayana importa prospectos con LinkedIn URL desde HubSpot a la campaña de Expandi semanalmente.

### Con Opción C (Growth $495)
Clay puede pushear directo a Expandi via HTTP API. No necesita pasar por HubSpot para importar leads. Pero la integración Expandi ↔ HubSpot sigue siendo necesaria para el logging de eventos (replies, connections).

### Entregable: Expandi con cuentas LinkedIn, IP residencial, límites conservadores, HubSpot conectado

---

## Daniel: Conexiones y Flujo de Datos (Vie 10 Abr)

### Opción A (Launch $185 — recomendada)
1. **Clay → Smartlead:** Configurar export nativo en Clay (columna Smartlead enrichment)
   - Prospectos con email válido → campaña Smartlead
2. **Smartlead → HubSpot:** Configurar webhook de Smartlead para reportar eventos a HubSpot
3. **HubSpot → Expandi:** Verificar que la integración bidireccional de Dayana está funcionando
4. **Expandi import:** Dayana importa prospectos con LinkedIn URL desde HubSpot a campaña Expandi
5. **Evaluar agente de voz IA:** Synthflow ($29) o Bland AI. Si presupuesto permite, piloto.

### Opción C (Growth $495)
1. **Clay → Smartlead:** Export nativo (mismo que Opción A)
2. **Clay → Expandi:** HTTP API POST directo desde Clay
3. **Clay → HubSpot:** Webhook directo desde Clay
4. Expandi ↔ HubSpot para logging de replies

### Entregable: Flujo Clay → Smartlead → HubSpot ↔ Expandi verificado end-to-end

---

## Criterios de Aceptación
- [ ] Smartlead: 15 cuentas en rotación, secuencia placeholder cargada, HubSpot recibiendo eventos
- [ ] Expandi: 2 cuentas LinkedIn, IP residencial, límites conservadores, HubSpot conectado bidireccional
- [ ] JustCall: Número activo, lista importada, HubSpot conectado
- [ ] Clay → Smartlead: 1 prospecto de prueba fluyó a Smartlead y apareció en HubSpot
- [ ] HubSpot → Expandi: 1 prospecto con LinkedIn importado a Expandi desde HubSpot
- [ ] Expandi → HubSpot: 1 evento de prueba (connection accepted) apareció en HubSpot
- [ ] Alerta de prueba: reply en Smartlead → HubSpot → Relay → Telegram (verificar con T03)

## Costo
| Item | Costo |
|------|-------|
| Smartlead | Ya comprado en T01 ($94/mes) |
| Expandi | $99/mes |
| JustCall | $30/mes |
| Agente voz IA (opcional) | $29-500/mes |

## Notas
- **La integración Expandi ↔ HubSpot es la más importante de esta tarea.** Sin ella, no hay logging de actividad LinkedIn ni notificaciones de replies.
- Solo workspace owners de Expandi pueden habilitar la integración HubSpot.
- Solo se syncea actividad futura desde el día de activación — no retroactiva.
- Contactos sin LinkedIn profile link NO se syncean a HubSpot desde Expandi.
- Import de leads a campañas de Expandi es en batches de 10 (limitación de Expandi).
