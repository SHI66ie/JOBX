"use client";

import { useState } from "react";
import {
  Add01Icon,
  Delete02Icon,
  SparklesIcon,
  Tick02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { CVRichTextField } from "./cv-rich-toolbar";
import type { CVPdfData, CoreCompetencyItem, StructuredExperienceItem, EducationItem, TechnicalWorkItem } from "@/lib/cv-pdf";

export type CVFormEditorProps = {
  initialData: CVPdfData;
  onChange: (updated: CVPdfData) => void;
  onApplyAndSave?: () => void;
  isSaving?: boolean;
};

function stripHtml(html: string): string {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, "");
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function CVFormEditor({
  initialData,
  onChange,
  onApplyAndSave,
  isSaving,
}: CVFormEditorProps) {
  const [data, setData] = useState<CVPdfData>(initialData);
  const [activeSection, setActiveSection] = useState<
    "header" | "summary" | "competencies" | "experience" | "education" | "projects" | "additional"
  >("summary");

  function updateField<K extends keyof CVPdfData>(key: K, val: CVPdfData[K]) {
    const updated = { ...data, [key]: val };
    setData(updated);
    onChange(updated);
  }

  // --- Handlers for Competencies ---
  function updateCompetency(index: number, pillar: string, scope: string) {
    const next = [...(data.competencies || [])];
    next[index] = { pillar, scope };
    updateField("competencies", next);
  }

  function addCompetency() {
    const next: CoreCompetencyItem[] = [
      ...(data.competencies || []),
      { pillar: "New Competency", scope: "Tools, technologies, key scope" },
    ];
    updateField("competencies", next);
  }

  function removeCompetency(index: number) {
    const next = (data.competencies || []).filter((_, i) => i !== index);
    updateField("competencies", next);
  }

  // --- Handlers for Experience ---
  function updateExperience(index: number, updatedItem: StructuredExperienceItem) {
    const next = [...data.structuredExperience];
    next[index] = updatedItem;
    updateField("structuredExperience", next);
  }

  function addExperience() {
    const next: StructuredExperienceItem[] = [
      ...data.structuredExperience,
      {
        role: "Job Title",
        company: "Company Name",
        period: "2024 — Present",
        context: "Brief business context or objective",
        highlights: [
          "Spearheaded key project delivering measurable efficiency improvements.",
          "Collaborated cross-functionally to achieve strategic delivery goals.",
        ],
      },
    ];
    updateField("structuredExperience", next);
  }

  function removeExperience(index: number) {
    const next = data.structuredExperience.filter((_, i) => i !== index);
    updateField("structuredExperience", next);
  }

  function updateHighlight(expIdx: number, hlIdx: number, val: string) {
    const exp = { ...data.structuredExperience[expIdx] };
    const hls = [...exp.highlights];
    hls[hlIdx] = val;
    exp.highlights = hls;
    updateExperience(expIdx, exp);
  }

  function addHighlight(expIdx: number) {
    const exp = { ...data.structuredExperience[expIdx] };
    exp.highlights = [...exp.highlights, "Key quantifiable achievement with outcome"];
    updateExperience(expIdx, exp);
  }

  function removeHighlight(expIdx: number, hlIdx: number) {
    const exp = { ...data.structuredExperience[expIdx] };
    exp.highlights = exp.highlights.filter((_, i) => i !== hlIdx);
    updateExperience(expIdx, exp);
  }

  // --- Handlers for Education ---
  function updateEducation(index: number, updatedItem: EducationItem) {
    const next = [...(data.education || [])];
    next[index] = updatedItem;
    updateField("education", next);
  }

  function addEducation() {
    const next: EducationItem[] = [
      ...(data.education || []),
      {
        degree: "B.Sc. in Computer Science or relevant discipline",
        institution: "University / Institute",
        year: "2020",
        details: "Graduated with Honors",
      },
    ];
    updateField("education", next);
  }

  function removeEducation(index: number) {
    const next = (data.education || []).filter((_, i) => i !== index);
    updateField("education", next);
  }

  // --- Handlers for Projects / Selected Work ---
  function updateWork(index: number, updatedItem: TechnicalWorkItem) {
    const next = [...(data.selectedWork || [])];
    next[index] = updatedItem;
    updateField("selectedWork", next);
  }

  function addWork() {
    const next: TechnicalWorkItem[] = [
      ...(data.selectedWork || []),
      {
        title: "Key Project or Initiative",
        description: "Technical scope, architecture overview, and quantifiable user impact.",
      },
    ];
    updateField("selectedWork", next);
  }

  function removeWork(index: number) {
    const next = (data.selectedWork || []).filter((_, i) => i !== index);
    updateField("selectedWork", next);
  }

  const navItems = [
    { id: "header", label: "Contact & Title" },
    { id: "summary", label: "Executive Summary" },
    { id: "competencies", label: `Competencies (${data.competencies?.length || 0})` },
    { id: "experience", label: `Experience (${data.structuredExperience.length})` },
    { id: "education", label: `Education (${data.education?.length || 0})` },
    { id: "projects", label: `Selected Work (${data.selectedWork?.length || 0})` },
    { id: "additional", label: "Additional Info" },
  ] as const;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs">
      {/* Top Section Nav Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-100 pb-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeSection === item.id
                ? "bg-brand text-brand-fg shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: HEADER & CONTACT */}
      {activeSection === "header" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Full Name
            </label>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Executive Headline / Title
            </label>
            <input
              type="text"
              value={data.suggestedTitle}
              onChange={(e) => updateField("suggestedTitle", e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer | Cloud Architect | AI Integrations"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Location &amp; Relocation
              </label>
              <input
                type="text"
                value={data.additionalInfo?.locationAndRelocation || data.location || ""}
                onChange={(e) => {
                  updateField("location", e.target.value);
                  updateField("additionalInfo", {
                    ...(data.additionalInfo || {}),
                    locationAndRelocation: e.target.value,
                  });
                }}
                placeholder="e.g. Abuja, FCT, Nigeria (Open to Relocation & Remote)"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Target Niche / Focus
              </label>
              <input
                type="text"
                value={data.targetNiche || ""}
                onChange={(e) => updateField("targetNiche", e.target.value)}
                placeholder="e.g. Fintech, High-scale distributed systems"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: EXECUTIVE SUMMARY WITH WORD FORMATTING TOOLS */}
      {activeSection === "summary" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Executive Profile Summary
              </label>
              <p className="text-[11.5px] text-neutral-500">
                Format your summary with bold highlights, justify or left alignment, bullet points, and headers.
              </p>
            </div>
          </div>

          <CVRichTextField
            value={data.executiveSummary}
            onChange={(val) => {
              // Store HTML / stripped text
              updateField("executiveSummary", stripHtml(val));
            }}
            placeholder="Write your high-impact executive summary here..."
            minHeight="min-h-[140px]"
          />
        </div>
      )}

      {/* SECTION 3: CORE COMPETENCIES */}
      {activeSection === "competencies" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Core Competencies (Pillar — Scope)
              </label>
              <p className="text-[11.5px] text-neutral-500">
                Executive recruiter benchmark: categorize your skills into targeted focus pillars.
              </p>
            </div>
            <button
              type="button"
              onClick={addCompetency}
              className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/15"
            >
              <Icon icon={Add01Icon} size={14} /> Add Pillar
            </button>
          </div>

          <div className="space-y-2.5">
            {(data.competencies || []).map((comp, idx) => (
              <div key={idx} className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 p-2.5">
                <div className="w-1/3 shrink-0">
                  <input
                    type="text"
                    value={comp.pillar}
                    onChange={(e) => updateCompetency(idx, e.target.value, comp.scope)}
                    placeholder="Pillar (e.g. Backend Architecture)"
                    className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-900 focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={comp.scope}
                    onChange={(e) => updateCompetency(idx, comp.pillar, e.target.value)}
                    placeholder="Scope & tools (e.g. Node.js, Go, PostgreSQL, Redis, Microservices)"
                    className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-brand focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCompetency(idx)}
                  className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                  title="Remove competency"
                >
                  <Icon icon={Delete02Icon} size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: PROFESSIONAL EXPERIENCE WITH WORD TOOLS */}
      {activeSection === "experience" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Professional Experience
              </label>
              <p className="text-[11.5px] text-neutral-500">
                Use action verbs, business context, and STAR bullet achievements.
              </p>
            </div>
            <button
              type="button"
              onClick={addExperience}
              className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/15"
            >
              <Icon icon={Add01Icon} size={14} /> Add Role
            </button>
          </div>

          <div className="space-y-4">
            {data.structuredExperience.map((exp, expIdx) => (
              <div
                key={expIdx}
                className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5"
              >
                <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2">
                  <span className="text-xs font-bold text-neutral-700">Role #{expIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(expIdx)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-800"
                  >
                    <Icon icon={Delete02Icon} size={13} /> Remove Role
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <label className="text-[10.5px] font-semibold text-neutral-500">Job Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(expIdx, { ...exp, role: e.target.value })}
                      placeholder="e.g. Lead Full-Stack Engineer"
                      className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-semibold text-neutral-500">Company</label>
                    <input
                      type="text"
                      value={exp.company || ""}
                      onChange={(e) => updateExperience(expIdx, { ...exp, company: e.target.value })}
                      placeholder="e.g. TechCorp Solutions"
                      className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-semibold text-neutral-500">Period</label>
                    <input
                      type="text"
                      value={exp.period || ""}
                      onChange={(e) => updateExperience(expIdx, { ...exp, period: e.target.value })}
                      placeholder="e.g. Oct 2022 — Present"
                      className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-semibold text-neutral-500">Business Context / Summary</label>
                  <input
                    type="text"
                    value={exp.context || ""}
                    onChange={(e) => updateExperience(expIdx, { ...exp, context: e.target.value })}
                    placeholder="Context: High-growth B2B fintech processing $10M+ monthly transactions."
                    className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-brand focus:outline-none"
                  />
                </div>

                {/* Bullets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                      Key Highlights &amp; Accomplishments
                    </span>
                    <button
                      type="button"
                      onClick={() => addHighlight(expIdx)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                    >
                      <Icon icon={Add01Icon} size={12} /> Add Bullet
                    </button>
                  </div>

                  {exp.highlights.map((hl, hlIdx) => (
                    <div key={hlIdx} className="flex items-start gap-2">
                      <span className="mt-2 text-xs text-neutral-400">•</span>
                      <textarea
                        rows={2}
                        value={hl}
                        onChange={(e) => updateHighlight(expIdx, hlIdx, e.target.value)}
                        placeholder="Action verb + Context + Quantifiable outcome..."
                        className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:border-brand focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(expIdx, hlIdx)}
                        className="mt-1.5 rounded p-1 text-neutral-400 hover:text-red-600"
                        title="Remove bullet"
                      >
                        <Icon icon={Delete02Icon} size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: EDUCATION */}
      {activeSection === "education" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Education &amp; Qualifications
              </label>
              <p className="text-[11.5px] text-neutral-500">Degrees, academic awards, and certifications.</p>
            </div>
            <button
              type="button"
              onClick={addEducation}
              className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/15"
            >
              <Icon icon={Add01Icon} size={14} /> Add Education
            </button>
          </div>

          <div className="space-y-2.5">
            {(data.education || []).map((edu, idx) => (
              <div key={idx} className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 p-2.5">
                <div className="grid flex-1 gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, { ...edu, degree: e.target.value })}
                    placeholder="Degree (e.g. B.Sc. Computer Engineering)"
                    className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-900 focus:border-brand focus:outline-none"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, { ...edu, institution: e.target.value })}
                    placeholder="Institution (e.g. Ahmadu Bello University)"
                    className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-brand focus:outline-none"
                  />
                  <input
                    type="text"
                    value={edu.year || ""}
                    onChange={(e) => updateEducation(idx, { ...edu, year: e.target.value })}
                    placeholder="Year (e.g. 2019)"
                    className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-brand focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="rounded p-1 text-neutral-400 hover:text-red-600"
                  title="Remove education"
                >
                  <Icon icon={Delete02Icon} size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: SELECTED WORK / PROJECTS */}
      {activeSection === "projects" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Selected Work / Key Technical Projects
              </label>
              <p className="text-[11.5px] text-neutral-500">Highlight portfolio platforms or key open-source initiatives.</p>
            </div>
            <button
              type="button"
              onClick={addWork}
              className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/15"
            >
              <Icon icon={Add01Icon} size={14} /> Add Project
            </button>
          </div>

          <div className="space-y-2.5">
            {(data.selectedWork || []).map((work, idx) => (
              <div key={idx} className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50/60 p-2.5">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={work.title}
                    onChange={(e) => updateWork(idx, { ...work, title: e.target.value })}
                    placeholder="Project Title (e.g. High-Throughput Payment Orchestrator)"
                    className="w-full max-w-sm rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-900 focus:border-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeWork(idx)}
                    className="rounded p-1 text-neutral-400 hover:text-red-600"
                  >
                    <Icon icon={Delete02Icon} size={15} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={work.description}
                  onChange={(e) => updateWork(idx, { ...work, description: e.target.value })}
                  placeholder="Scope, technologies used, and metrics/impact..."
                  className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-brand focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: ADDITIONAL INFO */}
      {activeSection === "additional" && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Work Arrangement &amp; Availability
            </label>
            <input
              type="text"
              value={data.additionalInfo?.workArrangement || ""}
              onChange={(e) =>
                updateField("additionalInfo", {
                  ...(data.additionalInfo || {}),
                  workArrangement: e.target.value,
                })
              }
              placeholder="e.g. Available Immediately  ·  Open to Contract or Full-time"
              className="w-full rounded border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Languages
            </label>
            <input
              type="text"
              value={(data.additionalInfo?.languages || []).join(", ")}
              onChange={(e) => {
                const langs = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                updateField("additionalInfo", {
                  ...(data.additionalInfo || {}),
                  languages: langs,
                });
              }}
              placeholder="e.g. English (Fluent), Hausa (Native), French (Basic)"
              className="w-full rounded border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              References &amp; Verification Note
            </label>
            <input
              type="text"
              value={data.additionalInfo?.referencesNote || ""}
              onChange={(e) =>
                updateField("additionalInfo", {
                  ...(data.additionalInfo || {}),
                  referencesNote: e.target.value,
                })
              }
              placeholder="e.g. Professional references & verified credentials available upon request"
              className="w-full rounded border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Bottom Action Footer if embedded with direct apply callback */}
      {onApplyAndSave && (
        <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-3">
          <p className="text-[11.5px] text-neutral-500">
            Edits are synced to the PDF preview and will update your profile CV when saved.
          </p>
          <button
            type="button"
            disabled={isSaving}
            onClick={onApplyAndSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-brand-fg shadow-sm transition hover:bg-brand/90 disabled:opacity-50"
          >
            {isSaving ? (
              <>Saving changes...</>
            ) : (
              <>
                <Icon icon={Tick02Icon} size={15} />
                Save &amp; Update CV
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
