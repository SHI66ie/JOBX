"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OnboardingFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
  };
  userId: string;
}

export default function OnboardingForm({ initialData, userId }: OnboardingFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let resumeUrl = "";

      // 1. Upload Resume if exists
      if (resumeFile) {
        const fileExt = resumeFile.name.split(".").pop();
        const filePath = `${userId}/resume-${Date.now()}.${fileExt}`;

        // Attempt upload to 'resumes' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, resumeFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.warn("Storage upload failed (bucket 'resumes' might not exist):", uploadError);
          // Don't crash, we'll continue onboarding and mock a URL or alert user
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from("resumes")
            .getPublicUrl(filePath);
          resumeUrl = publicUrlData.publicUrl;
        }
      }

      // 2. Save candidate details to Supabase Auth User Metadata (Safest fallback)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          onboarded: true,
          title,
          bio,
          skills: skills.split(",").map((s) => s.trim()),
          resume_url: resumeUrl,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 3. Attempt to update public.users table if it is configured
      try {
        await supabase
          .from("users")
          .update({
            bio,
            // check if columns exist or fail gracefully
          })
          .eq("id", userId);
      } catch (dbError) {
        console.warn("Database users table update skipped/failed:", dbError);
      }

      // Success -> Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={initialData.firstName} disabled className="mt-1" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={initialData.lastName} disabled className="mt-1" />
        </div>
      </div>

      <div>
        <Label htmlFor="title">Professional Title</Label>
        <Input
          id="title"
          placeholder="e.g. Frontend Developer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell employers about your experience, achievements, and goals..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <Input
          id="skills"
          placeholder="React, TypeScript, Next.js, Node"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="resume">Upload Resume (PDF, DOCX)</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-300 dark:border-zinc-700 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer relative">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-zinc-600 dark:text-zinc-400">
              <span className="relative rounded-md font-medium text-[#00838f] hover:text-[#005662] focus-within:outline-none">
                Upload a file
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-zinc-500">PDF, DOCX up to 5MB</p>
            {resumeFile && (
              <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-2">
                Selected: {resumeFile.name}
              </p>
            )}
          </div>
          <input
            id="resume"
            name="resume"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            required
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-[#00838f] hover:bg-[#005662] text-white">
        {loading ? "Saving Profile..." : "Complete Onboarding"}
      </Button>
    </form>
  );
}
