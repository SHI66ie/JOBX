"use server";

import {
  generateJobListing,
  screenCandidate,
  generateInterviewQuestions,
  enhanceCandidateBio,
  generateApplicationPitch,
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
} from "@/lib/ai";
import { createClient } from "@/utils/supabase/server";

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
