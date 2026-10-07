-- Apply flow: richer applications + live delivery to employers.
--   supabase db query --linked -f supabase/migrations/20260930130000_apply_flow.sql
BEGIN;

-- What the candidate sent, captured at apply time so later profile edits don't change it.
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS candidate_title TEXT,
  ADD COLUMN IF NOT EXISTS candidate_skills TEXT[] NOT NULL DEFAULT '{}';

-- Stream new applications to employers. Realtime applies the existing SELECT policies,
-- so an employer only receives applications for their own jobs.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;

-- Verify: expect the two new columns and applications in the realtime publication.
SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'applications';
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
