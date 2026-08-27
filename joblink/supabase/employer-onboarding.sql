-- Run this in the Supabase SQL editor after the base schema.
-- Adds employer onboarding fields used by /onboarding and /employer/settings.

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS hiring_for TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS business_registration TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
