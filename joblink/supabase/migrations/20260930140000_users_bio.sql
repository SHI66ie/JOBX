-- The live users table predates the bio column in schema.sql. Employer applicant queries
-- select candidate bios, so without it they fail and show no applicants.
--   supabase db query --linked -f supabase/migrations/20260930140000_users_bio.sql
BEGIN;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Backfill from what candidates already saved to their auth profile.
UPDATE public.users AS u
SET bio = NULLIF(trim(a.raw_user_meta_data->>'bio'), '')
FROM auth.users AS a
WHERE a.id = u.id
  AND u.bio IS NULL
  AND NULLIF(trim(a.raw_user_meta_data->>'bio'), '') IS NOT NULL;

NOTIFY pgrst, 'reload schema';
COMMIT;

-- Verify: expect bio in the column list and a count of backfilled bios.
SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) AS columns,
       (SELECT count(*) FROM public.users WHERE bio IS NOT NULL) AS with_bio
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users';
