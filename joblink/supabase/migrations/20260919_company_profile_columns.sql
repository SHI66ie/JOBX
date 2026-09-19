-- Extra company fields used by /employer/settings.
-- Safe to run in the Supabase SQL editor.

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS hiring_for TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS business_registration TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

CREATE UNIQUE INDEX IF NOT EXISTS companies_created_by_unique
  ON public.companies (created_by);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can insert companies" ON public.companies;
CREATE POLICY "Owners can insert companies"
  ON public.companies FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Owners can update companies" ON public.companies;
CREATE POLICY "Owners can update companies"
  ON public.companies FOR UPDATE USING (auth.uid() = created_by);

-- Backfill missing profile rows so companies.created_by FK succeeds.
INSERT INTO public.users (id, email, first_name, last_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'candidate')
FROM auth.users au
ON CONFLICT (id) DO NOTHING;
