"use server";

import {
  generateJobListing,
  screenCandidate,
  generateInterviewQuestions,
  enhanceCandidateBio,
  generateApplicationPitch,
  arrangeAndOptimizeCV,
  matchJobsToNiche,
  parseNicheSearch,
  analyzeJobFit,
  evaluateInterviewAnswer,
  rankJobApplicants,
  analyzeSalaryBenchmark,
  draftCandidateNote,
  auditJobInclusivity,
  chatWithCoPilot,
  type GenerateJobParams,
  type GeneratedJobResult,
  type CandidateScoreParams,
  type CandidateScreeningResult,
  type InterviewQuestionsParams,
  type InterviewQuestion,
  type EnhanceBioParams,
  type EnhancedBioResult,
  type TailorPitchParams,
  type TailoredPitchResult,
  type ArrangeCVParams,
  type ArrangedCVResult,
  type NicheMatchParams,
  type JobNicheMatch,
  type NicheSearchAnalysis,
  type JobFitParams,
  type JobFitAnalysis,
  type MockInterviewCritiqueParams,
  type MockInterviewCritique,
  type ApplicantForRanking,
  type RankedApplicant,
  type SalaryBenchmarkParams,
  type SalaryBenchmarkResult,
  type DraftNoteParams,
  type DraftedNoteResult,
  type InclusivityAuditParams,
  type InclusivityAuditResult,
  type CoPilotParams,
  type CoPilotResponse,
  type CoPilotMessage,
} from "@/lib/ai";
import { createClient } from "@/utils/supabase/server";
import { generateAICVPdf, type CVPdfData } from "@/lib/cv-pdf";
import { RESUME_BUCKET } from "@/lib/resumes";
import { revalidatePath } from "next/cache";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

async function requireAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to use AI assistant features.");
  }
  return user;
}

export async function actionGenerateJob(params: GenerateJobParams): Promise<{ data?: GeneratedJobResult; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: GenerateJobParams = {
      title: params.title?.trim().slice(0, 120),
      type: params.type?.trim().slice(0, 50),
      notes: params.notes?.trim().slice(0, 2000),
      companyName: params.companyName?.trim().slice(0, 100),
    };
    const data = await generateJobListing(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Generate Job Error:", err);
    return { error: getErrorMessage(err, "Failed to generate job posting") };
  }
}

export async function actionScreenCandidate(params: CandidateScoreParams): Promise<{ data?: CandidateScreeningResult; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: CandidateScoreParams = {
      jobTitle: params.jobTitle.trim().slice(0, 120),
      jobDescription: params.jobDescription?.trim().slice(0, 4000),
      jobRequirements: params.jobRequirements?.trim().slice(0, 3000),
      candidateName: params.candidateName?.trim().slice(0, 100),
      candidateTitle: params.candidateTitle?.trim().slice(0, 100),
      candidateBio: params.candidateBio?.trim().slice(0, 2000),
      candidateSkills: params.candidateSkills?.slice(0, 20).map((s) => s.trim().slice(0, 50)),
      coverLetter: params.coverLetter?.trim().slice(0, 2000),
    };
    const data = await screenCandidate(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Screen Candidate Error:", err);
    return { error: getErrorMessage(err, "Failed to screen candidate") };
  }
}

export async function actionGenerateInterviewQuestions(params: InterviewQuestionsParams): Promise<{ data?: { questions: InterviewQuestion[] }; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: InterviewQuestionsParams = {
      jobTitle: params.jobTitle.trim().slice(0, 120),
      jobRequirements: params.jobRequirements?.trim().slice(0, 3000),
      candidateName: params.candidateName?.trim().slice(0, 100),
      candidateSkills: params.candidateSkills?.slice(0, 20).map((s) => s.trim().slice(0, 50)),
      candidateBio: params.candidateBio?.trim().slice(0, 2000),
    };
    const data = await generateInterviewQuestions(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Interview Questions Error:", err);
    return { error: getErrorMessage(err, "Failed to generate interview questions") };
  }
}

export async function actionEnhanceBio(params: EnhanceBioParams): Promise<{ data?: EnhancedBioResult; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: EnhanceBioParams = {
      currentTitle: params.currentTitle?.trim().slice(0, 100),
      currentBio: params.currentBio?.trim().slice(0, 2000),
      skills: params.skills?.slice(0, 30).map((s) => s.trim().slice(0, 50)),
    };
    const data = await enhanceCandidateBio(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Enhance Bio Error:", err);
    return { error: getErrorMessage(err, "Failed to enhance bio") };
  }
}

export async function actionTailorPitch(params: TailorPitchParams): Promise<{ data?: TailoredPitchResult; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: TailorPitchParams = {
      jobTitle: params.jobTitle.trim().slice(0, 120),
      companyName: params.companyName?.trim().slice(0, 100),
      jobDescription: params.jobDescription?.trim().slice(0, 4000),
      candidateName: params.candidateName?.trim().slice(0, 100),
      candidateTitle: params.candidateTitle?.trim().slice(0, 100),
      candidateBio: params.candidateBio?.trim().slice(0, 2000),
      candidateSkills: params.candidateSkills?.slice(0, 20).map((s) => s.trim().slice(0, 50)),
    };
    const data = await generateApplicationPitch(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Tailor Pitch Error:", err);
    return { error: getErrorMessage(err, "Failed to generate pitch") };
  }
}

export async function actionArrangeCV(params: ArrangeCVParams): Promise<{ data?: ArrangedCVResult; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: ArrangeCVParams = {
      rawCVText: params.rawCVText?.slice(0, 10000),
      currentTitle: params.currentTitle?.trim().slice(0, 100),
      currentBio: params.currentBio?.trim().slice(0, 3000),
      skills: params.skills?.slice(0, 40).map((s) => s.trim().slice(0, 50)),
      targetNiche: params.targetNiche?.trim().slice(0, 100),
    };
    const data = await arrangeAndOptimizeCV(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Arrange CV Error:", err);
    return { error: getErrorMessage(err, "Failed to arrange CV") };
  }
}

export async function actionMatchJobsToNiche(params: NicheMatchParams): Promise<{ data?: { matches: JobNicheMatch[] }; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: NicheMatchParams = {
      candidateTitle: params.candidateTitle?.trim().slice(0, 100),
      candidateBio: params.candidateBio?.trim().slice(0, 3000),
      candidateSkills: params.candidateSkills?.slice(0, 30).map((s) => s.trim().slice(0, 50)),
      targetNiche: params.targetNiche?.trim().slice(0, 100),
      jobs: params.jobs.slice(0, 15).map((j) => ({
        id: j.id,
        title: j.title.slice(0, 100),
        company: j.company?.slice(0, 100),
        salary_range: j.salary_range?.slice(0, 50),
        type: j.type?.slice(0, 50),
        description: j.description?.slice(0, 1000),
        requirements: j.requirements?.slice(0, 1000),
      })),
    };
    const data = await matchJobsToNiche(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Match Jobs to Niche Error:", err);
    return { error: getErrorMessage(err, "Failed to match jobs to niche") };
  }
}

export async function actionParseNicheSearch(prompt: string): Promise<{ data?: NicheSearchAnalysis; error?: string }> {
  try {
    await requireAuthUser();
    const cleanPrompt = prompt.trim().slice(0, 300);
    const data = await parseNicheSearch(cleanPrompt);
    return { data };
  } catch (err: unknown) {
    console.error("AI Parse Niche Search Error:", err);
    return { error: getErrorMessage(err, "Failed to analyze niche search query") };
  }
}

export async function actionAnalyzeJobFit(params: JobFitParams): Promise<{ data?: JobFitAnalysis; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: JobFitParams = {
      jobTitle: params.jobTitle.trim().slice(0, 120),
      companyName: params.companyName?.trim().slice(0, 100),
      jobDescription: params.jobDescription?.slice(0, 4000),
      jobRequirements: params.jobRequirements?.slice(0, 3000),
      candidateTitle: params.candidateTitle?.trim().slice(0, 100),
      candidateBio: params.candidateBio?.slice(0, 2000),
      candidateSkills: params.candidateSkills?.slice(0, 25).map((s) => s.trim().slice(0, 50)),
    };
    const data = await analyzeJobFit(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Analyze Job Fit Error:", err);
    return { error: getErrorMessage(err, "Failed to analyze job fit") };
  }
}

export async function actionEvaluateInterviewAnswer(
  params: MockInterviewCritiqueParams,
): Promise<{ data?: MockInterviewCritique; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: MockInterviewCritiqueParams = {
      jobTitle: params.jobTitle.trim().slice(0, 120),
      question: params.question.trim().slice(0, 500),
      candidateAnswer: params.candidateAnswer.trim().slice(0, 3000),
    };
    const data = await evaluateInterviewAnswer(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Evaluate Interview Answer Error:", err);
    return { error: getErrorMessage(err, "Failed to critique interview answer") };
  }
}

export async function actionRankJobApplicants(params: {
  jobTitle: string;
  jobRequirements?: string;
  applicants: ApplicantForRanking[];
}): Promise<{ data?: { ranked: RankedApplicant[] }; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams = {
      jobTitle: params.jobTitle.trim().slice(0, 120),
      jobRequirements: params.jobRequirements?.slice(0, 3000),
      applicants: params.applicants.slice(0, 20).map((a) => ({
        id: a.id,
        name: a.name.slice(0, 100),
        title: a.title?.slice(0, 100),
        skills: a.skills?.slice(0, 15),
        bio: a.bio?.slice(0, 1000),
        coverLetter: a.coverLetter?.slice(0, 1500),
      })),
    };
    const data = await rankJobApplicants(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Rank Job Applicants Error:", err);
    return { error: getErrorMessage(err, "Failed to rank job applicants") };
  }
}

/**
 * Generates a JOMP-watermarked PDF from AI CV data, uploads it to the user's private
 * storage folder, saves resume_url to their auth metadata and public profile row,
 * and returns a short-lived signed viewing URL.
 *
 * The watermark cannot be removed — subscribe tier will clear it in a future update.
 */

export async function actionAnalyzeSalary(params: SalaryBenchmarkParams): Promise<{ data?: SalaryBenchmarkResult; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: SalaryBenchmarkParams = {
      jobTitle: params.jobTitle.trim().slice(0, 120),
      companyName: params.companyName?.trim().slice(0, 100),
      jobDescription: params.jobDescription?.slice(0, 3000),
      candidateTitle: params.candidateTitle?.trim().slice(0, 100),
      candidateBio: params.candidateBio?.slice(0, 1500),
      candidateSkills: params.candidateSkills?.slice(0, 25).map((s) => s.trim().slice(0, 50)),
    };
    const data = await analyzeSalaryBenchmark(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Analyze Salary Error:", err);
    return { error: getErrorMessage(err, "Failed to analyze salary benchmark") };
  }
}

export async function actionDraftCandidateNote(params: DraftNoteParams): Promise<{ data?: DraftedNoteResult; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: DraftNoteParams = {
      noteType: params.noteType,
      jobTitle: params.jobTitle.trim().slice(0, 120),
      companyName: params.companyName?.trim().slice(0, 100),
      candidateName: params.candidateName?.trim().slice(0, 100),
      candidateTitle: params.candidateTitle?.trim().slice(0, 100),
      tone: params.tone,
    };
    const data = await draftCandidateNote(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Draft Note Error:", err);
    return { error: getErrorMessage(err, "Failed to draft candidate note") };
  }
}

export async function actionAuditJobInclusivity(params: InclusivityAuditParams): Promise<{ data?: InclusivityAuditResult; error?: string }> {
  try {
    await requireAuthUser();
    const cleanParams: InclusivityAuditParams = {
      jobTitle: params.jobTitle.trim().slice(0, 120),
      description: params.description?.slice(0, 4000),
      requirements: params.requirements?.slice(0, 3000),
    };
    const data = await auditJobInclusivity(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI Audit Inclusivity Error:", err);
    return { error: getErrorMessage(err, "Failed to audit job posting") };
  }
}

export async function actionChatCoPilot(params: CoPilotParams): Promise<{ data?: CoPilotResponse; error?: string }> {
  try {
    await requireAuthUser();
    const cleanMessages = (params.messages || []).slice(-10).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content || "").slice(0, 1500),
    }));
    const cleanParams: CoPilotParams = {
      messages: cleanMessages,
      candidateName: params.candidateName?.trim().slice(0, 100),
      candidateTitle: params.candidateTitle?.trim().slice(0, 100),
      candidateBio: params.candidateBio?.slice(0, 2000),
      candidateSkills: params.candidateSkills?.slice(0, 25).map((s) => s.trim().slice(0, 50)),
      hasResume: Boolean(params.hasResume),
      ignoreProfile: Boolean(params.ignoreProfile),
      userRole: params.userRole,
      currentPage: params.currentPage?.trim().slice(0, 100),
    };
    const data = await chatWithCoPilot(cleanParams);
    return { data };
  } catch (err: unknown) {
    console.error("AI CoPilot Error:", err);
    return { error: getErrorMessage(err, "Failed to get Co-Pilot response") };
  }
}

export async function actionSaveAICV(params: {
  cvData: CVPdfData;
  profileUpdate: {
    firstName: string;
    lastName: string;
    title: string;
    bio: string;
    skills: string[];
  };
}): Promise<{ error?: string; resumePath?: string; viewUrl?: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Please sign in again." };
    }

    // 1. Generate watermarked PDF bytes server-side (watermark: true is default)
    const pdfBytes = generateAICVPdf({ ...params.cvData, watermark: true });

    // 2. Upload to the private resumes bucket
    const fileName = `ai-cv-${Date.now()}.pdf`;
    const objectPath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(objectPath, pdfBytes, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("AI CV upload failed:", uploadError.message);
      return { error: "Failed to save AI-generated CV. Please try again." };
    }

    // 3. Persist to auth metadata and public users row
    const first_name = params.profileUpdate.firstName.trim().slice(0, 60);
    const last_name = params.profileUpdate.lastName.trim().slice(0, 60);
    const title = params.profileUpdate.title.trim().slice(0, 100);
    const bio = params.profileUpdate.bio.trim().slice(0, 600);
    const skills = Array.from(
      new Set(params.profileUpdate.skills.map((s) => s.trim()).filter(Boolean))
    ).slice(0, 30);
    const resume_url = objectPath;

    const { error: metaError } = await supabase.auth.updateUser({
      data: { first_name, last_name, title, bio, skills, resume_url },
    });
    if (metaError) {
      return { error: metaError.message };
    }

    // Sync public profile (non-fatal)
    const { error: profileError } = await supabase
      .from("users")
      .update({ first_name, last_name, bio, title, skills, resume_url })
      .eq("id", user.id);
    if (profileError) {
      console.warn("Could not sync public.users profile:", profileError.message);
    }

    // 4. Also store structured CV JSON in user metadata so users can edit it anytime from profile
    try {
      await supabase.auth.updateUser({
        data: {
          saved_cv_data: params.cvData,
        },
      });
    } catch (saveJsonErr) {
      console.warn("Could not persist saved_cv_data metadata:", saveJsonErr);
    }

    // 5. Sign a short-lived URL for immediate preview/download
    const { data: signedData } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrls([objectPath], 3600);
    const viewUrl = signedData?.[0]?.signedUrl ?? null;

    revalidatePath("/dashboard", "layout");
    return { resumePath: objectPath, viewUrl };
  } catch (err: unknown) {
    console.error("Save AI CV Error:", err);
    return { error: getErrorMessage(err, "Failed to save AI-generated CV") };
  }
}

/**
 * Loads the user's latest structured CV JSON (if any)
 */
export async function actionLoadSavedCV(): Promise<{ data?: CVPdfData | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Please sign in again." };
    }

    const saved = (user.user_metadata?.saved_cv_data as CVPdfData) || null;
    return { data: saved };
  } catch (err: unknown) {
    return { error: getErrorMessage(err, "Failed to load CV data") };
  }
}



