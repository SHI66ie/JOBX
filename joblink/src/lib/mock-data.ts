/**
 * Mock data for the JOMP employer dashboard.
 * Used when NEXT_PUBLIC_USE_MOCK_DATA=true (and as a fallback when Supabase is unavailable).
 */

import type { Company } from "@/lib/employer";

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export const MOCK_COMPANY: Company = {
  id: "mock-company-001",
  name: "JOMP Technologies",
  description:
    "We connect Nigeria's top talent with the best opportunities across tech, finance, and creative industries. We're a remote-first team of 14 spread across Lagos, Abuja, Nairobi and London.",
  website: "https://jomponline.com",
  created_by: "mock-user-001",
};

export const MOCK_APPLICATIONS = [
  {
    id: "app-1",
    job_id: "mock-job-001",
    candidate_id: "mock-candidate-001",
    status: "pending",
    created_at: daysAgo(0.3),
    jobTitle: "Senior Frontend Engineer",
    jobId: "mock-job-001",
    users: {
      full_name: "Adaeze Okonkwo",
      email: "adaeze@example.com",
      bio: "Frontend engineer with 6 years building design systems and dashboards in React and TypeScript. Led the web rebuild at a Lagos fintech serving 400k users.",
    },
    cover_letter:
      "I've followed JOMP since launch and love the remote-first mission. I'd bring deep React/Next.js experience and a strong eye for UI polish.",
    resume_url: "/mock/sample-cv.pdf",
  },
  {
    id: "app-2",
    job_id: "mock-job-001",
    candidate_id: "mock-candidate-002",
    status: "pending",
    created_at: daysAgo(1),
    jobTitle: "Senior Frontend Engineer",
    jobId: "mock-job-001",
    users: {
      full_name: "Emeka Obi",
      email: "emeka@example.com",
      bio: "Full-stack developer leaning frontend. Next.js, Tailwind, and a soft spot for accessibility and performance budgets.",
    },
    cover_letter: null,
    resume_url: "/mock/sample-cv.pdf",
  },
  {
    id: "app-3",
    job_id: "mock-job-001",
    candidate_id: "mock-candidate-003",
    status: "reviewed",
    created_at: daysAgo(3),
    jobTitle: "Senior Frontend Engineer",
    jobId: "mock-job-001",
    users: {
      full_name: "Fatima Bello",
      email: "fatima@example.com",
      bio: "Senior engineer at a pan-African e-commerce company. Previously shipped the checkout flow used across 5 countries.",
    },
    cover_letter:
      "Happy to share a walkthrough of the component library I built — it cut our feature build time roughly in half.",
    resume_url: "/mock/sample-cv.pdf",
  },
  {
    id: "app-4",
    job_id: "mock-job-001",
    candidate_id: "mock-candidate-004",
    status: "interviewing",
    created_at: daysAgo(5),
    jobTitle: "Senior Frontend Engineer",
    jobId: "mock-job-001",
    users: {
      full_name: "Kelechi Nwosu",
      email: "kelechi@example.com",
      bio: "React and React Native engineer, 7 years. Enjoys mentoring and turning messy product specs into clean interfaces.",
    },
    cover_letter: null,
    resume_url: null,
  },
  {
    id: "app-5",
    job_id: "mock-job-001",
    candidate_id: "mock-candidate-005",
    status: "rejected",
    created_at: daysAgo(6),
    jobTitle: "Senior Frontend Engineer",
    jobId: "mock-job-001",
    users: {
      full_name: "Samuel Etim",
      email: "samuel@example.com",
      bio: "Junior developer, 1 year of experience with HTML, CSS and vanilla JavaScript.",
    },
    cover_letter: null,
    resume_url: null,
  },
  {
    id: "app-6",
    job_id: "mock-job-002",
    candidate_id: "mock-candidate-006",
    status: "accepted",
    created_at: daysAgo(9),
    jobTitle: "Product Manager",
    jobId: "mock-job-002",
    users: {
      full_name: "Chidi Eze",
      email: "chidi@example.com",
      bio: "Product manager with a background in engineering. Took a B2B payments product from 0 to 1,200 paying merchants.",
    },
    cover_letter: "Excited about building marketplaces that work for both sides.",
    resume_url: "/mock/sample-cv.pdf",
  },
  {
    id: "app-7",
    job_id: "mock-job-002",
    candidate_id: "mock-candidate-007",
    status: "interviewing",
    created_at: daysAgo(11),
    jobTitle: "Product Manager",
    jobId: "mock-job-002",
    users: {
      full_name: "Ngozi Adeleke",
      email: "ngozi@example.com",
      bio: "Growth PM. Ran experimentation at a consumer lending app and grew activation by 22%.",
    },
    cover_letter: null,
    resume_url: "/mock/sample-cv.pdf",
  },
  {
    id: "app-8",
    job_id: "mock-job-003",
    candidate_id: "mock-candidate-008",
    status: "pending",
    created_at: daysAgo(0.8),
    jobTitle: "Product Designer",
    jobId: "mock-job-003",
    users: {
      full_name: "Tunde Ajayi",
      email: "tunde@example.com",
      bio: "Product designer focused on fintech and marketplaces. Figma, prototyping, and running usability tests on a shoestring.",
    },
    cover_letter: null,
    resume_url: "/mock/sample-cv.pdf",
  },
  {
    id: "app-9",
    job_id: "mock-job-005",
    candidate_id: "mock-candidate-009",
    status: "rejected",
    created_at: daysAgo(26),
    jobTitle: "Data Analyst",
    jobId: "mock-job-005",
    users: {
      full_name: "Aisha Musa",
      email: "aisha@example.com",
      bio: "Data analyst: SQL, Power BI and Python. Built weekly reporting for a logistics company's ops team.",
    },
    cover_letter: null,
    resume_url: null,
  },
];

const JOB_BASE = [
  {
    id: "mock-job-001",
    title: "Senior Frontend Engineer",
    type: "full-time",
    status: "published",
    salary_range: "₦800,000 – ₦1,200,000 / month",
    created_at: daysAgo(7),
    description:
      "We're looking for a senior frontend engineer to own the experience job seekers and employers use every day.\n\nYou'll work closely with design and product to ship features end to end — from the job feed and matching to the employer hiring pipeline. You'll set the bar for UI quality, performance and accessibility across the app.\n\nA typical week: pairing on a new feature, reviewing PRs, tightening our design system, and talking to users about what's slowing them down.",
    requirements:
      "• 5+ years building production web apps with React and TypeScript\n• Strong experience with Next.js (App Router) and Tailwind CSS\n• An eye for detail: spacing, motion and interaction states matter to you\n• Comfortable working async across time zones\n• Bonus: experience with Supabase or Postgres",
  },
  {
    id: "mock-job-002",
    title: "Product Manager",
    type: "full-time",
    status: "published",
    salary_range: "₦900,000 – ₦1,400,000 / month",
    created_at: daysAgo(14),
    description:
      "Own the employer side of JOMP: posting, reviewing and hiring. You'll turn feedback from hiring teams into a clear roadmap and ship it with a small, senior team.",
    requirements:
      "• 3+ years as a product manager on a B2B or marketplace product\n• Comfortable with data: you can write basic SQL\n• Excellent written communication",
  },
  {
    id: "mock-job-003",
    title: "Product Designer",
    type: "contract",
    status: "published",
    salary_range: "$2,500 – $3,500 / month",
    created_at: daysAgo(2),
    description:
      "A 6-month contract to redesign onboarding and the candidate profile. You'll run quick research, prototype in Figma and hand off production-ready specs.",
    requirements: "• A portfolio with shipped product work\n• Strong Figma and prototyping skills\n• Experience designing for mobile-first users",
  },
  {
    id: "mock-job-004",
    title: "Backend Engineer (Node.js)",
    type: "full-time",
    status: "draft",
    salary_range: "₦700,000 – ₦1,000,000 / month",
    created_at: daysAgo(1),
    description: "Help us build the matching engine and notifications system behind JOMP.",
    requirements: "• Node.js and TypeScript\n• PostgreSQL and SQL performance tuning\n• Experience with background jobs and queues",
  },
  {
    id: "mock-job-005",
    title: "Data Analyst",
    type: "part-time",
    status: "closed",
    salary_range: null,
    created_at: daysAgo(30),
    description: "Part-time role supporting growth and ops with weekly dashboards and ad-hoc analysis.",
    requirements: "• SQL and a BI tool (Power BI, Looker or Metabase)\n• Clear storytelling with data",
  },
];

/** Jobs with their applications (status + date) derived from MOCK_APPLICATIONS. */
export const MOCK_JOBS = JOB_BASE.map((job) => ({
  ...job,
  location: "Remote",
  job_type: job.type,
  updated_at: job.created_at,
  company_id: "mock-company-001",
  employer_id: "mock-user-001",
  applications: MOCK_APPLICATIONS.filter((app) => app.job_id === job.id).map((app) => ({
    id: app.id,
    status: app.status,
    created_at: app.created_at,
  })),
}));

export const MOCK_USER = {
  id: "mock-user-001",
  email: "devteam@jomponline.com",
  user_metadata: {
    full_name: "Joblinkdevteam",
    first_name: "Ola",
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

/** Extra JOMP profile details for sample applicants (title, skills, ratings, work history). */
export const MOCK_CANDIDATE_EXTRAS: Record<
  string,
  {
    title: string;
    skills: string[];
    memberSince: string;
    rating: { average: number; count: number } | null;
    jobsCompleted: number;
    history: { title: string; company: string; period: string; rating?: number; review?: string }[];
  }
> = {
  "mock-candidate-001": {
    title: "Senior Frontend Engineer",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Design Systems", "Web Accessibility"],
    memberSince: "Mar 2025",
    rating: { average: 4.9, count: 7 },
    jobsCompleted: 7,
    history: [
      {
        title: "Dashboard rebuild (Next.js)",
        company: "Brightpath Logistics",
        period: "Jan – Apr 2026",
        rating: 5,
        review: "Shipped ahead of schedule and left us with a component library the whole team now uses.",
      },
      {
        title: "Accessibility audit & fixes",
        company: "Kora Health",
        period: "Oct – Nov 2025",
        rating: 5,
        review: "Thorough, clear communicator. Our Lighthouse accessibility score went from 70 to 98.",
      },
      { title: "Landing page build", company: "Nuvo Studio", period: "Aug 2025", rating: 4 },
    ],
  },
  "mock-candidate-002": {
    title: "Full-stack Developer",
    skills: ["Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
    memberSince: "Jul 2026",
    rating: null,
    jobsCompleted: 0,
    history: [],
  },
  "mock-candidate-003": {
    title: "Senior Software Engineer",
    skills: ["React", "TypeScript", "Redux", "Jest", "Web Performance"],
    memberSince: "Nov 2024",
    rating: { average: 4.7, count: 12 },
    jobsCompleted: 12,
    history: [
      {
        title: "Checkout optimisation",
        company: "Shoplink Africa",
        period: "2025",
        rating: 5,
        review: "Cut checkout drop-off by a third. Would hire again in a heartbeat.",
      },
      { title: "React Native app maintenance", company: "Tella Pay", period: "2024 – 2025", rating: 4 },
    ],
  },
  "mock-candidate-004": {
    title: "React & React Native Engineer",
    skills: ["React", "React Native", "Expo", "TypeScript", "Mentoring"],
    memberSince: "Feb 2025",
    rating: { average: 4.8, count: 5 },
    jobsCompleted: 5,
    history: [
      {
        title: "Mobile app v2",
        company: "Harvest Farms",
        period: "Mar – Jun 2026",
        rating: 5,
        review: "Turned a messy spec into a clean app our farmers actually enjoy using.",
      },
    ],
  },
  "mock-candidate-006": {
    title: "Product Manager",
    skills: ["Product Strategy", "Roadmapping", "SQL", "User Stories"],
    memberSince: "May 2025",
    rating: { average: 4.6, count: 3 },
    jobsCompleted: 3,
    history: [{ title: "Payments roadmap (contract)", company: "Tella Pay", period: "2025", rating: 5 }],
  },
};
