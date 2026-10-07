-- Align legacy checks with the job form. Keep 'active' for older integrations.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('published', 'active', 'closed', 'draft'));
ALTER TABLE public.jobs ALTER COLUMN status SET DEFAULT 'published';

ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_job_type_check
  CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'temporary'));

NOTIFY pgrst, 'reload schema';
COMMIT;
