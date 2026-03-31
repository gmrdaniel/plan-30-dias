-- Migration 006: Blockers / questions tracking

create table blockers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  category text not null,
  question text not null,
  context text not null,
  owner text not null,
  asks_to text not null,
  needed_by text not null,
  related_tasks text not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'respondida', 'aprobada')),
  answer text,
  answered_at timestamptz,
  created_at timestamptz default now()
);

alter table blockers enable row level security;
create policy "public_read_blockers" on blockers for select using (true);
create policy "public_update_blockers" on blockers for update using (true);
GRANT SELECT, UPDATE ON blockers TO anon, authenticated;

-- Seed blockers
INSERT INTO blockers (code, category, question, context, owner, asks_to, needed_by, related_tasks) VALUES

-- B01: Dominios
('B01', 'Definicion',
 'Visto bueno de dominios existentes: se mantienen los 6 actuales?',
 'Dominios actuales: elevnpro.me (creators), elevnhub.me (creators), elevn.me (creators), lanetahub.com (creators), laneta.com (corporativo x3), lanetapro.com (partners). Ninguno debe usarse para cold outreach. Confirmar que se mantienen y que se compran 5 nuevos en GoDaddy.',
 'Daniel', 'Direccion', '4 Abr (pre-sprint)', 'T01'),

-- B02: Dominios nuevos
('B02', 'Definicion',
 'Aprobacion de 5 dominios nuevos para cold outreach: cuales se compran?',
 'Propuesta: laneta-media.com, globalreview-content.com, globalreview-media.com, laneta-creators.com, elevn-creators.com. Criterio: parecidos a la marca, .com, sin palabras spam. Daniel puede proponer alternativas.',
 'Daniel', 'Direccion / Daniel decide', '4 Abr (pre-sprint)', 'T01'),

-- B03: Cuentas email
('B03', 'Definicion',
 'Aprobacion de 15 cuentas de email nuevas para cold outreach',
 'Propuesta de 15 cuentas (3 por dominio nuevo): B2B outreach (9 cuentas con nombres daniel/greg/taylor en 3 dominios) + Creator outreach (6 cuentas team/join/apply en 2 dominios). Ver spreadsheet de cuentas para detalle completo. Se necesitan nombres de sender aprobados.',
 'Daniel', 'Direccion / Daniel decide', '4 Abr (pre-sprint)', 'T01'),

-- B04: ICP B2B
('B04', 'Dependencia',
 'Datos de ICP B2B: industrias, tamano de acuerdo, titulos de decision, objeciones',
 'Equipo 1 (Marketing de Influencers / Pepe) debe entregar: industrias objetivo, rango de tamano de acuerdo ($2K-$12K), titulos de tomadores de decision, tamano de empresa, objeciones comunes, geolocalizacion, keywords de exclusion y 1 caso de exito de referencia. Sin esto, Gabriel no puede configurar filtros de Clay.',
 'Eugenia (recopila)', 'Equipo 1 (Pepe)', '7 Abr (Dia 2)', 'T04, T06, T11'),

-- B05: ICP Creadores
('B05', 'Dependencia',
 'Datos de ICP Creadores: plataformas, suscriptores minimos, categorias, razones de desercion',
 'Equipo 2 (Creadores / Mery) debe entregar: plataformas objetivo, suscriptores minimo, idiomas, categorias de contenido, ingreso mensual minimo, razones de desercion, tiempo a monetizacion, tasa de adopcion de servicios y pain points principales.',
 'Eugenia (recopila)', 'Equipo 2 (Mery)', '7 Abr (Dia 2)', 'T04, T06, T11'),

-- B06: Audio clonacion
('B06', 'Dependencia',
 'Audio de 5 min para clonacion de voz con ElevenLabs',
 'Equipo 2 debe coordinar grabacion: WAV 44.1kHz, habitacion silenciosa, microfono profesional, un solo hablante, espanol, tono conversacional. Sin esto, el clon de voz no se puede entrenar y las notas de voz automaticas no funcionan.',
 'Dayana (recibe)', 'Equipo 2 (Mery)', '10 Abr (Dia 5)', 'T09'),

-- B07: Templates email B2B
('B07', 'Dependencia',
 'Aprobacion de 4 plantillas de email frio B2B',
 'Equipo 4 (Contenido) escribe las 4 plantillas → Equipo 1 (Pepe) aprueba → Equipo 3 carga en Smartlead. Necesitamos: Email 1 (auditoria), Email 2 (seguimiento), Email 3 (caso estudio/FOMO), Email 4 (breakup). Texto plano, <100 palabras cada uno.',
 'Daniel (carga)', 'Equipo 4 → Equipo 1 aprueba', '20 Abr (Dia 11)', 'T07, T14'),

-- B08: Flujos ManyChat copy
('B08', 'Contenido',
 'Copy y flujos de ManyChat: necesitamos los textos de cada paso del chatbot',
 'Los flujos de ManyChat (WhatsApp cualificacion + Instagram DM reclutamiento) necesitan copy aprobado. Tenemos la estructura (T12) pero falta: textos exactos de cada mensaje, tono de voz, proyecciones a mostrar, video de 15s para IG DM. Quien define el copy: Equipo 4 o Dayana directamente?',
 'Dayana (construye)', 'Equipo 4 / Dayana define', '13 Abr (Dia 6)', 'T08, T12'),

-- B09: Flujos ManyChat aprobacion
('B09', 'Dependencia',
 'Aprobacion de flujos ManyChat por Equipo 2 antes de lanzar',
 'Equipo 2 (Mery) debe revisar y aprobar los flujos de WhatsApp e Instagram DM antes del lanzamiento en Semana 3. Criterios: tono adecuado, preguntas correctas, umbrales de calificacion, links funcionan.',
 'Dayana (envia)', 'Equipo 2 (Mery)', '16 Abr (Dia 9)', 'T12, DTO-04'),

-- B10: Video auditoria Sendspark
('B10', 'Dependencia',
 'Video maestro de auditoria de 75 segundos para Sendspark',
 'Equipo 1 (Pepe o lider MI) debe grabar video de compartir pantalla recorriendo un listado de Amazon de ejemplo. Este es el activo B2B mas importante. Sendspark lo personaliza con variables dinamicas por prospecto.',
 'Daniel (coordina)', 'Equipo 1 (Pepe)', '21 Abr (Dia 12)', 'T09'),

-- B11: Presupuesto Clay upgrade
('B11', 'Infraestructura',
 'Aprobacion de upgrade Clay $149 → $495/mes',
 'Sin el upgrade, la cascada de enriquecimiento no tiene creditos suficientes para 1,000 prospectos. Es el gasto individual mas grande. Daniel puede aprobar pero debe comunicar a los otros equipos.',
 'Daniel', 'Daniel decide (comunica a equipos)', '6 Abr (Dia 1)', 'T06, T11'),

-- B12: Micrositios aprobacion
('B12', 'Dependencia',
 'Aprobacion de micrositios B2B y Creadores por Equipos 1 y 2',
 'Lillian construye los micrositios (Unbounce B2B + Leadpages Creadores). Los equipos 1 y 2 deben revisar: datos correctos, calculos de ingresos, proyecciones, tono, CTA. Sin aprobacion, no se pueden usar en las secuencias.',
 'Lillian (construye)', 'Equipo 1 + Equipo 2', '21 Abr (Dia 12)', 'T16, DTO-10'),

-- B13: Nombres sender correos
('B13', 'Definicion',
 'Definir nombres de sender para los 15 correos de outreach',
 'Propuesta actual: daniel, greg, taylor para B2B (3 dominios = 9 cuentas) + team, join, apply para creadores (2 dominios = 6 cuentas). Necesitamos confirmar: estos nombres son los que queremos que vea el destinatario? Hay personas reales detras o son aliases?',
 'Daniel', 'Daniel decide', '4 Abr (pre-sprint)', 'T01'),

-- B14: WhatsApp Business API
('B14', 'Infraestructura',
 'Numero de telefono y cuenta para WhatsApp Business API (ManyChat)',
 'ManyChat necesita una cuenta de WhatsApp Business API verificada. Necesitamos: numero de telefono dedicado (no el personal), verificacion de Facebook Business, nombre de negocio aprobado por Meta. La aprobacion puede tardar 24-48h.',
 'Dayana (configura)', 'Daniel (provee numero/cuenta)', '10 Abr (Dia 5)', 'T08');
