# T07 — Smartlead + Expandi + JustCall + Conexiones Push

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T07 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Gabriel (Smartlead + JustCall), Dayana (Expandi), Daniel (conexiones push) |
| **Fecha Inicio** | Jueves 9 Abril |
| **Fecha Entrega** | Viernes 10 Abril |
| **Bloqueada por** | T01 (emails en warmup), T05 (cuentas LinkedIn), T06 (Clay) |
| **Bloquea a** | T14 (testing E2E), DTO-OUT-04 (Smartlead → Eq4), DTO-OUT-05 (Expandi → Eq4) |

## Objetivo
Los 3 canales de outreach (email, LinkedIn, teléfono) configurados y listos. Conexiones push desde Clay activas.

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

### Entregable: Screenshot dashboard con 15 cuentas rotando + secuencia placeholder cargada

---

## Gabriel: JustCall Config (Jue 9 Abr)

### Pasos
1. Daniel compra licencia JustCall ($30/mes)
2. Login JustCall
3. Configurar número de teléfono (US o MX según ICP)
4. Importar lista de 50 prospectos de prueba desde Clay
5. Configurar ventana de llamada: 4-5 PM (hora del prospecto)
6. Configurar integración con HubSpot (webhook o nativa)

### Entregable: JustCall con lista importada y ventana configurada

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

### Entregable: Expandi dashboard con cuentas conectadas, IP residencial, límites configurados

---

## Daniel: Conexiones Push (Vie 10 Abr)

### Pasos
1. En Clay, configurar push a Smartlead:
   - Cuando un prospecto es enriquecido y score >= 6 → push automático a Smartlead
   - Mapeo de campos: email, nombre, empresa → campos Smartlead
2. En Clay, configurar push a Expandi:
   - Cuando un prospecto tiene LinkedIn URL → push a Expandi
   - Mapeo: linkedin_url, nombre, empresa → campos Expandi
3. **Evaluar agente de voz IA:**
   - Investigar Synthflow ($29/mes) o Bland AI (pay per use)
   - Si presupuesto permite y parece viable: adquirir para piloto
   - Si no: JustCall es suficiente para llamadas manuales

### Entregable: Push Clay → Smartlead funcionando + Push Clay → Expandi funcionando

---

## Criterios de Aceptación Generales
- [ ] Smartlead: 15 cuentas en rotación, secuencia placeholder cargada, horario configurado
- [ ] Expandi: 2 cuentas LinkedIn conectadas, IP residencial, límites conservadores
- [ ] JustCall: Número activo, lista importada, ventana de llamada configurada
- [ ] Push Clay → Smartlead: 1 prospecto de prueba fluyó correctamente
- [ ] Push Clay → Expandi: 1 prospecto de prueba fluyó correctamente
- [ ] HubSpot: JustCall y/o Smartlead reportan actividad a HubSpot

## Costo
| Item | Costo |
|------|-------|
| Smartlead | Ya comprado en T01 ($94/mes) |
| Expandi | $99/mes |
| JustCall | $30/mes |
| Agente voz IA (opcional) | $29-500/mes |
