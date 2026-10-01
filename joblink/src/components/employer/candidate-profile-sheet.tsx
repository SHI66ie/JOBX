"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft01Icon, Cancel01Icon, File01Icon, Mail01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CvPane, fileNameOf } from "@/components/employer/cv-viewer";
import { Sheet, SheetIconButton } from "@/components/employer/sheet";
import { AICandidateScreening } from "@/components/ai/ai-candidate-screening";
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
      <h3 className="text-[13px] font-medium text-neutral-500">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * Wraps an applicant's avatar + name; clicking opens their JOMP profile in a side sheet.
 * The CV opens inside the same sheet with a back arrow.
 */
export function CandidateProfileTrigger({ profile, children }: { profile: CandidateProfileData; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"profile" | "cv">("profile");
  const status = applicationStatus(profile.application.status);
  const close = () => {
    setOpen(false);
    setView("profile");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group/profile flex min-w-0 items-start gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {children}
      </button>

      <Sheet open={open} onClose={close} label={`${profile.name}'s profile`} width={view === "cv" ? "sm:max-w-[720px]" : "sm:max-w-[560px]"}>
        {view === "cv" && profile.resumeUrl ? (
          <CvPane
            url={profile.resumeUrl}
            candidateName={profile.name}
            candidateEmail={profile.email}
            onClose={close}
            leading={<SheetIconButton icon={ArrowLeft01Icon} label="Back to profile" onClick={() => setView("profile")} />}
          />
        ) : (
          <>
            <header className="flex items-center justify-end px-4 pt-3 sm:px-5">
              <SheetIconButton icon={Cancel01Icon} label="Close" onClick={close} />
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-10 sm:px-8">
              {/* Identity */}
              <div className="flex items-start gap-4">
                <UserAvatar seed={profile.email || profile.name} size={64} />
                <div className="min-w-0 pt-1">
                  <h2 className="text-[22px] font-semibold tracking-[-0.025em]">{profile.name}</h2>
                  <p className="mt-0.5 text-[14px] text-neutral-600">{profile.title || "Job seeker"}</p>
                  <p className="mt-1 text-[12.5px] text-neutral-500">
                    Remote{profile.memberSince ? ` · Member since ${profile.memberSince}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {profile.email ? (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover"
                  >
                    <Icon icon={Mail01Icon} size={15} />
                    Email
                  </a>
                ) : null}
                {profile.resumeUrl ? (
                  <button
                    type="button"
                    onClick={() => setView("cv")}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-100 px-4 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-200/70"
                  >
                    <Icon icon={File01Icon} size={15} />
                    View CV
                  </button>
                ) : null}
              </div>

              {/* Stats */}
              <dl className="mt-7 grid grid-cols-3 border-y border-neutral-100 py-4">
                <div>
                  <dt className="text-[12px] text-neutral-500">Rating</dt>
                  <dd className="mt-1 text-[17px] font-semibold tabular-nums">
                    {profile.rating ? (
                      <span className="flex items-center gap-1.5">
                        {profile.rating.average.toFixed(1)}
                        <Icon icon={StarIcon} size={15} className="fill-amber-400 text-amber-400" />
                        <span className="text-[12px] font-normal text-neutral-400">({profile.rating.count})</span>
                      </span>
                    ) : (
                      <span className="text-[14px] font-normal text-neutral-400">No ratings yet</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-neutral-500">Jobs completed</dt>
                  <dd className="mt-1 text-[17px] font-semibold tabular-nums">{profile.jobsCompleted ?? 0}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-neutral-500">Applied</dt>
                  <dd className="mt-1 text-[14px] font-medium">{postedAgo(profile.application.appliedAt)}</dd>
                </div>
              </dl>

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

                <Section title="Their application">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", STATUS_TONES[status.tone])}>
                      {EMPLOYER_STATUS_LABELS[status.value]}
                    </span>
                    <span className="text-[13px] text-neutral-500">Applied {postedAgo(profile.application.appliedAt).toLowerCase()}</span>
                  </div>
                  {profile.application.coverLetter ? (
                    <p className="mt-3 whitespace-pre-line rounded-xl bg-neutral-50 px-4 py-3 text-[14px] leading-6 text-neutral-700">
                      {profile.application.coverLetter}
                    </p>
                  ) : null}
                  {profile.resumeUrl ? (
                    <button type="button" onClick={() => setView("cv")} className="mt-3 flex w-full items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-left transition-colors hover:bg-neutral-100">
                      <Icon icon={File01Icon} size={18} className="text-neutral-400" />
                      <span className="min-w-0 flex-1 truncate text-[13.5px] text-neutral-800">{fileNameOf(profile.resumeUrl)}</span>
                      <span className="text-[13px] font-medium text-brand">View</span>
                    </button>
                  ) : null}
                </Section>

                <Section title="Work history on JOMP">
                  {profile.history?.length ? (
                    <ul className="space-y-5">
                      {profile.history.map((item) => (
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
                  ) : (
                    <p className="text-[14px] text-neutral-400">No completed jobs on JOMP yet.</p>
                  )}
                </Section>
              </div>
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}
