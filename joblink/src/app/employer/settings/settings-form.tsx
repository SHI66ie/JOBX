"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { upsertCompanyProfile } from "../actions";
import { ACCOUNT_TYPES, HIRING_CATEGORIES, TEAM_SIZES, selectClassName } from "@/lib/employer-options";

interface SettingsFormProps {
  user: {
    id: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
    };
  };
  company: {
    id?: string;
    name?: string;
    account_type?: string;
    team_size?: string;
    hiring_for?: string;
    industry?: string;
    description?: string | null;
    website?: string | null;
    vat_number?: string | null;
    business_registration?: string | null;
    verification_status?: string | null;
  } | null;
}

export function EmployerSettingsForm({ user, company }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verification = company?.verification_status || "unverified";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await upsertCompanyProfile(formData);
    } catch (err: any) {
      // If Next.js redirect threw (NEXT_REDIRECT), allow it to proceed
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      console.error("Failed to save profile:", err);
      setErrorMsg(err?.message || "Failed to create profile. Please check your information and try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" name="first_name" defaultValue={user.user_metadata?.first_name || ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" name="last_name" defaultValue={user.user_metadata?.last_name || ""} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Company name</Label>
        <Input id="name" name="name" defaultValue={company?.name || ""} placeholder="Your company name" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="account_type">I am a</Label>
          <select id="account_type" name="account_type" defaultValue={company?.account_type || "business-owner"} className={selectClassName}>
            {ACCOUNT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="team_size">Team size</Label>
          <select id="team_size" name="team_size" defaultValue={company?.team_size || "small"} className={selectClassName}>
            {TEAM_SIZES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hiring_for">What are you hiring for?</Label>
        <select id="hiring_for" name="hiring_for" defaultValue={company?.hiring_for || company?.industry || "business-owner"} className={selectClassName}>
          {HIRING_CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">About the company</Label>
        <Textarea id="description" name="description" defaultValue={company?.description || ""} placeholder="What you do, who you hire, and why people should join." rows={4} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="url" defaultValue={company?.website || ""} placeholder="https://yourcompany.com" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vat_number">VAT / tax ID</Label>
          <Input id="vat_number" name="vat_number" defaultValue={company?.vat_number || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business_registration">Business registration</Label>
          <Input id="business_registration" name="business_registration" defaultValue={company?.business_registration || ""} />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm font-medium">Verification status</p>
        <p className="text-sm capitalize text-muted-foreground">{verification}</p>
        {verification === "unverified" && (
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="request_verification" value="true" className="mt-1" />
            <span>Request ID verification for higher spend limits and escrow</span>
          </label>
        )}
      </div>

      <Button type="submit" disabled={loading} className="min-w-[140px]">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {company ? "Saving profile..." : "Creating profile..."}
          </>
        ) : (
          company ? "Save profile" : "Create profile"
        )}
      </Button>
    </form>
  );
}
