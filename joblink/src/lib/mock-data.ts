/**
 * Mock data for JOMP employer dashboard.
 * Used when NEXT_PUBLIC_USE_MOCK_DATA=true or as a fallback when Supabase is unavailable.
 */

import type { Company } from "@/lib/employer";

export const MOCK_COMPANY: Company = {
  id: "mock-company-001",
  name: "JOMP Technologies",
  description:
    "We connect Nigeria's top talent with the best opportunities across tech, finance, and creative industries.",
  website: "https://jomponline.com",
  created_by: "mock-user-001",
};

export const MOCK_JOBS = [
  {
    id: "mock-job-001",
    title: "Senior Frontend Engineer",
    location: "Lagos, Nigeria",
    type: "full-time",
    status: "published",
    salary_range: "₦500,000 – ₦800,000/mo",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    company_id: "mock-company-001",
    employer_id: "mock-user-001",
    applications: [{ id: "app-1" }, { id: "app-2" }, { id: "app-3" }],
  },
  {
    id: "mock-job-002",
    title: "Product Manager",
    location: "Abuja, Nigeria",
    type: "full-time",
    status: "published",
    salary_range: "₦600,000 – ₦900,000/mo",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    company_id: "mock-company-001",
    employer_id: "mock-user-001",
    applications: [{ id: "app-4" }, { id: "app-5" }],
  },
  {
    id: "mock-job-003",
    title: "UX/UI Designer",
    location: "Remote",
    type: "contract",
    status: "active",
    salary_range: "₦300,000 – ₦500,000/mo",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    company_id: "mock-company-001",
    employer_id: "mock-user-001",
    applications: [{ id: "app-6" }],
  },
  {
    id: "mock-job-004",
    title: "Backend Engineer (Node.js)",
    location: "Lagos, Nigeria",
    type: "full-time",
    status: "draft",
    salary_range: "₦450,000 – ₦700,000/mo",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    company_id: "mock-company-001",
    employer_id: "mock-user-001",
    applications: [],
  },
  {
    id: "mock-job-005",
    title: "Data Analyst",
    location: "Port Harcourt, Nigeria",
    type: "full-time",
    status: "closed",
    salary_range: "₦250,000 – ₦400,000/mo",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    company_id: "mock-company-001",
    employer_id: "mock-user-001",
    applications: [{ id: "app-7" }, { id: "app-8" }],
  },
];

export const MOCK_APPLICATIONS = [
  {
    id: "app-1",
    job_id: "mock-job-001",
    candidate_id: "mock-candidate-001",
    status: "pending",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    jobTitle: "Senior Frontend Engineer",
    jobId: "mock-job-001",
    users: { full_name: "Adaeze Okonkwo", email: "adaeze@example.com" },
  },
  {
    id: "app-2",
    job_id: "mock-job-001",
    candidate_id: "mock-candidate-002",
    status: "reviewed",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    jobTitle: "Senior Frontend Engineer",
    jobId: "mock-job-001",
    users: { full_name: "Emeka Obi", email: "emeka@example.com" },
  },
  {
    id: "app-3",
    job_id: "mock-job-001",
    candidate_id: "mock-candidate-003",
    status: "interviewing",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    jobTitle: "Senior Frontend Engineer",
    jobId: "mock-job-001",
    users: { full_name: "Fatima Bello", email: "fatima@example.com" },
  },
  {
    id: "app-4",
    job_id: "mock-job-002",
    candidate_id: "mock-candidate-004",
    status: "accepted",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    jobTitle: "Product Manager",
    jobId: "mock-job-002",
    users: { full_name: "Chidi Eze", email: "chidi@example.com" },
  },
  {
    id: "app-5",
    job_id: "mock-job-002",
    candidate_id: "mock-candidate-005",
    status: "rejected",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    jobTitle: "Product Manager",
    jobId: "mock-job-002",
    users: { full_name: "Ngozi Adeleke", email: "ngozi@example.com" },
  },
  {
    id: "app-6",
    job_id: "mock-job-003",
    candidate_id: "mock-candidate-006",
    status: "pending",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    jobTitle: "UX/UI Designer",
    jobId: "mock-job-003",
    users: { full_name: "Tunde Ajayi", email: "tunde@example.com" },
  },
];

export const MOCK_USER = {
  id: "mock-user-001",
  email: "devteam@jomponline.com",
  user_metadata: {
    full_name: "Joblinkdevteam",
    roles: ["employer"],
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as const;

export const MOCK_ADMIN_STATS = {
  totalUsers: 1240,
  totalJobs: 87,
  totalCompanies: 34,
  totalApplications: 3821,
  pendingVerifications: 6,
};
