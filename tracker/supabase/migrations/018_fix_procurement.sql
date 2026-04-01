-- Migration 018: Fix procurement with real subscription levels discovered in tasks

-- Dominios: solo 1 por comprar, no 5
UPDATE procurement SET
  tool_name = '1 Dominio Secundario (GoDaddy) — 4 ya comprados',
  cost_onetime = '~$12',
  notes = '4 dominios ya comprados: elevnhub.me, elevnpro.me, lanetahub.com, lanetapro.com. Solo falta 1 (nombre por definir en B01). laneta.com y elevn.me excluidos.'
WHERE tool_key = 'dominios';

-- Clay: no es upgrade simple, hay 3 opciones
UPDATE procurement SET
  tool_name = 'Clay — decidir plan (Starter $149 / Launch $185 / Explorer $349)',
  cost_monthly = '$149-349',
  notes = 'Plan actual: Starter $149. Launch $185: agrega Smartlead nativo (+$36). Explorer $349: agrega HTTP API + webhooks + 10K créditos (+$200). Ver bloqueante B11. Medir créditos en batch de 200 antes de decidir. Legacy pricing terminó 10 Abr, solo quedan planes nuevos.'
WHERE tool_key = 'clay_upgrade';

-- HubSpot: puede necesitar Starter $20/mes
UPDATE procurement SET
  tool_name = 'HubSpot CRM — evaluar Free vs Starter ($20/mes)',
  cost_monthly = '$0-20',
  notes = 'Free tier puede tener limitaciones en workflows y propiedades custom. Si se necesitan workflows automáticos (mover a Nurture, engagement score), requiere Starter $20/mes. Evaluar Día 2.'
WHERE tool_key = 'hubspot';

-- Expandi: agregar nota sobre HubSpot integration
UPDATE procurement SET
  notes = 'Verificar que plan $99/mes incluye integración HubSpot nativa (B19). Config: Workspace > Integrations > HubSpot.'
WHERE tool_key = 'expandi';

-- Leadpages: descartada, Unbounce cubre ambos
UPDATE procurement SET
  tool_name = 'Leadpages — DESCARTADA (Unbounce cubre B2B + Creadores)',
  cost_monthly = '$0',
  notes = 'Descartada en análisis de T16. Unbounce con plan Build ($99) cubre micrositios B2B y Creadores. Ahorro: $49/mes.',
  is_contracted = true,
  contracted_at = now()
WHERE tool_key = 'leadpages';

-- Unbounce: actualizar que cubre ambos
UPDATE procurement SET
  tool_name = 'Unbounce Build — cubre micrositios B2B + Creadores',
  notes = 'Plan Build $99/mes: DTR, hidden fields, webhooks, HubSpot nativo, páginas ilimitadas. Reemplaza Leadpages para micrositio de creadores.'
WHERE tool_key = 'unbounce';

-- Agregar Zapier (backup integraciones)
INSERT INTO procurement (tool_key, tool_name, category, cost_monthly, cost_onetime, priority, priority_order, deadline, needed_by_task, needed_by_date, notes)
VALUES ('zapier', 'Zapier (backup integraciones)', 'Automatizacion', 'Free (100 tasks)', null, 'P3 — DIAS 5-7', 3, '10 Abr', 'T08, T12', '10 Abr', 'Backup para ManyChat → HubSpot si Relay.app no soporta el trigger. Free tier: 100 tasks/mes.');

-- Agregar Calendly
INSERT INTO procurement (tool_key, tool_name, category, cost_monthly, cost_onetime, priority, priority_order, deadline, needed_by_task, needed_by_date, notes)
VALUES ('calendly', 'Calendly', 'Ventas y Cierre', 'Free', null, 'P4 — SEMANA 2', 4, '20 Abr', 'T16', '17 Abr', 'CTA final de micrositios B2B: "Agenda tu Sprint Estratégico de 15 min". Integración nativa con HubSpot.');

-- Smartlead: agregar nota ya contratado
UPDATE procurement SET
  notes = 'Ya contratado. 15 cuentas de email conectadas para warmup. Rotación + tracking activo.'
WHERE tool_key = 'smartlead';
