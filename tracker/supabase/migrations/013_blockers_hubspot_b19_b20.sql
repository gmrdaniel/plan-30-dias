-- Migration 013: Add HubSpot blockers B19 and B20

INSERT INTO blockers (code, category, question, context, owner, asks_to, needed_by, related_tasks) VALUES

('B19', 'Infraestructura',
 'Confirmar plan HubSpot: Starter ($20/mes) para arrancar, Pro ($90/mes) en Semana 3',
 'Free solo permite 1 pipeline pero necesitamos 2 (B2B + Creadores). Starter ($20/mes) cubre Semana 1-2: 2 pipelines, 1,000 propiedades custom, API para integraciones, 30 dashboards. Pro ($90/mes) se necesita en Semana 3 para: workflows de Nurture automatico (21 dias sin respuesta), informes de conversion por etapa, equipos formales. Estrategia: contratar Starter el Dia 2, upgrade a Pro despues de T14 (testing E2E). Costo total mes 1: ~$110.',
 'Daniel', 'Daniel decide', '7 Abr (Dia 2)', 'T02, T03, T14'),

('B20', 'Infraestructura',
 'Smartlead y Expandi NO tienen integracion nativa con HubSpot — definir puente (Zapier/Relay)',
 'Smartlead y Expandi no aparecen en el Marketplace de HubSpot. Para sincronizar status de emails y LinkedIn a HubSpot se necesita un puente: Opcion A: Zapier Free (100 tasks/mes, suficiente para testing). Opcion B: Relay.app ($9/mes, ya contratado para alertas Telegram). Opcion C: Webhook custom de cada herramienta directo a HubSpot API. Confirmar con ventas HubSpot si existen apps en Marketplace. ManyChat tampoco es nativa — mismo workaround aplica. JustCall y Calendly SI son nativas.',
 'Daniel + Gabriel', 'Ventas HubSpot (confirmar Marketplace)', '10 Abr (Dia 5)', 'T02, T07, T14');
