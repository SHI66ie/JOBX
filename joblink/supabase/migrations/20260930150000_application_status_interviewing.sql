-- The live applications_status_check predates the interview stage, so moving an applicant
-- to "interviewing" failed. Allow every status the app uses.
--   supabase db query --linked -f supabase/migrations/20260930150000_application_status_interviewing.sql
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending', 'reviewed', 'interviewing', 'accepted', 'rejected'));

COMMIT;

-- Verify: expect interviewing in the list.
SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conname = 'applications_status_check';
