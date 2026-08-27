-- Run this in the Supabase SQL editor.
-- 1) Lets employer signups write a profile even if an old role check exists.
-- 2) Adds company fields used after signup.

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    role = COALESCE(EXCLUDED.role, public.users.role),
    updated_at = now();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth.users insert because the profile table rejected the row.
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS hiring_for TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS business_registration TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
