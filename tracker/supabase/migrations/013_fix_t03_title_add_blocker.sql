-- Migration 013: Fix T03 title + add blocker for Expandi/Relay

-- Fix title
UPDATE tasks SET
  title = 'Telegram + Relay.app Alertas',
  objective = 'Telegram operativo con canales por función. Relay.app configurado para notificar a ventas SOLO cuando deben actuar. Logging de eventos es responsabilidad de cada herramienta (T07/T08/T12).'
WHERE task_id = 'T03';

-- Blocker: Expandi not in Relay
INSERT INTO blockers (code, category, question, context, owner, asks_to, needed_by, related_tasks) VALUES
('B19', 'Infraestructura',
 'Expandi NO está en Relay.app — notificaciones de LinkedIn replies solo via HubSpot',
 'Relay.app tiene integración directa con Smartlead, ManyChat, Twilio, Calendly y HubSpot. Pero NO tiene Expandi, Sendspark ni Unbounce. Para notificar replies de LinkedIn (Expandi), el flujo debe ser: Expandi → HubSpot (webhook) → Relay (trigger por cambio en HubSpot) → Telegram. Esto requiere que T07 configure correctamente el webhook Expandi → HubSpot primero. No es bloqueante crítico pero agrega una dependencia extra.',
 'Eugenia (T03) + Gabriel (T07)', 'Verificar con Expandi docs', '16 Abr (Dia 9)', 'T03, T07'),

('B20', 'Definicion',
 'Daniel/Pepe: validar lista de notificaciones — cuáles activar para ventas',
 'T03 tiene 12 tipos de eventos (N1-N12). Recomendación: activar N1 (email reply), N2 (LinkedIn reply), N3 (WhatsApp reply), N4 (reunión agendada), N6 (score alto), N7 (creador cualificado). Los demás solo log en HubSpot. Daniel y Pepe deben confirmar antes de configurar los relays.',
 'Daniel', 'Daniel + Pepe (Eq1)', '7 Abr (Dia 2)', 'T03');
