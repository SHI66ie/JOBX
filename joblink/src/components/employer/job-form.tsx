"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { TextField } from "@/components/auth/auth-fields";
import { DescriptionEditor } from "@/components/employer/description-editor";
import { TextArea } from "@/components/onboarding/onboarding-fields";
import { SettingsRow } from "@/components/dashboard/profile-form";
import { richTextExcerpt } from "@/lib/rich-text";
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
        value={mode === "create" || currentStatus === "draft" ? "published" : currentStatus}
        disabled={pending}
        aria-busy={pending}
        className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-[14px] font-medium text-brand-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 transition-colors hover:bg-brand-hover disabled:opacity-70"
      >
        {pending && submitting !== "draft" ? "Saving…" : mode === "create" || currentStatus === "draft" ? "Publish job" : "Save changes"}
      </button>
      {mode === "create" || currentStatus === "draft" ? (
        <button
          type="submit"
          name="status"
          value="draft"
          disabled={pending}
        aria-busy={pending}
          className="inline-flex h-10 items-center rounded-full bg-neutral-100 px-5 text-[14px] font-medium text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 transition-colors hover:bg-neutral-200/70 disabled:opacity-70"
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
  action?: (formData: FormData) => Promise<FormState | void>;
  stateAction?: (prevState: FormState, formData: FormData) => Promise<FormState | void>;
  defaults?: JobDefaults;
  mode: "create" | "edit";
}) {
  const [values, setValues] = useState({
    title: defaults.title ?? "",
    type: defaults.type || "full-time",
    salary_range: defaults.salary_range ?? "",
    description: defaults.description ?? "",
    requirements: defaults.requirements ?? "",
  });
  function change(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }
  const [descriptionError, setDescriptionError] = useState("");
  const currentType = values.type;
  const [state, formAction] = useActionState<FormState, FormData>(async (prev, formData) => {
    if (stateAction) return (await stateAction(prev, formData)) ?? {};
    return (await action?.(formData)) ?? {};
  }, {});

  return (
    <form action={formAction} onSubmit={(event) => {
      const text = richTextExcerpt(values.description);
      if (!text.replace(/[\s\u200b-\u200d\ufeff]/g, "") || text.length > 20000) {
        event.preventDefault();
        setDescriptionError(text.length > 20000 ? "Keep the description to 20,000 characters or fewer." : "Add a description of the role before saving.");
        event.currentTarget.querySelector<HTMLElement>('[role="textbox"]')?.focus();
      } else setDescriptionError("");
    }}>
      <input type="hidden" name="location" value="Remote" />

      <div className="divide-y divide-neutral-100">
        <SettingsRow label="Job title (required)" hint="Short and specific works best.">
          <TextField id="title" name="title" label="Job title" hideLabel required value={values.title} onChange={(event) => change("title", event.target.value)} placeholder="e.g. Senior Frontend Engineer" maxLength={120} />
        </SettingsRow>

        <SettingsRow label="Job type" hint="All roles on JOMP are remote.">
          <fieldset>
            <legend className="sr-only">Job type</legend>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={cn(
                    "inline-flex h-10 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-medium ring-1 ring-inset transition-colors",
                    "bg-neutral-100 text-neutral-600 ring-transparent hover:bg-neutral-200/70 hover:text-neutral-900",
                    "has-[:checked]:bg-brand/[0.06] has-[:checked]:text-brand has-[:checked]:ring-brand/35",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
                  )}
                >
                  <input type="radio" name="type" value={type.value} checked={type.value === currentType} onChange={() => change("type", type.value)} className="sr-only" />
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
            value={values.salary_range} onChange={(event) => change("salary_range", event.target.value)}
            placeholder="e.g. $2,000 – $3,000 / month"
            maxLength={80}
          />
        </SettingsRow>

        <SettingsRow label="Description (required)" hint="What the role is, the team, and a typical week.">
          <DescriptionEditor value={values.description} error={descriptionError} onChange={(value) => { change("description", value); setDescriptionError(""); }} />
        </SettingsRow>

        <SettingsRow label="Requirements" hint="Skills and experience. Matching skills help us rank candidates.">
          <TextArea
            id="requirements"
            name="requirements"
            label="Requirements"
            hideLabel
            value={values.requirements} onChange={(event) => change("requirements", event.target.value)}
            placeholder={"e.g.\n• 3+ years with React and TypeScript\n• Comfortable working async across time zones"}
            maxLength={10000}
            className="min-h-[140px] rounded-xl focus-visible:ring-2 focus-visible:ring-brand"
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
