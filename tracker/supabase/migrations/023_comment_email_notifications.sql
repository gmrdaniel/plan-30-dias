-- Migration 023: Email notifications when someone comments on a task
-- Pattern copied from crm-laneta-v2-02, simplified for tracker

-- 0. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- 1. Add email to team_members
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email text;

UPDATE team_members SET email = 'daniel@laneta.com' WHERE short_name = 'Daniel';
UPDATE team_members SET email = 'gabriel@laneta.com' WHERE short_name = 'Gabriel';
UPDATE team_members SET email = 'lillian@laneta.com' WHERE short_name = 'Lillian';
UPDATE team_members SET email = 'dayana@laneta.com' WHERE short_name = 'Dayana';
UPDATE team_members SET email = 'eugenia@laneta.com' WHERE short_name = 'Eugenia';

-- 2. Create notifications table (simplified)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES team_members(id),
  task_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  author_name text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  retry_count integer NOT NULL DEFAULT 0,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_pending ON notifications (status, created_at) WHERE status = 'PENDING';

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_notifications" ON notifications FOR SELECT USING (true);
GRANT SELECT ON notifications TO anon, authenticated;

-- 3. Trigger: on INSERT into task_comments, notify all assigned members (except author)
CREATE OR REPLACE FUNCTION notify_on_task_comment()
RETURNS trigger AS $$
DECLARE
  v_task_title text;
  v_author_name text;
  v_comment_preview text;
  v_member record;
BEGIN
  -- Get task title
  SELECT title INTO v_task_title FROM tasks WHERE task_id = NEW.task_id;

  -- Get author name
  SELECT short_name INTO v_author_name FROM team_members WHERE id = NEW.author_id;

  -- Preview of comment (first 100 chars)
  v_comment_preview := LEFT(NEW.content, 100);
  IF LENGTH(NEW.content) > 100 THEN
    v_comment_preview := v_comment_preview || '...';
  END IF;

  -- Notify all members assigned to this task (except the comment author)
  FOR v_member IN
    SELECT tm.id, tm.email, tm.short_name
    FROM task_assignments ta
    JOIN team_members tm ON tm.id = ta.member_id
    WHERE ta.task_id = NEW.task_id
      AND ta.member_id != NEW.author_id
      AND tm.email IS NOT NULL
  LOOP
    INSERT INTO notifications (recipient_id, task_id, title, message, author_name)
    VALUES (
      v_member.id,
      NEW.task_id,
      v_author_name || ' comentó en ' || NEW.task_id || ': ' || COALESCE(v_task_title, ''),
      v_comment_preview,
      v_author_name
    );
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block the comment insert
  RAISE WARNING 'notify_on_task_comment failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS zzz_notify_on_task_comment ON task_comments;
CREATE TRIGGER zzz_notify_on_task_comment
  AFTER INSERT ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_task_comment();

-- 4. Helper function to call edge function (used by cron)
CREATE OR REPLACE FUNCTION call_send_comment_emails()
RETURNS void AS $$
DECLARE
  v_response_status int;
  v_url text;
  v_service_key text;
BEGIN
  v_url := current_setting('app.settings.supabase_url', true);
  v_service_key := current_setting('app.settings.service_role_key', true);

  IF v_url IS NULL OR v_service_key IS NULL THEN
    -- Fallback: try direct URL
    v_url := 'https://nvbanvwibmghxroybjxp.supabase.co';
    -- Cannot proceed without service key
    RAISE WARNING 'Missing app.settings for edge function call';
    RETURN;
  END IF;

  SELECT status INTO v_response_status
  FROM net.http_post(
    url := v_url || '/functions/v1/send-comment-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body := '{}'::jsonb
  );

  IF v_response_status >= 400 THEN
    RAISE WARNING 'Edge function returned status %', v_response_status;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'call_send_comment_emails failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Cron job: process pending notifications every 5 minutes
SELECT cron.schedule(
  'process-comment-emails',
  '*/5 * * * *',
  $$SELECT call_send_comment_emails()$$
);
