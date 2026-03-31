-- Migration 008: Add blockers for test data and ICP job titles

INSERT INTO blockers (code, category, question, context, owner, asks_to, needed_by, related_tasks) VALUES

('B15', 'Definicion',
 'Definir job titles objetivo del ICP B2B para filtros de Clay y secuencias',
 'Los datos de prueba (CSV empleados) muestran 867 contactos con cargos reales como CMO, Digital Marketing Specialist, Head of E-commerce, Brand Manager, Recruitment Assistant, Ambassador, etc. Necesitamos definir cuales son los 3-5 cargos prioritarios para filtrar en Clay y personalizar las secuencias de Smartlead/Expandi. Propuesta inicial: CMO, VP Marketing, Head of E-commerce, Brand Manager, Marketing Director. Confirmar con Equipo 1 (Pepe).',
 'Eugenia (documenta)', 'Equipo 1 (Pepe) + Daniel', '7 Abr (Dia 2)', 'T04, T06, T11'),

('B16', 'Definicion',
 'Datos de 22 empleados internos para swap en pruebas de flujo (email, telefono, LinkedIn)',
 'Para probar las secuencias de Smartlead, Expandi, ManyChat, SMS y llamadas sin contactar prospectos reales, necesitamos los datos de los 22 empleados de la empresa: nombre, email personal, telefono, LinkedIn, WhatsApp, Instagram (opcional). Estos datos se usaran SOLO para pruebas — se insertan en lugar de los datos reales de prospectos en los flujos de test.',
 'Daniel (coordina)', 'Todos los empleados', '13 Abr (Dia 6)', 'T14'),

('B17', 'Definicion',
 'Seleccionar 20 empresas del CSV de prueba como fixture para validacion de flujos',
 'De las 60 empresas del CSV (01-empresas), seleccionar 20 representativas que cubran: diferentes industrias, diferentes tamanos, con y sin video, US y LATAM, con datos completos e incompletos. Estas 20 se usan como datos semilla en Clay para validar la cascada, el sync a Supabase, el push a Smartlead/Expandi y los micrositios.',
 'Gabriel (selecciona)', 'Daniel aprueba', '8 Abr (Dia 3)', 'T06, T11, T14');
