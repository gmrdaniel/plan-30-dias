-- Sprint Tracker: Equipo 3 Infraestructura
-- Migration 002: Seed all data from task files and seguimiento maestro
-- Generated 2026-03-31

---------------------------------------
-- 1. TEAM MEMBERS (5 records)
---------------------------------------
INSERT INTO team_members (id, name, short_name, role, avatar_color, password, is_leader) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Daniel Ramirez', 'Daniel', 'Lider / Director General Mexico', '#ef4444', 'daniel2026', true),
  ('22222222-2222-2222-2222-222222222222', 'Gabriel Pinero', 'Gabriel', 'Analista Creativo de Datos y Automatizacion', '#3b82f6', 'gabriel2026', false),
  ('33333333-3333-3333-3333-333333333333', 'Lillian Lucio', 'Lillian', 'Disenadora UX/UI Junior', '#8b5cf6', 'lillian2026', false),
  ('44444444-4444-4444-4444-444444444444', 'Dayana Vizcaya', 'Dayana', 'Directora Creativa', '#f59e0b', 'dayana2026', false),
  ('55555555-5555-5555-5555-555555555555', 'Eugenia Garcia', 'Eugenia', 'Estratega de MKT Digital y Narrativa', '#10b981', 'eugenia2026', false);

---------------------------------------
-- 2. TASKS (21 records)
---------------------------------------
INSERT INTO tasks (task_id, title, objective, priority, status, phase, start_date, due_date, blocked_by, blocks) VALUES
  ('T01',
   'Dominios + Email + DNS + Warmup Smartlead',
   'Tener 15 cuentas de email con DNS correctamente configurado y en warmup activo en Smartlead antes del final del Dia 1. Cada dia de retraso = 1 dia de retraso en el lanzamiento de campanas.',
   'CRITICA', 'pendiente', 'pre_sprint',
   '2026-04-06', '2026-04-06',
   '{}', '{T06,T07,T11}'),

  ('T02',
   'HubSpot CRM Setup',
   'CRM central operativo con pipelines, propiedades y accesos para los 4 equipos.',
   'CRITICA', 'pendiente', 'pre_sprint',
   '2026-04-07', '2026-04-07',
   '{}', '{T14,T17}'),

  ('T03',
   'Slack + Relay.app Alertas',
   'Workspace de Slack operativo con canales por funcion y alertas automaticas desde HubSpot via Relay.app.',
   'CRITICA', 'pendiente', 'pre_sprint',
   '2026-04-07', '2026-04-07',
   '{}', '{T14,T18}'),

  ('T04',
   'Documentos ICP (B2B + Creadores)',
   'Tener 2 documentos ICP finalizados (B2B y Creadores) que definan exactamente a quien buscar. Gabriel necesita estos criterios para construir la cascada de Clay.',
   'CRITICA', 'pendiente', 'pre_sprint',
   '2026-04-06', '2026-04-07',
   '{DTO-01,DTO-02}', '{T06,T11}'),

  ('T05',
   'Cuentas LinkedIn + Instagram Outreach',
   'Crear 2-3 cuentas de LinkedIn y 1 cuenta de Instagram dedicadas al outreach. Iniciar warmup inmediato (14 dias para LinkedIn).',
   'CRITICA', 'pendiente', 'pre_sprint',
   '2026-04-07', '2026-04-07',
   '{}', '{T07}'),

  ('T06',
   'Clay Cascade + SmartScout + Apify Config',
   'Tener Clay configurado con tabla de enriquecimiento en cascada, conectado a SmartScout y Apify, listo para procesar 1,000 prospectos B2B.',
   'CRITICA', 'pendiente', 'semana_1',
   '2026-04-08', '2026-04-09',
   '{T04}', '{T07,T11}'),

  ('T07',
   'Smartlead + Expandi + JustCall + Conexiones',
   'Los 3 canales de outreach (email, LinkedIn, telefono) configurados y listos. Conexiones push desde Clay activas.',
   'CRITICA', 'pendiente', 'semana_1',
   '2026-04-09', '2026-04-10',
   '{T01,T05,T06}', '{T14,DTO-09,DTO-10}'),

  ('T08',
   'ManyChat + WhatsApp + Branch.io + Twilio',
   'Infraestructura de mensajeria configurada: chatbot WhatsApp/Instagram, deep links para transicion entre canales, SMS via Twilio.',
   'CRITICA', 'pendiente', 'semana_1',
   '2026-04-10', '2026-04-13',
   '{}', '{T12,DTO-07}'),

  ('T09',
   'Sendspark + ElevenLabs + Klaviyo/SMS',
   'Video personalizado (Sendspark), clonacion de voz (ElevenLabs) y recuperacion SMS (Klaviyo) configurados.',
   'CRITICA', 'pendiente', 'semana_1',
   '2026-04-13', '2026-04-13',
   '{DTO-03}', '{DTO-08,DTO-12}'),

  ('T10',
   'Slybroadcast + Social Blade + Outgrow',
   'Adquirir y configurar las herramientas de apoyo: voicemail masivo, analytics de creadores y contenido interactivo.',
   'ALTA', 'pendiente', 'semana_1',
   '2026-04-14', '2026-04-14',
   '{}', '{T16}'),

  ('T11',
   'Clay Cascade 1,000 Prospectos',
   '1,000 prospectos B2B completamente enriquecidos, calificados y listos para ser cargados en Smartlead y Expandi.',
   'CRITICA', 'pendiente', 'semana_1',
   '2026-04-08', '2026-04-14',
   '{T04,T06}', '{DTO-06,T11-B,T14}'),

  ('T11-B',
   'Sync Clay -> Supabase (client_inventory + contacts + lists)',
   'Persistir los 1,000 prospectos enriquecidos de Clay en Supabase (client_inventory + client_contacts + client_contact_lists) como respaldo y fuente de verdad paralela.',
   'CRITICA', 'pendiente', 'semana_2',
   '2026-04-17', '2026-04-17',
   '{T11}', '{T14}'),

  ('T12',
   'Flujos ManyChat WhatsApp + IG Completos + Webhook -> Supabase',
   'Flujos completos de ManyChat para: (1) cualificacion de creadores por WhatsApp, (2) reclutamiento por Instagram DM. Integrados con Branch.io deep links.',
   'CRITICA', 'pendiente', 'semana_2',
   '2026-04-14', '2026-04-15',
   '{T08}', '{T14,DTO-07}'),

  ('T13',
   'Discord + WhatsApp Communities',
   'Servidor Discord y Comunidad WhatsApp de creadores estructurados, listos para que Equipo 2 invite a los 50 miembros fundadores.',
   'ALTA', 'pendiente', 'semana_2',
   '2026-04-15', '2026-04-15',
   '{}', '{}'),

  ('T14',
   'Testing E2E + Verificacion Integraciones',
   'Verificar que los 2 pipelines completos funcionan end-to-end sin errores. Todo el equipo participa.',
   'CRITICA', 'pendiente', 'semana_2',
   '2026-04-16', '2026-04-16',
   '{T07,T11,T12}', '{T15}'),

  ('T15',
   'Documentacion Arquitectura + Loom',
   'Documentar toda la arquitectura tecnica y grabar un Loom de 15 minutos para que el Equipo 4 (Contenido+Campanas) entienda el sistema y sepa donde cargar sus activos.',
   'CRITICA', 'pendiente', 'semana_2',
   '2026-04-16', '2026-04-16',
   '{T14}', '{DTO-05}'),

  ('T16',
   'Micrositios B2B + Creadores + Lead Magnets',
   '2 micrositios personalizados (B2B + Creadores) y 2 herramientas interactivas (auditoria video + calculadora ingresos) activas y capturando leads a HubSpot.',
   'CRITICA', 'pendiente', 'semana_2',
   '2026-04-17', '2026-04-21',
   '{T10}', '{DTO-11}'),

  ('T17',
   'Monitoreo Competitivo + Routable',
   'Configurar monitoreo automatico de competidores e iniciar integracion de pagos con Routable.',
   'ALTA', 'pendiente', 'semana_3_4',
   '2026-04-22', '2026-04-23',
   '{T02}', '{}'),

  ('T18',
   'Monitoreo Diario + Resolucion Integraciones',
   'Mantener todos los sistemas operativos, detectar problemas temprano y resolverlos antes de que impacten las campanas.',
   'ALTA', 'pendiente', 'semana_3_4',
   '2026-04-22', '2026-05-08',
   '{T14}', '{T19}'),

  ('T19',
   'Evaluacion Escalamiento Mes 2',
   'Documento de evaluacion que responda: Funciono? Que escalar? Que ajustar? Cuanto cuesta el Mes 2?',
   'ALTA', 'pendiente', 'semana_3_4',
   '2026-05-04', '2026-05-06',
   '{T18}', '{T20}'),

  ('T20',
   'Retrospectiva Sprint',
   'Cerrar el sprint formalmente. Presentar resultados, lecciones aprendidas y plan para Mes 2.',
   'MEDIA', 'pendiente', 'cierre',
   '2026-05-08', '2026-05-08',
   '{T19}', '{}');

---------------------------------------
-- 3. TASK ASSIGNMENTS
---------------------------------------
-- T01: Responsable Gabriel, Apoyo Daniel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T01', '22222222-2222-2222-2222-222222222222', 'responsable'),
  ('T01', '11111111-1111-1111-1111-111111111111', 'apoyo');

-- T02: Responsable Daniel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T02', '11111111-1111-1111-1111-111111111111', 'responsable');

-- T03: Responsable Eugenia
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T03', '55555555-5555-5555-5555-555555555555', 'responsable');

-- T04: Responsable Eugenia, Apoyo Daniel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T04', '55555555-5555-5555-5555-555555555555', 'responsable'),
  ('T04', '11111111-1111-1111-1111-111111111111', 'apoyo');

-- T05: Responsable Dayana
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T05', '44444444-4444-4444-4444-444444444444', 'responsable');

-- T06: Responsable Gabriel, Apoyo Daniel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T06', '22222222-2222-2222-2222-222222222222', 'responsable'),
  ('T06', '11111111-1111-1111-1111-111111111111', 'apoyo');

-- T07: Responsable Gabriel, Responsable Dayana, Apoyo Daniel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T07', '22222222-2222-2222-2222-222222222222', 'responsable'),
  ('T07', '44444444-4444-4444-4444-444444444444', 'responsable'),
  ('T07', '11111111-1111-1111-1111-111111111111', 'apoyo');

-- T08: Responsable Dayana, Apoyo Gabriel, Apoyo Lillian
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T08', '44444444-4444-4444-4444-444444444444', 'responsable'),
  ('T08', '22222222-2222-2222-2222-222222222222', 'apoyo'),
  ('T08', '33333333-3333-3333-3333-333333333333', 'apoyo');

-- T09: Responsable Dayana, Responsable Eugenia, Apoyo Gabriel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T09', '44444444-4444-4444-4444-444444444444', 'responsable'),
  ('T09', '55555555-5555-5555-5555-555555555555', 'responsable'),
  ('T09', '22222222-2222-2222-2222-222222222222', 'apoyo');

-- T10: Responsable Eugenia, Responsable Daniel, Apoyo Lillian
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T10', '55555555-5555-5555-5555-555555555555', 'responsable'),
  ('T10', '11111111-1111-1111-1111-111111111111', 'responsable'),
  ('T10', '33333333-3333-3333-3333-333333333333', 'apoyo');

-- T11: Responsable Gabriel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T11', '22222222-2222-2222-2222-222222222222', 'responsable');

-- T11-B: Responsable Gabriel, Apoyo Daniel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T11-B', '22222222-2222-2222-2222-222222222222', 'responsable'),
  ('T11-B', '11111111-1111-1111-1111-111111111111', 'apoyo');

-- T12: Responsable Dayana, Apoyo Gabriel, Apoyo Daniel, Apoyo Lillian
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T12', '44444444-4444-4444-4444-444444444444', 'responsable'),
  ('T12', '22222222-2222-2222-2222-222222222222', 'apoyo'),
  ('T12', '11111111-1111-1111-1111-111111111111', 'apoyo'),
  ('T12', '33333333-3333-3333-3333-333333333333', 'apoyo');

-- T13: Responsable Lillian, Apoyo Eugenia
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T13', '33333333-3333-3333-3333-333333333333', 'responsable'),
  ('T13', '55555555-5555-5555-5555-555555555555', 'apoyo');

-- T14: Responsable Gabriel, Responsable Daniel, Apoyo Dayana, Apoyo Lillian, Apoyo Eugenia
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T14', '22222222-2222-2222-2222-222222222222', 'responsable'),
  ('T14', '11111111-1111-1111-1111-111111111111', 'responsable'),
  ('T14', '44444444-4444-4444-4444-444444444444', 'apoyo'),
  ('T14', '33333333-3333-3333-3333-333333333333', 'apoyo'),
  ('T14', '55555555-5555-5555-5555-555555555555', 'apoyo');

-- T15: Responsable Daniel, Apoyo Dayana, Apoyo Lillian
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T15', '11111111-1111-1111-1111-111111111111', 'responsable'),
  ('T15', '44444444-4444-4444-4444-444444444444', 'apoyo'),
  ('T15', '33333333-3333-3333-3333-333333333333', 'apoyo');

-- T16: Responsable Lillian, Responsable Eugenia, Co-ejecuta Dayana, Apoyo Daniel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T16', '33333333-3333-3333-3333-333333333333', 'responsable'),
  ('T16', '55555555-5555-5555-5555-555555555555', 'responsable'),
  ('T16', '44444444-4444-4444-4444-444444444444', 'co-ejecuta'),
  ('T16', '11111111-1111-1111-1111-111111111111', 'apoyo');

-- T17: Responsable Daniel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T17', '11111111-1111-1111-1111-111111111111', 'responsable');

-- T18: Responsable Gabriel, Responsable Dayana
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T18', '22222222-2222-2222-2222-222222222222', 'responsable'),
  ('T18', '44444444-4444-4444-4444-444444444444', 'responsable');

-- T19: Responsable Daniel
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T19', '11111111-1111-1111-1111-111111111111', 'responsable');

-- T20: Responsable Daniel, Responsable Gabriel, Responsable Lillian, Responsable Dayana, Responsable Eugenia
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('T20', '11111111-1111-1111-1111-111111111111', 'responsable'),
  ('T20', '22222222-2222-2222-2222-222222222222', 'responsable'),
  ('T20', '33333333-3333-3333-3333-333333333333', 'responsable'),
  ('T20', '44444444-4444-4444-4444-444444444444', 'responsable'),
  ('T20', '55555555-5555-5555-5555-555555555555', 'responsable');

---------------------------------------
-- 4. TASK CHECKLIST
---------------------------------------

-- ===================== T01 =====================
-- Entregables T01
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T01', 'entregable', '5 dominios secundarios comprados y accesibles', 1),
  ('T01', 'entregable', '15 cuentas de email creadas en Google Workspace', 2),
  ('T01', 'entregable', 'SPF/DKIM/DMARC configurado y verificado para los 5 dominios', 3),
  ('T01', 'entregable', 'Score 9/10+ en Mail-Tester para al menos 1 cuenta por dominio', 4),
  ('T01', 'entregable', 'Google Postmaster Tools configurado para los 5 dominios', 5),
  ('T01', 'entregable', '15 cuentas conectadas a Smartlead con warmup activo', 6),
  ('T01', 'entregable', 'Screenshot del dashboard de Smartlead mostrando warmup activo', 7);
-- Criterios T01
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T01', 'criterio', 'MxToolbox muestra SPF, DKIM y DMARC como "Pass" para cada dominio', 1),
  ('T01', 'criterio', 'Mail-Tester score >= 9/10', 2),
  ('T01', 'criterio', 'Dashboard Smartlead muestra 15 cuentas en estado "Warming up"', 3),
  ('T01', 'criterio', 'Google Postmaster Tools accesible para cada dominio', 4);

-- ===================== T02 =====================
-- Entregables T02
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T02', 'entregable', 'Cuenta HubSpot creada', 1),
  ('T02', 'entregable', 'Pipeline B2B Ventas con 9 etapas', 2),
  ('T02', 'entregable', 'Pipeline Creadores Onboarding con 9 etapas', 3),
  ('T02', 'entregable', '8 propiedades custom creadas', 4),
  ('T02', 'entregable', 'Accesos dados a los 4 equipos', 5),
  ('T02', 'entregable', 'Contacto de prueba en cada pipeline', 6);
-- Criterios T02
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T02', 'criterio', 'Los 4 lideres de equipo confirman acceso por Slack', 1),
  ('T02', 'criterio', 'Un contacto puede moverse por todas las etapas sin error', 2),
  ('T02', 'criterio', 'Propiedades custom visibles al editar un contacto', 3);

-- ===================== T03 =====================
-- Entregables T03
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T03', 'entregable', 'Workspace Slack creado con 5 canales', 1),
  ('T03', 'entregable', 'Todos los miembros de los 4 equipos invitados', 2),
  ('T03', 'entregable', 'Relay.app configurado con 2 automatizaciones', 3),
  ('T03', 'entregable', 'Alerta de prueba recibida exitosamente en Slack', 4),
  ('T03', 'entregable', 'Screenshot de la alerta funcionando', 5);
-- Criterios T03
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T03', 'criterio', 'Al crear un lead en HubSpot con score >= 7, aparece mensaje en #leads-b2b-calientes en menos de 5 minutos', 1),
  ('T03', 'criterio', 'Todos los lideres de equipo confirman que recibieron la alerta de prueba', 2),
  ('T03', 'criterio', 'Canales tienen las personas correctas', 3);

-- ===================== T04 =====================
-- Entregables T04
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T04', 'entregable', '2 templates enviados a Pepe y Mery (Lunes 6 Abr AM)', 1),
  ('T04', 'entregable', 'Seguimiento hecho (Lunes 4 PM)', 2),
  ('T04', 'entregable', 'ICP B2B compilado y compartido', 3),
  ('T04', 'entregable', 'ICP Creadores compilado y compartido', 4),
  ('T04', 'entregable', 'Daniel reviso y aprobo ambos documentos', 5),
  ('T04', 'entregable', 'Link compartido en Slack', 6);
-- Criterios T04
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T04', 'criterio', 'Cada documento tiene TODOS los campos llenos (no hay "___" vacios)', 1),
  ('T04', 'criterio', 'Gabriel confirma que los criterios son suficientes para configurar filtros en Clay', 2),
  ('T04', 'criterio', 'Documento firmado (aprobado) por el lider del equipo que proporciono los datos', 3);

-- ===================== T05 =====================
-- Entregables T05
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T05', 'entregable', '2-3 perfiles LinkedIn creados con contenido profesional', 1),
  ('T05', 'entregable', 'Plan de warmup LinkedIn documentado (quien hace cuantas conexiones por dia)', 2),
  ('T05', 'entregable', '1 cuenta Instagram creada con 3-5 posts publicados', 3),
  ('T05', 'entregable', 'Screenshots de los perfiles activos', 4);
-- Criterios T05
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T05', 'criterio', 'Perfiles LinkedIn tienen foto, headline, bio y experiencia completos', 1),
  ('T05', 'criterio', 'LinkedIn muestra al menos 5 conexiones aceptadas el primer dia', 2),
  ('T05', 'criterio', 'Instagram tiene al menos 3 posts publicados y 20 follows', 3),
  ('T05', 'criterio', 'Emails de las cuentas estan documentados para Gabriel (T07 - Expandi)', 4);

-- ===================== T06 =====================
-- Entregables T06
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T06', 'entregable', 'SmartScout exportando con filtros de ICP', 1),
  ('T06', 'entregable', 'Apify scrapers configurados y ejecutando', 2),
  ('T06', 'entregable', 'Tabla de cascada Clay construida con 5 columnas de enriquecimiento', 3),
  ('T06', 'entregable', 'Prueba de 50 prospectos ejecutada exitosamente', 4),
  ('T06', 'entregable', 'Tasa de enriquecimiento >80% verificada', 5),
  ('T06', 'entregable', 'Documento tecnico de la logica de cascada (para referencia)', 6);
-- Criterios T06
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T06', 'criterio', '50 prospectos de prueba tienen: email verificado, LinkedIn URL, empresa, score', 1),
  ('T06', 'criterio', 'Tasa de campos completos >80%', 2),
  ('T06', 'criterio', 'Cascada corre sin errores de API', 3),
  ('T06', 'criterio', 'Datos de SmartScout + Apify fluyen a Clay sin intervencion manual', 4);

-- ===================== T07 =====================
-- Entregables T07 (extracted from the sections as entregables)
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T07', 'entregable', 'Smartlead: 15 cuentas en rotacion, secuencia placeholder cargada, horario configurado', 1),
  ('T07', 'entregable', 'Expandi: 2 cuentas LinkedIn conectadas, IP residencial, limites conservadores', 2),
  ('T07', 'entregable', 'JustCall: Numero activo, lista importada, ventana de llamada configurada', 3),
  ('T07', 'entregable', 'Push Clay -> Smartlead funcionando', 4),
  ('T07', 'entregable', 'Push Clay -> Expandi funcionando', 5);
-- Criterios T07
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T07', 'criterio', 'Smartlead: 15 cuentas en rotacion, secuencia placeholder cargada, horario configurado', 1),
  ('T07', 'criterio', 'Expandi: 2 cuentas LinkedIn conectadas, IP residencial, limites conservadores', 2),
  ('T07', 'criterio', 'JustCall: Numero activo, lista importada, ventana de llamada configurada', 3),
  ('T07', 'criterio', 'Push Clay -> Smartlead: 1 prospecto de prueba fluyo correctamente', 4),
  ('T07', 'criterio', 'Push Clay -> Expandi: 1 prospecto de prueba fluyo correctamente', 5),
  ('T07', 'criterio', 'HubSpot: JustCall y/o Smartlead reportan actividad a HubSpot', 6);

-- ===================== T08 =====================
-- Entregables T08 (from section subtitles)
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T08', 'entregable', 'ManyChat Pro activo con WhatsApp Business API conectado', 1),
  ('T08', 'entregable', 'Templates de WhatsApp enviados a Meta para aprobacion', 2),
  ('T08', 'entregable', 'Instagram conectado a ManyChat', 3),
  ('T08', 'entregable', 'Twilio: 2 numeros comprados (US + MX), A2P registro iniciado, webhook configurado, SMS de prueba enviado', 4),
  ('T08', 'entregable', 'Branch.io configurado, 4 templates de deep link creados, probados en movil', 5);
-- Criterios T08
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T08', 'criterio', 'ManyChat Pro activo con WhatsApp Business API conectado', 1),
  ('T08', 'criterio', 'Al menos 3 templates de WhatsApp enviados a Meta', 2),
  ('T08', 'criterio', 'Instagram conectado a ManyChat', 3),
  ('T08', 'criterio', 'Twilio: 2 numeros activos (US + MX)', 4),
  ('T08', 'criterio', 'Twilio: A2P 10DLC registro iniciado', 5),
  ('T08', 'criterio', 'Twilio: SMS de prueba enviado y recibido exitosamente', 6),
  ('T08', 'criterio', 'Branch.io: 4 templates de deep link funcionando', 7),
  ('T08', 'criterio', 'Branch.io: probado en al menos 1 dispositivo movil (iOS o Android)', 8);

-- ===================== T09 =====================
-- Entregables T09 (from section subtitles)
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T09', 'entregable', 'Sendspark activo, variables dinamicas configuradas, 3 links de prueba generados', 1),
  ('T09', 'entregable', 'Clon de voz entrenado en ElevenLabs, 10 muestras generadas, enviadas a Eq2 para aprobacion', 2),
  ('T09', 'entregable', 'API ElevenLabs -> ManyChat conectada, flujo de prueba ejecutado, audio recibido en WhatsApp', 3),
  ('T09', 'entregable', 'Klaviyo configurado, trigger de abandono activo, SMS de prueba enviado', 4);
-- Criterios T09
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T09', 'criterio', 'Sendspark: variables dinamicas renderizan correctamente en 3 links de prueba', 1),
  ('T09', 'criterio', 'ElevenLabs: clon de voz entrenado (si audio llego)', 2),
  ('T09', 'criterio', 'ElevenLabs: 10 muestras enviadas a Equipo 2', 3),
  ('T09', 'criterio', 'API ElevenLabs -> ManyChat: nota de voz generada y enviada por WhatsApp en prueba', 4),
  ('T09', 'criterio', 'Klaviyo: SMS de recuperacion de abandono enviado exitosamente en prueba', 5);

-- ===================== T10 =====================
-- Entregables T10 (from section subtitles)
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T10', 'entregable', 'Slybroadcast activo, guion subido o escrito', 1),
  ('T10', 'entregable', 'Social Blade API activa, 5 busquedas de prueba exitosas, estructura de datos documentada', 2),
  ('T10', 'entregable', 'Outgrow activo, calculator de prueba creado, embed verificado', 3);
-- Criterios T10
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T10', 'criterio', 'Slybroadcast: cuenta activa, guion subido o escrito', 1),
  ('T10', 'criterio', 'Social Blade: API key obtenida, 5 busquedas exitosas', 2),
  ('T10', 'criterio', 'Outgrow: cuenta activa, calculator de prueba creado, embed funciona', 3),
  ('T10', 'criterio', 'Credenciales documentadas en gestor compartido', 4);

-- ===================== T11 =====================
-- Entregables T11
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T11', 'entregable', '1,000 prospectos en Clay con todos los campos obligatorios', 1),
  ('T11', 'entregable', 'Tasa de campos completos >80%', 2),
  ('T11', 'entregable', 'Email bounce rate estimado <5%', 3),
  ('T11', 'entregable', 'Prospectos pushed a Smartlead exitosamente', 4),
  ('T11', 'entregable', 'Prospectos pushed a Expandi exitosamente', 5),
  ('T11', 'entregable', 'CSV backup en Google Drive compartido', 6),
  ('T11', 'entregable', 'Reporte de calidad: # total, # con email, # con LinkedIn, # con score >= 6', 7);
-- Criterios T11
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T11', 'criterio', 'Minimo 800/1000 prospectos con email verificado', 1),
  ('T11', 'criterio', 'Minimo 700/1000 con LinkedIn URL', 2),
  ('T11', 'criterio', 'Minimo 500/1000 con icp_score >= 6', 3),
  ('T11', 'criterio', '0 duplicados por empresa/email', 4),
  ('T11', 'criterio', 'Push a Smartlead verificado (prospectos aparecen en la herramienta)', 5),
  ('T11', 'criterio', 'Push a Expandi verificado', 6);

-- ===================== T11-B =====================
-- Entregables T11-B
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T11-B', 'entregable', 'Sync implementado (Opcion A o C)', 1),
  ('T11-B', 'entregable', '1,000 prospectos visibles en client_inventory en Supabase', 2),
  ('T11-B', 'entregable', 'Contactos vinculados en client_contacts', 3),
  ('T11-B', 'entregable', 'Lista "Sprint-Abr-B2B-1000" creada con los 1,000 contactos', 4),
  ('T11-B', 'entregable', 'Documentacion del mapping y proceso de sync', 5);
-- Criterios T11-B
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T11-B', 'criterio', 'Datos en Supabase coinciden con datos en Clay (spot check 20 registros)', 1),
  ('T11-B', 'criterio', '0 duplicados en client_inventory por website_url', 2),
  ('T11-B', 'criterio', 'qualification_score y qualification_criteria correctamente populados', 3),
  ('T11-B', 'criterio', 'Lista creada y accesible desde el CRM Laneta', 4);

-- ===================== T12 =====================
-- Entregables T12
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T12', 'entregable', 'Flujo WhatsApp de cualificacion completo y funcional', 1),
  ('T12', 'entregable', 'Flujo Instagram DM de reclutamiento completo y funcional', 2),
  ('T12', 'entregable', 'Branch.io deep links integrados en ambos flujos', 3),
  ('T12', 'entregable', 'Webhook ManyChat -> Supabase configurado y funcionando (creadores nuevos llegan a creator_inventory)', 4),
  ('T12', 'entregable', 'Prueba end-to-end en dispositivo movil (video de evidencia)', 5),
  ('T12', 'entregable', 'UX review de Lillian completado', 6),
  ('T12', 'entregable', 'Flujos enviados a Mery (Equipo 2) para aprobacion (DTO-OUT-06)', 7);
-- Criterios T12
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T12', 'criterio', 'Un usuario de prueba puede completar el flujo WhatsApp de principio a fin', 1),
  ('T12', 'criterio', 'El deep link de Instagram -> WhatsApp funciona en iOS y Android', 2),
  ('T12', 'criterio', 'Los datos de cualificacion llegan a HubSpot correctamente', 3),
  ('T12', 'criterio', 'Los datos de cualificacion llegan a Supabase (creator_inventory + creator_lists)', 4),
  ('T12', 'criterio', 'La alerta de Slack se dispara para creadores cualificados', 5),
  ('T12', 'criterio', 'Lillian da visto bueno de UX', 6);

-- ===================== T13 =====================
-- Entregables T13
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T13', 'entregable', 'Servidor Discord creado con 12 canales en 4 categorias', 1),
  ('T13', 'entregable', '4 roles configurados con permisos correctos', 2),
  ('T13', 'entregable', 'Bot de bienvenida activo y probado', 3),
  ('T13', 'entregable', 'Diseno visual del servidor (icono, banner)', 4),
  ('T13', 'entregable', 'Comunidad WhatsApp creada con 4 sub-grupos', 5),
  ('T13', 'entregable', 'Mensajes de bienvenida preparados', 6),
  ('T13', 'entregable', 'Links de invitacion compartidos con Mery (Equipo 2)', 7);
-- Criterios T13
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T13', 'criterio', 'Un usuario nuevo puede unirse al Discord y recibe mensaje de bienvenida automatico', 1),
  ('T13', 'criterio', 'Los canales tienen la estructura y permisos correctos', 2),
  ('T13', 'criterio', 'Links de WhatsApp Community funcionan correctamente', 3),
  ('T13', 'criterio', 'Mery (Equipo 2) tiene los links para invitar fundadores', 4);

-- ===================== T14 =====================
-- Entregables T14
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T14', 'entregable', 'Checklist de tests completado (este documento con todos los items marcados)', 1),
  ('T14', 'entregable', 'Lista de bugs/issues encontrados con severidad (Critico/Alto/Medio/Bajo)', 2),
  ('T14', 'entregable', 'Bugs criticos resueltos el mismo dia', 3),
  ('T14', 'entregable', 'Bugs altos asignados con fecha de resolucion', 4);
-- Criterios T14
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T14', 'criterio', 'Pipeline B2B fluye end-to-end sin errores', 1),
  ('T14', 'criterio', 'Pipeline Creadores fluye end-to-end sin errores', 2),
  ('T14', 'criterio', 'Todas las integraciones HubSpot verificadas', 3),
  ('T14', 'criterio', 'Alertas Slack funcionan', 4),
  ('T14', 'criterio', 'Deep links funcionan en movil', 5),
  ('T14', 'criterio', 'CERO bugs criticos abiertos al final del dia', 6);

-- ===================== T15 =====================
-- Entregables T15
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T15', 'entregable', 'Diagrama de arquitectura en Figma (Lillian)', 1),
  ('T15', 'entregable', 'Screenshots de dashboards de cada herramienta (Dayana)', 2),
  ('T15', 'entregable', 'Tabla "donde cargar que" (Dayana)', 3),
  ('T15', 'entregable', 'Loom de 15 minutos grabado y compartido (Daniel)', 4),
  ('T15', 'entregable', 'Link del Loom enviado a lider de Equipo 4 por Slack', 5);
-- Criterios T15
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T15', 'criterio', 'Lider de Equipo 4 confirma que entiende donde cargar cada tipo de contenido', 1),
  ('T15', 'criterio', 'Diagrama cubre ambos pipelines y todas las herramientas', 2),
  ('T15', 'criterio', 'Loom dura entre 12 y 18 minutos (no mas, no menos)', 3);

-- ===================== T16 =====================
-- Entregables T16 (no explicit "## Entregables" section with checkboxes, using QA Final checklist)
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T16', 'entregable', 'Micrositio B2B live en Unbounce con DTR funcionando', 1),
  ('T16', 'entregable', 'Micrositio Creadores live en Leadpages', 2),
  ('T16', 'entregable', 'Auditoria video B2B activa en Outgrow, embed code generado', 3),
  ('T16', 'entregable', 'Calculadora ingresos creadores activa en Outgrow, embed code generado', 4);
-- Criterios T16 (from QA Final section)
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T16', 'criterio', 'Micrositio B2B: DTR funciona, responsive, form -> HubSpot', 1),
  ('T16', 'criterio', 'Micrositio Creadores: campos dinamicos, responsive, form -> HubSpot', 2),
  ('T16', 'criterio', 'Auditoria video Outgrow: inputs -> outputs correctos, captura leads', 3),
  ('T16', 'criterio', 'Calculadora ingresos Outgrow: formulas correctas, captura leads', 4),
  ('T16', 'criterio', 'Todos los embeds funcionan dentro de los micrositios', 5),
  ('T16', 'criterio', 'Probado en mobile (iOS y/o Android)', 6);

-- ===================== T17 =====================
-- Entregables T17
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T17', 'entregable', 'Google Alerts configurado (5+ alertas)', 1),
  ('T17', 'entregable', 'Visualping configurado para 3+ paginas de competidores', 2),
  ('T17', 'entregable', 'Routable: contacto iniciado / demo agendada / o decision de posponer documentada', 3);
-- Criterios T17
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T17', 'criterio', 'Recibir al menos 1 alerta de Google Alerts dentro de 48h', 1),
  ('T17', 'criterio', 'Visualping muestra estado de monitoreo activo', 2),
  ('T17', 'criterio', 'Decision sobre Routable documentada y comunicada a direccion', 3);

-- ===================== T18 =====================
-- Entregables T18
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T18', 'entregable', 'Reporte diario de dominios en Slack (Gabriel) — minimo 15 reportes en el sprint', 1),
  ('T18', 'entregable', 'Reporte diario de redes en standup (Dayana) — minimo 15 reportes', 2),
  ('T18', 'entregable', 'Doc "Issues Resueltos" actualizado con cada incidente', 3),
  ('T18', 'entregable', 'Cero issues criticos abiertos por mas de 24h', 4);
-- Criterios T18
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T18', 'criterio', 'Ningun dominio en blacklist al final del sprint', 1),
  ('T18', 'criterio', 'Ninguna cuenta LinkedIn permanentemente restringida', 2),
  ('T18', 'criterio', 'Todos los pipelines operativos al cierre del sprint', 3),
  ('T18', 'criterio', 'Issues resueltos documentados para referencia futura', 4);

-- ===================== T19 =====================
-- Entregables T19
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T19', 'entregable', 'Documento de evaluacion completo (Google Doc, 5-8 paginas)', 1),
  ('T19', 'entregable', 'Tabla de presupuesto Mes 2', 2),
  ('T19', 'entregable', 'Lista de cuellos de botella con soluciones propuestas', 3),
  ('T19', 'entregable', 'Recomendacion clara: escalar / ajustar / pausar', 4);
-- Criterios T19
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T19', 'criterio', 'Todas las secciones del documento tienen datos reales (no placeholders)', 1),
  ('T19', 'criterio', 'Presupuesto Mes 2 desglosado por herramienta', 2),
  ('T19', 'criterio', 'Recomendaciones son accionables (no genericas)', 3),
  ('T19', 'criterio', 'Daniel puede presentar este documento a direccion en 10 minutos', 4);

-- ===================== T20 =====================
-- Entregables T20
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T20', 'entregable', 'Reunion realizada con todos los miembros presentes', 1),
  ('T20', 'entregable', 'Acta de la retrospectiva documentada (Google Doc)', 2),
  ('T20', 'entregable', 'Lista de acciones para Mes 2 con responsables y fechas', 3),
  ('T20', 'entregable', 'Evaluacion enviada a direccion', 4);
-- Criterios T20
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T20', 'criterio', 'Direccion recibe el documento de evaluacion + acta de retro', 1),
  ('T20', 'criterio', 'Cada miembro del equipo contribuyo con al menos 1 insight', 2),
  ('T20', 'criterio', 'Plan Mes 2 tiene al menos 3 acciones concretas con fechas', 3);

---------------------------------------
-- 5. MILESTONES (11 records)
---------------------------------------
INSERT INTO milestones (milestone_id, title, target_date, success_criteria) VALUES
  ('M1', 'Warmup iniciado', '2026-04-06', '15 cuentas email en Smartlead calentando'),
  ('M2', 'CRM + Comms operativos', '2026-04-07', 'HubSpot + Slack + Relay.app funcionando'),
  ('M3', 'Stack de datos activo', '2026-04-09', 'Clay + SmartScout + Apify cascada construyendose'),
  ('M4', 'Outreach tools ready', '2026-04-10', 'Smartlead + Expandi + JustCall configurados'),
  ('M5', 'Messaging infra live', '2026-04-13', 'ManyChat + Twilio + Branch.io + ElevenLabs activos'),
  ('M6', '1,000 prospectos', '2026-04-14', 'Clay cascade completa, prospectos enriquecidos'),
  ('M6b', 'Datos en Supabase', '2026-04-17', '1,000 prospectos sincronizados a client_inventory + client_contacts'),
  ('M7', 'Pipelines E2E probados', '2026-04-16', 'B2B + Creadores pipelines funcionando end-to-end'),
  ('M8', 'Micrositios + Lead Magnets', '2026-04-21', '2 micrositios + 2 calculadoras activas'),
  ('M9', 'Fase de monitoreo estable', '2026-04-28', '5 dias sin incidentes criticos'),
  ('M10', 'Sprint completado', '2026-05-08', 'Retrospectiva + evaluacion escalamiento entregados');
