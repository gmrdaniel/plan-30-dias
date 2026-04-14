-- Migration 028: Fix team2 login
-- Newer Supabase auth (is_sso_user, is_anonymous) columns are NOT NULL.
-- If these are NULL for a user, GoTrue returns "Database error querying schema"
-- when queries try to build the user record.
-- Note: auth.identities.email is a generated column, cannot be updated directly.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='users' AND column_name='is_sso_user') THEN
    UPDATE auth.users SET is_sso_user = false WHERE is_sso_user IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='users' AND column_name='is_anonymous') THEN
    UPDATE auth.users SET is_anonymous = false WHERE is_anonymous IS NULL;
  END IF;
END $$;
