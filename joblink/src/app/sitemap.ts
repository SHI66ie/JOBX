import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jomponline.com";

  let jobUrls: MetadataRoute.Sitemap = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, updated_at, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5000);

      if (jobs) {
        jobUrls = jobs.map((job) => ({
          url: `${baseUrl}/dashboard/jobs/${job.id}`,
          lastModified: new Date(job.updated_at || job.created_at || "2026-01-01T00:00:00.000Z"),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }
    } catch (err: unknown) {
      console.error("Sitemap generation error:", err);
    }
  }

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return [...staticUrls, ...jobUrls];
}
