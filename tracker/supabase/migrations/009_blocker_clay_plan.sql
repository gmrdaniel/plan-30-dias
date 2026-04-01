-- Migration 009: Blocker for Clay plan limitation

INSERT INTO blockers (code, category, question, context, owner, asks_to, needed_by, related_tasks) VALUES
('B18', 'Infraestructura',
 'Clay Starter ($149) NO incluye integración con Smartlead ni HTTP API ni Webhooks',
 'El plan actual (Starter $149/mes, 2,000 créditos) permite enriquecer datos pero NO exportar directamente a Smartlead, Expandi ni Supabase desde Clay. Opciones: (1) Explorer $349/mes — tiene todo: Smartlead nativo + HTTP API + Webhooks + 10,000 créditos. (2) Launch $185/mes — solo Smartlead nativo, sin HTTP API ni webhooks, 2,500 créditos. (3) Quedarse en Starter $149 — Gabriel exporta CSV manualmente y usa scripts Python para pushear a Smartlead/Expandi/Supabase. Opción 1 es la más eficiente pero +$200/mes. Opción 3 es la más barata pero agrega trabajo manual a Gabriel en cada batch.',
 'Daniel', 'Daniel decide', '8 Abr (Dia 3)', 'T06, T07, T11, T11-B');
