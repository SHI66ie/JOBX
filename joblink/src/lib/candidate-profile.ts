/** What an employer sees about an applicant in the profile sheet. Optional fields render empty states. */
export type CandidateProfileData = {
  name: string;
  email: string | null;
  title?: string | null;
  bio?: string | null;
  skills?: string[];
  memberSince?: string | null;
  rating?: { average: number; count: number } | null;
  jobsCompleted?: number;
  history?: { title: string; company: string; period: string; rating?: number; review?: string }[];
  resumeUrl?: string | null;
  application: { status: string; appliedAt: string; coverLetter?: string | null };
};
