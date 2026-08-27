"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACCOUNT_TYPES,
  HIRING_CATEGORIES,
  TEAM_SIZES,
  isEnterpriseTeam,
  selectClassName,
} from "@/lib/employer-options";
import { completeEmployerOnboarding } from "./actions";

interface EmployerOnboardingFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function EmployerOnboardingForm({ initialData }: EmployerOnboardingFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState("small");
  const enterprise = useMemo(() => isEnterpriseTeam(teamSize), [teamSize]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await completeEmployerOnboarding(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Could not finish setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" name="first_name" defaultValue={initialData.firstName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" name="last_name" defaultValue={initialData.lastName} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" value={initialData.email} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account_type">I am a</Label>
        <select id="account_type" name="account_type" required defaultValue="business-owner" className={selectClassName}>
          {ACCOUNT_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          Company name {enterprise ? "" : <span className="text-muted-foreground font-normal">(optional)</span>}
        </Label>
        <Input id="name" name="name" placeholder="Acme Studios" required={enterprise} />
        {!enterprise && (
          <p className="text-xs text-muted-foreground">Required later for enterprise accounts and invoices.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hiring_for">What are you hiring for?</Label>
        <select id="hiring_for" name="hiring_for" required defaultValue="business-owner" className={selectClassName}>
          {HIRING_CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team_size">Team size</Label>
        <select
          id="team_size"
          name="team_size"
          required
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          className={selectClassName}
        >
          {TEAM_SIZES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div>
          <p className="text-sm font-medium">Business details</p>
          <p className="text-xs text-muted-foreground">
            {enterprise
              ? "Enterprise accounts need a VAT / tax ID and business registration number."
              : "Optional now. Add these if you want invoices in the company name."}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vat_number">VAT / tax ID {enterprise ? "" : "(optional)"}</Label>
          <Input id="vat_number" name="vat_number" placeholder="e.g. GB123456789" required={enterprise} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business_registration">
            Business registration number {enterprise ? "" : "(optional)"}
          </Label>
          <Input
            id="business_registration"
            name="business_registration"
            placeholder="Company number / CAC / RC"
            required={enterprise}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">Verification</p>
          <p className="text-xs text-muted-foreground">
            ID verification is only required if you later raise spend limits or use escrow. You can skip this for now.
          </p>
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="request_verification" value="true" className="mt-1" />
          <span>Request ID verification for higher limits and escrow features</span>
        </label>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Continue to hiring dashboard"}
      </Button>
    </form>
  );
}
