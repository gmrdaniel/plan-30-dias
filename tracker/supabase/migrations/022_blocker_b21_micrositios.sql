-- Migration 022: Add blocker B21 — micrositios por definir con Mery

INSERT INTO blockers (code, category, question, context, owner, asks_to, needed_by, related_tasks, status)
VALUES (
  'B21',
  'Dependencia Equipo 2',
  'Definir los 5 micrositios: productos, estructura y contenido con el equipo de Mery',
  'T16 tiene 5 micrositios preliminares (1 B2B The Ads Factory + 2 Linguana + 2 Meta) pero los nombres de productos, wireframes y contenido deben validarse con Equipo 2 (Mery) antes de que Lillian construya en Unbounce. Sin esta definición, Lillian puede preparar la estructura técnica (DTR, forms, embeds) pero no el contenido final.',
  'Daniel',
  'Mery (Equipo 2)',
  '15 Abr (2 días antes de que Lillian empiece a construir)',
  'T16',
  'pendiente'
);
