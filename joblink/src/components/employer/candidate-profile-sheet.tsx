"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, File01Icon, Mail01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CvPane, fileNameOf } from "@/components/employer/cv-viewer";
import { Sheet, SheetIconButton } from "@/components/employer/sheet";
import { AICandidateScreening } from "@/components/ai/ai-candidate-screening";
import { StageActions } from "@/components/employer/pipeline-actions";
import { updateApplicationStatus } from "@/app/employer/actions";
import { EMPLOYER_STATUS_LABELS, STATUS_TONES, applicationStatus } from "@/lib/applications";

import type { CandidateProfileData } from "@/lib/candidate-profile";
import { postedAgo } from "@/lib/jobs";
import { cn } from "@/lib/utils";

function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          icon={StarIcon}
          size={size}
          strokeWidth={1.5}
          className={cn(star <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-neutral-300")}
        />
      ))}
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-6">
      <h3 className="text-[13px] text-neutral-500">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * Opens an applicant's full application in a side sheet: cover note, CV, profile and stage actions
 * together. Opening a new application moves it to "In review" (the candidate sees that too).
 */
export function ApplicationReview({
  profile,
  applicationId,
  jobId,
  jobTitle,
  children,
  className,
  defaultOpen = false,
}: {
  profile: CandidateProfileData;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  children: ReactNode;
  className?: string;
  /** Open on load, e.g. when linked from the Applicants page or a new-application toast. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"application" | "cv">("application");
  const [, startTransition] = useTransition();
  const status = applicationStatus(profile.application.status);
  const note = profile.application.coverLetter?.trim();

  function show() {
    setOpen(true);
    if (status.value === "pending") {
      startTransition(async () => {
        try {
          await updateApplicationStatus(applicationId, "reviewed", jobId);
        } catch {
          // Leave it as new; the employer can still move it manually.
        }
      });
    }
  }

  function close() {
    setOpen(false);
    setView("application");
  }

  const openedFromLink = useRef(false);
  useEffect(() => {
    if (!defaultOpen || openedFromLink.current) return;
    openedFromLink.current = true;
    show();
    // Only on first mount; `show` is stable enough for a one-shot open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultOpen]);

  return (
    <>
      <button
        type="button"
        onClick={show}
        className={cn("text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", className)}
      >
        {children}
      </button>

      <Sheet open={open} onClose={close} label={`${profile.name}'s application`} width={view === "cv" ? "sm:max-w-[760px]" : "sm:max-w-[620px]"}>
        {view === "cv" && profile.resumeUrl ? (
          <CvPane
            url={profile.resumeUrl}
            candidateName={profile.name}
            candidateEmail={profile.email}
            onClose={close}
            leading={<SheetIconButton icon={ArrowLeft01Icon} label="Back to application" onClick={() => setView("application")} />}
          />
        ) : (
          <>
            <header className="flex items-center justify-between gap-3 px-5 pt-4 sm:px-8">
              <p className="truncate text-[13px] text-neutral-500">
                Application for <span className="font-medium text-neutral-800">{jobTitle}</span>
              </p>
              <SheetIconButton icon={Cancel01Icon} label="Close" onClick={close} />
            </header>

            <div className="flex-1 overflow-y-auto px-5 pb-10 sm:px-8">
              <div className="mt-4 flex items-start gap-4">
                <UserAvatar seed={profile.email || profile.name} size={56} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 className="truncate text-[21px] font-semibold tracking-[-0.025em] text-neutral-950">{profile.name}</h2>
                  <p className="mt-0.5 truncate text-[14px] text-neutral-600">{profile.title || "Job seeker"}</p>
                  <p className="mt-1 text-[12.5px] text-neutral-500">
                    Applied {postedAgo(profile.application.appliedAt).toLowerCase()}
                    {profile.memberSince ? ` · Member since ${profile.memberSince}` : ""}
                  </p>
                </div>
                {profile.email ? (
                  <a
                    href={`mailto:${profile.email}`}
                    title={profile.email}
                    aria-label={`Email ${profile.name}`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Icon icon={Mail01Icon} size={18} />
                  </a>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-neutral-100 py-3.5">
                <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-medium", STATUS_TONES[status.tone])}>
                  {EMPLOYER_STATUS_LABELS[status.value]}
                </span>
                <StageActions applicationId={applicationId} jobId={jobId} status={status.value} />
              </div>

              {/* AI Screening Copilot */}
              <AICandidateScreening
                jobTitle={profile.jobTitle || "Remote Position"}
                jobDescription={profile.jobDescription}
                jobRequirements={profile.jobRequirements}
                candidateName={profile.name}
                candidateTitle={profile.title}
                candidateBio={profile.bio}
                candidateSkills={profile.skills}
                coverLetter={profile.application.coverLetter}
              />

              <div className="divide-y divide-neutral-100">
                <Section title="Cover note">
                  {note ? (
                    <p className="whitespace-pre-line text-[14.5px] leading-7 text-neutral-800">{note}</p>
                  ) : (
                    <p className="text-[14px] text-neutral-400">No cover note.</p>
                  )}
                </Section>

                <Section title="CV">
                  {profile.resumeUrl ? (
                    <button
                      type="button"
                      onClick={() => setView("cv")}
                      className="group/cv flex w-full items-center gap-3 rounded-xl bg-neutral-100 px-3.5 py-3 text-left transition-colors duration-200 hover:bg-neutral-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                        <Icon icon={File01Icon} size={16} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-neutral-800">{fileNameOf(profile.resumeUrl)}</span>
                      <span className="flex items-center gap-1 text-[13px] font-medium text-neutral-500 transition-colors group-hover/cv:text-neutral-900">
                        Open
                        <Icon icon={ArrowRight01Icon} size={15} className="transition-transform duration-200 group-hover/cv:translate-x-0.5" />
                      </span>
                    </button>
                  ) : (
                    <p className="text-[14px] text-neutral-400">No CV attached.</p>
                  )}
                </Section>

                <Section title="About">
                  {profile.bio ? (
                    <p className="whitespace-pre-line text-[14.5px] leading-7 text-neutral-700">{profile.bio}</p>
                  ) : (
                    <p className="text-[14px] text-neutral-400">No bio yet.</p>
                  )}
                </Section>

                <Section title="Skills">
                  {profile.skills?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-neutral-100 px-2.5 py-1 text-[12.5px] font-medium text-neutral-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[14px] text-neutral-400">No skills listed.</p>
                  )}
                </Section>

                {profile.history?.length || profile.rating ? (
                  <Section title="Work history on JOMP">
                    {profile.rating ? (
                      <p className="mb-4 flex items-center gap-2 text-[13px] text-neutral-600">
                        <Stars value={profile.rating.average} />
                        {profile.rating.average.toFixed(1)} from {profile.rating.count} {profile.rating.count === 1 ? "review" : "reviews"} ·{" "}
                        {profile.jobsCompleted ?? 0} jobs completed
                      </p>
                    ) : null}
                    <ul className="space-y-5">
                      {(profile.history ?? []).map((item) => (
                        <li key={`${item.title}-${item.period}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[14.5px] font-medium text-neutral-900">{item.title}</p>
                              <p className="text-[13px] text-neutral-500">
                                {item.company} · {item.period}
                              </p>
                            </div>
                            {item.rating ? <Stars value={item.rating} /> : null}
                          </div>
                          {item.review ? <p className="mt-2 text-[13.5px] italic leading-6 text-neutral-600">&ldquo;{item.review}&rdquo;</p> : null}
                        </li>
                      ))}
                    </ul>
                  </Section>
                ) : null}
              </div>
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}
