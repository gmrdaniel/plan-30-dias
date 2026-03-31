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

### Dominios activos (6) — NO usar para cold outreach
| Dominio | Uso actual | Cold outreach |
|---------|-----------|--------------|
| laneta.com | Corporativo (daniel.r@, greg@, taylor@) | NO — primario |
| lanetapro.com | Partners (hello@partners) | NO — en uso |
| elevnpro.me | Creadores (apply@creators) | NO — en uso |
| elevnhub.me | Creadores (apply@creators) | NO — en uso |
| elevn.me | Creadores (apply@creators) | NO — en uso |
| lanetahub.com | Creadores (apply@creators) | NO — en uso |

### Emails activos (8) + pendientes (2) + por eliminar (2)
| Correo | Estatus | Uso |
|--------|---------|-----|
| taylor@laneta.com | Activa | Reciclar nombre en dominio nuevo |
| hello@partners.lanetapro.com | Activa | Partners / backup WA |
| apply@creators.elevnpro.me | Activa | Outreach creadores |
| apply@creators.elevnhub.me | Activa | Outreach creadores |
| apply@creators.elevn.me | Activa | Outreach creadores |
| apply@creators.lanetahub.com | Activa | Outreach creadores |
| join@partners.lanetapro.com | Pendiente | Partners |
| join@partners.laneta.com | Pendiente | Calendar |
| daniel.r@laneta.com | POR ELIMINAR | Reciclar nombre en dominio nuevo |
| greg@laneta.com | POR ELIMINAR | Reciclar nombre en dominio nuevo |

**Decision:** Se necesitan 5 dominios secundarios NUEVOS + 15 cuentas email NUEVAS para cold outreach B2B y creadores. Ver lista completa en **00-LISTA-CONTRATACION-HERRAMIENTAS.md**.

**Oportunidad de adelanto:** Si Daniel compra dominios + Smartlead antes del 6 Abr (P0), el warmup de 14 dias inicia antes y las campanas pueden lanzar antes.

## Detalle de Implementación

### Daniel — Compras (mañana, antes de las 10 AM)
1. Comprar 5 dominios secundarios en GoDaddy (~$12 c/u):
   - Sugerencias: laneta-media.com, globalreview-content.com, lanetastudio.com, elevn-creators.com, laneta-digital.com
   - Criterio: que suenen profesionales, NO spam, cercanos a la marca pero NO idénticos
2. Comprar licencia Smartlead ($94/mes) — **URGENTE, Gabriel lo necesita hoy**
3. Enviar credenciales de ambos a Gabriel por canal seguro (NO Telegram público)

### Gabriel — Configuración Técnica (todo el día)
1. **Crear cuentas email en Google Workspace** (3 por dominio = 15 total):
   - Patrón: nombre@dominio (ej: daniel@laneta-media.com, greg@laneta-media.com, taylor@laneta-media.com)
   - 3 cuentas x 5 dominios = 15 cuentas
2. **Configurar DNS para cada dominio:**
   - SPF: `v=spf1 include:_spf.google.com ~all`
   - DKIM: Generar en Google Workspace Admin > Apps > Gmail > Authenticate email
   - DMARC: `v=DMARC1; p=none; rua=mailto:postmaster@[dominio]`
3. **Verificar con MxToolbox** cada dominio: SPF, DKIM, DMARC green
4. **Verificar con Mail-Tester** (enviar email de prueba): Score mínimo 9/10
5. **Configurar Google Postmaster Tools** para cada dominio
6. **Conectar las 15 cuentas a Smartlead:**
   - Login Smartlead
   - Add email accounts (SMTP/IMAP de Google Workspace)
   - Activar warmup para cada cuenta
   - Configurar rotación de cuentas

## Entregables
- [ ] 5 dominios secundarios comprados y accesibles
- [ ] 15 cuentas de email creadas en Google Workspace
- [ ] SPF/DKIM/DMARC configurado y verificado para los 5 dominios
- [ ] Score 9/10+ en Mail-Tester para al menos 1 cuenta por dominio
- [ ] Google Postmaster Tools configurado para los 5 dominios
- [ ] 15 cuentas conectadas a Smartlead con warmup activo
- [ ] Screenshot del dashboard de Smartlead mostrando warmup activo

## Criterios de Aceptación
- [ ] MxToolbox muestra SPF, DKIM y DMARC como "Pass" para cada dominio
- [ ] Mail-Tester score >= 9/10
- [ ] Dashboard Smartlead muestra 15 cuentas en estado "Warming up"
- [ ] Google Postmaster Tools accesible para cada dominio

## Costo
| Item | Costo | Tipo |
|------|-------|------|
| 5 dominios GoDaddy | ~$60 | Único |
| 15 cuentas Google Workspace | ~$108/mes | Recurrente |
| Smartlead | $94/mes | Recurrente |

## Riesgos
- **DNS no propaga a tiempo:** Esperar 24-48h. Conectar a Smartlead las que ya propagaron, el resto al Día 2.
- **Gabriel sin internet:** Daniel tiene los conocimientos para hacer la configuración como backup.
- **Smartlead no acepta cuentas:** Verificar que SMTP/IMAP estén habilitados en Google Admin. Si persiste, usar Instantly.ai como backup.

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
- Usa un spreadsheet para trackear: dominio | cuenta | SPF | DKIM | DMARC | Mail-Tester | Smartlead status
- NO uses los dominios principales (laneta.com, elevn.me, etc.) para cold email
- Guarda TODAS las credenciales en el gestor de contraseñas del equipo
- Si un dominio no propaga DNS antes de las 5 PM, continúa con los demás y completa al día siguiente
- **Monitorear warmup diario desde Dia 3:** revisar dashboard Smartlead para inbox placement rate
- **Poner landing page basica en cada dominio nuevo** — dominios completamente vacios parecen sospechosos
- **No cruzar links entre dominios de outreach** — mantenerlos independientes para aislar reputacion
