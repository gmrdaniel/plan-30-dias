-- 019: Enable edit and delete for task_comments
-- Adds updated_at column, RLS policies for UPDATE/DELETE, and grants

-- Add updated_at column
ALTER TABLE task_comments ADD COLUMN updated_at timestamptz DEFAULT NULL;

-- RLS policies: anyone can update/delete (same as insert policy)
CREATE POLICY "public_update_comments" ON task_comments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_comments" ON task_comments FOR DELETE USING (true);

-- Grants
GRANT UPDATE, DELETE ON task_comments TO anon, authenticated;
