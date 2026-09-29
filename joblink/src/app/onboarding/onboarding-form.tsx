"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { TextField } from "@/components/auth/auth-fields";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import {
  CompletionScreen,
  FileDrop,
  FormError,
  StepActions,
  StepBody,
  StepHeading,
  SkillPicker,
  TextArea,
} from "@/components/onboarding/onboarding-fields";
import { completeCandidateOnboarding } from "./actions";

const STEPS = [
  { label: "About you", hint: "Your name as employers will see it." },
  { label: "Your profile", hint: "A headline and a short summary." },
  { label: "Skills & CV", hint: "What you're great at, plus your CV." },
] as const;

const SKILL_SUGGESTIONS = [
  "Communication",
  "Customer service",
  "Microsoft Excel",
  "Project management",
  "Sales",
  "Data analysis",
  "React",
  "Graphic design",
  "Social media",
  "Accounting",
];

interface OnboardingFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    bio?: string;
    skills?: string;
  };
  isComplete?: boolean;
}

export default function OnboardingForm({ initialData, isComplete = false }: OnboardingFormProps) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [title, setTitle] = useState(initialData.title ?? "");
  const [bio, setBio] = useState(initialData.bio ?? "");
  const [skills, setSkills] = useState<string[]>(
    (initialData.skills ?? "").split(",").map((item) => item.trim()).filter(Boolean),
  );
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [redirectTo, setRedirectTo] = useState<string | null>(isComplete ? "/dashboard" : null);

  function validate(current: number) {
    if (current === 0 && (!firstName.trim() || !lastName.trim())) return "Add your first and last name.";
    if (current === 1 && !title.trim()) return "Add a professional title, e.g. Frontend Developer.";
    if (current === 1 && bio.trim().length < 20) return "Write a short bio — a couple of sentences is plenty.";
    if (current === 2 && skills.length === 0) return "Add at least one skill.";
    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validate(step);
    setErrorMsg(problem);
    if (problem) return;

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      let resumeUrl = "";
      if (resumeFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const ext = resumeFile.name.split(".").pop();
          const filePath = `${user.id}/resume-${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("resumes")
            .upload(filePath, resumeFile, { cacheControl: "3600", upsert: true });
          if (!uploadError) {
            resumeUrl = supabase.storage.from("resumes").getPublicUrl(filePath).data.publicUrl;
          }
        }
      }

      const formData = new FormData();
      formData.set("first_name", firstName);
      formData.set("last_name", lastName);
      formData.set("title", title);
      formData.set("bio", bio);
      formData.set("skills", skills.join(", "));
      formData.set("resume_url", resumeUrl);

      const result = await completeCandidateOnboarding(formData);
      if (result?.error) {
        setErrorMsg(result.error);
        setIsSubmitting(false);
        return;
      }
      setRedirectTo(result?.redirectTo ?? "/dashboard");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  const back = step > 0 ? () => { setErrorMsg(""); setStep(step - 1); } : undefined;

  return (
    <OnboardingShell
      title="Set up your profile"
      steps={STEPS}
      currentStep={step}
      isComplete={Boolean(redirectTo)}
      email={initialData.email}
    >
      {redirectTo ? (
        <CompletionScreen
          title={`You're all set, ${firstName.trim()}.`}
          description="Your profile is live. Browse open roles and apply in a few clicks."
          href={redirectTo}
          cta="Browse jobs"
        />
      ) : (
        <form key={step} noValidate onSubmit={handleSubmit}>
          {step === 0 ? (
            <>
              <StepHeading
                eyebrow="Welcome to JOMP"
                title="First, what's your name?"
                description="This is how you'll appear to employers when you apply."
              />
              <StepBody>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField id="first_name" label="First name" autoComplete="given-name" autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ada" />
                  <TextField id="last_name" label="Last name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Obi" />
                </div>
                <TextField id="email" label="Email" value={initialData.email} readOnly className="opacity-60" />
              </StepBody>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <StepHeading
                title="Tell employers who you are"
                description="A clear headline and a short summary go a long way."
              />
              <StepBody>
                <TextField id="title" label="Professional title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" />
                <TextArea
                  id="bio"
                  label="Short bio"
                  meta={`${bio.length}/600`}
                  maxLength={600}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What you do, what you've achieved, and what you're looking for next."
                />
              </StepBody>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <StepHeading
                title="What are you great at?"
                description="Skills help us match you with the right roles."
              />
              <StepBody>
                <SkillPicker id="skills" label="Skills" tags={skills} onChange={setSkills} suggestions={SKILL_SUGGESTIONS} placeholder="Search skills, e.g. React, Sales, Excel" />
                <FileDrop id="resume" label="CV / résumé" file={resumeFile} onFile={(file) => { setErrorMsg(""); setResumeFile(file); }} onError={setErrorMsg} />
              </StepBody>
            </>
          ) : null}

          <StepActions
            onBack={back}
            primaryLabel={step === STEPS.length - 1 ? "Finish setup" : "Continue"}
            isSubmitting={isSubmitting}
            submittingLabel="Saving profile…"
          />
          <FormError message={errorMsg} />
        </form>
      )}
    </OnboardingShell>
  );
}
