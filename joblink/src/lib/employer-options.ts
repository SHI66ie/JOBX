export const HIRING_CATEGORIES = [
  { value: "graphic-design", label: "I need graphic design" },
  { value: "software-it", label: "I need software / IT talent" },
  { value: "marketing", label: "I need marketing help" },
  { value: "sales", label: "I need salespeople" },
  { value: "operations", label: "I need operations / admin support" },
  { value: "finance", label: "I need finance / accounting help" },
  { value: "customer-support", label: "I need customer support" },
  { value: "legal", label: "I need legal / compliance help" },
  { value: "healthcare", label: "I hire in healthcare" },
  { value: "education", label: "I hire in education" },
  { value: "construction", label: "I hire in construction / trades" },
  { value: "hospitality", label: "I hire in hospitality" },
  { value: "business-owner", label: "I'm a business owner hiring across roles" },
  { value: "recruiter", label: "I'm a recruiter / agency hiring for clients" },
  { value: "other", label: "Other" },
] as const;

export const TEAM_SIZES = [
  { value: "solo", label: "Solo / just me" },
  { value: "small", label: "Small business (2–20)" },
  { value: "agency", label: "Agency" },
  { value: "enterprise", label: "Enterprise (50+)" },
] as const;

export const ACCOUNT_TYPES = [
  { value: "business-owner", label: "Business owner" },
  { value: "hiring-manager", label: "Hiring manager" },
  { value: "recruiter", label: "Recruiter" },
  { value: "agency", label: "Agency" },
  { value: "solo", label: "Independent / solo" },
] as const;

export function isEnterpriseTeam(teamSize: string) {
  return teamSize === "enterprise";
}

export const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
