import OpenAI from "openai";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

/** Check if either Gemini or OpenAI API credentials are ready */
export function isAIConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

/** Low-level Gemini caller */
async function callGemini(opts: {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  const model = GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: opts.userPrompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      responseMimeType: opts.jsonMode ? "application/json" : "text/plain",
    },
  };

  if (opts.systemPrompt) {
    body.systemInstruction = { parts: [{ text: opts.systemPrompt }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini API");
  return text;
}

/** Low-level OpenAI caller */
async function callOpenAI(opts: {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}): Promise<string> {
  const openai = getOpenAIClient();
  if (!openai) throw new Error("OPENAI_API_KEY is not configured");

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: "system", content: opts.systemPrompt });
  }
  messages.push({ role: "user", content: opts.userPrompt });

  const res = await openai.chat.completions.create({
    model: AI_MODEL,
    messages,
    temperature: opts.temperature ?? 0.5,
    ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
  });

  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}

/** Unified text/JSON AI dispatcher */
export async function askAI(opts: {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}): Promise<string | null> {
  // Prefer Gemini if available (e.g. Free Tier)
  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGemini(opts);
    } catch (err) {
      console.warn("Gemini call failed, trying OpenAI if configured:", err);
      if (process.env.OPENAI_API_KEY) {
        return await callOpenAI(opts);
      }
      throw err;
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    return await callOpenAI(opts);
  }

  return null;
}

/** Strict JSON helper with automated fallbacks and markdown stripping */
export async function askAIJson<T>(opts: {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  fallback: () => T;
}): Promise<T> {
  try {
    const raw = await askAI({ ...opts, jsonMode: true });
    if (!raw) return opts.fallback();
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn("AI generation error, using fallback heuristics:", err);
    return opts.fallback();
  }
}

// =========================================================================
// 1. JOB POSTING GENERATOR (Employer)
// =========================================================================

export type GenerateJobParams = {
  title?: string;
  type?: string;
  notes?: string;
  companyName?: string;
};

export type GeneratedJobResult = {
  title: string;
  type: string;
  salary_range: string;
  description: string;
  requirements: string;
  skills: string[];
};

export async function generateJobListing(params: GenerateJobParams): Promise<GeneratedJobResult> {
  const roleTitle = params.title?.trim() || "Remote Software Engineer";
  const prompt = `You are an expert tech recruiter and hiring consultant for a modern remote jobs platform called JOMP.
Create a comprehensive, engaging, and realistic job posting based on the employer's draft input:

Title hint: "${roleTitle}"
Job Type: "${params.type || "full-time"}"
Company: "${params.companyName || "Our Company"}"
Extra Notes / requirements from employer: "${params.notes || "Create a modern, high quality posting"}"

Respond ONLY with a valid JSON object with the following fields:
{
  "title": "A crisp, industry standard job title",
  "type": "full-time" | "part-time" | "contract" | "internship",
  "salary_range": "e.g. $3,000 – $4,500 / month or $80,000 – $110,000 / year",
  "description": "Engaging job description with background, responsibilities, and team culture",
  "requirements": "Bulleted list starting with • of realistic qualifications, technical skills, and experience",
  "skills": ["Array", "of", "5-8", "key", "skill", "tags"]
}`;

  return askAIJson<GeneratedJobResult>({
    systemPrompt: "You are a professional HR and recruitment AI assistant that outputs strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.7,
    fallback: () => ({
      title: roleTitle,
      type: params.type || "full-time",
      salary_range: "$3,000 – $5,000 / month",
      description: `We are looking for a talented ${roleTitle} to join our remote team at ${params.companyName || "our company"}.\n\nIn this role, you will collaborate with cross-functional team members to build, test, and ship high-impact features. You will take ownership of key project deliverables and ensure excellent code quality and user experience.\n\nA typical week:\n• Building and refining core product workflows\n• Collaborating asynchronously across timezones\n• Reviewing PRs and participating in architectural planning`,
      requirements: `• 3+ years of professional experience in related domains\n• Proven track record of delivering clean, scalable solutions\n• Strong communication and async collaboration skills\n• Self-directed with high attention to detail`,
      skills: ["React", "TypeScript", "Node.js", "Git", "API Design", "Problem Solving"],
    }),
  });
}

// =========================================================================
// 2. CANDIDATE SCREENING (Employer)
// =========================================================================

export type CandidateScoreParams = {
  jobTitle: string;
  jobDescription?: string;
  jobRequirements?: string;
  candidateName?: string;
  candidateTitle?: string;
  candidateBio?: string;
  candidateSkills?: string[];
  coverLetter?: string;
};

export type CandidateScreeningResult = {
  score: number; // 0 to 100
  grade: "Strong Match" | "Good Match" | "Moderate Match" | "Low Match";
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendation: "Shortlist for Interview" | "Hold for Review" | "Decline";
};

export async function screenCandidate(params: CandidateScoreParams): Promise<CandidateScreeningResult> {
  const candidateSkills = params.candidateSkills || [];
  const prompt = `Analyze this candidate's application against the job requirements and provide a fair, objective screening evaluation.

JOB DETAILS:
Title: ${params.jobTitle}
Description: ${params.jobDescription || "Not provided"}
Requirements: ${params.jobRequirements || "Not provided"}

CANDIDATE DETAILS:
Name: ${params.candidateName || "Candidate"}
Professional Title: ${params.candidateTitle || "Not specified"}
Bio: ${params.candidateBio || "Not provided"}
Skills: ${candidateSkills.join(", ") || "None listed"}
Cover Letter / Note: ${params.coverLetter || "None provided"}

Respond ONLY with a valid JSON object:
{
  "score": integer between 0 and 100,
  "grade": "Strong Match" | "Good Match" | "Moderate Match" | "Low Match",
  "summary": "2-3 sentences summarizing the fit and potential value of this candidate",
  "strengths": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "gaps": ["potential gap or area to probe in interview 1", "potential gap 2"],
  "recommendation": "Shortlist for Interview" | "Hold for Review" | "Decline"
}`;

  return askAIJson<CandidateScreeningResult>({
    systemPrompt: "You are an objective, experienced tech recruiter assistant that outputs strict JSON.",
    userPrompt: prompt,
    temperature: 0.4,
    fallback: () => {
      const hasOverlap = candidateSkills.length > 0;
      const score = hasOverlap ? 85 : 70;
      return {
        score,
        grade: score >= 80 ? "Strong Match" : "Good Match",
        summary: `${params.candidateName || "The candidate"} demonstrates relevant experience for the ${params.jobTitle} position with strong alignment in core fundamentals.`,
        strengths: [
          "Relevant background and skill profile",
          "Clear professional communication",
          candidateSkills.length > 0
            ? `Key skills demonstrated: ${candidateSkills.slice(0, 3).join(", ")}`
            : "Demonstrated eagerness to contribute",
        ],
        gaps: ["Verify domain-specific depth during technical discussion", "Confirm remote time-zone overlap"],
        recommendation: score >= 80 ? "Shortlist for Interview" : "Hold for Review",
      };
    },
  });
}

// =========================================================================
// 3. INTERVIEW QUESTIONS (Employer)
// =========================================================================

export type InterviewQuestionsParams = {
  jobTitle: string;
  jobRequirements?: string;
  candidateName?: string;
  candidateSkills?: string[];
  candidateBio?: string;
};

export type InterviewQuestion = {
  category: "Technical" | "Role-Specific" | "Behavioral" | "Culture & Remote";
  question: string;
  whatToLookFor: string;
};

export async function generateInterviewQuestions(
  params: InterviewQuestionsParams,
): Promise<{ questions: InterviewQuestion[] }> {
  const prompt = `Generate 4 tailored, high-signal interview questions for hiring a ${params.jobTitle}.
Candidate Name: ${params.candidateName || "Candidate"}
Requirements: ${params.jobRequirements || "General requirements"}
Candidate Skills: ${(params.candidateSkills || []).join(", ") || "General"}

Respond ONLY with a valid JSON object:
{
  "questions": [
    {
      "category": "Technical" | "Role-Specific" | "Behavioral" | "Culture & Remote",
      "question": "The question string",
      "whatToLookFor": "What good candidates say / key signals to assess"
    }
  ]
}`;

  return askAIJson<{ questions: InterviewQuestion[] }>({
    systemPrompt: "You are an expert hiring manager creating high-signal interview questions. Output strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.5,
    fallback: () => ({
      questions: [
        {
          category: "Role-Specific",
          question: `Can you walk us through a recent project where you took ownership from conception to delivery in a ${params.jobTitle} capacity?`,
          whatToLookFor: "Clear understanding of architecture, problem solving, and ability to measure business outcomes.",
        },
        {
          category: "Technical",
          question: "How do you approach debugging complex, async or distributed issues in production?",
          whatToLookFor: "Systematic investigation mindset, telemetry usage, and root cause analysis.",
        },
        {
          category: "Culture & Remote",
          question: "How do you organize your work, manage priorities, and communicate asynchronously in a remote team?",
          whatToLookFor: "Proactive communication, documentation habits, and self-direction.",
        },
        {
          category: "Behavioral",
          question: "Tell us about a time you disagreed on a technical or product decision with a teammate. How did you resolve it?",
          whatToLookFor: "Empathy, constructive dialogue, and commitment to the team's shared goals.",
        },
      ],
    }),
  });
}

// =========================================================================
// 4. CANDIDATE BIO & PROFILE ENHANCER
// =========================================================================

export type EnhanceBioParams = {
  currentBio?: string;
  currentTitle?: string;
  skills?: string[];
};

export type EnhancedBioResult = {
  enhancedBio: string;
  suggestedTitle: string;
  suggestedSkills: string[];
  keyHighlights: string[];
};

export async function enhanceCandidateBio(params: EnhanceBioParams): Promise<EnhancedBioResult> {
  const title = params.currentTitle?.trim() || "Full-Stack Software Engineer";
  const prompt = `You are a top career advisor and resume coach on JOMP.
Help an applicant polish their profile so it stands out to top remote companies.

Current Title: "${params.currentTitle || ""}"
Current Bio / Summary: "${params.currentBio || ""}"
Current Skills: "${(params.skills || []).join(", ")}"

Respond ONLY with a valid JSON object:
{
  "suggestedTitle": "Polished, professional 2-4 word job title",
  "enhancedBio": "Engaging, professional 2-3 sentence bio (under 500 characters) highlighting value, experience, and remote readiness",
  "suggestedSkills": ["List", "of", "6-10", "highly", "relevant", "skills"],
  "keyHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
}`;

  return askAIJson<EnhancedBioResult>({
    systemPrompt: "You are a world-class career strategist. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.6,
    fallback: () => ({
      suggestedTitle: title,
      enhancedBio: params.currentBio?.trim()
        ? `${params.currentBio.trim()} Passionate about building performant, user-centered web applications and collaborating effectively in fast-moving remote teams.`
        : `Experienced ${title} with a track record of building performant, accessible web applications. Skilled in modern frontend & backend architectures, async collaboration, and continuous delivery.`,
      suggestedSkills: Array.from(new Set([...(params.skills || []), "TypeScript", "React", "Node.js", "Git", "Problem Solving"])),
      keyHighlights: ["Strong remote async collaboration", "Modern engineering best practices", "End-to-end feature delivery"],
    }),
  });
}

// =========================================================================
// 5. TAILORED APPLICATION PITCH (Candidate)
// =========================================================================

export type TailorPitchParams = {
  jobTitle: string;
  companyName?: string;
  jobDescription?: string;
  candidateName?: string;
  candidateTitle?: string;
  candidateBio?: string;
  candidateSkills?: string[];
};

export type TailoredPitchResult = {
  coverLetter: string;
  matchingPoints: string[];
};

export async function generateApplicationPitch(params: TailorPitchParams): Promise<TailoredPitchResult> {
  const prompt = `Write a compelling, concise, and authentic cover note (under 180 words) for a job applicant applying on JOMP.

Job: ${params.jobTitle} at ${params.companyName || "Company"}
Job Description Summary: ${params.jobDescription || "Remote position"}
Candidate: ${params.candidateName || "Applicant"} (${params.candidateTitle || "Professional"})
Candidate Bio: ${params.candidateBio || ""}
Candidate Skills: ${(params.candidateSkills || []).join(", ")}

Respond ONLY with a valid JSON object:
{
  "coverLetter": "The concise cover letter text with paragraphs",
  "matchingPoints": ["Point 1 why you're a great fit", "Point 2", "Point 3"]
}`;

  return askAIJson<TailoredPitchResult>({
    systemPrompt: "You are a recruitment pitch coach. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.7,
    fallback: () => ({
      coverLetter: `Hi ${params.companyName || "Hiring Team"},\n\nI was excited to see your opening for the ${params.jobTitle} position. With my background in ${(params.candidateSkills || ["modern software development"]).slice(0, 3).join(", ")} and experience delivering high-quality remote work, I am confident I can make an immediate impact on your team.\n\nI would love the opportunity to connect and discuss how my skills align with your goals.\n\nBest regards,\n${params.candidateName || "Candidate"}`,
      matchingPoints: [
        "Relevant technical and domain experience",
        "Proven async and remote collaboration skills",
        "Commitment to high product velocity and quality",
      ],
    }),
  });
}

// =========================================================================
// 6. AI CV ARRANGER & NICHE STRUCTURE OPTIMIZER (Candidate)
// =========================================================================

export type ArrangeCVParams = {
  rawCVText?: string;
  currentTitle?: string;
  currentBio?: string;
  skills?: string[];
  targetNiche?: string;
};

export type CoreCompetencyItem = {
  pillar: string;
  scope: string;
};

export type StructuredExperienceItem = {
  role: string;
  company?: string;
  period?: string;
  context?: string;
  highlights: string[];
};

export type EducationItem = {
  degree: string;
  institution: string;
  year?: string;
  details?: string;
};

export type TechnicalWorkItem = {
  title: string;
  description: string;
};

export type AdditionalInfoItem = {
  locationAndRelocation?: string;
  languages?: string[];
  workArrangement?: string;
  referencesNote?: string;
};

export type ArrangedCVResult = {
  targetNiche: string;
  suggestedTitle: string;
  headlinePillars?: string[];
  executiveSummary: string;
  competencies?: CoreCompetencyItem[];
  skillsByCategory: Record<string, string[]>;
  recommendedSkills: string[];
  structuredExperience: StructuredExperienceItem[];
  education?: EducationItem[];
  selectedWork?: TechnicalWorkItem[];
  additionalInfo?: AdditionalInfoItem;
  nicheStrengths: string[];
  atsKeywords: string[];
  formattedMarkdown: string;
};

export async function arrangeAndOptimizeCV(params: ArrangeCVParams): Promise<ArrangedCVResult> {
  const fallbackTitle = params.currentTitle?.trim() || "ICT Officer · End-User Support · Digital Records & Asset Control";
  const prompt = `You are an elite executive CV strategist, senior technical recruiter, and career architect.
Analyze the user's background and produce an executive, fine-tuned, high-impact CV structured strictly in the following professional standard:

STANDARD BENCHMARK STRUCTURE:
1. HEADLINE: A multi-pillar headline: Primary Title · Core Focus 1 · Core Focus 2 (e.g. "IT / ICT Officer · End-User Support · Digital Records & Asset Control").
2. PROFILE (EXECUTIVE SUMMARY): A dense, authoritative 4-6 sentence narrative stating candidate background, operating contexts (ministries, NGOs, tech firms), dual technical & operational discipline (e.g. standard operating procedures, data protection, compliance), tangible systems or tools built/deployed (with metrics, e.g. "offline staff-directory tool covering 400+ officers"), and clear target value proposition.
3. CORE COMPETENCIES: 5-8 bulleted competency pillars, formatted as: "Pillar Name — detailed scope, software/tools, scale (e.g. 60+ users), protocols, and concrete routine responsibilities".
4. PROFESSIONAL EXPERIENCE:
   - For each role: Role Title, Company/Ministry/Organization, Location, Date range.
   - Optional contextual statement (e.g. "Contract staff. Followed the Principal from FMWA to FMYD.")
   - 3-6 high-impact action bullets with active verbs, system/software names, protocols, and quantifiable outcomes.
5. EDUCATION & CERTIFICATIONS: Degrees, professional certificates, training academies, and capstone projects.
6. SELECTED TECHNICAL WORK / PROJECTS (if software, internal tools, or key deliverables exist): Title — stack, architecture, and live operational impact.
7. ADDITIONAL INFORMATION: Languages, location/remote availability, work arrangement clarity, and reference notice.

INPUT DATA:
Target Niche / Focus hint: "${params.targetNiche || "Information Technology & Operations"}"
Current Title: "${params.currentTitle || ""}"
Current Summary / Bio: "${params.currentBio || ""}"
Current Skills: "${(params.skills || []).join(", ")}"
Raw CV Content / Notes:
${params.rawCVText || "Extract and arrange standard roles and skills based on the title and bio."}

Respond ONLY with a strictly valid JSON object matching this schema:
{
  "targetNiche": "2-4 word primary niche name",
  "suggestedTitle": "Multi-pillar headline (e.g. IT / ICT Officer · End-User Support · Digital Records & Asset Control)",
  "headlinePillars": ["Pillar 1", "Pillar 2", "Pillar 3"],
  "executiveSummary": "Dense, authoritative 4-6 sentence narrative profile",
  "competencies": [
    {
      "pillar": "Pillar Name (e.g. End-user support)",
      "scope": "software installation, email and account setup, password resets, first-line troubleshooting for 60+ users"
    }
  ],
  "skillsByCategory": {
    "Category Name": ["Skill 1", "Skill 2"]
  },
  "recommendedSkills": ["Flat array of 8-15 core skills for candidate profile"],
  "structuredExperience": [
    {
      "role": "Role Title",
      "company": "Organization / Ministry — Location",
      "period": "e.g. June 2025 – Present",
      "context": "Brief context or engagement type (optional)",
      "highlights": [
        "Action verb + concrete responsibility + quantifiable result",
        "Action verb + tools/protocols deployed + organizational impact"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree or Certificate title",
      "institution": "University / Academy, Location",
      "year": "e.g. 2025",
      "details": "Capstone project, honors, or key coursework (optional)"
    }
  ],
  "selectedWork": [
    {
      "title": "Tool or Project Name",
      "description": "Tech stack, purpose, and production use summary"
    }
  ],
  "additionalInfo": {
    "locationAndRelocation": "e.g. Resident in Abuja, FCT, Nigeria",
    "languages": ["English", "Hausa"],
    "workArrangement": "e.g. Available part-time or full-time with remote support capability",
    "referencesNote": "References available on request"
  },
  "nicheStrengths": ["Positioning strength 1", "Positioning strength 2"],
  "atsKeywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
  "formattedMarkdown": "# Full Name\\n**Headline**... (Full formatted markdown CV matching benchmark standard)"
}`;

  return askAIJson<ArrangedCVResult>({
    systemPrompt: "You are a world-class executive CV strategist and senior recruiter. Return strictly valid JSON following the benchmark structure.",
    userPrompt: prompt,
    temperature: 0.4,
    fallback: () => ({
      targetNiche: params.targetNiche?.trim() || "IT & Technical Operations",
      suggestedTitle: fallbackTitle,
      headlinePillars: ["IT / ICT Officer", "End-User Support", "Digital Records & Asset Control"],
      executiveSummary: params.currentBio?.trim()
        ? params.currentBio.trim()
        : `Experienced ICT and technical operations officer with a strong foundation in end-user support, digital archiving, and asset control across structured public-sector and humanitarian environments. Combines day-to-day hardware/software troubleshooting, productivity suites, and account provisioning with rigorous operational discipline: data protection compliance, need-to-know access control, and systematic reporting to leadership. Builds reliable internal digital tools that eliminate paper-based bottlenecks and streamline daily organizational workflows.`,
      competencies: [
        {
          pillar: "End-user support",
          scope: "Software installation (Microsoft Office, antivirus, line-of-business tools), email and account provisioning, password resets, and first-line hardware troubleshooting.",
        },
        {
          pillar: "Cloud documents & records",
          scope: "Shared document libraries, cloud file synchronization, backup routines, digital archiving, folder-structure standards, and user guidance.",
        },
        {
          pillar: "IT assets & inventory",
          scope: "Device issuance logs, asset tagging, specification of replacements, coordination of laptop and printer maintenance, and consumable supplies.",
        },
        {
          pillar: "Connectivity & networking",
          scope: "ISP liaison and service-quality follow-up, router and network troubleshooting, keeping distributed teams reachable on official channels.",
        },
        {
          pillar: "Data protection & governance",
          scope: "Access control, license accountability, and staff cyber-hygiene briefings aligned with data protection standards and confidentiality protocols.",
        },
        {
          pillar: "Reporting & handovers",
          scope: "Incident logs, weekly and monthly activity notes for supervisors, controlled credential registers, and formal written handover documentation.",
        },
      ],
      skillsByCategory: {
        "Technical Support": ["Hardware Diagnostics", "OS Deployment", "Printer Configuration", "Network Troubleshooting"],
        "Cloud & Administration": ["Google Workspace", "Microsoft 365", "SharePoint", "User Provisioning"],
        "Data & Governance": ["Data Protection (NDPA)", "Access Control", "Asset Management", "Incident Reporting"],
        "Development & Tools": ["Internal Tooling", "Git", "API Integrations", "Process Automation"],
      },
      recommendedSkills: Array.from(new Set([...(params.skills || []), "End-User Support", "Asset Management", "Cloud Documents", "Troubleshooting", "Data Protection", "Network Administration"])),
      structuredExperience: [
        {
          role: fallbackTitle.split("·")[0].trim() || "ICT / Operations Support",
          company: "Executive Office & Operations — Abuja",
          period: "2024 – Present",
          context: "Contract technical operations support.",
          highlights: [
            "Install, configure, and maintain productivity software and operational systems across workstations, resolving daily user tickets with high satisfaction.",
            "Designed and deployed lightweight internal tools for staff directories and asset tracking, cutting repeated registry inquiries by over 50%.",
            "Maintain hardware inventory records, track device issuance, coordinate vendor repairs, and enforce scheduled backup protocols.",
            "Briefed operational personnel on secure computing practices and confidential data handling in compliance with regulatory standards.",
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor of Science",
          institution: "Accredited University",
          year: "2024",
          details: "Focused on information systems, quantitative analysis, and project planning.",
        },
      ],
      selectedWork: [
        {
          title: "Internal Staff Directory Tool",
          description: "Offline-capable directory and asset record application supporting quick personnel verification without physical paperwork.",
        },
      ],
      additionalInfo: {
        locationAndRelocation: "Abuja, FCT, Nigeria",
        languages: ["English", "Hausa"],
        workArrangement: "Available for on-site or hybrid roles with remote support capability",
        referencesNote: "Professional references available on request",
      },
      nicheStrengths: [
        "Proven ability to bridge hands-on end-user support with institutional data discipline",
        "Experience building practical internal tools that eliminate paper-based processes",
      ],
      atsKeywords: ["ICT Support", "End-User Troubleshooting", "Asset Management", "Data Protection", "SharePoint", "Network Support", "Remote Operations"],
      formattedMarkdown: `# Candidate Name\n**${fallbackTitle}**\n\n## PROFILE\nExperienced specialist combining technical support with operational discipline.\n\n## CORE COMPETENCIES\n- **End-user support** — Software install, account setup, troubleshooting.\n- **Asset management** — Device issuance, maintenance, inventory control.\n\n## PROFESSIONAL EXPERIENCE\n### ${fallbackTitle}\n*2024 – Present*\n- Supported operational systems and end users with high reliability.\n- Automated paper workflows using internal tools.`,
    }),
  });
}

// =========================================================================
// 7. AI NICHE JOB MATCHER (Candidate)
// =========================================================================

export type NicheMatchJobInput = {
  id: string;
  title: string;
  company?: string;
  salary_range?: string;
  type?: string;
  description?: string;
  requirements?: string;
};

export type NicheMatchParams = {
  candidateTitle?: string;
  candidateBio?: string;
  candidateSkills?: string[];
  targetNiche?: string;
  jobs: NicheMatchJobInput[];
};

export type JobNicheMatch = {
  jobId: string;
  fitScore: number; // 0 to 100
  fitGrade: "Exceptional Match" | "Strong Match" | "Good Match" | "Moderate Match";
  headline: string;
  matchingHighlights: string[];
  recommendedAdditions: string[];
};

export async function matchJobsToNiche(params: NicheMatchParams): Promise<{ matches: JobNicheMatch[] }> {
  if (!params.jobs.length) return { matches: [] };

  const candidateSummary = `
Title: ${params.candidateTitle || "Professional"}
Niche: ${params.targetNiche || "Tech / Remote"}
Skills: ${(params.candidateSkills || []).join(", ")}
Bio: ${params.candidateBio || ""}
`.trim();

  const jobsData = params.jobs.slice(0, 15).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company || "Company",
    type: job.type || "full-time",
    salary: job.salary_range || "Competitive",
    excerpt: (job.description || "").slice(0, 250),
    requirements: (job.requirements || "").slice(0, 250),
  }));

  const prompt = `Analyze how well each job matches the candidate's niche and background:

CANDIDATE:
${candidateSummary}

AVAILABLE JOBS:
${JSON.stringify(jobsData, null, 2)}

INSTRUCTIONS:
Evaluate semantic niche alignment, core skill synergy, and role compatibility.
Respond ONLY with a valid JSON object:
{
  "matches": [
    {
      "jobId": "the job id",
      "fitScore": integer between 45 and 99,
      "fitGrade": "Exceptional Match" | "Strong Match" | "Good Match" | "Moderate Match",
      "headline": "1 punchy sentence explaining why this matches their niche",
      "matchingHighlights": ["Highlight 1", "Highlight 2"],
      "recommendedAdditions": ["1-2 skills/points candidate should highlight for this role"]
    }
  ]
}`;

  return askAIJson<{ matches: JobNicheMatch[] }>({
    systemPrompt: "You are an expert career matchmaker and niche analyst. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.3,
    fallback: () => {
      const candidateSkillsLower = (params.candidateSkills || []).map((s) => s.toLowerCase());
      const matches: JobNicheMatch[] = params.jobs.map((job) => {
        const text = `${job.title} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
        const matched = candidateSkillsLower.filter((s) => text.includes(s));
        const ratio = candidateSkillsLower.length > 0 ? matched.length / candidateSkillsLower.length : 0.5;
        const score = Math.min(96, Math.max(55, Math.round(60 + ratio * 36)));
        const grade: JobNicheMatch["fitGrade"] =
          score >= 90 ? "Exceptional Match" : score >= 80 ? "Strong Match" : score >= 70 ? "Good Match" : "Moderate Match";

        return {
          jobId: job.id,
          fitScore: score,
          fitGrade: grade,
          headline:
            matched.length > 0
              ? `Strong niche overlap with your ${matched.slice(0, 2).join(" & ")} experience.`
              : `Relevant remote opportunity in ${job.title}.`,
          matchingHighlights:
            matched.length > 0
              ? [`Matches your skills in: ${matched.slice(0, 3).join(", ")}`]
              : ["Transferable experience aligns with core responsibilities"],
          recommendedAdditions: ["Highlight async remote communication and recent project achievements"],
        };
      });

      return { matches };
    },
  });
}

// =========================================================================
// 8. NATURAL LANGUAGE NICHE SEARCH PARSER (Candidate)
// =========================================================================

export type NicheSearchAnalysis = {
  searchKeywords: string;
  inferredJobTypes: string[];
  detectedNiche: string;
  summary: string;
};

export async function parseNicheSearch(userPrompt: string): Promise<NicheSearchAnalysis> {
  const prompt = `The user typed a job search query on a remote job board: "${userPrompt}".
Extract clean search keywords and identify their niche intent.

Respond ONLY with a valid JSON object:
{
  "searchKeywords": "1-3 high-signal keyword terms for database search (e.g. 'React frontend' or 'Node backend')",
  "inferredJobTypes": ["full-time", "contract", "part-time", "internship"] (empty array if not specified),
  "detectedNiche": "2-4 word niche descriptor",
  "summary": "1 sentence summarizing what the user is looking for"
}`;

  return askAIJson<NicheSearchAnalysis>({
    systemPrompt: "You are a recruitment search engine parser. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.2,
    fallback: () => ({
      searchKeywords: userPrompt.replace(/[^\w\s-]/g, "").trim(),
      inferredJobTypes: [],
      detectedNiche: "General Remote Tech",
      summary: `Searching for jobs matching "${userPrompt}"`,
    }),
  });
}

// =========================================================================
// 9. JOB-FIT & SKILL GAP ADVISOR (Candidate)
// =========================================================================

export type JobFitParams = {
  jobTitle: string;
  companyName?: string;
  jobDescription?: string;
  jobRequirements?: string;
  candidateTitle?: string;
  candidateBio?: string;
  candidateSkills?: string[];
};

export type JobFitAnalysis = {
  score: number; // 0 to 100
  grade: "Exceptional Fit" | "Strong Fit" | "Good Match" | "Moderate Fit" | "Challenging Fit";
  summary: string;
  matchedStrengths: string[];
  missingGaps: string[];
  strategicAdvice: string[];
};

export async function analyzeJobFit(params: JobFitParams): Promise<JobFitAnalysis> {
  const candidateSkills = params.candidateSkills || [];
  const prompt = `Analyze this candidate's fit for the following job listing and provide an objective skill-gap assessment:

JOB:
Title: ${params.jobTitle}
Company: ${params.companyName || "Company"}
Description: ${params.jobDescription?.slice(0, 1500) || "Not provided"}
Requirements: ${params.jobRequirements?.slice(0, 1200) || "Not provided"}

CANDIDATE:
Title: ${params.candidateTitle || "Not specified"}
Bio: ${params.candidateBio?.slice(0, 800) || "Not provided"}
Skills: ${candidateSkills.join(", ") || "None listed"}

INSTRUCTIONS:
1. Calculate a realistic Match Score (0 to 100).
2. List 2-4 concrete strengths the candidate brings that directly map to the job requirements.
3. List 1-3 gaps or unverified areas in their background (e.g. missing tools, cloud platforms, seniority depth).
4. Provide 2-3 strategic tips on how the candidate should position themselves or write their application note to overcome these gaps.

Respond ONLY with a valid JSON object:
{
  "score": integer between 40 and 98,
  "grade": "Exceptional Fit" | "Strong Fit" | "Good Match" | "Moderate Fit" | "Challenging Fit",
  "summary": "2 sentences summarizing the candidate's alignment with this role",
  "matchedStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "missingGaps": ["Gap 1", "Gap 2"],
  "strategicAdvice": ["Strategic advice 1", "Strategic advice 2"]
}`;

  return askAIJson<JobFitAnalysis>({
    systemPrompt: "You are an expert career strategist and technical recruiter. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.3,
    fallback: () => {
      const skillsLower = candidateSkills.map((s) => s.toLowerCase());
      const jobText = `${params.jobTitle} ${params.jobDescription || ""} ${params.jobRequirements || ""}`.toLowerCase();
      const matched = candidateSkills.filter((s) => jobText.includes(s.toLowerCase()));
      const ratio = candidateSkills.length > 0 ? matched.length / candidateSkills.length : 0.5;
      const score = Math.min(95, Math.max(50, Math.round(55 + ratio * 40)));
      const grade: JobFitAnalysis["grade"] =
        score >= 90 ? "Exceptional Fit" : score >= 80 ? "Strong Fit" : score >= 70 ? "Good Match" : "Moderate Fit";

      return {
        score,
        grade,
        summary: `Your profile aligns well with the ${params.jobTitle} position, demonstrating core competencies in key technical and collaboration areas.`,
        matchedStrengths:
          matched.length > 0
            ? matched.map((s) => `Demonstrated skill in ${s}`)
            : ["Strong foundation in modern software best practices", "Remote async communication aptitude"],
        missingGaps: ["Verify hands-on experience with team-specific toolchains and architectural scale"],
        strategicAdvice: [
          "In your cover note, highlight measurable outcomes from recent projects rather than just tech stacks.",
          "Demonstrate your ability to self-manage and deliver asynchronously across timezones.",
        ],
      };
    },
  });
}

// =========================================================================
// 10. INTERACTIVE MOCK INTERVIEW CRITIQUE (Candidate)
// =========================================================================

export type MockInterviewCritiqueParams = {
  jobTitle: string;
  question: string;
  candidateAnswer: string;
};

export type MockInterviewCritique = {
  score: number; // 1 to 10
  rating: "Exceptional" | "Solid" | "Needs Improvement";
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedSTARAnswer: string;
};

export async function evaluateInterviewAnswer(params: MockInterviewCritiqueParams): Promise<MockInterviewCritique> {
  const prompt = `Critique this candidate's interview answer for a remote ${params.jobTitle} role:

QUESTION:
"${params.question}"

CANDIDATE ANSWER:
"${params.candidateAnswer}"

INSTRUCTIONS:
Evaluate clarity, technical depth, remote communication maturity, and structure (STAR method: Situation, Task, Action, Result).
Respond ONLY with a valid JSON object:
{
  "score": number between 1 and 10 (can be decimal like 8.5),
  "rating": "Exceptional" | "Solid" | "Needs Improvement",
  "feedback": "2-3 sentences of constructive coaching on their answer",
  "strengths": ["1-2 things done well in this answer"],
  "improvements": ["1-2 concrete ways to strengthen the answer"],
  "suggestedSTARAnswer": "A concise, high-impact example answer demonstrating the STAR method (under 120 words)"
}`;

  return askAIJson<MockInterviewCritique>({
    systemPrompt: "You are a seasoned hiring manager and interview coach. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.4,
    fallback: () => ({
      score: 8.0,
      rating: "Solid",
      feedback:
        "Your answer is clear and addresses the core question. To make it stand out even more to remote hiring managers, emphasize the measurable business impact of your work.",
      strengths: ["Clear logical flow and relevant examples", "Demonstrates problem-solving mindset"],
      improvements: ["Quantify results (e.g. 'reduced latency by 35%' or 'shipped 2 weeks ahead of schedule')"],
      suggestedSTARAnswer: `In my last role, we faced a scaling bottleneck during peak traffic (Situation). I was tasked with identifying the root cause and stabilizing performance (Task). I profiled our database queries, added caching at the edge, and refactored the API layer (Action). This reduced response times by 40% and prevented downtime during launch (Result).`,
    }),
  });
}

// =========================================================================
// 11. BATCH APPLICANT RANKING & SHORTLIST (Employer)
// =========================================================================

export type ApplicantForRanking = {
  id: string;
  name: string;
  title?: string;
  skills?: string[];
  bio?: string;
  coverLetter?: string;
};

export type RankedApplicant = {
  id: string;
  score: number; // 0 to 100
  tier: "Top Pick" | "Strong Potential" | "Review Further" | "Low Match";
  standoutReason: string;
  potentialRiskOrGap: string;
};

export async function rankJobApplicants(params: {
  jobTitle: string;
  jobRequirements?: string;
  applicants: ApplicantForRanking[];
}): Promise<{ ranked: RankedApplicant[] }> {
  if (!params.applicants.length) return { ranked: [] };

  const prompt = `Rank these candidate applications for the role of "${params.jobTitle}":

JOB REQUIREMENTS:
${params.jobRequirements?.slice(0, 1500) || "General requirements for " + params.jobTitle}

APPLICANTS:
${JSON.stringify(
  params.applicants.slice(0, 15).map((a) => ({
    id: a.id,
    name: a.name,
    title: a.title || "Applicant",
    skills: (a.skills || []).slice(0, 10).join(", "),
    bio: (a.bio || "").slice(0, 200),
    coverLetter: (a.coverLetter || "").slice(0, 250),
  })),
  null,
  2,
)}

INSTRUCTIONS:
Evaluate candidate suitability, skill overlap, and cover note clarity.
Order the ranked array by score descending (highest score first).
Respond ONLY with a valid JSON object:
{
  "ranked": [
    {
      "id": "applicant id",
      "score": integer between 30 and 99,
      "tier": "Top Pick" | "Strong Potential" | "Review Further" | "Low Match",
      "standoutReason": "1 sentence on why this candidate is compelling",
      "potentialRiskOrGap": "1 sentence on what to verify in an interview"
    }
  ]
}`;

  return askAIJson<{ ranked: RankedApplicant[] }>({
    systemPrompt: "You are an executive talent screener and recruiter. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.2,
    fallback: () => {
      const ranked: RankedApplicant[] = params.applicants.map((app, idx) => {
        const skillsCount = app.skills?.length || 0;
        const score = Math.min(97, Math.max(50, 75 + skillsCount * 3 - idx * 2));
        const tier: RankedApplicant["tier"] =
          score >= 90 ? "Top Pick" : score >= 80 ? "Strong Potential" : score >= 70 ? "Review Further" : "Low Match";

        return {
          id: app.id,
          score,
          tier,
          standoutReason:
            skillsCount > 0
              ? `Strong background with relevant skills in ${(app.skills || []).slice(0, 2).join(" & ")}.`
              : "Clear background and motivation in application note.",
          potentialRiskOrGap: "Probe depth of hands-on production experience in interview.",
        };
      });

      return { ranked: ranked.sort((a, b) => b.score - a.score) };
    },
  });
}


// =========================================================================
// 12. SALARY BENCHMARK & NEGOTIATION HELPER (Candidate)
// =========================================================================

export type SalaryBenchmarkParams = {
  jobTitle: string;
  companyName?: string;
  jobDescription?: string;
  candidateTitle?: string;
  candidateSkills?: string[];
  candidateBio?: string;
};

export type SalaryBenchmarkResult = {
  estimatedRange: {
    low: number;
    mid: number;
    high: number;
    currency: string;
  };
  marketPosition: string;
  factors: string[];
  negotiationTips: string[];
  talkingPoints: string[];
};

export async function analyzeSalaryBenchmark(params: SalaryBenchmarkParams): Promise<SalaryBenchmarkResult> {
  const candidateSkills = params.candidateSkills || [];
  const prompt = `Estimate the annual salary range for the following job and candidate profile, and provide salary negotiation guidance:

JOB:
Title: ${params.jobTitle}
Company: ${params.companyName || "Not specified"}
Description: ${params.jobDescription?.slice(0, 1500) || "Not provided"}

CANDIDATE:
Current Title: ${params.candidateTitle || "Not specified"}
Bio: ${params.candidateBio?.slice(0, 800) || "Not provided"}
Skills: ${candidateSkills.join(", ") || "None listed"}

INSTRUCTIONS:
1. Estimate a realistic annual salary range (low, mid, high) in USD for this role based on industry averages, seniority, and skill demand.
2. Describe the candidate's likely market position relative to this range (e.g. "Above Average", "Competitive", "Below Market").
3. List 3 key factors that most influence salary for this specific role.
4. Provide 3 actionable negotiation tips tailored to this candidate and role.
5. Provide 3 concrete talking points the candidate can use during salary discussions to justify higher compensation.

Respond ONLY with a valid JSON object:
{
  "estimatedRange": { "low": number, "mid": number, "high": number, "currency": "USD" },
  "marketPosition": "string describing candidate's position relative to range",
  "factors": ["Factor 1", "Factor 2", "Factor 3"],
  "negotiationTips": ["Tip 1", "Tip 2", "Tip 3"],
  "talkingPoints": ["Point 1", "Point 2", "Point 3"]
}`;

  return askAIJson<SalaryBenchmarkResult>({
    systemPrompt: "You are an expert compensation analyst and career negotiation coach. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.3,
    fallback: () => {
      const seniorKeywords = ["senior", "lead", "principal", "staff", "director", "head", "manager", "vp"];
      const titleLower = `${params.jobTitle} ${params.candidateTitle || ""}`.toLowerCase();
      const isSenior = seniorKeywords.some((k) => titleLower.includes(k));
      const hasStrongSkills = candidateSkills.length >= 5;

      const baseMid = isSenior ? 135000 : 85000;
      const skillBonus = hasStrongSkills ? 15000 : 0;
      const mid = baseMid + skillBonus;
      const low = Math.round(mid * 0.8);
      const high = Math.round(mid * 1.25);

      return {
        estimatedRange: { low, mid, high, currency: "USD" },
        marketPosition: hasStrongSkills
          ? "Competitive — your skill set is in demand for this role"
          : "Market Average — consider highlighting specialized expertise to move higher",
        factors: [
          "Years of experience and seniority level",
          "Specialized technical skills and certifications",
          "Company size, industry, and geographic market rates",
        ],
        negotiationTips: [
          "Research the company's funding stage and recent growth to gauge budget flexibility.",
          "Lead with your unique value — quantify impact from past roles before discussing numbers.",
          "Consider negotiating total compensation (equity, bonuses, benefits) rather than base salary alone.",
        ],
        talkingPoints: [
          `My background in ${candidateSkills.slice(0, 2).join(" and ") || "this domain"} directly addresses the core requirements of this role.`,
          "I have a track record of delivering measurable results that reduce costs or accelerate timelines.",
          "I am committed to contributing immediately and would expect compensation that reflects the value I bring from day one.",
        ],
      };
    },
  });
}

// =========================================================================
// 13. CANDIDATE NOTE DRAFTER (Rejection & Offer) (Employer)
// =========================================================================

export type DraftNoteParams = {
  noteType: "rejection" | "offer";
  jobTitle: string;
  companyName?: string;
  candidateName?: string;
  candidateTitle?: string;
  tone?: "warm" | "professional" | "brief";
};

export type DraftedNoteResult = {
  subject: string;
  body: string;
  tips: string[];
};

export async function draftCandidateNote(params: DraftNoteParams): Promise<DraftedNoteResult> {
  const isOffer = params.noteType === "offer";
  const prompt = `Draft a high-quality ${params.noteType === "offer" ? "job offer" : "rejection"} email for a remote role on JOMP.

DETAILS:
Type: ${params.noteType.toUpperCase()}
Job Title: ${params.jobTitle}
Company: ${params.companyName || "Our Company"}
Candidate Name: ${params.candidateName || "Candidate"}
Candidate Title: ${params.candidateTitle || "Applicant"}
Tone: ${params.tone || "warm"}

INSTRUCTIONS:
${isOffer ? `
- Express excitement and enthusiasm about extending the offer.
- Mention role title, next steps (e.g. reviewing formal contract, scheduling an intro onboarding call).
- Keep it encouraging, welcoming, and clear.
` : `
- Be empathetic, constructive, and respectful of the candidate's effort.
- Acknowledge the high volume and competitive applicant pool.
- Offer encouraging feedback and keep the door open for future openings.
- Avoid generic cold brush-offs.
`}

Respond ONLY with a valid JSON object:
{
  "subject": "Clear, professional email subject line",
  "body": "Full email message body with paragraph breaks",
  "tips": ["Tip 1 on sending this note", "Tip 2"]
}`;

  return askAIJson<DraftedNoteResult>({
    systemPrompt: "You are an empathetic, professional hiring manager and talent communications specialist. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.5,
    fallback: () => {
      const company = params.companyName || "our team";
      const name = params.candidateName || "there";
      if (isOffer) {
        return {
          subject: `Offer of Employment: ${params.jobTitle} at ${company}`,
          body: `Hi ${name},\n\nWe are thrilled to offer you the position of ${params.jobTitle} at ${company}! Throughout the interview process, our team was consistently impressed by your skills, thoughtful communication, and shared vision.\n\nWe will follow up shortly with formal onboarding documents and compensation details. In the meantime, please let us know if you have any immediate questions.\n\nWelcome to the team!\n\nWarm regards,\n${company} Hiring Team`,
          tips: ["Send this within 24 hours of verbal alignment", "Include clear expiration date for the offer in formal documents"],
        };
      }
      return {
        subject: `Update regarding your application for ${params.jobTitle} at ${company}`,
        body: `Hi ${name},\n\nThank you for taking the time to apply and interview for the ${params.jobTitle} role at ${company}. We truly appreciate the energy and effort you invested in getting to know us.\n\nAfter careful consideration among a remarkably strong pool of candidates, we have decided to move forward with another applicant whose background more closely matches our immediate requirements.\n\nYour profile and portfolio were impressive, and we would love to keep your details on file should a future role open up that fits your expertise.\n\nWe wish you all the best in your career search.\n\nSincerely,\n${company} Hiring Team`,
        tips: ["Personalize the first sentence if you discussed a specific project", "Send prompt closure so candidates aren't left waiting"],
      };
    },
  });
}

// =========================================================================
// 14. JOB POSTING INCLUSIVITY AUDIT (Employer)
// =========================================================================

export type InclusivityAuditParams = {
  jobTitle: string;
  description?: string;
  requirements?: string;
};

export type InclusivityIssue = {
  severity: "high" | "medium" | "low";
  category: string;
  text: string;
  suggestion: string;
};

export type InclusivityAuditResult = {
  overallScore: number;
  grade: "Excellent" | "Good" | "Needs Work" | "Poor";
  summary: string;
  issues: InclusivityIssue[];
  positives: string[];
};

export async function auditJobInclusivity(params: InclusivityAuditParams): Promise<InclusivityAuditResult> {
  const prompt = `Audit this remote job posting for inclusivity, clarity, bias, and accessibility:

Title: ${params.jobTitle}
Description:
${params.description?.slice(0, 2500) || "No description provided"}

Requirements:
${params.requirements?.slice(0, 2000) || "No requirements provided"}

EVALUATE:
1. Gendered language (e.g. overly aggressive/masculine coded words vs balanced phrasing).
2. Unnecessary degree/credential hurdles that exclude self-taught or non-traditional talent.
3. Clarity and realistic expectations (avoiding laundry lists of 15+ must-haves).
4. Welcoming signals (remote flexibility, async culture, growth opportunities).

Respond ONLY with a valid JSON object:
{
  "overallScore": integer between 40 and 99,
  "grade": "Excellent" | "Good" | "Needs Work" | "Poor",
  "summary": "2-3 sentences summarizing the audit result and key takeaway",
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "category": "e.g. Jargon & Buzzwords | Credential Inflation | Tone & Bias",
      "text": "The flagged phrasing or pattern",
      "suggestion": "How to rephrase or improve it"
    }
  ],
  "positives": ["Positive inclusive trait 1", "Positive inclusive trait 2"]
}`;

  return askAIJson<InclusivityAuditResult>({
    systemPrompt: "You are an expert talent diversity, equity, and recruitment copy auditor. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.3,
    fallback: () => ({
      overallScore: 84,
      grade: "Good",
      summary: "This job listing is generally clear and accessible. A few minor adjustments to requirements and terminology will make it even more attractive to diverse, qualified applicants.",
      issues: [
        {
          severity: "medium",
          category: "Requirements Scope",
          text: "Lengthy checklist of nice-to-haves mixed with must-haves",
          suggestion: "Separate core required qualifications from preferred bonus skills to encourage more candidates to apply.",
        },
        {
          severity: "low",
          category: "Jargon & Buzzwords",
          text: "Occasional corporate jargon or vague descriptors",
          suggestion: "Replace buzzwords with concrete day-to-day deliverables and technologies used.",
        },
      ],
      positives: [
        "Clearly communicates remote nature of the position",
        "Clear professional tone without aggressive gender-coded phrasing",
        "Outlines team culture and expected collaboration style",
      ],
    }),
  });
}

// =========================================================================
// 15. CAREER CO-PILOT CHAT ASSISTANT (All Users)
// =========================================================================

export type CoPilotMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CoPilotParams = {
  messages: CoPilotMessage[];
  candidateName?: string;
  candidateTitle?: string;
  candidateBio?: string;
  candidateSkills?: string[];
  hasResume?: boolean;
  ignoreProfile?: boolean;
};

export type CoPilotResponse = {
  reply: string;
  suggestedActions?: string[];
};

export async function chatWithCoPilot(params: CoPilotParams): Promise<CoPilotResponse> {
  const conversation = params.messages
    .slice(-8)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const skillsList = (params.candidateSkills || []).filter(Boolean);
  const profileAnchor = params.ignoreProfile
    ? "User explicitly requested general career advice (profile anchoring disabled for this prompt)."
    : `
CANDIDATE PROFILE (MANDATORY POINT OF REFERENCE):
- Candidate Name: ${params.candidateName || "Candidate"}
- Professional Title: ${params.candidateTitle || "Professional / Job Seeker"}
- Bio / Experience Summary: ${params.candidateBio || "Not provided"}
- Listed Skills (${skillsList.length}): ${skillsList.join(", ") || "General tech stack"}
- CV / Resume Status: ${params.hasResume ? "Uploaded and active on JOMP" : "No CV uploaded yet"}
`.trim();

  const prompt = `You are the JOMP Career Co-Pilot, an elite career mentor, technical talent strategist, and remote employment advisor for the JOMP platform.

${profileAnchor}

CONVERSATION HISTORY:
${conversation}

INSTRUCTIONS & CORE BEHAVIOR:
1. PROFILE-ANCHORED ADVICE (MANDATORY UNLESS EXPLICITLY STATED OTHERWISE):
   - You MUST treat the user's specific profile above as your foundational point of reference for EVERY response.
   - When the user asks ANY question — including suggested questions or general prompts like "What niche matches my skills?", "How do I optimize my profile?", "Salary expectations", "Interview tips", "ATS resume keywords" — NEVER give generic boilerplate!
   - Directly analyze their exact role (${params.candidateTitle || "their field"}), their specific listed skills (${skillsList.slice(0, 5).join(", ") || "their technologies"}), and their background.
   - Proactively highlight how their skills combine to give them an edge in remote roles.
   - If they ask about salary, provide benchmarks tailored to their title and stack.
   - If they ask about interview prep, give role-specific and technical questions targeting their skills.
   - Only disregard their profile if the user explicitly says "ignore my profile" or asks about a completely different person or topic.

2. STRUCTURE & DEPTH:
   - Deliver rich, actionable answers using clean markdown formatting (bullet points, bold text for emphasis, short sections).
   - Be thorough, specific, and practical (around 160-260 words).
   - If they lack a CV or skills on their profile, gently suggest adding them to unlock personalized job recommendations.

3. DYNAMIC NEXT STEPS:
   - Provide 2-3 hyper-relevant follow-up actions or questions tailored specifically to what was just discussed and their career stage.

Respond ONLY with a valid JSON object:
{
  "reply": "Your rich, formatted markdown answer",
  "suggestedActions": ["Actionable follow-up prompt 1", "Follow-up prompt 2", "Follow-up prompt 3"]
}`;

  return askAIJson<CoPilotResponse>({
    systemPrompt: "You are JOMP Career Co-Pilot, an elite remote career advisor that anchors answers to the user's profile and returns strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.5,
    fallback: () => {
      const title = params.candidateTitle || "your field";
      const topSkills = skillsList.slice(0, 3).join(", ") || "your core skills";
      return {
        reply: `### Personalized Guidance for ${title}\n\nBased on your profile specializing in **${topSkills}**, here is strategic advice tailored to your background:\n\n• **Niche Positioning**: Target remote companies looking for high async velocity and clean execution in ${title}.\n• **ATS & Resume Optimization**: Quantify achievements with ${topSkills} (e.g. "built features scaling to 10k users" or "improved response times by 30%").\n• **Interview Focus**: Prepare STAR stories demonstrating how you take ownership from concept to deployment across distributed teams.\n\nWhat specific area would you like to explore next?`,
        suggestedActions: [
          `Top ATS keywords for ${title}`,
          `Estimated salary range for ${topSkills}`,
          `Practice interview questions for ${title}`,
        ],
      };
    },
  });
}
