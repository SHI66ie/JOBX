-- Bring an existing jobs table up to date without replacing jobs or RLS policies.
-- Run in the SQL Editor for the same Supabase project used by the app.
BEGIN;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS salary_range TEXT,
  ADD COLUMN IF NOT EXISTS requirements TEXT;

-- Associate older jobs only where their employer owns exactly one company.
-- Keep any existing association intact.
UPDATE public.jobs AS j
SET company_id = c.id
FROM public.companies AS c
WHERE j.company_id IS NULL
  AND j.employer_id = c.created_by
  AND (SELECT count(*) FROM public.companies AS owned WHERE owned.created_by = c.created_by) = 1;

CREATE INDEX IF NOT EXISTS jobs_company_id_idx ON public.jobs (company_id);

-- PostgREST must refresh its metadata after the column changes commit.
NOTIFY pgrst, 'reload schema';
COMMIT;

-- Verify the fields used by the posting form are available.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'jobs'
  AND column_name IN ('company_id', 'employer_id', 'type', 'job_type', 'salary_range', 'requirements')
ORDER BY column_name;
