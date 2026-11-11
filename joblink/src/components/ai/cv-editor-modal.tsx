"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cancel01Icon,
  Download04Icon,
  EyeIcon,
  Edit02Icon,
  Tick02Icon,
  DocumentCodeIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionSaveAICV, actionLoadSavedCV } from "@/app/actions/ai";
import { generateAICVPdf, type CVPdfData } from "@/lib/cv-pdf";
import { CVFormEditor } from "./cv-form-editor";
import type { CandidateProfile } from "@/lib/profile";

export function CVEditorModal({
  profile,
  open,
  onClose,
  onSaved,
}: {
  profile: CandidateProfile;
  open: boolean;
  onClose: () => void;
  onSaved?: (updatedProfile: CandidateProfile, viewUrl?: string | null) => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [cvData, setCvData] = useState<CVPdfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your Name";

  // Build a default starting template when user wants to type their own CV from scratch
  function getDefaultTemplate(): CVPdfData {
    return {
      fullName,
      suggestedTitle: profile.title || "Professional Title",
      executiveSummary: profile.bio || "Dynamic and results-driven professional with proven expertise.",
      location: "Abuja, FCT, Nigeria",
      targetNiche: profile.title || "Technology",
      competencies: [
        {
          pillar: "Core Discipline",
          scope: profile.skills.length ? profile.skills.join(", ") : "Strategic Execution, Problem Solving, Communication",
        },
      ],
      skillsByCategory: {},
      recommendedSkills: profile.skills,
      structuredExperience: [
        {
          role: profile.title || "Senior Role",
          company: "Leading Organization",
          period: "2023 — Present",
          context: "Driving strategic initiatives and technical delivery across key products.",
          highlights: [
            "Delivered critical high-impact deliverables on schedule with measurable improvements.",
            "Collaborated cross-functionally to streamline operational workflows and quality.",
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's Degree",
          institution: "University / Institution",
          year: "2021",
          details: "Relevant coursework and honors",
        },
      ],
      selectedWork: [
        {
          title: "Flagship Project",
          description: "End-to-end architecture, implementation, and quantified performance metrics.",
        },
      ],
      additionalInfo: {
        locationAndRelocation: "Abuja, FCT, Nigeria (Open to Relocation & Remote)",
        languages: ["English (Fluent)"],
        workArrangement: "Available immediately for contract or permanent positions",
        referencesNote: "References available upon request",
      },
      watermark: true,
    };
  }

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    actionLoadSavedCV().then((res) => {
      if (res.data) {
        setCvData({
          ...res.data,
          fullName: res.data.fullName || fullName,
        });
      } else {
        // No saved AI CV: provide interactive template for typing their own CV
        setCvData(getDefaultTemplate());
      }
      setLoading(false);
    });
  }, [open, fullName]);

  function handleDownload() {
    if (!cvData) return;
    try {
      const bytes = generateAICVPdf(cvData);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CV-${(profile.firstName || "Resume").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download PDF.");
    }
  }

  function handleSave() {
    if (!cvData) return;
    setError("");
    setSuccess(false);

    startSaving(async () => {
      const mergedSkills = Array.from(
        new Set([
          ...profile.skills,
          ...(cvData.recommendedSkills || []),
          ...(cvData.competencies?.flatMap((c) => c.scope.split(",").map((s) => s.trim())) || []),
        ]),
      ).filter(Boolean);

      const res = await actionSaveAICV({
        cvData,
        profileUpdate: {
          firstName: cvData.fullName.split(" ")[0] || profile.firstName,
          lastName: cvData.fullName.split(" ").slice(1).join(" ") || profile.lastName,
          title: cvData.suggestedTitle || profile.title,
          bio: cvData.executiveSummary || profile.bio,
          skills: mergedSkills,
        },
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      setSuccess(true);
      const updated: CandidateProfile = {
        ...profile,
        title: cvData.suggestedTitle || profile.title,
        bio: cvData.executiveSummary || profile.bio,
        skills: mergedSkills,
        resumeUrl: res.resumePath || profile.resumeUrl,
      };

      if (onSaved) {
        onSaved(updated, res.viewUrl ?? null);
      }
      router.refresh();
    });
  }

  if (!open) return null;

  return (
    <div className="app-theme fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-950/60 p-4 backdrop-blur-xs">
      <div className="relative my-8 flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-neutral-200/80 bg-surface text-neutral-900 shadow-2xl ring-1 ring-black/10">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Icon icon={Edit02Icon} size={22} />
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-neutral-900">
                CV Editor &amp; Formatter (Word Tools)
              </h3>
              <p className="text-[13px] text-neutral-500">
                Type your own CV or edit your existing CV with formatting tools (Justify, Bold, Italics, Alignment, Lists &amp; Headings).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Icon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-[13px] text-emerald-800">
              <Icon icon={Tick02Icon} size={17} className="text-emerald-600" />
              <span>Your CV and profile have been successfully updated!</span>
            </div>
          )}

          {/* Subtabs */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  activeTab === "edit"
                    ? "bg-brand text-brand-fg"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <Icon icon={Edit02Icon} size={14} />
                Editor (Word Tools)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  activeTab === "preview"
                    ? "bg-brand text-brand-fg"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <Icon icon={EyeIcon} size={14} />
                PDF Preview
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-200/80 bg-surface px-2.5 py-1 text-[12px] font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 shadow-xs"
            >
              <Icon icon={Download04Icon} size={13} /> Download PDF
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-neutral-500">Loading CV data...</div>
          ) : cvData ? (
            <>
              {activeTab === "edit" ? (
                <CVFormEditor
                  initialData={cvData}
                  onChange={setCvData}
                  onApplyAndSave={handleSave}
                  isSaving={isSaving}
                />
              ) : (
                /* PDF PREVIEW */
                <div className="relative overflow-hidden rounded-xl border border-neutral-200/80 bg-surface p-6 sm:p-8 shadow-sm text-neutral-900">
                  {/* Diagonal Watermark */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
                  >
                    <span className="rotate-[-32deg] text-center text-[42px] sm:text-[56px] font-extrabold tracking-wider text-neutral-900/[0.07] uppercase">
                      CREATED WITH JOMP
                    </span>
                  </div>

                  <div className="relative">
                    <h2 className="text-[21px] font-bold tracking-tight text-brand uppercase">
                      {cvData.fullName}
                    </h2>
                    <p className="mt-1 text-[13.5px] font-bold text-neutral-800">
                      {cvData.suggestedTitle}
                    </p>
                    <p className="mt-1 text-[12px] text-neutral-600">
                      {[cvData.additionalInfo?.locationAndRelocation || cvData.location || "Abuja, FCT, Nigeria", "JOMP Verified Talent"].filter(Boolean).join("  ·  ")}
                    </p>
                  </div>

                  <hr className="my-3.5 border-t-2 border-brand" />

                  {/* Summary */}
                  <div className="relative space-y-1.5">
                    <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">PROFILE</h4>
                    <p className="text-[12.5px] leading-relaxed text-neutral-800">{cvData.executiveSummary}</p>
                  </div>

                  <hr className="my-3.5 border-neutral-200/80" />

                  {/* Competencies */}
                  {cvData.competencies?.length ? (
                    <div className="relative space-y-2">
                      <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">CORE COMPETENCIES</h4>
                      <div className="space-y-1.5 text-[12px] text-neutral-800">
                        {cvData.competencies.map((comp, idx) => (
                          <div key={idx} className="leading-snug">
                            <span className="font-bold text-neutral-900">{comp.pillar}</span>
                            {" — "}
                            <span className="text-neutral-700">{comp.scope}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Experience */}
                  {cvData.structuredExperience?.length ? (
                    <>
                      <hr className="my-3.5 border-neutral-200/80" />
                      <div className="relative space-y-3.5">
                        <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">PROFESSIONAL EXPERIENCE</h4>
                        {cvData.structuredExperience.map((exp, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex flex-wrap items-center justify-between text-[12.5px]">
                              <span className="font-bold text-neutral-900">
                                {exp.role} {exp.company ? `| ${exp.company}` : ""}
                              </span>
                              <span className="text-[12px] font-medium text-neutral-600">{exp.period}</span>
                            </div>
                            {exp.context && <p className="text-[11.5px] italic text-neutral-500">{exp.context}</p>}
                            <ul className="space-y-1 pl-4 text-[12px] text-neutral-700 list-disc">
                              {exp.highlights.map((h, hIdx) => (
                                <li key={hIdx} className="leading-snug">{h}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}

                  {/* Education */}
                  {cvData.education?.length ? (
                    <>
                      <hr className="my-3.5 border-neutral-200/80" />
                      <div className="relative space-y-2">
                        <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">EDUCATION &amp; CERTIFICATIONS</h4>
                        <div className="space-y-1.5 text-[12px]">
                          {cvData.education.map((edu, idx) => (
                            <div key={idx}>
                              <div className="flex flex-wrap items-center justify-between">
                                <span className="font-bold text-neutral-900">
                                  {edu.degree} {edu.institution ? `| ${edu.institution}` : ""}
                                </span>
                                {edu.year && <span className="text-[11.5px] text-neutral-500">{edu.year}</span>}
                              </div>
                              {edu.details && <p className="text-[11.5px] italic text-neutral-600">{edu.details}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}

                  {/* Selected Work */}
                  {cvData.selectedWork?.length ? (
                    <>
                      <hr className="my-3.5 border-neutral-200/80" />
                      <div className="relative space-y-2">
                        <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">SELECTED TECHNICAL WORK</h4>
                        <div className="space-y-1.5 text-[12px]">
                          {cvData.selectedWork.map((work, idx) => (
                            <div key={idx} className="leading-snug">
                              <span className="font-bold text-neutral-900">{work.title}</span>
                              {" — "}
                              <span className="text-neutral-700">{work.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}

                  {/* Footer watermark */}
                  <div className="mt-6 border-t border-neutral-200/80 pt-3 text-center text-[11px] text-neutral-500">
                    Created with JOMP • Free Tier Watermarked
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-neutral-200/80 bg-neutral-100/50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200/80 bg-surface px-4 py-2 text-[13px] font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
          >
            Close
          </button>

          <button
            type="button"
            disabled={isSaving || !cvData}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Icon icon={Tick02Icon} size={15} />
                Save &amp; Update CV on Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
