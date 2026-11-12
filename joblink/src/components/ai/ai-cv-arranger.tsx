"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  SparklesIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Tick02Icon,
  DocumentCodeIcon,
  DashboardSquare01Icon,
  Download04Icon,
  File01Icon,
  EyeIcon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionArrangeCV, actionSaveAICV } from "@/app/actions/ai";
import { generateAICVPdf, type CVPdfData } from "@/lib/cv-pdf";
import { CVFormEditor } from "./cv-form-editor";
import type { ArrangedCVResult } from "@/lib/ai";
import type { CandidateProfile } from "@/lib/profile";

export function AICVArranger({
  initialProfile,
  onProfileUpdated,
  triggerClassName,
  label = "Arrange CV with AI",
}: {
  initialProfile: CandidateProfile;
  onProfileUpdated?: (updated: CandidateProfile, viewUrl?: string | null) => void;
  triggerClassName?: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [targetNiche, setTargetNiche] = useState("");
  const [rawText, setRawText] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "edit" | "overview" | "markdown">("preview");
  const [result, setResult] = useState<ArrangedCVResult | null>(null);
  const [editedPayload, setEditedPayload] = useState<CVPdfData | null>(null);
  const [error, setError] = useState("");
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  /** After successful "Apply to My Profile" */
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [appliedCvUrl, setAppliedCvUrl] = useState<string | null>(null);

  const [isArranging, startArranging] = useTransition();
  const [isApplying, startApplying] = useTransition();

  const fullName = [initialProfile.firstName, initialProfile.lastName].filter(Boolean).join(" ") || "Your Profile";

  function handleOpen() {
    setError("");
    setAppliedSuccess(false);
    setAppliedCvUrl(null);
    if (!rawText && initialProfile.bio) {
      setRawText(`Current Title: ${initialProfile.title}\n\nSummary:\n${initialProfile.bio}\n\nSkills:\n${initialProfile.skills.join(", ")}`);
    }
    if (!targetNiche && initialProfile.title) {
      setTargetNiche(initialProfile.title);
    }
    setOpen(true);
  }

  function handleArrange() {
    setError("");
    setAppliedSuccess(false);
    setAppliedCvUrl(null);
    startArranging(async () => {
      const res = await actionArrangeCV({
        rawCVText: rawText,
        currentTitle: initialProfile.title,
        currentBio: initialProfile.bio,
        skills: initialProfile.skills,
        targetNiche: targetNiche || initialProfile.title,
      });

      if (res.error || !res.data) {
        setError(res.error || "Failed to arrange CV. Please try again.");
        return;
      }

      setResult(res.data);
      setEditedPayload(getPdfPayload(res.data));
      setActiveTab("preview");
    });
  }

  function getPdfPayload(cvResult: ArrangedCVResult): CVPdfData {
    const competencies = cvResult.competencies?.length
      ? cvResult.competencies
      : Object.entries(cvResult.skillsByCategory || {}).map(([pillar, items]) => ({
          pillar,
          scope: items.join(", "),
        }));

    return {
      fullName,
      headline: cvResult.suggestedTitle,
      suggestedTitle: cvResult.suggestedTitle,
      executiveSummary: cvResult.executiveSummary,
      targetNiche: cvResult.targetNiche,
      competencies,
      skillsByCategory: cvResult.skillsByCategory || {},
      recommendedSkills: cvResult.recommendedSkills || [],
      structuredExperience: cvResult.structuredExperience || [],
      education: cvResult.education || [],
      selectedWork: cvResult.selectedWork || [],
      additionalInfo: cvResult.additionalInfo,
      atsKeywords: cvResult.atsKeywords || [],
      nicheStrengths: cvResult.nicheStrengths || [],
      watermark: true,
    };
  }

  function handleDownloadLocalPdf() {
    const payload = editedPayload || (result ? getPdfPayload(result) : null);
    if (!payload) return;
    try {
      const bytes = generateAICVPdf(payload);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JOMP-CV-${(initialProfile.firstName || "Resume").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate and download PDF:", err);
      setError("Failed to generate PDF. Please try again.");
    }
  }

  function handleApplyToProfile() {
    const payload = editedPayload || (result ? getPdfPayload(result) : null);
    if (!payload) return;
    setError("");
    startApplying(async () => {
      const mergedSkills = Array.from(
        new Set([...initialProfile.skills, ...(payload.recommendedSkills || [])]),
      );

      const nextProfile: CandidateProfile = {
        ...initialProfile,
        title: payload.suggestedTitle || initialProfile.title,
        bio: payload.executiveSummary || initialProfile.bio,
        skills: mergedSkills,
      };

      const cvData = payload;

      // Generate a watermarked PDF, upload it, save resume_url and structured CV JSON
      const saveRes = await actionSaveAICV({
        cvData,
        profileUpdate: {
          firstName: payload.fullName.split(" ")[0] || initialProfile.firstName,
          lastName: payload.fullName.split(" ").slice(1).join(" ") || initialProfile.lastName,
          title: payload.suggestedTitle || initialProfile.title,
          bio: payload.executiveSummary || initialProfile.bio,
          skills: mergedSkills,
        },
      });

      if (saveRes.error) {
        setError(saveRes.error);
        return;
      }

      // Update local profile state with the new resume path
      const updatedProfile: CandidateProfile = {
        ...nextProfile,
        resumeUrl: saveRes.resumePath || nextProfile.resumeUrl,
      };

      setAppliedSuccess(true);
      setAppliedCvUrl(saveRes.viewUrl ?? null);

      if (onProfileUpdated) {
        onProfileUpdated(updatedProfile, saveRes.viewUrl ?? null);
      }

      router.refresh();
    });
  }

  function handleCopyMarkdown() {
    if (!result?.formattedMarkdown) return;
    navigator.clipboard.writeText(result.formattedMarkdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  }

  function handleCopySummary() {
    if (!result?.executiveSummary) return;
    navigator.clipboard.writeText(result.executiveSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  }

  const displayData = editedPayload || (result ? getPdfPayload(result) : null);
  const activeCompetencies = displayData?.competencies?.length
    ? displayData.competencies
    : Object.entries(displayData?.skillsByCategory || {}).map(([pillar, items]) => ({
        pillar,
        scope: items.join(", "),
      }));

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          triggerClassName ||
          "inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/[0.08] px-4 py-2 text-[13px] font-semibold text-brand transition-all hover:bg-brand/[0.15] hover:shadow-sm"
        }
      >
        <Icon icon={SparklesIcon} size={16} className="text-brand" />
        {label}
      </button>

      {open ? (
        <div className="app-theme fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-950/60 p-4 backdrop-blur-xs">
          <div className="relative my-8 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-neutral-200/80 bg-surface text-neutral-900 shadow-2xl ring-1 ring-black/10">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon icon={SparklesIcon} size={22} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-neutral-900">AI CV Arranger &amp; Niche Optimizer</h3>
                  <p className="text-[13px] text-neutral-500">
                    Fine-tune your CV into high-impact executive format, extract key competencies, and attach to your profile.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <Icon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {error ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-700">
                  {error}
                </div>
              ) : null}

              {/* Input step */}
              <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800">Target Niche or Specialty</label>
                    <input
                      type="text"
                      value={targetNiche}
                      onChange={(e) => setTargetNiche(e.target.value)}
                      placeholder="e.g. IT / ICT Officer, Cloud & Asset Control, Full-Stack"
                      className="mt-1 h-9.5 w-full rounded-lg border border-neutral-200/80 bg-surface px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800">Current Role Title</label>
                    <input
                      type="text"
                      defaultValue={initialProfile.title}
                      placeholder="e.g. ICT Officer · End-User Support"
                      className="mt-1 h-9.5 w-full rounded-lg border border-neutral-200/80 bg-surface px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-neutral-800">
                    Paste Raw CV, Experience Notes, or Job History
                  </label>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste your resume draft, past responsibilities, projects, certifications, or rough notes here..."
                    className="mt-1 w-full rounded-lg border border-neutral-200/80 bg-surface p-3 text-[13px] leading-5 text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-neutral-500">
                    AI will structure multi-pillar headlines, scoped core competencies, context notes, and STAR bullets.
                  </p>
                  <button
                    type="button"
                    disabled={isArranging}
                    onClick={handleArrange}
                    className="inline-flex h-9.5 items-center gap-1.5 rounded-lg bg-brand px-4 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:opacity-50"
                  >
                    {isArranging ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" />
                        Fine-Tuning CV…
                      </>
                    ) : (
                      <>
                        <Icon icon={SparklesIcon} size={15} />
                        Fine-Tune &amp; Arrange
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Arranged Results */}
              {result ? (
                <div className="mt-6 space-y-6">
                  {/* Results Subtabs */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          activeTab === "preview"
                            ? "bg-brand text-brand-fg"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        <Icon icon={EyeIcon} size={14} />
                        CV Preview (Watermarked)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("edit")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          activeTab === "edit"
                            ? "bg-brand text-brand-fg"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        <Icon icon={Edit02Icon} size={14} />
                        Edit CV (Word Tools)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          activeTab === "overview"
                            ? "bg-brand text-brand-fg"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        <Icon icon={DashboardSquare01Icon} size={14} />
                        Structured Overview
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("markdown")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          activeTab === "markdown"
                            ? "bg-brand text-brand-fg"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        <Icon icon={DocumentCodeIcon} size={14} />
                        Markdown
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadLocalPdf}
                        className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-surface px-2.5 py-1 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs"
                      >
                        <Icon icon={Download04Icon} size={13} />
                        Download PDF
                      </button>
                      {activeTab === "markdown" ? (
                        <button
                          type="button"
                          onClick={handleCopyMarkdown}
                          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-surface px-2.5 py-1 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          <Icon icon={copiedMd ? Tick02Icon : Copy01Icon} size={13} />
                          {copiedMd ? "Copied" : "Copy Markdown"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Watermark notice callout */}
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/70 bg-amber-50/80 p-3 text-[12px] text-amber-900">
                    <span className="mt-0.5 inline-block text-[14px]">🏷️</span>
                    <div>
                      <span className="font-semibold">JOMP Watermark Applied (Free Tier)</span>
                      <p className="mt-0.5 text-amber-800">
                        A JOMP watermark is embedded in AI-generated CVs. Subscriptions to export clean, watermark-free CVs will be available in an upcoming update.
                      </p>
                    </div>
                  </div>

                  {/* TAB 1: CV DOCUMENT PREVIEW (FINE-TUNED BENCHMARK LAYOUT) */}
                  {activeTab === "preview" ? (
                    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-surface p-6 sm:p-8 shadow-sm">
                      {/* Diagonal Watermark Overlay: Faint, faded, embedded at the back of the document */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none overflow-hidden"
                      >
                        <span className="rotate-[-54deg] text-center text-[100px] sm:text-[140px] font-black tracking-widest text-[#01224F]/[0.06] uppercase select-none">
                          JOMP
                        </span>
                      </div>

                      {/* Header Watermark Banner */}
                      <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-2 text-[10.5px] uppercase tracking-wider text-neutral-400">
                        <span>JOMP AI RESUME BUILDER</span>
                        <span className="rounded-full bg-amber-100/70 px-2 py-0.5 font-medium text-amber-800">Free Tier Watermark</span>
                      </div>

                      {/* 1. Header: Name, Multi-pillar Headline, Contact, Meta */}
                      <div className="relative">
                        <h2 className="text-[21px] font-bold tracking-tight text-brand uppercase">{displayData?.fullName || fullName}</h2>
                        <p className="mt-1 text-[13.5px] font-bold text-neutral-800">
                          {displayData?.suggestedTitle}
                        </p>
                        <p className="mt-1 text-[12px] text-neutral-600">
                          {[displayData?.additionalInfo?.locationAndRelocation || displayData?.location || "Abuja, FCT, Nigeria", "JOMP Verified Talent"].filter(Boolean).join("  ·  ")}
                        </p>
                        {displayData?.additionalInfo?.workArrangement || displayData?.additionalInfo?.languages?.length ? (
                          <p className="mt-0.5 text-[11.5px] text-neutral-500">
                            {[
                              displayData.additionalInfo?.languages?.length ? `Languages: ${displayData.additionalInfo.languages.join(", ")}` : null,
                              displayData.additionalInfo?.workArrangement,
                            ].filter(Boolean).join("  ·  ")}
                          </p>
                        ) : null}
                      </div>

                      <hr className="my-3.5 border-t-2 border-brand" />

                      {/* 2. PROFILE */}
                      <div className="relative space-y-1.5">
                        <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">PROFILE</h4>
                        <p className="text-[12.5px] leading-relaxed text-neutral-800">{displayData?.executiveSummary}</p>
                      </div>

                      <hr className="my-3.5 border-neutral-200" />

                      {/* 3. CORE COMPETENCIES (Pillar — Scope) */}
                      <div className="relative space-y-2">
                        <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">CORE COMPETENCIES</h4>
                        <div className="space-y-1.5 text-[12px] text-neutral-800">
                          {activeCompetencies.map((comp, idx) => (
                            <div key={idx} className="leading-snug">
                              <span className="font-bold text-neutral-900">{comp.pillar}</span>
                              {" — "}
                              <span className="text-neutral-700">{comp.scope}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <hr className="my-3.5 border-neutral-200" />

                      {/* 4. PROFESSIONAL EXPERIENCE */}
                      {displayData?.structuredExperience?.length ? (
                        <div className="relative space-y-3.5">
                          <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">PROFESSIONAL EXPERIENCE</h4>
                          {displayData.structuredExperience.map((exp, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex flex-wrap items-center justify-between text-[12.5px]">
                                <span className="font-bold text-neutral-900">
                                  {exp.role} {exp.company ? `| ${exp.company}` : ""}
                                </span>
                                <span className="text-[12px] font-medium text-neutral-600">{exp.period}</span>
                              </div>
                              {exp.context ? (
                                <p className="text-[11.5px] italic text-neutral-500">{exp.context}</p>
                              ) : null}
                              <ul className="space-y-1 pl-4 text-[12px] text-neutral-700 list-disc">
                                {exp.highlights.map((h, hIdx) => (
                                  <li key={hIdx} className="leading-snug">{h}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* 5. EDUCATION & CERTIFICATIONS */}
                      {displayData?.education?.length ? (
                        <>
                          <hr className="my-3.5 border-neutral-200" />
                          <div className="relative space-y-2">
                            <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">EDUCATION &amp; CERTIFICATIONS</h4>
                            <div className="space-y-1.5 text-[12px]">
                              {displayData.education.map((edu, idx) => (
                                <div key={idx}>
                                  <div className="flex flex-wrap items-center justify-between">
                                    <span className="font-bold text-neutral-900">
                                      {edu.degree} {edu.institution ? `| ${edu.institution}` : ""}
                                    </span>
                                    {edu.year ? <span className="text-[11.5px] text-neutral-500">{edu.year}</span> : null}
                                  </div>
                                  {edu.details ? (
                                    <p className="text-[11.5px] italic text-neutral-600">{edu.details}</p>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : null}

                      {/* 6. SELECTED TECHNICAL WORK */}
                      {displayData?.selectedWork?.length ? (
                        <>
                          <hr className="my-3.5 border-neutral-200" />
                          <div className="relative space-y-2">
                            <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">SELECTED TECHNICAL WORK &amp; INTERNAL TOOLS</h4>
                            <div className="space-y-1.5 text-[12px]">
                              {displayData.selectedWork.map((work, idx) => (
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

                      {/* 7. ADDITIONAL INFORMATION */}
                      {displayData?.additionalInfo ? (
                        <>
                          <hr className="my-3.5 border-neutral-200" />
                          <div className="relative space-y-1.5 text-[12px]">
                            <h4 className="text-[12px] font-bold tracking-wider uppercase text-brand">ADDITIONAL INFORMATION</h4>
                            <ul className="space-y-1 text-neutral-700">
                              {displayData.additionalInfo.locationAndRelocation ? (
                                <li>• {displayData.additionalInfo.locationAndRelocation}</li>
                              ) : null}
                              {displayData.additionalInfo.languages?.length ? (
                                <li>• Fluent in {displayData.additionalInfo.languages.join(", ")}</li>
                              ) : null}
                              {displayData.additionalInfo.workArrangement ? (
                                <li>• {displayData.additionalInfo.workArrangement}</li>
                              ) : null}
                              {displayData.additionalInfo.referencesNote ? (
                                <li>• {displayData.additionalInfo.referencesNote}</li>
                              ) : null}
                            </ul>
                          </div>
                        </>
                      ) : null}

                      {/* Bottom Footer Watermark */}
                      <div className="mt-6 border-t border-neutral-200 pt-3 text-center text-[11px] text-neutral-500">
                        Created with JOMP AI • Subscribe to remove watermark • https://jomponline.com
                      </div>
                    </div>
                  ) : activeTab === "edit" ? (
                    <div>
                      {displayData ? (
                        <CVFormEditor
                          initialData={displayData}
                          onChange={(updated) => {
                            setEditedPayload(updated);
                          }}
                        />
                      ) : null}
                    </div>
                  ) : activeTab === "overview" ? (
                    <div className="space-y-5">
                      {/* Niche & Headline Card */}
                      <div className="rounded-xl border border-brand/20 bg-brand/[0.03] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                              Target Niche: {result.targetNiche}
                            </span>
                            <h4 className="mt-1 text-[16px] font-bold text-neutral-900">{result.suggestedTitle}</h4>
                          </div>
                        </div>

                        <div className="mt-3 border-t border-brand/15 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-neutral-500">Executive Narrative Profile</span>
                            <button
                              type="button"
                              onClick={handleCopySummary}
                              className="text-[11.5px] font-medium text-brand hover:underline"
                            >
                              {copiedSummary ? "Copied!" : "Copy Profile"}
                            </button>
                          </div>
                          <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-700">
                            {result.executiveSummary}
                          </p>
                        </div>
                      </div>

                      {/* Scoped Core Competencies */}
                      <div>
                        <h4 className="text-[14px] font-semibold text-neutral-900">Scoped Core Competencies</h4>
                        <div className="mt-2.5 space-y-2">
                          {activeCompetencies.map((comp, idx) => (
                            <div key={idx} className="rounded-xl border border-neutral-200 bg-surface p-3 shadow-xs">
                              <h5 className="text-[13px] font-bold text-neutral-900">{comp.pillar}</h5>
                              <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-600">{comp.scope}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Experience Highlights */}
                      {result.structuredExperience?.length ? (
                        <div>
                          <h4 className="text-[14px] font-semibold text-neutral-900">Experience Highlights (STAR Bullets)</h4>
                          <div className="mt-2.5 space-y-3">
                            {result.structuredExperience.map((item, idx) => (
                              <div key={idx} className="rounded-xl border border-neutral-200 bg-surface p-4 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-[14px] font-semibold text-neutral-900">{item.role}</h5>
                                  <span className="text-[12px] text-neutral-400">{item.period || item.company}</span>
                                </div>
                                {item.context ? (
                                  <p className="mt-1 text-[12px] italic text-neutral-500">{item.context}</p>
                                ) : null}
                                <ul className="mt-2 space-y-1.5 text-[13px] text-neutral-600">
                                  {item.highlights.map((bullet, bIdx) => (
                                    <li key={bIdx} className="flex items-start gap-2">
                                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                      <span>{bullet}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Education & Selected Work */}
                      {result.education?.length || result.selectedWork?.length ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {result.education?.length ? (
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5">
                              <h5 className="text-[12.5px] font-semibold text-neutral-800">Education &amp; Certifications</h5>
                              <div className="mt-2 space-y-2">
                                {result.education.map((edu, eIdx) => (
                                  <div key={eIdx} className="text-[12px]">
                                    <p className="font-semibold text-neutral-900">{edu.degree}</p>
                                    <p className="text-neutral-500">{edu.institution} {edu.year ? `(${edu.year})` : ""}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {result.selectedWork?.length ? (
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5">
                              <h5 className="text-[12.5px] font-semibold text-neutral-800">Technical Work &amp; Tools</h5>
                              <div className="mt-2 space-y-2">
                                {result.selectedWork.map((work, wIdx) => (
                                  <div key={wIdx} className="text-[12px]">
                                    <p className="font-semibold text-neutral-900">{work.title}</p>
                                    <p className="text-neutral-600">{work.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {/* ATS Keywords & Niche Positioning */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5">
                          <h5 className="text-[12.5px] font-semibold text-neutral-800">Recommended ATS Keywords</h5>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {result.atsKeywords?.map((kw) => (
                              <span key={kw} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5">
                          <h5 className="text-[12.5px] font-semibold text-neutral-800">Niche Positioning Strengths</h5>
                          <ul className="mt-2 space-y-1 text-[12px] text-neutral-600">
                            {result.nicheStrengths?.map((str, sIdx) => (
                              <li key={sIdx} className="flex items-center gap-1.5">
                                <Icon icon={CheckmarkCircle02Icon} size={14} className="text-brand shrink-0" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-neutral-200 bg-neutral-900 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-neutral-200">
                        {result.formattedMarkdown}
                      </pre>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-4">
              <div className="text-[12.5px] text-neutral-500">
                {appliedSuccess ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                      <Icon icon={Tick02Icon} size={15} />
                      Profile updated — title, bio, skills &amp; CV saved!
                    </span>
                    {appliedCvUrl ? (
                      <a
                        href={appliedCvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline"
                      >
                        <Icon icon={File01Icon} size={13} />
                        View your AI-generated CV
                      </a>
                    ) : null}
                  </div>
                ) : (
                  "Ready to fine-tune your CV in benchmark standard"
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-neutral-200 bg-surface px-4 py-2 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Close
                </button>

                {result && !appliedSuccess ? (
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={handleApplyToProfile}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:opacity-60"
                  >
                    {isApplying ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" />
                        Saving CV &amp; Profile…
                      </>
                    ) : (
                      <>
                        <Icon icon={CheckmarkCircle02Icon} size={15} />
                        Apply &amp; Add CV to Profile
                      </>
                    )}
                  </button>
                ) : appliedSuccess && appliedCvUrl ? (
                  <a
                    href={appliedCvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/[0.07] px-4 py-2 text-[13px] font-medium text-brand hover:bg-brand/[0.14]"
                  >
                    <Icon icon={Download04Icon} size={15} />
                    Download Watermarked PDF
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
