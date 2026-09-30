export type ApplicationStatus = "pending" | "reviewed" | "interviewing" | "accepted" | "rejected";

/** Max length of the optional note a candidate sends with an application. */
export const COVER_NOTE_LIMIT = 2000;

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

/** Employer-facing labels for the same statuses. */
export const EMPLOYER_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "New",
  reviewed: "In review",
  interviewing: "Interviewing",
  accepted: "Hired",
  rejected: "Rejected",
};

/** The next moves an employer can make from each stage. */
export function nextMoves(status: ApplicationStatus): { status: ApplicationStatus; label: string; tone: "default" | "positive" | "negative" }[] {
  const moves: Record<ApplicationStatus, ApplicationStatus[]> = {
    pending: ["reviewed", "interviewing", "rejected"],
    reviewed: ["interviewing", "accepted", "rejected"],
    interviewing: ["accepted", "rejected"],
    accepted: ["interviewing"],
    rejected: ["reviewed"],
  };
  const labels: Record<ApplicationStatus, string> = {
    pending: "Mark as new",
    reviewed: "Move to review",
    interviewing: "Interview",
    accepted: "Hire",
    rejected: "Reject",
  };
  return moves[status].map((next) => ({
    status: next,
    label: status === "rejected" && next === "reviewed" ? "Reconsider" : status === "accepted" ? "Undo hire" : labels[next],
    tone: next === "accepted" ? "positive" : next === "rejected" ? "negative" : "default",
  }));
}
