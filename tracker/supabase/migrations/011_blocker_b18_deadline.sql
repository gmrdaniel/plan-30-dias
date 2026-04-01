-- Migration 011: URGENT deadline on B18

UPDATE blockers SET
  question = 'URGENTE: Clay Starter NO incluye Smartlead/HTTP API — deadline 10 Abr para plan legacy',
  context = 'Plan actual: Starter $149/mes (legacy). NO incluye email sequencer (Smartlead), HTTP API ni webhooks. DEADLINE: 10 Abril 11:59 PM PDT — después solo planes nuevos disponibles. Opciones ANTES del 10 Abr: (1) Explorer $349/mes legacy — Smartlead + HTTP API + Webhooks + 10,000 créditos. Es $146/mes MAS BARATO que el equivalente nuevo (Growth $495). (2) Quedarse en Starter $149 — exportar CSV manual + scripts Python de Gabriel. Opción DESPUES del 10 Abr: (3) Growth $495/mes (nueva línea) — mismas features que Explorer pero $146 más caro. RECOMENDACION: Si el pipeline automático es necesario (y lo es para 1,000+ prospectos), comprar Explorer $349 ANTES del 10 Abr. Daniel debe decidir esta semana.',
  needed_by = 'ANTES del 10 Abr (deadline legacy pricing)',
  status = 'pendiente'
WHERE code = 'B18';
