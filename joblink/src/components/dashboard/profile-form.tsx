"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { File01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { TextField } from "@/components/auth/auth-fields";
import { FileDrop, SkillPicker, TextArea } from "@/components/onboarding/onboarding-fields";
import { updateCandidateProfile } from "@/app/dashboard/actions";
import { profileStrength, type CandidateProfile } from "@/lib/profile";
import { RESUME_BUCKET } from "@/lib/resumes";
import { fileNameOf } from "@/components/employer/cv-viewer";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

const SKILL_SUGGESTIONS = ["Communication", "Customer service", "Microsoft Excel", "Project management", "Sales", "React"];

/** Label + hint on the left, control on the right; stacks on mobile. */
export function SettingsRow({
  id,
  label,
  hint,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="grid scroll-mt-24 gap-3 py-7 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-10">
      <div>
        <p className="text-[14px] font-medium text-neutral-900">{label}</p>
        {hint ? <p className="mt-1 text-[13px] leading-5 text-neutral-500">{hint}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** `cvLink` is a signed viewing link for the CV saved at `cvLink.path`; it goes stale once the CV changes. */
export function ProfileForm({ initial, cvLink }: { initial: CandidateProfile; cvLink?: { path: string; url: string | null } }) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [replacingCv, setReplacingCv] = useState(false);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const dirty = useMemo(() => Boolean(newFile) || JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved, newFile]);
  const strength = profileStrength({ ...draft, resumeUrl: newFile ? "pending" : draft.resumeUrl });

  function update<K extends keyof CandidateProfile>(key: K, value: CandidateProfile[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setJustSaved(false);
  }

  function discard() {
    setDraft(saved);
    setNewFile(null);
    setReplacingCv(false);
    setError("");
  }

  function save() {
    setError("");
    startSaving(async () => {
      let resumeUrl = draft.resumeUrl;

      if (newFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Please sign in again.");
          return;
        }
        const ext = newFile.name.split(".").pop();
        const path = `${user.id}/resume-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(RESUME_BUCKET)
          .upload(path, newFile, { cacheControl: "3600", upsert: true });
        if (uploadError) {
          console.error("CV upload failed:", uploadError.message);
          setError("We couldn't upload your CV. Please try again.");
          return;
        }
        // Private bucket: keep the object path; the server signs a viewing link per page load.
        resumeUrl = path;
      }

      const next = { ...draft, resumeUrl };
      const result = await updateCandidateProfile(next);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(next);
      setDraft(next);
      setNewFile(null);
      setReplacingCv(false);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 2500);
    });
  }

  const cvName = draft.resumeUrl ? fileNameOf(draft.resumeUrl) : "";
  const cvViewUrl = cvLink?.url && cvLink.path === draft.resumeUrl ? cvLink.url : null;

  return (
    <div>
      <StrengthLine strength={strength} />

      <div className="divide-y divide-neutral-100">
        <SettingsRow label="Name" hint="Shown on every application you send.">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField id="first_name" label="First name" hideLabel placeholder="First name" autoComplete="given-name" value={draft.firstName} onChange={(e) => update("firstName", e.target.value)} />
            <TextField id="last_name" label="Last name" hideLabel placeholder="Last name" autoComplete="family-name" value={draft.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </div>
        </SettingsRow>

        <SettingsRow id="field-title" label="Professional title" hint="One line that says what you do.">
          <TextField id="title" label="Professional title" hideLabel value={draft.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Frontend Developer" maxLength={100} />
        </SettingsRow>

        <SettingsRow id="field-bio" label="Bio" hint="Your experience, wins, and what you want next.">
          <TextArea id="bio" label="Bio" hideLabel maxLength={600} value={draft.bio} onChange={(e) => update("bio", e.target.value)} placeholder="A few sentences about you." />
          <p className="mt-1.5 text-right text-xs tabular-nums text-neutral-400">{draft.bio.length}/600</p>
        </SettingsRow>

        <SettingsRow id="field-skills" label="Skills" hint="Powers your Best matches on the job board.">
          <SkillPicker
            id="skills"
            label="Skills"
            hideLabel
            tags={draft.skills}
            onChange={(skills) => update("skills", skills)}
            suggestions={SKILL_SUGGESTIONS}
            placeholder="Search skills, e.g. React, Sales, Excel"
          />
        </SettingsRow>

        <SettingsRow id="field-resume" label="CV" hint="PDF or DOCX, up to 5MB.">
          {draft.resumeUrl && !replacingCv && !newFile ? (
            <div className="flex items-center gap-3">
              <Icon icon={File01Icon} size={20} className="shrink-0 text-neutral-400" />
              <span className="min-w-0 flex-1 truncate text-[14px] text-neutral-900">{cvName}</span>
              <div className="flex shrink-0 items-center gap-1 text-[13px] font-medium">
                {cvViewUrl ? (
                  <a href={cvViewUrl} target="_blank" rel="noopener noreferrer" className="rounded-md px-2 py-1 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                    View
                  </a>
                ) : null}
                <button type="button" onClick={() => setReplacingCv(true)} className="rounded-md px-2 py-1 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                  Replace
                </button>
                <button type="button" onClick={() => update("resumeUrl", "")} className="rounded-md px-2 py-1 text-neutral-500 hover:bg-red-50 hover:text-red-700">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <FileDrop
              id="resume"
              label="CV"
              hideLabel
              file={newFile}
              onFile={(file) => {
                setError("");
                setNewFile(file);
                setJustSaved(false);
              }}
              onError={setError}
            />
          )}
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
              Profile saved
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

/** One quiet line: tiny ring, percentage, and what's left as links. Hidden at 100%. */
function StrengthLine({ strength }: { strength: ReturnType<typeof profileStrength> }) {
  if (strength.percent === 100) return null;
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const todo = strength.checks.filter((check) => !check.done);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pb-2 pt-6">
      <svg viewBox="0 0 24 24" className="size-6 -rotate-90" aria-hidden>
        <circle cx="12" cy="12" r={radius} fill="none" className="stroke-neutral-200" strokeWidth="3" />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - strength.percent / 100)}
          className="stroke-brand transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <p className="text-[14px] text-neutral-900">
        <span className="font-semibold tabular-nums">{strength.percent}%</span> complete
      </p>
      <span className="text-neutral-300">·</span>
      <p className="text-[13px] text-neutral-500">
        {todo.map((check, index) => (
          <span key={check.id}>
            <a href={`#field-${check.id}`} className="text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-brand hover:decoration-brand">
              {check.missing}
            </a>
            {index < todo.length - 1 ? <span className="px-1.5 text-neutral-300">·</span> : null}
          </span>
        ))}
      </p>
    </div>
  );
}
