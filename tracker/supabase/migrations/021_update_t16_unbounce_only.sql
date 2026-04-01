-- Migration 014: Update T16 checklist — Leadpages replaced by Unbounce for both microsites

-- Update entregable: Micrositio Creadores now in Unbounce (not Leadpages)
UPDATE task_checklist
SET description = 'Micrositio Creadores live en Unbounce con DTR funcionando'
WHERE task_id = 'T16' AND category = 'entregable' AND description LIKE '%Leadpages%';

-- Update criterio: same change
UPDATE task_checklist
SET description = 'Micrositio Creadores: DTR funciona, responsive, form -> HubSpot'
WHERE task_id = 'T16' AND category = 'criterio' AND description LIKE '%Micrositio Creadores%';

-- Add new entregables
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T16', 'entregable', 'Middleware webhook (Edge Function) recibe datos de Unbounce/Outgrow y envia a HubSpot API', 5),
  ('T16', 'entregable', 'Columna micrositio_url generada en Clay con todos los params DTR', 6);

-- Add new criterios
INSERT INTO task_checklist (task_id, category, description, sort_order) VALUES
  ('T16', 'criterio', 'Hidden fields capturan params del URL correctamente', 7),
  ('T16', 'criterio', 'Integracion nativa HubSpot O webhook funcionan (al menos uno)', 8);

-- Update T16 task blocked_by to include T02
UPDATE tasks
SET blocked_by = '{T10,T02}'
WHERE task_id = 'T16';
