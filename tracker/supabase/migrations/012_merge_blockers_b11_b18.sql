-- Migration 012: Merge B11 + B18 into unified B11, delete B18

UPDATE blockers SET
  question = 'Decidir plan de Clay — impacta créditos, Smartlead y automatización del pipeline',
  context = 'Plan actual: Starter $149/mes (2,000 créditos). NO incluye Smartlead nativo, HTTP API ni webhooks. Tres opciones: (1) Starter $149 — todo manual, Gabriel exporta CSV y usa scripts para Smartlead/Expandi/Supabase. 2,000 créditos probablemente NO alcanzan para 1,000 prospectos (~4-7 créditos cada uno). (2) Launch $185 (+$36/mes) — Smartlead NATIVO automático, 2,500 créditos. Expandi y Supabase siguen manual (CSV + scripts Gabriel). Recomendado para arrancar. (3) Growth $495 (+$346/mes) — TODO automático: Smartlead nativo + HTTP API (Expandi) + Webhooks (Supabase) + 6,000 créditos. Estrategia: contratar Launch $185, medir créditos en batch de 200. Si no alcanzan evaluar Growth con datos reales.',
  needed_by = '8 Abr (Dia 3 — antes de configurar exports en Clay)',
  related_tasks = 'T06, T07, T11, T11-B',
  category = 'Infraestructura'
WHERE code = 'B11';

DELETE FROM blockers WHERE code = 'B18';
