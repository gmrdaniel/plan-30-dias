-- Migration 016: Unify B01+B02, update B03 and B13

-- Unify B01+B02 into B01
UPDATE blockers SET
  question = 'Visto bueno de dominios: 5 dominios existentes para cold outreach, laneta.com excluido',
  context = 'Dominios disponibles para cold outreach (YA comprados): elevnpro.me, elevnhub.me, elevn.me, lanetahub.com, lanetapro.com. Dominio excluido: laneta.com (principal, no usar para cold). Cuentas existentes en operación (NO tocar): apply@creators.elevnpro.me, apply@creators.elevnhub.me, apply@creators.elevn.me, apply@creators.lanetahub.com. Cuentas a eliminar de laneta.com: daniel.r@, greg@, taylor@ (nombres se reciclan en dominios nuevos). Pendiente: Equipo 1/2 debe definir nombres de sender y subdominios (ver B13).',
  status = 'respondida',
  answer = 'Los 5 dominios ya están comprados. laneta.com se excluye. Las 4 cuentas activas de operación no se tocan. Se crean 15 cuentas nuevas en estos 5 dominios.',
  answered_at = now()
WHERE code = 'B01';

-- Delete B02 (absorbed into B01)
DELETE FROM blockers WHERE code = 'B02';

-- Update B03: 15 cuentas → realmente son 15 nuevas por crear
UPDATE blockers SET
  question = 'Crear 15 cuentas de email nuevas para cold outreach en los 5 dominios existentes',
  context = 'Se necesitan 15 cuentas nuevas (3 por dominio) en: elevnpro.me, elevnhub.me, elevn.me, lanetahub.com, lanetapro.com. Las cuentas existentes (apply@, hello@) NO se tocan — son operación. Los nombres de sender y subdominios los define Equipo 1 (Pepe) y Equipo 2 (Mery) — ver B13. Una vez definidos, Gabriel configura SPF/DKIM/DMARC y conecta a Smartlead warmup. No se compran dominios nuevos.'
WHERE code = 'B03';

-- Update B13: ahora incluye nombres de sender Y subdominios, responsabilidad de otros equipos
UPDATE blockers SET
  question = 'Equipos 1 y 2 deben definir: nombres de sender + subdominios para las 15 cuentas de outreach',
  context = 'Para crear las 15 cuentas de cold outreach, los equipos deben entregar: (1) Equipo 1 (Pepe): 3 nombres de sender para B2B (ej: daniel, greg, taylor u otros) + subdominio preferido (ej: "partners", "team", "outreach"). (2) Equipo 2 (Mery): 3 nombres de sender para Creadores + subdominio preferido (ej: "creators", "join", "team"). Formato final: nombre@subdominio.dominio (ej: daniel@partners.lanetapro.com). Los 5 dominios ya están definidos (B01). Sin estos nombres, no se pueden crear las cuentas ni iniciar warmup. Las 6 filas pendientes del spreadsheet (marcadas "sugeridos por mery") deben confirmarse aquí.',
  asks_to = 'Equipo 1 (Pepe) + Equipo 2 (Mery)',
  needed_by = '4 Abr (pre-sprint, urgente para iniciar warmup el 6 Abr)',
  related_tasks = 'T01, T04'
WHERE code = 'B13';
