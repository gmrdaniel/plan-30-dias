-- Migration 024: Fix legacy "Slack" references in task_checklist (should be Telegram)
-- These items were edited in the database after the initial seed and missed previous cleanups

UPDATE task_checklist
SET description = 'Los 4 lideres de equipo confirman acceso por Telegram'
WHERE task_id = 'T02'
  AND description = 'Los 4 lideres de equipo confirman acceso por Slack';

UPDATE task_checklist
SET description = 'Link compartido en Telegram'
WHERE task_id = 'T04'
  AND description = 'Link compartido en Slack';
