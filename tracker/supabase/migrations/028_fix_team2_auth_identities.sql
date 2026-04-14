-- Migration 028: Fix team2 auth login
-- Newer Supabase auth requires auth.identities.email to be populated explicitly
-- and flags like is_sso_user / is_anonymous on auth.users to be non-null.
-- Without these, GoTrue returns "Database error querying schema" on signInWithPassword.

-- 1. Ensure is_sso_user / is_anonymous are set on the team2 users (safe no-op if already correct)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='users' AND column_name='is_sso_user') THEN
    UPDATE auth.users SET is_sso_user = false
    WHERE id IN (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      'dddddddd-dddd-dddd-dddd-dddddddddddd'
    ) AND is_sso_user IS DISTINCT FROM false;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='users' AND column_name='is_anonymous') THEN
    UPDATE auth.users SET is_anonymous = false
    WHERE id IN (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      'dddddddd-dddd-dddd-dddd-dddddddddddd'
    ) AND is_anonymous IS DISTINCT FROM false;
  END IF;
END $$;

-- 2. Fill the email column on auth.identities if it exists (added in supabase-auth 2024+)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='identities' AND column_name='email') THEN
    UPDATE auth.identities SET email = 'pepe@laneta.com'       WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND email IS NULL;
    UPDATE auth.identities SET email = 'mafer@laneta.com'      WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND email IS NULL;
    UPDATE auth.identities SET email = 'robert@laneta.com'     WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' AND email IS NULL;
    UPDATE auth.identities SET email = 'marialaura@laneta.com' WHERE user_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' AND email IS NULL;
  END IF;
END $$;

-- 3. Also backfill team3 identities (in case the column was added after their creation)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='identities' AND column_name='email') THEN
    UPDATE auth.identities SET email = 'daniel@laneta.com'  WHERE user_id = '11111111-1111-1111-1111-111111111111' AND email IS NULL;
    UPDATE auth.identities SET email = 'gabriel@laneta.com' WHERE user_id = '22222222-2222-2222-2222-222222222222' AND email IS NULL;
    UPDATE auth.identities SET email = 'lillian@laneta.com' WHERE user_id = '33333333-3333-3333-3333-333333333333' AND email IS NULL;
    UPDATE auth.identities SET email = 'dayana@laneta.com'  WHERE user_id = '44444444-4444-4444-4444-444444444444' AND email IS NULL;
    UPDATE auth.identities SET email = 'eugenia@laneta.com' WHERE user_id = '55555555-5555-5555-5555-555555555555' AND email IS NULL;
  END IF;
END $$;
