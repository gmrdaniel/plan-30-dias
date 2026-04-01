-- Migration 010: Fix blocker B18 with correct Clay pricing tiers

UPDATE blockers SET
  question = 'Clay Starter ($149) NO incluye integración con Smartlead ni HTTP API ni Webhooks — decidir upgrade',
  context = 'Plan actual: Starter $149/mes (legacy, 2,000 créditos). No incluye email sequencer integrations, HTTP API ni webhooks. Opciones: (1) Explorer $349/mes (legacy) — todo: Smartlead nativo + HTTP API + Webhooks + 10,000 créditos. Costo: +$200/mes. (2) Migrar a Launch $185/mes (nueva línea) — Smartlead nativo, SIN HTTP API ni webhooks, 2,500 créditos. Costo: +$36/mes pero Expandi y Supabase sync quedan manuales (CSV + scripts Gabriel). Verificar con soporte Clay si la migración legacy→nueva es posible. (3) Quedarse en Starter $149 — todo manual: Gabriel exporta CSV de Clay y usa scripts Python para pushear a Smartlead, Expandi y Supabase. $0 extra pero más trabajo manual en cada batch. Recomendación: si presupuesto lo permite, Explorer $349 es la mejor relación costo/beneficio (todo automático + 5x más créditos).'
WHERE code = 'B18';
