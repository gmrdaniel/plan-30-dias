-- Migration 003: Create auth users + fix table grants
-- Fix: ensure anon and authenticated roles can access tables

-- 1. GRANTS on all tracker tables
GRANT SELECT ON team_members TO anon, authenticated;
GRANT SELECT, UPDATE ON tasks TO anon, authenticated;
GRANT SELECT ON task_assignments TO anon, authenticated;
GRANT SELECT, UPDATE ON task_checklist TO anon, authenticated;
GRANT SELECT, INSERT ON task_comments TO anon, authenticated;
GRANT SELECT, UPDATE ON milestones TO anon, authenticated;

-- 2. Create auth users for each team member
-- Using fixed UUIDs that match team_members.id so we can link them
-- Passwords: nombre2026 (e.g., daniel2026)

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated',
    'daniel@laneta.com',
    crypt('daniel2026', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Daniel Ramirez","short_name":"Daniel"}',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated',
    'gabriel@laneta.com',
    crypt('gabriel2026', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Gabriel Pinero","short_name":"Gabriel"}',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated', 'authenticated',
    'lillian@laneta.com',
    crypt('lillian2026', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Lillian Lucio","short_name":"Lillian"}',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated', 'authenticated',
    'dayana@laneta.com',
    crypt('dayana2026', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Dayana Vizcaya","short_name":"Dayana"}',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated', 'authenticated',
    'eugenia@laneta.com',
    crypt('eugenia2026', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Eugenia Garcia","short_name":"Eugenia"}',
    ''
  );

-- 3. Create identities for each user (required for email login)
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'daniel@laneta.com', '{"sub":"11111111-1111-1111-1111-111111111111","email":"daniel@laneta.com"}', 'email', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'gabriel@laneta.com', '{"sub":"22222222-2222-2222-2222-222222222222","email":"gabriel@laneta.com"}', 'email', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'lillian@laneta.com', '{"sub":"33333333-3333-3333-3333-333333333333","email":"lillian@laneta.com"}', 'email', now(), now(), now()),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'dayana@laneta.com', '{"sub":"44444444-4444-4444-4444-444444444444","email":"dayana@laneta.com"}', 'email', now(), now(), now()),
  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'eugenia@laneta.com', '{"sub":"55555555-5555-5555-5555-555555555555","email":"eugenia@laneta.com"}', 'email', now(), now(), now());
