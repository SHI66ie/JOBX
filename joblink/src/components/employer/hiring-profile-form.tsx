"use client";

import { useMemo, useState, useTransition } from "react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { TextField } from "@/components/auth/auth-fields";
import { PillChoice, TextArea, Toggle } from "@/components/onboarding/onboarding-fields";
import { SettingsRow } from "@/components/dashboard/profile-form";
import { upsertCompanyProfile } from "@/app/employer/actions";
import { ACCOUNT_TYPES, HIRING_CATEGORIES, TEAM_SIZES, isEnterpriseTeam } from "@/lib/employer-options";
import { cn } from "@/lib/utils";

export type HiringProfile = {
  firstName: string;
  lastName: string;
  name: string;
  accountType: string;
  hiringFor: string[];
  teamSize: string;
  description: string;
  website: string;
  vatNumber: string;
  registration: string;
  verificationStatus: string;
};

/** "I need graphic design" → "Graphic design". */
function shortHiringLabel(label: string) {
  const trimmed = label.replace(/^I need /, "").replace(/^I hire in /, "");
  if (trimmed.startsWith("I'm a business owner")) return "Hiring across roles";
  if (trimmed.startsWith("I'm a recruiter")) return "Recruiting for clients";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

const HIRING_OPTIONS = HIRING_CATEGORIES.map((option) => ({ value: option.value as string, label: shortHiringLabel(option.label) }));

function SinglePills({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "inline-flex h-9 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-medium ring-1 ring-inset transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
              checked ? "bg-brand/[0.06] text-brand ring-brand/35" : "bg-neutral-100 text-neutral-600 ring-transparent hover:bg-neutral-200/70 hover:text-neutral-900",
            )}
          >
            <input type="radio" name={name} value={option.value} checked={checked} onChange={() => onChange(option.value)} className="sr-only" />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

const VERIFICATION_LABELS: Record<string, { label: string; className: string; hint: string }> = {
  verified: { label: "Verified", className: "bg-emerald-50 text-emerald-700", hint: "Your identity is verified. Higher limits and escrow are available." },
  pending: { label: "Pending review", className: "bg-amber-50 text-amber-700", hint: "We're reviewing your details. This usually takes 1–2 working days." },
  unverified: { label: "Not verified", className: "bg-neutral-100 text-neutral-600", hint: "Only needed for higher spend limits or escrow." },
};

export function HiringProfileForm({ initial }: { initial: HiringProfile }) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [requestVerification, setRequestVerification] = useState(false);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const dirty = useMemo(() => requestVerification || JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved, requestVerification]);
  const enterprise = isEnterpriseTeam(draft.teamSize);
  const verification = VERIFICATION_LABELS[draft.verificationStatus] ?? VERIFICATION_LABELS.unverified;

  function update<K extends keyof HiringProfile>(key: K, value: HiringProfile[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setJustSaved(false);
  }

  function discard() {
    setDraft(saved);
    setRequestVerification(false);
    setError("");
  }

  function save() {
    setError("");
    startSaving(async () => {
      const formData = new FormData();
      formData.set("first_name", draft.firstName);
      formData.set("last_name", draft.lastName);
      formData.set("name", draft.name);
      formData.set("account_type", draft.accountType);
      formData.set("hiring_for", draft.hiringFor.join(","));
      formData.set("team_size", draft.teamSize);
      formData.set("description", draft.description);
      formData.set("website", draft.website);
      formData.set("vat_number", draft.vatNumber);
      formData.set("business_registration", draft.registration);
      if (requestVerification) formData.set("request_verification", "true");

      try {
        const result = await upsertCompanyProfile(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
      } catch {
        setError("We couldn't save your settings. Please try again.");
        return;
      }

      const next = requestVerification && draft.verificationStatus === "unverified" ? { ...draft, verificationStatus: "pending" } : draft;
      setSaved(next);
      setDraft(next);
      setRequestVerification(false);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 2500);
    });
  }

  const optional = enterprise ? "" : " · optional";

  return (
    <div>
      <div className="divide-y divide-neutral-100">
        <SettingsRow label="Your name" hint="Shown to candidates you message and hire.">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField id="first_name" label="First name" hideLabel placeholder="First name" autoComplete="given-name" value={draft.firstName} onChange={(e) => update("firstName", e.target.value)} />
            <TextField id="last_name" label="Last name" hideLabel placeholder="Last name" autoComplete="family-name" value={draft.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </div>
        </SettingsRow>

        <SettingsRow label="Hiring as" hint="How you hire on JOMP.">
          <SinglePills name="account_type" value={draft.accountType} options={ACCOUNT_TYPES} onChange={(value) => update("accountType", value)} />
        </SettingsRow>

        <SettingsRow label="Display name" hint="The name candidates see on your jobs: your business, agency, or just you.">
          <TextField
            id="name"
            label="Display name"
            hideLabel
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={[draft.firstName, draft.lastName].filter(Boolean).join(" ") || "e.g. Acme Studios"}
            maxLength={100}
          />
          <p className="mt-1.5 text-xs text-neutral-500">Leave empty to use your own name.</p>
        </SettingsRow>

        <SettingsRow label="Hiring for" hint="Up to 3. Helps us suggest the right candidates.">
          <PillChoice name="hiring_for" label="Hiring for" values={draft.hiringFor} onChange={(values) => update("hiringFor", values)} options={HIRING_OPTIONS} max={3} />
        </SettingsRow>

        <SettingsRow label="Team size">
          <SinglePills name="team_size" value={draft.teamSize} options={TEAM_SIZES} onChange={(value) => update("teamSize", value)} />
        </SettingsRow>

        <SettingsRow label="About" hint="What you do and what it's like to work with you. Shown on your job listings.">
          <TextArea
            id="description"
            label="About"
            hideLabel
            maxLength={1000}
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="A few sentences about you or your business."
          />
          <p className="mt-1.5 text-right text-xs tabular-nums text-neutral-400">{draft.description.length}/1000</p>
        </SettingsRow>

        <SettingsRow label="Website" hint="Optional.">
          <TextField id="website" label="Website" hideLabel type="url" inputMode="url" value={draft.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
        </SettingsRow>

        <SettingsRow label="Business details" hint={enterprise ? "Required for Enterprise accounts." : "Optional. Add these for invoices in a business name."}>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField id="vat_number" label={`VAT / tax ID${optional}`} value={draft.vatNumber} onChange={(e) => update("vatNumber", e.target.value)} placeholder="e.g. 12345678-0001" />
            <TextField id="business_registration" label={`Registration no.${optional}`} value={draft.registration} onChange={(e) => update("registration", e.target.value)} placeholder="CAC / RC number" />
          </div>
        </SettingsRow>

        <SettingsRow label="Verification" hint={verification.hint}>
          <div className="space-y-4">
            <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium", verification.className)}>{verification.label}</span>
            {draft.verificationStatus === "unverified" ? (
              <Toggle
                checked={requestVerification}
                onChange={(checked) => {
                  setRequestVerification(checked);
                  setJustSaved(false);
                }}
                title="Request ID verification"
                description="We'll ask for ID after you save. You can skip this for now."
              />
            ) : null}
          </div>
        </SettingsRow>
      </div>

      {error ? (
        <p role="alert" className="auth-shake mt-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
          {error}
        </p>
      ) : null}

      <div
        className={cn(
          "fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-[opacity,transform] duration-300",
          dirty || justSaved ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-neutral-900 py-2 pl-4 pr-2 text-neutral-50 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]">
          {justSaved && !dirty ? (
            <p className="flex flex-1 items-center gap-2 py-1.5 text-[13px]">
              <Icon icon={Tick02Icon} size={16} className="text-emerald-400" strokeWidth={2.2} />
              Settings saved
            </p>
          ) : (
            <>
              <p className="flex-1 text-[13px] text-neutral-50/80">Unsaved changes</p>
              <button type="button" onClick={discard} disabled={isSaving} className="rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-50/70 hover:text-neutral-50">
                Discard
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="rounded-xl bg-neutral-50 px-4 py-2 text-[13px] font-medium text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-70"
              >
                {isSaving ? "Saving…" : "Save changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
