import OpenAI from "openai";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

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
  const openai = getOpenAIClient();

  if (!openai) {
    // Fallback template generator when API key is not configured yet
    const roleTitle = params.title?.trim() || "Remote Software Engineer";
    return {
      title: roleTitle,
      type: params.type || "full-time",
      salary_range: "$3,000 – $5,000 / month",
      description: `We are looking for a talented ${roleTitle} to join our remote team at ${params.companyName || "our company"}.\n\nIn this role, you will collaborate with cross-functional team members to build, test, and ship high-impact features. You will take ownership of key project deliverables and ensure excellent code quality and user experience.\n\nA typical week:\n• Building and refining core product workflows\n• Collaborating asynchronously across timezones\n• Reviewing PRs and participating in architectural planning`,
      requirements: `• 3+ years of professional experience in related domains\n• Proven track record of delivering clean, scalable solutions\n• Strong communication and async collaboration skills\n• Self-directed with high attention to detail`,
      skills: ["React", "TypeScript", "Node.js", "Git", "API Design", "Problem Solving"],
    };
  }

  const prompt = `You are an expert tech recruiter and hiring consultant for a modern remote jobs platform called JOMP.
Create a comprehensive, engaging, and realistic job posting based on the employer's draft input:

Title hint: "${params.title || "Software Specialist"}"
Job Type: "${params.type || "full-time"}"
Company: "${params.companyName || "Our Company"}"
Extra Notes / requirements from employer: "${params.notes || "Create a modern, high quality posting"}"

Respond ONLY with a valid JSON object with the following fields:
{
  "title": "A crisp, industry standard job title",
  "type": "full-time" or "part-time" or "contract" or "internship",
  "salary_range": "e.g. $3,000 – $4,500 / month or $80,000 – $110,000 / year",
  "description": "Engaging job description with background, responsibilities, and team culture",
  "requirements": "Bulleted list starting with • of realistic qualifications, technical skills, and experience",
  "skills": ["Array", "of", "5-8", "key", "skill", "tags"]
}`;

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: "You are a professional HR and recruitment AI assistant that outputs strictly valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  return JSON.parse(content) as GeneratedJobResult;
}

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
  const openai = getOpenAIClient();

  if (!openai) {
    const candidateSkills = params.candidateSkills || [];
    const hasOverlap = candidateSkills.length > 0;
    const score = hasOverlap ? 85 : 70;
    return {
      score,
      grade: score >= 80 ? "Strong Match" : "Good Match",
      summary: `${params.candidateName || "The candidate"} demonstrates relevant experience for the ${params.jobTitle} position with strong alignment in core fundamentals.`,
      strengths: [
        "Relevant background and skill profile",
        "Clear professional communication",
        candidateSkills.length > 0 ? `Key skills demonstrated: ${candidateSkills.slice(0, 3).join(", ")}` : "Demonstrated eagerness to contribute",
      ],
      gaps: ["Verify domain-specific depth during technical discussion", "Confirm remote time-zone overlap"],
      recommendation: score >= 80 ? "Shortlist for Interview" : "Hold for Review",
    };
  }

  const prompt = `Analyze this candidate's application against the job requirements and provide a fair, objective screening evaluation.

JOB DETAILS:
Title: ${params.jobTitle}
Description: ${params.jobDescription || "Not provided"}
Requirements: ${params.jobRequirements || "Not provided"}

CANDIDATE DETAILS:
Name: ${params.candidateName || "Candidate"}
Professional Title: ${params.candidateTitle || "Not specified"}
Bio: ${params.candidateBio || "Not provided"}
Skills: ${(params.candidateSkills || []).join(", ") || "None listed"}
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

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: "You are an objective, experienced tech recruiter assistant that outputs strict JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  return JSON.parse(content) as CandidateScreeningResult;
}

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

export async function generateInterviewQuestions(params: InterviewQuestionsParams): Promise<{ questions: InterviewQuestion[] }> {
  const openai = getOpenAIClient();

  if (!openai) {
    return {
      questions: [
        {
          category: "Role-Specific",
          question: `Can you walk us through a recent project where you took ownership from conception to delivery in a ${params.jobTitle} capacity?`,
          whatToLookFor: "Clear understanding of architecture, problem solving, and ability to measure business outcomes.",
        },
        {
          category: "Technical",
          question: `How do you approach debugging complex, async or distributed issues in production?`,
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
    };
  }

  const prompt = `Generate 4-5 tailored, high-signal interview questions for hiring a ${params.jobTitle}.
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

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: "You are an expert hiring manager creating high-signal interview questions. Output strictly valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  return JSON.parse(content) as { questions: InterviewQuestion[] };
}

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
  const openai = getOpenAIClient();

  if (!openai) {
    const title = params.currentTitle?.trim() || "Full-Stack Software Engineer";
    return {
      suggestedTitle: title,
      enhancedBio: params.currentBio?.trim()
        ? `${params.currentBio.trim()} Passionate about building performant, user-centered web applications and collaborating effectively in fast-moving remote teams.`
        : `Experienced ${title} with a track record of building performant, accessible web applications. Skilled in modern frontend & backend architectures, async collaboration, and continuous delivery.`,
      suggestedSkills: Array.from(new Set([...(params.skills || []), "TypeScript", "React", "Node.js", "Git", "Problem Solving"])),
      keyHighlights: ["Strong remote async collaboration", "Modern engineering best practices", "End-to-end feature delivery"],
    };
  }

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

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: "You are a world-class career strategist. Return strictly valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  return JSON.parse(content) as EnhancedBioResult;
}

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
  const openai = getOpenAIClient();

  if (!openai) {
    return {
      coverLetter: `Hi ${params.companyName || "Hiring Team"},\n\nI was excited to see your opening for the ${params.jobTitle} position. With my background in ${(params.candidateSkills || ["modern software development"]).slice(0, 3).join(", ")} and experience delivering high-quality remote work, I am confident I can make an immediate impact on your team.\n\nI would love the opportunity to connect and discuss how my skills align with your goals.\n\nBest regards,\n${params.candidateName || "Candidate"}`,
      matchingPoints: [
        "Relevant technical and domain experience",
        "Proven async and remote collaboration skills",
        "Commitment to high product velocity and quality",
      ],
    };
  }

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

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: "You are a recruitment pitch coach. Return strictly valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  return JSON.parse(content) as TailoredPitchResult;
}
