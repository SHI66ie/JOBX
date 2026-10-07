"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode, type RefObject } from "react";
import {
  Alert02Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  File01Icon,
  LinkSquare02Icon,
  Loading03Icon,
  PencilEdit02Icon,
  SentIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { FileDrop, TextArea } from "@/components/onboarding/onboarding-fields";
import { Sheet, SheetIconButton } from "@/components/employer/sheet";
import { fileNameOf } from "@/components/employer/cv-viewer";
import { applyForJob, saveResume } from "@/app/dashboard/actions";
import { COVER_NOTE_LIMIT } from "@/lib/applications";
import type { ApplyJob } from "@/lib/jobs";
import type { CandidateProfile } from "@/lib/profile";
import { RESUME_BUCKET } from "@/lib/resumes";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

/** `resumeViewUrl` is a short-lived signed link for the CV at `resumeUrl` (an object path). */
export type Applicant = CandidateProfile & { email: string; resumeViewUrl?: string | null };

const STEPS = [
  { label: "Your details", title: "Check what you're sending", hint: "This is exactly what the employer will see. Add or replace your CV right here." },
  { label: "Cover note", title: "Add a cover note", hint: "Optional, but a few specific lines about why this role fits you go a long way." },
  { label: "Review", title: "Review and send", hint: "One last look. You can't edit an application once it's sent." },
] as const;

const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";
const PRIMARY = cn(
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-brand px-5 text-[14px] font-medium text-brand-fg transition-[background-color,transform,opacity] duration-200 hover:bg-brand-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
  FOCUS_RING,
);
const SECONDARY = cn(
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-[14px] font-medium text-neutral-600 transition-[background-color,color,transform] duration-200 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97]",
  FOCUS_RING,
);

/** Multi-step apply flow: review what's shared, add a note, confirm and send. */
export function ApplySheet({
  open,
  onClose,
  job,
  applicant,
  onApplied,
}: {
  open: boolean;
  onClose: () => void;
  job: ApplyJob;
  applicant: Applicant;
  onApplied: () => void;
}) {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);
  // A CV uploaded inside the sheet replaces the one from the page without a reload.
  const [cv, setCv] = useState({ path: applicant.resumeUrl, url: applicant.resumeViewUrl ?? null });
  const me: Applicant = { ...applicant, resumeUrl: cv.path, resumeViewUrl: cv.url };

  const name = [me.firstName, me.lastName].filter(Boolean).join(" ");
  const canContinue = step === 0 ? Boolean(name && me.resumeUrl) : step === 1 ? note.length <= COVER_NOTE_LIMIT : confirmed;

  // Move focus to each new step's heading so keyboard and screen-reader users follow along
  // (the cover note step focuses its textarea instead).
  useEffect(() => {
    if (open && (sent || step !== 1)) requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }, [open, step, sent]);

  function close() {
    if (isPending) return;
    onClose();
    if (sent) {
      setStep(0);
      setSent(false);
    }
  }

  function next() {
    setError("");
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    startTransition(async () => {
      const result = await applyForJob(job.id, { coverLetter: note });
      if (result?.error) setError(result.error);
      else {
        setSent(true);
        onApplied();
      }
    });
  }

  return (
    <Sheet open={open} onClose={close} label={`Apply to ${job.title}`} width="sm:max-w-[600px]">
      <header className="px-5 pt-5 sm:px-8 sm:pt-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-brand/70">{sent ? "Application sent" : "Applying to"}</p>
            <p className="mt-1 truncate text-[17px] font-semibold tracking-[-0.02em] text-neutral-950">{job.title}</p>
            <p className="mt-0.5 truncate text-[13px] text-neutral-500">{[job.company, job.meta].filter(Boolean).join("  ·  ")}</p>
          </div>
          <SheetIconButton icon={Cancel01Icon} label="Close" onClick={close} />
        </div>

        {!sent ? (
          <div className="mt-6">
            <div className="flex gap-1.5" aria-hidden>
              {STEPS.map((item, index) => (
                <span key={item.label} className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <span
                    className="block h-full origin-left rounded-full bg-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `scaleX(${index <= step ? 1 : 0})` }}
                  />
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-[12px] font-medium text-neutral-500">
              Step {step + 1} of {STEPS.length}
              <span className="mx-1.5 text-neutral-300">·</span>
              <span key={step} className="auth-swap inline-block text-brand">{STEPS[step].label}</span>
            </p>
          </div>
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6 sm:px-8">
        {sent ? (
          <Sent heading={heading} company={job.company} onDone={close} />
        ) : (
          <div key={step} className="auth-swap">
            <h2 ref={heading} tabIndex={-1} className="text-[22px] font-semibold tracking-[-0.03em] text-neutral-950 focus:outline-none">
              {STEPS[step].title}
            </h2>
            <p className="mt-1.5 text-[14px] leading-6 text-neutral-500">{STEPS[step].hint}</p>

            <div className="mt-7">
              {step === 0 ? <DetailsStep applicant={me} name={name} onCv={setCv} /> : null}
              {step === 1 ? (
                <div>
                  <TextArea
                    id="cover-note"
                    label="Cover note"
                    meta={
                      <span className={cn("tabular-nums", note.length > COVER_NOTE_LIMIT ? "font-medium text-red-700" : note.length > COVER_NOTE_LIMIT * 0.9 ? "text-amber-700" : "")}>
                        {note.length.toLocaleString()} / {COVER_NOTE_LIMIT.toLocaleString()}
                      </span>
                    }
                    value={note}
                    autoFocus
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={`Hi ${job.company || "there"}, I'd love to join as ${job.title} because…`}
                    className="min-h-[220px]"
                  />
                  <ul className="mt-4 space-y-1.5 text-[13px] leading-5 text-neutral-500">
                    {["Mention one result you're proud of that fits this role.", "Say when you could start and your time zone.", "Keep it short. Three or four sentences is plenty."].map((tip) => (
                      <li key={tip} className="flex gap-2">
                        <Icon icon={Tick02Icon} size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-neutral-400" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {step === 2 ? (
                <ReviewStep
                  job={job}
                  applicant={me}
                  name={name}
                  note={note}
                  confirmed={confirmed}
                  onConfirm={setConfirmed}
                  onEdit={(target) => setStep(target)}
                />
              ) : null}
            </div>

            {error ? (
              <p role="alert" className="auth-shake mt-6 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {!sent ? (
        <footer className="flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-3.5 sm:px-8">
          {step > 0 ? (
            <button type="button" onClick={() => { setError(""); setStep(step - 1); }} disabled={isPending} className={SECONDARY}>
              <Icon icon={ArrowLeft02Icon} size={16} />
              Back
            </button>
          ) : (
            <button type="button" onClick={close} className={SECONDARY}>Cancel</button>
          )}
          <div className="flex items-center gap-1">
            {step === 1 && !note ? (
              <button type="button" onClick={next} className={SECONDARY}>Skip</button>
            ) : null}
            <button type="button" onClick={next} disabled={!canContinue || isPending} aria-busy={isPending} className={cn(PRIMARY, "group/next")}>
              {step === STEPS.length - 1 ? (
                isPending ? (
                  <>
                    <Icon icon={Loading03Icon} size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send application
                    <Icon icon={SentIcon} size={16} className="transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/next:-translate-y-0.5 group-hover/next:translate-x-0.5" />
                  </>
                )
              ) : (
                <>
                  Continue
                  <Icon icon={ArrowRight02Icon} size={16} className="transition-transform duration-200 group-hover/next:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </footer>
      ) : null}
    </Sheet>
  );
}

function Row({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid gap-1.5 py-4 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-start sm:gap-4">
      <p className="text-[13px] text-neutral-500 sm:pt-0.5">{label}</p>
      <div className="min-w-0 text-[14px] text-neutral-900">{children}</div>
      {action ? <div className="sm:pt-0.5">{action}</div> : null}
    </div>
  );
}

function EditLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-md text-[13px] font-medium text-neutral-500 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Icon icon={PencilEdit02Icon} size={14} />
      Edit
    </Link>
  );
}

function CvFile({ path, url }: { path: string; url?: string | null }) {
  const body = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <Icon icon={File01Icon} size={16} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-neutral-800">{fileNameOf(path)}</span>
    </>
  );
  // Without a signed link (e.g. it couldn't be generated) show the file without a preview.
  if (!url) return <div className="flex items-center gap-3 rounded-xl bg-neutral-100 px-3.5 py-3">{body}</div>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/cv flex items-center gap-3 rounded-xl bg-neutral-100 px-3.5 py-3 transition-colors duration-200 hover:bg-neutral-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {body}
      <Icon icon={LinkSquare02Icon} size={15} className="shrink-0 text-neutral-400 transition-[color,transform] duration-200 group-hover/cv:-translate-y-px group-hover/cv:translate-x-px group-hover/cv:text-neutral-700" />
    </a>
  );
}

function DetailsStep({
  applicant,
  name,
  onCv,
}: {
  applicant: Applicant;
  name: string;
  onCv: (cv: { path: string; url: string | null }) => void;
}) {
  const [replacing, setReplacing] = useState(false);
  const showUpload = !applicant.resumeUrl || replacing;

  return (
    <div>
      {!name ? (
        <div role="alert" className="auth-swap mb-5 flex gap-3 rounded-xl bg-amber-50 px-4 py-3">
          <Icon icon={Alert02Icon} size={17} className="mt-0.5 shrink-0 text-amber-700" />
          <p className="text-[13px] leading-5 text-amber-700">
            <span className="font-medium">Add your name to apply.</span> Employers need it to consider you.{" "}
            <Link href="/dashboard/settings" className="font-medium underline underline-offset-2">
              Update your profile
            </Link>
          </p>
        </div>
      ) : null}

      <div className="flex items-center gap-3.5">
        <UserAvatar seed={applicant.email || name} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold tracking-[-0.015em] text-neutral-900">{name || "No name yet"}</p>
          <p className="truncate text-[13px] text-neutral-500">{[applicant.title, applicant.email].filter(Boolean).join("  ·  ")}</p>
        </div>
        <EditLink href="/dashboard/settings" label="Edit your name and title" />
      </div>

      <div className="mt-5 divide-y divide-neutral-100 border-t border-neutral-100">
        <Row label="CV" action={applicant.resumeUrl && !replacing ? <TextButton onClick={() => setReplacing(true)}>Replace</TextButton> : undefined}>
          {showUpload ? (
            <CvUpload
              onUploaded={(cv) => {
                onCv(cv);
                setReplacing(false);
              }}
              onCancel={applicant.resumeUrl ? () => setReplacing(false) : undefined}
            />
          ) : (
            <CvFile path={applicant.resumeUrl} url={applicant.resumeViewUrl} />
          )}
        </Row>
        <Row label="About you" action={<EditLink href="/dashboard/settings#field-bio" label="Edit your bio" />}>
          {applicant.bio ? (
            <p className="line-clamp-4 whitespace-pre-line leading-6 text-neutral-700">{applicant.bio}</p>
          ) : (
            <p className="text-neutral-400">No bio yet. A couple of lines about your experience helps you stand out.</p>
          )}
        </Row>
        <Row label="Skills" action={<EditLink href="/dashboard/settings#field-skills" label="Edit your skills" />}>
          {applicant.skills.length ? (
            <div className="flex flex-wrap gap-1.5">
              {applicant.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-neutral-100 px-2.5 py-1 text-[12.5px] font-medium text-neutral-700">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400">No skills listed.</p>
          )}
        </Row>
      </div>
    </div>
  );
}

function TextButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md text-[13px] font-medium text-neutral-500 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Icon icon={PencilEdit02Icon} size={14} />
      {children}
    </button>
  );
}

/** Drop a CV, upload it straight to the candidate's private folder, and save it to their profile. */
function CvUpload({ onUploaded, onCancel }: { onUploaded: (cv: { path: string; url: string | null }) => void; onCancel?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isUploading, startUpload] = useTransition();

  function upload(next: File | null) {
    setError("");
    setFile(next);
    if (!next) return;
    startUpload(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in again.");
        return;
      }
      const path = `${user.id}/resume-${Date.now()}.${next.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage.from(RESUME_BUCKET).upload(path, next, { cacheControl: "3600", upsert: true });
      if (uploadError) {
        console.error("CV upload failed:", uploadError.message);
        setError("We couldn't upload your CV. Please try again.");
        setFile(null);
        return;
      }
      const result = await saveResume(path);
      if (result.error || !result.path) {
        setError(result.error ?? "We couldn't save your CV. Please try again.");
        setFile(null);
        return;
      }
      onUploaded({ path: result.path, url: result.viewUrl ?? null });
    });
  }

  return (
    <div>
      {isUploading && file ? (
        <div className="flex items-center gap-3 rounded-xl bg-neutral-100 px-3.5 py-3">
          <Icon icon={Loading03Icon} size={16} className="shrink-0 animate-spin text-neutral-500" />
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-neutral-800">{file.name}</span>
          <span className="text-[12px] text-neutral-500">Uploading…</span>
        </div>
      ) : (
        <FileDrop id="apply-cv" label="CV" hideLabel file={null} onFile={upload} onError={setError} />
      )}
      {error ? <p role="alert" className="auth-shake mt-2 text-[12.5px] text-red-700">{error}</p> : null}
      {onCancel && !isUploading ? (
        <button type="button" onClick={onCancel} className="mt-2 text-[12.5px] font-medium text-neutral-500 hover:text-neutral-900">
          Keep current CV
        </button>
      ) : null}
    </div>
  );
}

function ReviewStep({
  job,
  applicant,
  name,
  note,
  confirmed,
  onConfirm,
  onEdit,
}: {
  job: ApplyJob;
  applicant: Applicant;
  name: string;
  note: string;
  confirmed: boolean;
  onConfirm: (value: boolean) => void;
  onEdit: (step: number) => void;
}) {
  const change = (step: number, label: string) => (
    <button
      type="button"
      onClick={() => onEdit(step)}
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-md text-[13px] font-medium text-neutral-500 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Icon icon={PencilEdit02Icon} size={14} />
      Change
    </button>
  );

  return (
    <div>
      <div className="divide-y divide-neutral-100 border-y border-neutral-100">
        <Row label="To">
          <p className="font-medium">{job.company || "The employer"}</p>
          <p className="text-[13px] text-neutral-500">{job.title}</p>
        </Row>
        <Row label="From" action={change(0, "Change your details")}>
          <p className="font-medium">{name}</p>
          <p className="text-[13px] text-neutral-500">{[applicant.title, applicant.email].filter(Boolean).join("  ·  ")}</p>
          {applicant.skills.length ? (
            <p className="mt-1 line-clamp-2 text-[13px] text-neutral-500">{applicant.skills.join(", ")}</p>
          ) : null}
        </Row>
        <Row label="CV">{applicant.resumeUrl ? <CvFile path={applicant.resumeUrl} url={applicant.resumeViewUrl} /> : null}</Row>
        <Row label="Cover note" action={change(1, note ? "Edit cover note" : "Add a cover note")}>
          {note.trim() ? (
            <p className="line-clamp-5 whitespace-pre-line leading-6 text-neutral-700">{note.trim()}</p>
          ) : (
            <p className="text-neutral-400">No cover note</p>
          )}
        </Row>
      </div>

      <label
        className={cn(
          "mt-6 flex cursor-pointer items-start gap-3 rounded-xl px-3.5 py-3 ring-1 ring-inset transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.99] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
          confirmed ? "bg-brand/[0.045] ring-brand/35" : "bg-neutral-100 ring-transparent hover:bg-neutral-200/60",
        )}
      >
        <input type="checkbox" checked={confirmed} onChange={(event) => onConfirm(event.target.checked)} className="sr-only" />
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md transition-[background-color,transform] duration-200",
            confirmed ? "scale-100 bg-brand text-brand-fg" : "scale-95 bg-surface ring-1 ring-inset ring-neutral-300",
          )}
        >
          {confirmed ? <Icon icon={Tick02Icon} key="on" className="auth-pop size-3" strokeWidth={3.2} /> : null}
        </span>
        <span className="text-[13.5px] leading-5 text-neutral-700">
          My details are accurate, and I&apos;m happy to share them with {job.company || "this employer"}.
        </span>
      </label>
    </div>
  );
}

function Sent({ heading, company, onDone }: { heading: RefObject<HTMLHeadingElement | null>; company: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center px-2 pt-10 text-center">
      <span className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-emerald-50" />
        <span className="apply-ring absolute inset-0 rounded-full ring-2 ring-emerald-400/60" />
        <Icon icon={Tick02Icon} className="auth-pop relative size-7 text-emerald-700" strokeWidth={2.4} />
      </span>
      <h2 ref={heading} tabIndex={-1} className="auth-rise mt-6 text-[22px] font-semibold tracking-[-0.03em] text-neutral-950 focus:outline-none">
        Application sent
      </h2>
      <p className="auth-rise mt-2 max-w-sm text-[14px] leading-6 text-neutral-500" style={{ animationDelay: "80ms" }}>
        {company || "The employer"} now has your details. We&apos;ll let you know as soon as your status changes.
      </p>
      <div className="auth-rise mt-8 flex flex-wrap justify-center gap-2" style={{ animationDelay: "140ms" }}>
        <Link href="/dashboard/applications" className={PRIMARY}>
          Track application
          <Icon icon={ArrowRight02Icon} size={16} />
        </Link>
        <button type="button" onClick={onDone} className={cn(SECONDARY, "bg-neutral-100 hover:bg-neutral-200/70")}>
          Keep browsing
        </button>
      </div>
    </div>
  );
}
