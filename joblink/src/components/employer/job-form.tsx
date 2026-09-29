"use client";

import { useFormStatus } from "react-dom";
import { TextField } from "@/components/auth/auth-fields";
import { TextArea } from "@/components/onboarding/onboarding-fields";
import { SettingsRow } from "@/components/dashboard/profile-form";
import { JOB_TYPES } from "@/lib/jobs";
import { cn } from "@/lib/utils";

type JobDefaults = {
  title?: string;
  type?: string | null;
  salary_range?: string | null;
  description?: string;
  requirements?: string | null;
  status?: string;
};

function SubmitButtons({ mode, currentStatus }: { mode: "create" | "edit"; currentStatus: string }) {
  const { pending, data } = useFormStatus();
  const submitting = pending ? String(data?.get("status") ?? "") : "";

  return (
    <div className="flex flex-wrap items-center gap-2 pt-8">
      <button
        type="submit"
        name="status"
        value={mode === "create" ? "published" : currentStatus}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-[14px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:opacity-70"
      >
        {pending && submitting !== "draft" ? "Saving…" : mode === "create" ? "Publish job" : "Save changes"}
      </button>
      {mode === "create" || currentStatus === "draft" ? (
        <button
          type="submit"
          name="status"
          value="draft"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-full bg-neutral-100 px-5 text-[14px] font-medium text-neutral-800 transition-colors hover:bg-neutral-200/70 disabled:opacity-70"
        >
          {pending && submitting === "draft" ? "Saving…" : "Save as draft"}
        </button>
      ) : null}
    </div>
  );
}

/** Post / edit a remote job. Posts to a server action; location is always Remote. */
export function JobForm({
  action,
  defaults = {},
  mode,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: JobDefaults;
  mode: "create" | "edit";
}) {
  const currentType = defaults.type || "full-time";

  return (
    <form action={action}>
      <input type="hidden" name="location" value="Remote" />

      <div className="divide-y divide-neutral-100">
        <SettingsRow label="Job title" hint="Short and specific works best.">
          <TextField id="title" name="title" label="Job title" hideLabel required defaultValue={defaults.title} placeholder="e.g. Senior Frontend Engineer" maxLength={120} />
        </SettingsRow>

        <SettingsRow label="Job type" hint="All roles on JOMP are remote.">
          <fieldset>
            <legend className="sr-only">Job type</legend>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={cn(
                    "inline-flex h-9 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-medium ring-1 ring-inset transition-colors",
                    "bg-neutral-100 text-neutral-600 ring-transparent hover:bg-neutral-200/70 hover:text-neutral-900",
                    "has-[:checked]:bg-brand/[0.06] has-[:checked]:text-brand has-[:checked]:ring-brand/35",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
                  )}
                >
                  <input type="radio" name="type" value={type.value} defaultChecked={type.value === currentType} className="sr-only" />
                  {type.label}
                </label>
              ))}
            </div>
          </fieldset>
        </SettingsRow>

        <SettingsRow label="Pay" hint="Optional, but listings with pay get more applicants.">
          <TextField
            id="salary_range"
            name="salary_range"
            label="Pay"
            hideLabel
            defaultValue={defaults.salary_range ?? ""}
            placeholder="e.g. $2,000 – $3,000 / month"
            maxLength={80}
          />
        </SettingsRow>

        <SettingsRow label="Description" hint="What the role is, the team, and a typical week.">
          <TextArea
            id="description"
            name="description"
            label="Description"
            hideLabel
            required
            defaultValue={defaults.description}
            placeholder="Describe the role and what success looks like."
            className="min-h-[200px]"
          />
        </SettingsRow>

        <SettingsRow label="Requirements" hint="Skills and experience. Matching skills help us rank candidates.">
          <TextArea
            id="requirements"
            name="requirements"
            label="Requirements"
            hideLabel
            defaultValue={defaults.requirements ?? ""}
            placeholder={"e.g.\n• 3+ years with React and TypeScript\n• Comfortable working async across time zones"}
            className="min-h-[140px]"
          />
        </SettingsRow>
      </div>

      <SubmitButtons mode={mode} currentStatus={defaults.status || "published"} />
    </form>
  );
}
