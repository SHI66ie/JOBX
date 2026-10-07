-- ============================================================
-- JOBX / JOMP - CTO Hardening, Performance Indexes & Storage Migration
-- Migration: 20261007_cto_hardening_and_indexes.sql
-- Safe and idempotent to run in Supabase SQL Editor
-- ============================================================

-- 1. ADD MISSING CANDIDATE PROFILE COLUMNS TO public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS jobs_completed INT DEFAULT 0;

-- 2. ADD MISSING COMPANY COLUMNS (IF NOT ALREADY ADDED)
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS hiring_for TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS business_registration TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

-- 3. FIX ROLE ESCALATION TRIGGER (PERMIT CANDIDATE <-> EMPLOYER, BLOCK UNAUTHORIZED ADMIN)
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow setting role to 'admin' if requested by service_role or an existing admin
    IF NEW.role = 'admin' THEN
      IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        ) THEN
          RAISE EXCEPTION 'Unauthorized: Only platform administrators can grant admin privileges.';
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_role ON public.users;
CREATE TRIGGER trg_protect_user_role
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_role();

-- 4. PERFORMANCE & FOREIGN KEY INDEXES
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);

-- 5. STORAGE BUCKET CONFIGURATION FOR RESUMES
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Authenticated users can upload CV" ON storage.objects;
CREATE POLICY "Authenticated users can upload CV"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update own CV" ON storage.objects;
CREATE POLICY "Users can update own CV"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid()::text = owner::text)
  );

DROP POLICY IF EXISTS "Public can view resumes" ON storage.objects;
CREATE POLICY "Public can view resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes');
