-- Migration 029: Force all nullable/defaulted token columns on team2 auth users
-- "Database error querying schema" from GoTrue often caused by NULL values in
-- columns that are scanned as non-null strings in Go (e.g. confirmation_token,
-- recovery_token, email_change_token_*, phone_change_token).

DO $$
DECLARE
  col text;
  uids uuid[] := ARRAY[
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid
  ];
  text_cols text[] := ARRAY[
    'confirmation_token','recovery_token','email_change_token_new',
    'email_change_token_current','email_change','phone_change_token',
    'phone_change','reauthentication_token'
  ];
BEGIN
  FOREACH col IN ARRAY text_cols LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='auth' AND table_name='users' AND column_name=col) THEN
      EXECUTE format(
        'UPDATE auth.users SET %I = COALESCE(%I, '''') WHERE id = ANY($1)',
        col, col
      ) USING uids;
    END IF;
  END LOOP;
END $$;
