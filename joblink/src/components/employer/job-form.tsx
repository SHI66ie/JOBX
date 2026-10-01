"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { TextField } from "@/components/auth/auth-fields";
import { TextArea } from "@/components/onboarding/onboarding-fields";
import { SettingsRow } from "@/components/dashboard/profile-form";
import { JOB_TYPES } from "@/lib/jobs";
import { cn } from "@/lib/utils";
import { AIJobAssistant } from "@/components/ai/ai-job-assistant";

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
type FormState = { error?: string | null } | undefined;

/**
 * Pass `stateAction` for actions shaped (prevState, formData) => { error } (e.g. postJob),
 * or `action` for plain (formData) actions that throw/redirect (e.g. updateJob bound to an id).
 */
export function JobForm({
  action,
  stateAction,
  defaults = {},
  mode,
}: {
  action?: (formData: FormData) => Promise<void>;
  stateAction?: (prevState: FormState, formData: FormData) => Promise<FormState | void>;
  defaults?: JobDefaults;
  mode: "create" | "edit";
}) {
  const [formData, setFormData] = useState({
    title: defaults.title || "",
    type: defaults.type || "full-time",
    salary_range: defaults.salary_range || "",
    description: defaults.description || "",
    requirements: defaults.requirements || "",
  });

  const [state, formAction] = useActionState<FormState, FormData>(async (prev, fd) => {
    if (stateAction) return (await stateAction(prev, fd)) ?? {};
    await action?.(fd);
    return {};
  }, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="location" value="Remote" />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-neutral-500">All jobs on JOMP are remote.</p>
        <AIJobAssistant
          onApply={(aiJob) => {
            setFormData({
              title: aiJob.title,
              type: aiJob.type || "full-time",
              salary_range: aiJob.salary_range || "",
              description: aiJob.description,
              requirements: aiJob.requirements,
            });
          }}
        />
      </div>

      <div className="divide-y divide-neutral-100">
        <SettingsRow label="Job title" hint="Short and specific works best.">
          <TextField
            id="title"
            name="title"
            label="Job title"
            hideLabel
            required
            value={formData.title}
            onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
            placeholder="e.g. Senior Frontend Engineer"
            maxLength={120}
          />
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
                    formData.type === type.value
                      ? "bg-brand/[0.06] text-brand ring-brand/35"
                      : "",
                  )}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={() => setFormData((d) => ({ ...d, type: type.value }))}
                    className="sr-only"
                  />
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
            value={formData.salary_range}
            onChange={(e) => setFormData((d) => ({ ...d, salary_range: e.target.value }))}
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
            value={formData.description}
            onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
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
            value={formData.requirements}
            onChange={(e) => setFormData((d) => ({ ...d, requirements: e.target.value }))}
            placeholder={"e.g.\n• 3+ years with React and TypeScript\n• Comfortable working async across time zones"}
            className="min-h-[140px]"
          />
        </SettingsRow>
      </div>

      {state?.error ? (
        <p role="alert" className="auth-shake mt-6 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButtons mode={mode} currentStatus={defaults.status || "published"} />
    </form>
  );
}

