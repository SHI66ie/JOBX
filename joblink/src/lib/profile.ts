export type CandidateProfile = {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  skills: string[];
  resumeUrl: string;
};

export type ProfileCheck = { id: "title" | "bio" | "skills" | "resume"; done: boolean; missing: string };
export type ProfileStrength = { percent: number; missing: string[]; checks: ProfileCheck[] };

/** Reads the candidate profile out of Supabase auth metadata. */
export function candidateProfileFromMeta(meta: Record<string, unknown> | undefined | null): CandidateProfile {
  const data = meta ?? {};
  const rawSkills = data.skills;
  const skills = Array.isArray(rawSkills)
    ? rawSkills.map(String).filter(Boolean)
    : String(rawSkills || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return {
    firstName: String(data.first_name || ""),
    lastName: String(data.last_name || ""),
    title: String(data.title || ""),
    bio: String(data.bio || ""),
    skills,
    resumeUrl: String(data.resume_url || ""),
  };
}

/** Four equal parts: title, bio, 3+ skills, CV. */
export function profileStrength(profile: Pick<CandidateProfile, "title" | "bio" | "skills" | "resumeUrl">): ProfileStrength {
  const checks: ProfileCheck[] = [
    { id: "title", done: Boolean(profile.title.trim()), missing: "Add a professional title" },
    { id: "bio", done: profile.bio.trim().length >= 20, missing: "Write a short bio" },
    { id: "skills", done: profile.skills.length >= 3, missing: "Add at least 3 skills" },
    { id: "resume", done: Boolean(profile.resumeUrl), missing: "Upload your CV" },
  ];
  const done = checks.filter((check) => check.done).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((check) => !check.done).map((check) => check.missing),
    checks,
  };
}
