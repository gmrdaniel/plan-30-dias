# T01 — Dominios + Email + DNS + Warmup Smartlead

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T01 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Gabriel Piñero |
| **Apoyo** | Daniel Ramírez (compras) |
| **Fecha Inicio** | Lunes 6 Abril 2026 |
| **Fecha Entrega** | Lunes 6 Abril 2026 (mismo día) |
| **Bloqueada por** | — |
| **Bloquea a** | T06, T07, T11, T14 |

## Objetivo
Tener 15 cuentas de email con DNS correctamente configurado y en warmup activo en Smartlead antes del final del Día 1. Cada día de retraso = 1 día de retraso en el lanzamiento de campañas.

## Contexto: Infraestructura de email existente

### Dominios activos (5) — reutilizados con subdominios nuevos para cold outreach
| Dominio | Uso actual | Cold outreach |
|---------|-----------|--------------|
| laneta.com | Corporativo (daniel.r@, greg@, taylor@) | NO — primario, no tocar |
| elevn.me | Creadores (apply@creators) | NO — operación, no tocar |
| lanetahub.com | Creadores (apply@creators) | SI — con subdominios nuevos: brands, partners, go |
| lanetapro.com | Partners (hello@partners) | SI — con subdominios nuevos: brands, partners, go |
| elevnhub.me | Creadores (apply@creators) | SI — con subdominios nuevos: go, hello, we, app |
| elevnpro.me | Creadores (apply@creators) | SI — con subdominios nuevos: go, hello, we |

### Dominio nuevo a comprar (1)
| Dominio | Registrador | Costo | Nota |
|---------|-------------|-------|------|
| elevngo.me | GoDaddy | ~$12 | Único dominio nuevo necesario. Subdominios: creators, hello |

### Cuentas existentes — NO tocar
| Correo | Estatus | Nota |
|--------|---------|------|
| apply@creators.elevnpro.me | Activa | Operación creadores |
| apply@creators.elevnhub.me | Activa | Operación creadores |
| apply@creators.elevn.me | Activa | Operación creadores |
| apply@creators.lanetahub.com | Activa | Operación creadores |
| hello@partners.lanetapro.com | Activa | Partners / backup WA |

### Cuentas a reciclar licencia
| Correo viejo | Correo nuevo | Nota |
|---|---|---|
| hello@partners.lanetapro.com | collabs@brands.lanetahub.com | Reciclar licencia |
| join@go.elevnhub.me | brands@partners.lanetahub.com | Reciclar licencia |
| taylor@laneta.com | partners@go.lanetahub.com | Reciclar licencia |
| daniel.r@laneta.com | collabs@brands.lanetapro.com | Reciclar licencia |

**Estructura revisada y validada con Mery.**

## 15 Cuentas nuevas de cold outreach

### B2B (6 cuentas — 2 dominios existentes con subdominios)

| # | Correo | Dominio | Subdominio | Sender | Licencia | Estatus |
|---|--------|---------|------------|--------|----------|---------|
| 1 | collabs@brands.lanetahub.com | lanetahub.com | brands | collabs | Reciclada | pendiente |
| 2 | brands@partners.lanetahub.com | lanetahub.com | partners | brands | Reciclada | Configurado |
| 3 | partners@go.lanetahub.com | lanetahub.com | go | partners | Reciclada | pendiente |
| 4 | collabs@brands.lanetapro.com | lanetapro.com | brands | collabs | Reciclada | pendiente |
| 5 | brands@partners.lanetapro.com | lanetapro.com | partners | brands | Sin licencia | Configurado |
| 6 | partners@go.lanetapro.com | lanetapro.com | go | partners | Sin licencia | pendiente |

### Creadores (9 cuentas — 3 dominios, 1 nuevo)

| # | Correo | Dominio | Subdominio | Sender | Licencia | Estatus |
|---|--------|---------|------------|--------|----------|---------|
| 7 | apply@creators.elevngo.me | elevngo.me | creators | apply | Nueva | pendiente |
| 8 | apply@hello.elevngo.me | elevngo.me | hello | apply | Nueva | pendiente |
| 9 | join@go.elevnhub.me | elevnhub.me | go | join | Nueva | pendiente |
| 10 | apply@hello.elevnhub.me | elevnhub.me | hello | apply | Nueva | pendiente |
| 11 | join@we.elevnhub.me | elevnhub.me | we | join | Nueva | pendiente |
| 12 | join@app.elevnhub.me | elevnhub.me | app | join | Nueva | pendiente |
| 13 | apply@go.elevnpro.me | elevnpro.me | go | apply | Nueva | pendiente |
| 14 | join@hello.elevnpro.me | elevnpro.me | hello | join | Nueva | pendiente |
| 15 | hello@we.elevnpro.me | elevnpro.me | we | hello | Nueva | pendiente |

## Detalle de Implementación

### Daniel — Compras (mañana, antes de las 10 AM)
1. Comprar 1 dominio en GoDaddy (~$12):
   - **elevngo.me**
2. Comprar licencia Smartlead ($94/mes) — **URGENTE, Gabriel lo necesita hoy**
3. Enviar credenciales de ambos a Gabriel por canal seguro (NO Telegram público)

### Gabriel — Configuración Técnica (todo el día)

#### Paso 1: Crear subdominios en Google Workspace / GoDaddy DNS

**lanetahub.com** (3 subdominios):
- brands.lanetahub.com
- partners.lanetahub.com
- go.lanetahub.com

**lanetapro.com** (3 subdominios):
- brands.lanetapro.com
- partners.lanetapro.com
- go.lanetapro.com

**elevngo.me** (2 subdominios — dominio nuevo):
- creators.elevngo.me
- hello.elevngo.me

**elevnhub.me** (4 subdominios):
- go.elevnhub.me
- hello.elevnhub.me
- we.elevnhub.me
- app.elevnhub.me

**elevnpro.me** (3 subdominios):
- go.elevnpro.me
- hello.elevnpro.me
- we.elevnpro.me

**Total: 15 subdominios en 5 dominios**

#### Paso 2: Crear cuentas email en Google Workspace
- Crear las 15 cuentas listadas arriba
- 4 cuentas reciclan licencia existente
- 2 cuentas ya están configuradas (brands@partners.lanetahub.com, brands@partners.lanetapro.com)
- 9 cuentas necesitan licencia nueva (~$65/mes a $7.20 c/u)

#### Paso 3: Configurar DNS para cada subdominio
- SPF: `v=spf1 include:_spf.google.com ~all`
- DKIM: Generar en Google Workspace Admin > Apps > Gmail > Authenticate email (por subdominio)
- DMARC: `v=DMARC1; p=none; rua=mailto:postmaster@[dominio]`
- **Importante:** SPF/DKIM se configura a nivel de subdominio, no solo dominio raíz

#### Paso 4: Verificación
- **MxToolbox** cada subdominio: SPF, DKIM, DMARC green
- **Mail-Tester** (enviar email de prueba): Score mínimo 9/10
- **Google Postmaster Tools** para cada dominio raíz (5 dominios)

#### Paso 5: Conectar a Smartlead
- Login Smartlead
- Add email accounts (SMTP/IMAP de Google Workspace) — 15 cuentas
- Activar warmup para cada cuenta
- Configurar rotación de cuentas separada: B2B (6) y Creadores (9)

## Entregables
- [ ] 1 dominio nuevo comprado (elevngo.me)
- [ ] 15 subdominios creados en 5 dominios
- [ ] 15 cuentas de email creadas en Google Workspace (4 recicladas + 2 existentes + 9 nuevas)
- [ ] SPF/DKIM/DMARC configurado y verificado para los 15 subdominios
- [ ] Score 9/10+ en Mail-Tester para al menos 1 cuenta por dominio
- [ ] Google Postmaster Tools configurado para los 5 dominios
- [ ] 15 cuentas conectadas a Smartlead con warmup activo
- [ ] Screenshot del dashboard de Smartlead mostrando warmup activo

## Criterios de Aceptación
- [ ] MxToolbox muestra SPF, DKIM y DMARC como "Pass" para cada subdominio
- [ ] Mail-Tester score >= 9/10
- [ ] Dashboard Smartlead muestra 15 cuentas en estado "Warming up"
- [ ] Google Postmaster Tools accesible para cada dominio
- [ ] Cuentas existentes (apply@creators.*) siguen funcionando sin cambios

## Costo
| Item | Costo | Tipo |
|------|-------|------|
| 1 dominio GoDaddy (elevngo.me) | ~$12 | Único |
| 9 licencias Google Workspace nuevas | ~$65/mes | Recurrente |
| Smartlead | $94/mes | Recurrente |

## Riesgos
- **DNS no propaga a tiempo:** Esperar 24-48h. Conectar a Smartlead las que ya propagaron, el resto al Día 2.
- **Gabriel sin internet:** Daniel tiene los conocimientos para hacer la configuración como backup.
- **Smartlead no acepta cuentas:** Verificar que SMTP/IMAP estén habilitados en Google Admin. Si persiste, usar Instantly.ai como backup.
- **Conflicto con subdominios existentes (creators.*):** Las cuentas existentes (apply@creators.elevnpro.me, etc.) NO se tocan. Los subdominios nuevos (go.*, hello.*, we.*, etc.) son independientes.

## Estrategia de Warmup (14-21 dias)

Smartlead tiene warmup automatico incluido. Funciona asi:
1. Smartlead mantiene un pool de miles de buzones reales que intercambian emails con tus cuentas
2. Los emails se abren, responden y marcan como "no spam" automaticamente
3. Esto entrena a Gmail/Outlook a confiar en tus dominios

### Plan de warmup con empleados internos (22 personas)

Ademas del warmup automatico de Smartlead, usar a los 22 empleados como "semilla de confianza":

| Dia | Accion | Quien |
|-----|--------|-------|
| 1-2 | Cada empleado agrega las 15 cuentas nuevas a sus contactos (Gmail/Outlook) | Todos (22) |
| 1-3 | Cada empleado envia 1-2 emails reales a cada cuenta nueva (pregunta casual, saludo) | Todos (22) |
| 3-5 | Cada empleado responde al menos 1 email de las cuentas nuevas | Todos (22) |
| 1-7 | Si algun email llega a spam: marcarlo como "No es spam" | Todos (22) |
| 7-14 | Smartlead warmup automatico continua, ya no se necesita accion manual | Automatico |

**Importante:**
- Las interacciones de empleados son MANUALES y genuinas, no automatizadas
- Esto complementa el warmup de Smartlead, no lo reemplaza
- Los empleados usan sus cuentas personales Y corporativas (mas senales de confianza)

### Configuracion de warmup en Smartlead

| Parametro | Valor recomendado |
|-----------|------------------|
| Emails warmup/dia inicial | 2-3 por cuenta |
| Incremento diario | +2-3 cada 3 dias |
| Max emails warmup/dia | 30-40 por cuenta |
| Warmup durante campanas | SI, mantener activo siempre |
| Volumen real post-warmup | 25-30 emails/dia por cuenta MAX |

### Escalonamiento de cuentas

NO activar las 15 cuentas el mismo dia. Escalonar:
- Dia 1: 5 cuentas (1 por dominio)
- Dia 2: 5 cuentas mas
- Dia 3: 5 cuentas restantes

### Timeline de warmup

| Dia | Status | Volumen estimado/cuenta |
|-----|--------|------------------------|
| 1-3 | Warmup inicial + empleados | 2-5 emails/dia |
| 4-7 | Warmup activo | 8-12 emails/dia |
| 8-14 | Warmup maduro | 15-25 emails/dia |
| 15-21 | Listo para campanas reales | Iniciar con 10-15 reales/dia |
| 21+ | Produccion | 25-30 reales/dia + warmup de fondo |

**Alerta:** Si en el Dia 14 el inbox placement rate es <90% en Smartlead, NO lanzar campanas reales. Esperar hasta Dia 21.

## Notas para Gabriel
- Usa un spreadsheet para trackear: dominio | subdominio | cuenta | SPF | DKIM | DMARC | Mail-Tester | Smartlead status
- NO uses los dominios principales (laneta.com, elevn.me) para cold email
- NO toques las cuentas existentes (apply@creators.*)
- Guarda TODAS las credenciales en el gestor de contraseñas del equipo
- Si un subdominio no propaga DNS antes de las 5 PM, continúa con los demás y completa al día siguiente
- **Monitorear warmup diario desde Dia 3:** revisar dashboard Smartlead para inbox placement rate
- **Poner landing page basica en cada dominio nuevo** — dominios completamente vacios parecen sospechosos
- **No cruzar links entre dominios de outreach** — mantenerlos independientes para aislar reputacion
- **Separar rotación en Smartlead:** grupo B2B (6 cuentas) y grupo Creadores (9 cuentas) independientes
