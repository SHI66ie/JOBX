-- Make CVs private. Run after 20260930_resumes_bucket.sql, in the SQL Editor or with:
--   supabase db query --linked -f supabase/migrations/20260930120000_private_resumes.sql
-- The app now stores the object path (<user id>/resume-<ts>.<ext>) and signs short-lived links.
BEGIN;

UPDATE storage.buckets SET public = false WHERE id = 'resumes';

-- Applications store the exact CV that was sent. Convert any public URLs to object paths
-- so the employer policy below can match them.
UPDATE public.applications
SET resume_url = regexp_replace(resume_url, '^.*/storage/v1/object/(public|sign)/resumes/([^?#]+).*$', '\2')
WHERE resume_url ~ '/storage/v1/object/(public|sign)/resumes/';

-- Employers can open (sign links for) exactly the CV attached to an application for one of their jobs.
-- Owners keep access through "Users can read own resumes".
DROP POLICY IF EXISTS "Employers can read resumes sent to their jobs" ON storage.objects;
CREATE POLICY "Employers can read resumes sent to their jobs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'resumes'
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      LEFT JOIN public.companies c ON c.id = j.company_id
      WHERE a.resume_url = storage.objects.name
        AND (j.employer_id = auth.uid() OR c.created_by = auth.uid())
    )
  );

COMMIT;

-- Verify: expect public = false and both read policies listed.
SELECT id, public FROM storage.buckets WHERE id = 'resumes';
SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname ILIKE '%resumes%' ORDER BY policyname;
