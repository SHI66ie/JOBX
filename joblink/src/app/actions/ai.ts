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

export async function actionGenerateJob(params: GenerateJobParams): Promise<{ data?: GeneratedJobResult; error?: string }> {
  try {
    const data = await generateJobListing(params);
    return { data };
  } catch (err: any) {
    console.error("AI Generate Job Error:", err);
    return { error: err.message || "Failed to generate job posting" };
  }
}

export async function actionScreenCandidate(params: CandidateScoreParams): Promise<{ data?: CandidateScreeningResult; error?: string }> {
  try {
    const data = await screenCandidate(params);
    return { data };
  } catch (err: any) {
    console.error("AI Screen Candidate Error:", err);
    return { error: err.message || "Failed to screen candidate" };
  }
}

export async function actionGenerateInterviewQuestions(params: InterviewQuestionsParams): Promise<{ data?: { questions: InterviewQuestion[] }; error?: string }> {
  try {
    const data = await generateInterviewQuestions(params);
    return { data };
  } catch (err: any) {
    console.error("AI Interview Questions Error:", err);
    return { error: err.message || "Failed to generate interview questions" };
  }
}

export async function actionEnhanceBio(params: EnhanceBioParams): Promise<{ data?: EnhancedBioResult; error?: string }> {
  try {
    const data = await enhanceCandidateBio(params);
    return { data };
  } catch (err: any) {
    console.error("AI Enhance Bio Error:", err);
    return { error: err.message || "Failed to enhance bio" };
  }
}

export async function actionTailorPitch(params: TailorPitchParams): Promise<{ data?: TailoredPitchResult; error?: string }> {
  try {
    const data = await generateApplicationPitch(params);
    return { data };
  } catch (err: any) {
    console.error("AI Tailor Pitch Error:", err);
    return { error: err.message || "Failed to generate pitch" };
  }
}
