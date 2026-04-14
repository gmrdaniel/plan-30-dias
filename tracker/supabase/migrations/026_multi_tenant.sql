-- Migration 026: Multi-tenant support
-- Adds team_id to core tables so multiple teams coexist in one project.
-- Existing data defaults to 'team3' (Infraestructura). Team 2 is Marketing Influencers.

-- 1. Add team_id columns (default team3 for existing rows)
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS team_id text NOT NULL DEFAULT 'team3';
ALTER TABLE tasks        ADD COLUMN IF NOT EXISTS team_id text NOT NULL DEFAULT 'team3';
ALTER TABLE milestones   ADD COLUMN IF NOT EXISTS team_id text NOT NULL DEFAULT 'team3';

-- 2. Expand phase check constraint to accept team2 phases (semana_3, semana_4)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_phase_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_phase_check
  CHECK (phase IN ('pre_sprint', 'semana_1', 'semana_2', 'semana_3', 'semana_4', 'semana_3_4', 'cierre'));

-- 3. Indexes for fast per-team queries
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team        ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_milestones_team   ON milestones(team_id);
