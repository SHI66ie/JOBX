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

export type StructuredExperienceItem = {
  role: string;
  company?: string;
  period?: string;
  highlights: string[];
};

export type ArrangedCVResult = {
  targetNiche: string;
  suggestedTitle: string;
  executiveSummary: string;
  skillsByCategory: Record<string, string[]>;
  recommendedSkills: string[];
  structuredExperience: StructuredExperienceItem[];
  nicheStrengths: string[];
  atsKeywords: string[];
  formattedMarkdown: string;
};

export async function arrangeAndOptimizeCV(params: ArrangeCVParams): Promise<ArrangedCVResult> {
  const fallbackTitle = params.currentTitle?.trim() || "Full-Stack Software Specialist";
  const prompt = `You are an elite executive CV strategist and remote career architect.
Analyze the user's background and arrange their CV into a clean, modern, high-impact structure tailored to their niche.

INPUT:
Target Niche / Focus hint: "${params.targetNiche || "Software & Technology"}"
Current Title: "${params.currentTitle || ""}"
Current Summary / Bio: "${params.currentBio || ""}"
Current Skills: "${(params.skills || []).join(", ")}"
Raw CV Content / Notes:
${params.rawCVText || "Extract and arrange standard roles and skills based on the title and bio."}

INSTRUCTIONS:
1. Identify the candidate's exact high-converting niche (e.g. "Full-Stack Web Architect", "B2B SaaS Growth Lead", "Mobile iOS Specialist").
2. Rewrite the summary into a compelling 3-4 sentence Executive Summary optimized for remote recruiters.
3. Categorize their skills into 3-4 logical buckets (e.g. "Core Languages", "Frameworks & Architecture", "DevOps & Tools", "Leadership & Async").
4. Rewrite key experience highlights using high-impact CAR/STAR action bullets (Action verb + Context + Quantifiable outcome).
5. Extract top ATS keywords to include.
6. Provide a complete, beautifully structured Markdown representation of the CV ready to export.

Respond ONLY with a valid JSON object:
{
  "targetNiche": "2-4 word niche name",
  "suggestedTitle": "Crisp professional title",
  "executiveSummary": "Punchy 3-4 sentence professional summary",
  "skillsByCategory": {
    "Category Name": ["Skill 1", "Skill 2"]
  },
  "recommendedSkills": ["Flat array of 8-12 top skills for profile"],
  "structuredExperience": [
    {
      "role": "Role Title",
      "company": "Company or Project Name",
      "period": "e.g. 2023 - Present",
      "highlights": [
        "Built and scaled...",
        "Spearheaded..."
      ]
    }
  ],
  "nicheStrengths": ["Key positioning strength 1", "Key positioning strength 2"],
  "atsKeywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
  "formattedMarkdown": "# Full Name / Title\\n\\n## Executive Summary... (Full markdown string)"
}`;

  return askAIJson<ArrangedCVResult>({
    systemPrompt: "You are a world-class CV arranger and remote hiring expert. Return strictly valid JSON.",
    userPrompt: prompt,
    temperature: 0.5,
    fallback: () => ({
      targetNiche: params.targetNiche?.trim() || "Modern Web & Software Engineering",
      suggestedTitle: fallbackTitle,
      executiveSummary: params.currentBio?.trim()
        ? params.currentBio.trim()
        : `Experienced ${fallbackTitle} specializing in high-performance web applications and remote async delivery. Proven track record of taking complex features from concept to production with modern architectures and clean code.`,
      skillsByCategory: {
        "Core Technologies": ["TypeScript", "JavaScript", "HTML5", "CSS3"],
        "Frameworks & Libraries": ["React", "Next.js", "Node.js", "Tailwind CSS"],
        "Tools & Cloud": ["Git", "GitHub", "Supabase", "REST APIs", "Docker"],
        "Practices": ["Async Collaboration", "Code Reviews", "Performance Tuning"],
      },
      recommendedSkills: Array.from(new Set([...(params.skills || []), "TypeScript", "React", "Next.js", "Node.js", "Git"])),
      structuredExperience: [
        {
          role: fallbackTitle,
          company: "Key Technical Projects & Roles",
          period: "Recent",
          highlights: [
            "Designed and delivered full-stack web features serving global users with high reliability.",
            "Architected performant frontend interfaces and scalable backend API endpoints.",
            "Collaborated across distributed teams using modern asynchronous workflows and CI/CD.",
          ],
        },
      ],
      nicheStrengths: [
        "Strong full-stack foundations with modern TypeScript ecosystem",
        "Self-directed remote worker with clear written documentation habits",
      ],
      atsKeywords: ["Full-Stack", "TypeScript", "React", "Next.js", "API Design", "Remote"],
      formattedMarkdown: `# ${fallbackTitle}\n\n## Executive Summary\nExperienced specialist with expertise in modern web technologies and remote collaboration.\n\n## Key Skills\n• TypeScript, React, Next.js, Node.js, Git, Supabase\n\n## Experience Highlights\n• Delivered scalable web applications with responsive design and fast load times.\n• Built secure API integrations and optimized database interactions.`,
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
