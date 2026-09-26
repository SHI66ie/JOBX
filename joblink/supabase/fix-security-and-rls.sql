-- ============================================================
-- JOBX / Joblink - Security, RLS & Data Integrity Migration
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- 1. PREVENT PRIVILEGE ESCALATION ON USER ROLES
-- Prevents standard users from issuing updates that escalate their own role to 'admin'
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow service_role key to manage roles freely
    IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
      -- Only authenticated admins can modify user roles
      IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
      ) THEN
        RAISE EXCEPTION 'Unauthorized: Only platform administrators can change user roles.';
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

-- 2. FIX USERS SELECT POLICY (EMPLOYER APPLICANT VIEW & ADMIN ACCESS)
-- Allows:
-- a) Users to view their own profile
-- b) Employers to view candidate profiles for applicants to their jobs
-- c) Platform admins to view all user profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users and employers can view profiles" ON public.users;
CREATE POLICY "Users and employers can view profiles"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      LEFT JOIN public.companies c ON c.id = j.company_id
      WHERE a.candidate_id = public.users.id
        AND (j.employer_id = auth.uid() OR c.created_by = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- 3. FIX JOBS SELECT POLICY (ALLOW ADMINS TO VIEW ALL LISTINGS)
DROP POLICY IF EXISTS "Anyone can view published/active jobs" ON public.jobs;
CREATE POLICY "Anyone can view published/active jobs"
  ON public.jobs FOR SELECT
  USING (
    status IN ('published', 'active')
    OR auth.uid() = employer_id
    OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = jobs.company_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- 4. FIX NOTIFICATIONS INSERT POLICY (PREVENT NOTIFICATION SPOOFING / SPAM)
-- Only allow notification inserts from employers to their actual applicants, self, or admins
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert valid notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert valid notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      LEFT JOIN public.companies c ON c.id = j.company_id
      WHERE a.candidate_id = notifications.user_id
        AND (j.employer_id = auth.uid() OR c.created_by = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
