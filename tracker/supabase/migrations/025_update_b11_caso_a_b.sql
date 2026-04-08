-- Migration 025: Update B11 with Caso A vs Caso B decision after 7 Abr validation
--
-- Context: On 7 Abr we confirmed 3 silent locks in Clay Launch (HTTP API column,
-- Webhook source, Import from CRM). We validated a workaround using Airtable as
-- a bridge between Supabase and Clay. B11 now becomes a clean A/B decision for
-- Daniel: keep Launch + Airtable bridge ($0 incremental) or upgrade to Growth
-- ($495, +$310/mo) which natively unlocks the 3 features.

UPDATE blockers SET
  question = 'Aprobar presupuesto Clay: mantener Launch $185 con bridge Airtable (Caso A) o upgrade a Growth $495 (Caso B, +$310/mes)',
  context = 'Validado el 7 Abr: pipeline downstream Clay -> Google Sheets -> Apps Script -> Edge Function -> Supabase funciona en Launch. Bloqueo upstream: Launch NO permite HTTP API column, Webhook source, ni Import from CRM (3 locks confirmados). Workaround validado: bridge via Airtable (Supabase -> Airtable REST API -> Clay Airtable source -> Google Sheets -> Apps Script -> Supabase -> HubSpot). Limitantes del bridge: sync Airtable->Clay automatico 1x/dia + manual on-demand; Airtable free cap 1,000 records/base. CASO A — mantener Launch $185 + bridge Airtable: $0 incremental, 100% automatizable salvo trigger manual de sync, viable para sprints <= 1,000 leads, 5 sistemas en el path, esfuerzo restante ~3-4h (push-to-airtable + clay-prospects-sync). CASO B — upgrade a Growth $495 (+$310/mes, ~$3,720/ano): 6,000 data credits/mo + 40,000 actions/mo. Las features "Auto-sync and enrich CRM" y "Integrate with any HTTP API" destraban exactamente los 3 locks confirmados. Flujo directo CRM -> Clay -> Supabase -> HubSpot, 3 sistemas en el path, sync continuo sin latencia 24h, sin caps de records, esfuerzo restante ~1-2h. Decision: aprobar Caso A (default sin gasto, valida con datos reales) o Caso B (gasto recurrente a cambio de simplicidad operativa y escalabilidad).',
  needed_by = '9 Abr (Dia 4 — antes de correr el primer batch real de prospectos)',
  status = 'pendiente'
WHERE code = 'B11';
