"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeCandidateOnboarding } from "./actions";

interface OnboardingFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    bio?: string;
    skills?: string;
  };
}

export default function OnboardingForm({ initialData }: OnboardingFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      let uploadedUrl = resumeUrl;

      if (resumeFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const fileExt = resumeFile.name.split(".").pop();
          const filePath = `${user.id}/resume-${Date.now()}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("resumes")
            .upload(filePath, resumeFile, { cacheControl: "3600", upsert: true });

          if (!uploadError && uploadData) {
            uploadedUrl = supabase.storage.from("resumes").getPublicUrl(filePath).data.publicUrl;
            setResumeUrl(uploadedUrl);
          }
        }
      }

      formData.set("resume_url", uploadedUrl);
      const result = await completeCandidateOnboarding(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong during onboarding.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" name="first_name" defaultValue={initialData.firstName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" name="last_name" defaultValue={initialData.lastName} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={initialData.email} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Professional title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Frontend Developer"
          defaultValue={initialData.title}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Professional bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell employers about your experience, achievements, and goals..."
          defaultValue={initialData.bio}
          required
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <Input
          id="skills"
          name="skills"
          placeholder="React, TypeScript, Next.js, Node"
          defaultValue={initialData.skills}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Resume (optional)</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-300 dark:border-zinc-700 border-dashed rounded-md relative">
          <div className="space-y-1 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">PDF or DOCX up to 5MB</p>
            {resumeFile && (
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{resumeFile.name}</p>
            )}
          </div>
          <input
            id="resume"
            name="resume"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving profile..." : "Continue to job board"}
      </Button>
    </form>
  );
}
