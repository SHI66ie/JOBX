-- Run with an administrative SQL connection. All test rows are rolled back.
-- Requires at least one existing company and its owner profile.
BEGIN;
DO $$
DECLARE
  company uuid;
  owner_id uuid;
  job_id uuid;
  job_status text;
  kind text;
BEGIN
  SELECT c.id, c.created_by INTO company, owner_id
  FROM public.companies c JOIN public.users u ON u.id = c.created_by
  LIMIT 1;
  IF company IS NULL THEN
    RAISE EXCEPTION 'Posting test needs an existing company and owner profile';
  END IF;

  PERFORM set_config('request.jwt.claim.sub', owner_id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;

  FOREACH job_status IN ARRAY ARRAY['published', 'draft', 'closed', 'active'] LOOP
    FOREACH kind IN ARRAY ARRAY['full-time', 'part-time', 'contract', 'internship', 'temporary'] LOOP
      INSERT INTO public.jobs (company_id, employer_id, title, description, requirements, location, type, job_type, salary_range, status)
      VALUES (company, owner_id, 'Rollback-only posting test', '<p><strong>Formatted description</strong></p>', 'Test requirement', 'Remote', kind, kind, 'Test pay', job_status)
      RETURNING id INTO job_id;

      IF NOT EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND status = job_status) THEN
        RAISE EXCEPTION 'Employer cannot read back the newly posted job';
      END IF;
      UPDATE public.jobs SET status = 'draft' WHERE id = job_id;
      UPDATE public.jobs SET status = 'published' WHERE id = job_id;
    END LOOP;
  END LOOP;

  -- Invalid values must still be rejected.
  BEGIN
    UPDATE public.jobs SET status = 'invalid-status' WHERE id = job_id;
    RAISE EXCEPTION 'Invalid status was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    UPDATE public.jobs SET job_type = 'invalid-type' WHERE id = job_id;
    RAISE EXCEPTION 'Invalid job type was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
ROLLBACK;
SELECT 'PASS: 20 status/type combinations, employer readback, draft/publish updates, invalid-value rejection; all test rows rolled back' AS result;
