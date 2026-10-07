import type { JobListing } from "@/lib/jobs";

type JobPostingSchemaProps = {
  job: Pick<
    JobListing,
    "id" | "title" | "description" | "requirements" | "type" | "job_type" | "salary_range" | "created_at"
  > & {
    location?: string | null;
    company?: { name: string | null; website?: string | null } | null;
  };
  siteUrl?: string;
};

export function mapEmploymentType(type?: string | null): string {
  switch (type?.toLowerCase()) {
    case "full-time":
      return "FULL_TIME";
    case "part-time":
      return "PART_TIME";
    case "contract":
      return "CONTRACTOR";
    case "internship":
      return "INTERN";
    case "temporary":
      return "TEMPORARY";
    default:
      return "FULL_TIME";
  }
}

export function parseSalary(salaryRange?: string | null) {
  if (!salaryRange) return null;
  const numbers = salaryRange.replace(/,/g, "").match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;

  const min = parseInt(numbers[0], 10);
  const max = numbers.length > 1 ? parseInt(numbers[1], 10) : min;
  const unit = /year|yr/i.test(salaryRange) ? "YEAR" : "MONTH";

  return { min, max, unit };
}

export function JobPostingSchema({ job, siteUrl = "https://jomponline.com" }: JobPostingSchemaProps) {
  const fullDescription = [job.description, job.requirements ? `Requirements:\n${job.requirements}` : ""]
    .filter(Boolean)
    .join("\n\n");

  const createdDate = new Date(job.created_at || "2026-01-01T00:00:00.000Z");
  const validThroughDate = new Date(createdDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days valid

  const isRemoteLocation = Boolean(job.location && /remote/i.test(job.location)) || true;
  const salary = parseSalary(job.salary_range);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: fullDescription.replace(/\n/g, "<br/>"),
    identifier: {
      "@type": "PropertyValue",
      name: "JOMP",
      value: job.id,
    },
    datePosted: createdDate.toISOString(),
    validThrough: validThroughDate.toISOString(),
    employmentType: mapEmploymentType(job.type || job.job_type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company?.name || "JOMP Partner",
      sameAs: job.company?.website || siteUrl,
      logo: `${siteUrl}/brand/JOMP_Monogram_Navy.svg`,
    },
    jobLocationType: isRemoteLocation ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements: isRemoteLocation
      ? {
          "@type": "Country",
          name: "Worldwide",
        }
      : undefined,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Remote",
        addressCountry: "Global",
      },
    },
    ...(salary
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "USD",
            value: {
              "@type": "QuantitativeValue",
              minValue: salary.min,
              maxValue: salary.max,
              unitText: salary.unit,
            },
          },
        }
      : {}),
    directApply: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
