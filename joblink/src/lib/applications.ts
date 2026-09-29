export type ApplicationStatus = "pending" | "reviewed" | "interviewing" | "accepted" | "rejected";

export const APPLICATION_STAGES = ["Applied", "In review", "Interview", "Decision"] as const;

type StatusMeta = {
  label: string;
  /** Index into APPLICATION_STAGES the application has reached. */
  stage: number;
  tone: "neutral" | "sky" | "violet" | "emerald" | "muted";
  group: "active" | "interviewing" | "closed";
};

const STATUS: Record<ApplicationStatus, StatusMeta> = {
  pending: { label: "Applied", stage: 0, tone: "neutral", group: "active" },
  reviewed: { label: "In review", stage: 1, tone: "sky", group: "active" },
  interviewing: { label: "Interviewing", stage: 2, tone: "violet", group: "interviewing" },
  accepted: { label: "Accepted", stage: 3, tone: "emerald", group: "closed" },
  rejected: { label: "Not selected", stage: 3, tone: "muted", group: "closed" },
};

export function applicationStatus(status: string | null | undefined): StatusMeta & { value: ApplicationStatus } {
  const value = (status && status in STATUS ? status : "pending") as ApplicationStatus;
  return { value, ...STATUS[value] };
}

export const STATUS_TONES: Record<StatusMeta["tone"], string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  sky: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
  emerald: "bg-emerald-50 text-emerald-700",
  muted: "bg-neutral-100 text-neutral-500",
};
