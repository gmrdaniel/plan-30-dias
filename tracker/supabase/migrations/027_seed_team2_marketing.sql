-- Migration 027: Seed Team 2 — Marketing Influencers (Pepe)
-- 4 team members + auth users + 31 tasks MI-001..MI-031 + assignments.
-- Source: Tracker_Equipo1_Marketing_Influencers.xlsx (Sprint 6 Abr – 8 May 2026).

---------------------------------------
-- 1. TEAM MEMBERS (team_id='team2')
---------------------------------------
INSERT INTO team_members (id, name, short_name, role, avatar_color, password, is_leader, team_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jose Hijar',          'Pepe',       'Lider / Cierra negocios / Primer respaldo de alertas', '#ef4444', 'pepe2026',   true,  'team2'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Maria Parra',         'Mafer',      'Conversaciones activas / Segundo respaldo de alertas', '#3b82f6', 'mafer2026',  false, 'team2'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Robert Ferrer',       'Robert',     'Control de calidad / Tercer respaldo de alertas',       '#8b5cf6', 'robert2026', false, 'team2'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Maria Laura Capote',  'MariaLaura', 'Monitoreo de sistemas y alertas Slack',                '#10b981', 'marialaura2026', false, 'team2');

---------------------------------------
-- 2. AUTH USERS (emails + passwords)
---------------------------------------
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES
  ('00000000-0000-0000-0000-000000000000','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','authenticated','authenticated','pepe@laneta.com',       crypt('pepe2026',       gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"name":"Jose Hijar","short_name":"Pepe"}',        ''),
  ('00000000-0000-0000-0000-000000000000','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','authenticated','authenticated','mafer@laneta.com',      crypt('mafer2026',      gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"name":"Maria Parra","short_name":"Mafer"}',      ''),
  ('00000000-0000-0000-0000-000000000000','cccccccc-cccc-cccc-cccc-cccccccccccc','authenticated','authenticated','robert@laneta.com',     crypt('robert2026',     gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"name":"Robert Ferrer","short_name":"Robert"}',   ''),
  ('00000000-0000-0000-0000-000000000000','dddddddd-dddd-dddd-dddd-dddddddddddd','authenticated','authenticated','marialaura@laneta.com', crypt('marialaura2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"name":"Maria Laura Capote","short_name":"MariaLaura"}', '');

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','pepe@laneta.com',      '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","email":"pepe@laneta.com"}',      'email', now(), now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','mafer@laneta.com',     '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","email":"mafer@laneta.com"}',     'email', now(), now(), now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','cccccccc-cccc-cccc-cccc-cccccccccccc','robert@laneta.com',    '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","email":"robert@laneta.com"}',    'email', now(), now(), now()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','dddddddd-dddd-dddd-dddd-dddddddddddd','marialaura@laneta.com','{"sub":"dddddddd-dddd-dddd-dddd-dddddddddddd","email":"marialaura@laneta.com"}','email', now(), now(), now());

---------------------------------------
-- 3. TASKS (31 records, team_id='team2')
-- Status: Completado→completada, "En espera team X"→bloqueada, Pendiente→pendiente
-- Priority: Critico→CRITICA, Alto Impacto→ALTA, Mejora→MEDIA
---------------------------------------
INSERT INTO tasks (task_id, title, objective, priority, status, phase, start_date, due_date, blocked_by, blocks, team_id) VALUES
  ('MI-001', 'Recopilar industrias y rangos de ingresos del ICP',
   'Pepe: identificar 3-5 industrias principales (Amazon FBA, Shopify DTC, CPG) y rangos de ingresos de clientes activos. El sistema filtra marcas de $500K+/mes.',
   'CRITICA','completada','pre_sprint','2026-04-06','2026-04-07','{}','{MI-003}','team2'),

  ('MI-002', 'Documentar objeciones comunes y titulos de decisores',
   'Mafer: listar las 5 objeciones mas comunes en llamadas de venta. Anotar titulos exactos de decisores: CEO, CMO, Director Marketing, Head of eCommerce.',
   'CRITICA','completada','pre_sprint','2026-04-06','2026-04-07','{}','{MI-003,MI-009}','team2'),

  ('MI-003', 'Enviar documento de ICP B2B a Infraestructura',
   'Pepe: compilar MI-001 y MI-002 en un documento de ICP B2B y enviarlo a Infraestructura antes del cierre del Dia 2.',
   'CRITICA','completada','pre_sprint','2026-04-07','2026-04-07','{MI-001,MI-002}','{MI-004,MI-005,MI-006}','team2'),

  ('MI-004', 'Revisar y firmar el documento de ICP B2B',
   'Pepe: leer el documento ICP compilado por Infraestructura, verificar industrias y rangos, corregir si hay errores y confirmar aprobacion por Slack o email.',
   'CRITICA','completada','pre_sprint','2026-04-07','2026-04-07','{MI-003}','{}','team2'),

  ('MI-005', 'Revisar 4 correos de prospeccion B2B - Tono y argumento',
   'Pepe: leer los 4 borradores (punto de dolor, seguimiento, FOMO competitivo, cierre). Verificar tono natural y argumento de negocio solido.',
   'CRITICA','completada','semana_1','2026-04-08','2026-04-10','{MI-003}','{MI-007}','team2'),

  ('MI-006', 'Revisar 4 correos de prospeccion B2B - Gramatica y datos',
   'Robert: revisar los 4 borradores por errores gramaticales y datos que suenen falsos o exagerados.',
   'CRITICA','completada','semana_1','2026-04-08','2026-04-10','{MI-003}','{MI-007}','team2'),

  ('MI-007', 'Confirmar aprobacion formal de los 4 correos B2B',
   'Pepe + Robert: confirmar Aprobado en Slack para los 4 correos antes del cierre del Dia 5. Contenido esta bloqueado hasta esta confirmacion.',
   'CRITICA','completada','semana_1','2026-04-10','2026-04-10','{MI-005,MI-006}','{}','team2'),

  ('MI-008', 'Revisar guion de buzon de voz (45 segundos)',
   'Pepe: escuchar el guion de buzon de voz de 45 segundos. Suena natural? Dura exactamente 45 segundos? Corregir el mismo dia.',
   'ALTA','completada','semana_1','2026-04-08','2026-04-10','{}','{}','team2'),

  ('MI-008-1', 'Revisar guion de llamada (15 minutos) - Pepe',
   'Pepe: Suena natural? Dura 15 minutos? Cubre las objeciones documentadas. Corregir el mismo dia.',
   'ALTA','completada','semana_1','2026-04-08','2026-04-10','{}','{}','team2'),

  ('MI-009', 'Revisar guion de llamada telefonica de 15 minutos',
   'Mafer: revisar el guion de la llamada de 15 minutos del Dia 18. Verificar que cubra las objeciones documentadas en MI-002.',
   'ALTA','completada','semana_1','2026-04-08','2026-04-10','{MI-002}','{}','team2'),

  ('MI-010', 'Preparar el ejemplo de listado para el video de auditoria',
   'Pepe: abrir un listado de Amazon o Shopify sin video en sus productos. Contenido puede ayudar a elegir un buen ejemplo el Dia 10.',
   'CRITICA','bloqueada','semana_2','2026-04-15','2026-04-15','{}','{MI-011}','team2'),

  ('MI-011', 'Grabar el video de auditoria maestro de 75 segundos (Sendspark)',
   'Pepe: grabar pantalla + camara en esquina. (A) Saludo con nombre y categoria. (B) Senalar donde falta el video. (C) Cuantificar perdida de ingresos. (D) CTA a auditoria. Maximo 75 segundos.',
   'CRITICA','bloqueada','semana_2','2026-04-15','2026-04-17','{MI-010}','{MI-012,MI-013}','team2'),

  ('MI-012', 'Entregar archivo de video maestro al equipo de Contenido',
   'Pepe: entregar el archivo de video al equipo de Contenido el Dia 12 para que lo suban y configuren personalizacion dinamica en Sendspark.',
   'CRITICA','bloqueada','semana_2','2026-04-17','2026-04-17','{MI-011}','{MI-020}','team2'),

  ('MI-013', 'Revisar el micrositio personalizado B2B en movil y desktop',
   'Pepe: abrir el enlace del micrositio en celular y computadora. Verificar que los datos de cada marca se inserten correctamente y el calculo de perdida de ingresos sea realista.',
   'ALTA','bloqueada','semana_2','2026-04-16','2026-04-21','{MI-011}','{MI-014}','team2'),

  ('MI-014', 'Verificar competidores del micrositio sean reales e impactantes',
   'Robert: verificar que los competidores mostrados sean reales, reconocibles y que el argumento sea impactante para un CEO.',
   'ALTA','bloqueada','semana_2','2026-04-15','2026-04-21','{MI-013}','{}','team2'),

  ('MI-015', 'Verificar datos de competidores para el Correo 3 (FOMO)',
   'Pepe: verificar que los competidores de SmartScout sean reales y reconocibles para el argumento de FOMO competitivo del Correo 3.',
   'ALTA','bloqueada','semana_2','2026-04-15','2026-04-21','{}','{MI-016}','team2'),

  ('MI-016', 'Verificar precision numerica de datos de ranking de competidores',
   'Mafer: verificar que los numeros de mejora de ranking de SmartScout sean precisos. Un dato falso destruye la credibilidad del Correo 3.',
   'ALTA','bloqueada','semana_2','2026-04-15','2026-04-21','{MI-015}','{}','team2'),

  ('MI-017', 'Confirmar que el canal Slack #leads-b2b-calientes funciona',
   'Maria Laura: recibir la alerta de prueba de Infraestructura y verificar que muestra nombre de marca, accion tomada y hora exacta.',
   'ALTA','bloqueada','semana_2','2026-04-15','2026-04-21','{}','{MI-018,MI-021,MI-022,MI-023}','team2'),

  ('MI-018', 'Verificar que el equipo este en el canal con notificaciones activas',
   'Maria Laura: confirmar que Pepe, Mafer y Robert esten en #leads-b2b-calientes con notificaciones activadas en celular.',
   'ALTA','pendiente','semana_2','2026-04-15','2026-04-21','{MI-017}','{MI-022}','team2'),

  ('MI-019', 'Revisar el demo interactivo de La Neta - Ruta B2B',
   'Pepe + Robert: navegar la ruta B2B completa de la demo interactiva (Arcade/Navattic) como si fueran un prospecto. Evaluar claridad, conviccion y elementos faltantes.',
   'MEDIA','pendiente','semana_2','2026-04-15','2026-04-21','{}','{}','team2'),

  ('MI-020', 'Usar videos Sendspark personalizados en conversaciones manuales',
   'Pepe + Mafer: en cada conversacion de venta, usar el enlace Sendspark personalizado (nombre y empresa insertados) en lugar de PDF de propuesta.',
   'ALTA','pendiente','semana_3','2026-04-22','2026-05-08','{MI-012}','{MI-021}','team2'),

  ('MI-021', 'Ejecutar llamadas a prospectos calidos - Sprint estrategico 15 min',
   'Pepe: filtrar en HubSpot prospectos con alto engagement (video completo, micrositio, 3+ emails). Llamar con JustCall. Formato: referencia a auditoria, pregunta abierta, agendar reunion.',
   'CRITICA','pendiente','semana_3','2026-04-23','2026-05-08','{MI-017,MI-020}','{MI-025,MI-027}','team2'),

  ('MI-022', 'Monitorear alertas Slack y responder en menos de 1 hora',
   'Equipo completo: activar notificaciones de #leads-b2b-calientes. Alerta de alta intencion (video completo + micrositio 2min+ + reunion agendada): Pepe responde en <1h. Backup: Mafer, luego Robert.',
   'CRITICA','pendiente','semana_3','2026-04-22','2026-05-08','{MI-017,MI-018}','{MI-025}','team2'),

  ('MI-023', 'Monitorear que las alertas de Slack sigan llegando correctamente',
   'Maria Laura: verificar diariamente que el canal de alertas funciona. Si dejan de llegar, avisar a Infraestructura de inmediato.',
   'CRITICA','pendiente','semana_3','2026-04-22','2026-05-08','{MI-017}','{MI-028}','team2'),

  ('MI-024', 'Registrar objeciones negativas en HubSpot para el reporte final',
   'Mafer: registrar en HubSpot cada respuesta negativa u objecion nueva que el sistema automatizado no sabe responder, para el reporte de retroalimentacion del Dia 31.',
   'ALTA','pendiente','semana_3','2026-04-22','2026-05-06','{}','{MI-026}','team2'),

  ('MI-025', 'Analizar que gancho de mensajeria funciono mejor',
   'Pepe: de las marcas que respondieron, identificar que gancho genero mas respuestas: punto de dolor (pierdes dinero) vs. FOMO competitivo (tu competidor ya lo tiene).',
   'ALTA','pendiente','semana_4','2026-04-29','2026-05-06','{MI-021,MI-022}','{MI-029}','team2'),

  ('MI-026', 'Documentar objeciones nuevas detectadas en el sprint',
   'Mafer: listar las objeciones nuevas que escucho en conversaciones y que el sistema automatizado no sabe responder. Aportar al reporte de retroalimentacion.',
   'ALTA','pendiente','semana_4','2026-04-29','2026-05-06','{MI-024}','{MI-029}','team2'),

  ('MI-027', 'Identificar patrones de industria y tamano en respuestas positivas',
   'Robert: de las marcas que respondieron positivamente, identificar patron en industria o tamano de empresa. Aportar al reporte de retroalimentacion.',
   'ALTA','pendiente','semana_4','2026-04-29','2026-05-06','{MI-021}','{MI-029}','team2'),

  ('MI-028', 'Resumir metricas de alertas Slack',
   'Maria Laura: resumir cuantas alertas de Slack se recibieron por dia, cuantas llevaron a accion y cuantas no se atendieron a tiempo.',
   'ALTA','pendiente','semana_4','2026-04-29','2026-05-06','{MI-023}','{MI-029}','team2'),

  ('MI-029', 'Consolidar y enviar reporte de retroalimentacion de mensajeria',
   'Todo el equipo: consolidar los analisis de MI-025 al MI-028 en un documento unico y enviar al equipo de Contenido+Campanas el Dia 31.',
   'ALTA','pendiente','semana_4','2026-05-06','2026-05-06','{MI-025,MI-026,MI-027,MI-028}','{MI-030}','team2'),

  ('MI-030', 'Preparar presentacion de resultados del sprint',
   'Todo el equipo: preparar presentacion con reuniones agendadas, propuestas enviadas, tamano de contrato promedio.',
   'MEDIA','pendiente','semana_4','2026-04-29','2026-05-08','{MI-029}','{MI-031}','team2'),

  ('MI-031', 'Participar en la retrospectiva de fin de sprint',
   'Todo el equipo: presentar resultados en la retrospectiva conjunta. Se decide si el Mes 2 escala de 250 a 1,000+ marcas en prospeccion.',
   'MEDIA','pendiente','semana_4','2026-05-08','2026-05-08','{MI-030}','{}','team2');

---------------------------------------
-- 4. TASK ASSIGNMENTS
-- Responsable = primer nombre en columna Responsable del Excel
-- co-ejecuta = los demas miembros listados
---------------------------------------
INSERT INTO task_assignments (task_id, member_id, assignment_role) VALUES
  ('MI-001',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-002',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'responsable'),
  ('MI-003',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-004',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-005',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-006',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'responsable'),
  ('MI-007',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-007',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'co-ejecuta'),
  ('MI-008',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-008-1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-009',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'responsable'),
  ('MI-010',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-011',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-012',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-013',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-014',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'responsable'),
  ('MI-015',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-016',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'responsable'),
  ('MI-017',   'dddddddd-dddd-dddd-dddd-dddddddddddd', 'responsable'),
  ('MI-018',   'dddddddd-dddd-dddd-dddd-dddddddddddd', 'responsable'),
  ('MI-019',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'responsable'),
  ('MI-019',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'co-ejecuta'),
  ('MI-020',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-020',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'co-ejecuta'),
  ('MI-021',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-022',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-022',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'co-ejecuta'),
  ('MI-022',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'co-ejecuta'),
  ('MI-022',   'dddddddd-dddd-dddd-dddd-dddddddddddd', 'co-ejecuta'),
  ('MI-023',   'dddddddd-dddd-dddd-dddd-dddddddddddd', 'responsable'),
  ('MI-024',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'responsable'),
  ('MI-025',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-026',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'responsable'),
  ('MI-027',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'responsable'),
  ('MI-028',   'dddddddd-dddd-dddd-dddd-dddddddddddd', 'responsable'),
  ('MI-029',   'dddddddd-dddd-dddd-dddd-dddddddddddd', 'responsable'),
  ('MI-029',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'co-ejecuta'),
  ('MI-029',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'co-ejecuta'),
  ('MI-029',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'co-ejecuta'),
  ('MI-030',   'dddddddd-dddd-dddd-dddd-dddddddddddd', 'responsable'),
  ('MI-030',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'co-ejecuta'),
  ('MI-030',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'co-ejecuta'),
  ('MI-030',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'co-ejecuta'),
  ('MI-031',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'responsable'),
  ('MI-031',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'co-ejecuta'),
  ('MI-031',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'co-ejecuta'),
  ('MI-031',   'dddddddd-dddd-dddd-dddd-dddddddddddd', 'co-ejecuta');

---------------------------------------
-- 5. MILESTONES (5 hitos clave del sprint)
---------------------------------------
INSERT INTO milestones (milestone_id, title, target_date, success_criteria, team_id) VALUES
  ('MI-H1', 'Correos B2B aprobados',        '2026-04-10', 'Los 4 correos de prospeccion aprobados por Pepe y Robert', 'team2'),
  ('MI-H2', 'Video maestro entregado',      '2026-04-17', 'Video de 75s entregado al equipo de Contenido para Sendspark', 'team2'),
  ('MI-H3', 'Alertas Slack operativas',     '2026-04-21', 'Canal #leads-b2b-calientes funcionando con equipo suscrito', 'team2'),
  ('MI-H4', 'Sistema B2B en vivo',          '2026-04-22', 'Sendspark + HubSpot + Slack activos en conversaciones reales', 'team2'),
  ('MI-H5', 'Retrospectiva y decision Mes 2','2026-05-08', 'Presentacion entregada. Decision go/no-go escalar a 1,000+ marcas', 'team2');

-- Update progress for completed tasks (no checklist yet, so set manually)
UPDATE tasks SET progress_pct = 100 WHERE status = 'completada' AND team_id = 'team2';
