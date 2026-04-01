-- Migration 017: Fix B01, B03, B13 with correct domain info

-- B01: 4 domains confirmed + 1 to buy
UPDATE blockers SET
  question = '4 dominios confirmados + 1 dominio por comprar para completar los 5 de cold outreach',
  context = 'Dominios confirmados para cold outreach: (1) elevnhub.me, (2) elevnpro.me, (3) lanetahub.com, (4) lanetapro.com. Dominio 5: POR DEFINIR Y COMPRAR — Daniel o equipos deben elegir nombre y compartir opciones. Dominios excluidos: laneta.com (principal) y elevn.me (operación). Cuentas existentes en operación (NO tocar): apply@creators.elevnpro.me, apply@creators.elevnhub.me, apply@creators.elevn.me, apply@creators.lanetahub.com.',
  status = 'pendiente',
  answer = null,
  answered_at = null
WHERE code = 'B01';

-- B03: 15 accounts on 4 confirmed + 1 pending domain
UPDATE blockers SET
  question = 'Crear 15 cuentas de email nuevas: 4 dominios listos + 1 dominio pendiente de compra',
  context = 'Se necesitan 15 cuentas nuevas (3 por dominio) en 5 dominios. 4 ya comprados: elevnhub.me, elevnpro.me, lanetahub.com, lanetapro.com. 1 pendiente de compra (B01). Subdominios existentes disponibles: creators.*, partners.*, go.*, hello.*. Los nombres de sender y subdominios a usar los definen Equipo 1 y 2 (ver B13). Las cuentas existentes (apply@, hello@) NO se tocan. Una vez definidos nombres + comprado el 5to dominio, Gabriel configura SPF/DKIM/DMARC y conecta a Smartlead warmup.'
WHERE code = 'B03';

-- B13: add available subdomains list
UPDATE blockers SET
  question = 'Definir nombres de sender + subdominios para 15 cuentas — hay subdominios existentes disponibles',
  context = 'Para las 15 cuentas de cold outreach, los equipos deben definir: (1) Nombres de sender: 3 nombres para B2B + 3 para Creadores (ej: daniel, greg, taylor u otros). (2) Subdominios: elegir entre existentes o crear nuevos. Subdominios YA creados en Google Workspace: creators.* (en 4 dominios), partners.* (en lanetapro y lanetahub), go.* (en elevnhub y elevnpro), hello.* (en elevn). Formato: nombre@subdominio.dominio. Equipo 1 (Pepe) define B2B. Equipo 2 (Mery) define Creadores. Las 6 filas pendientes del spreadsheet (marcadas "sugeridos por mery") deben confirmarse aquí.'
WHERE code = 'B13';
