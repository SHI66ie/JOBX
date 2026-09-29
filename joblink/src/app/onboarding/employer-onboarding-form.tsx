"use client";

import { useState, type FormEvent } from "react";
import {
  Agreement02Icon,
  Briefcase01Icon,
  Building03Icon,
  Rocket01Icon,
  Store01Icon,
  UserIcon,
  UserGroupIcon,
  UserSearch01Icon,
  UserSettings01Icon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { TextField } from "@/components/auth/auth-fields";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import {
  ChoiceGrid,
  ChoiceTiles,
  CompletionScreen,
  FormError,
  PillChoice,
  StepActions,
  StepBody,
  StepHeading,
  Toggle,
} from "@/components/onboarding/onboarding-fields";
import { ACCOUNT_TYPES, HIRING_CATEGORIES, TEAM_SIZES, isEnterpriseTeam } from "@/lib/employer-options";
import { completeEmployerOnboarding } from "./actions";

type AccountType = (typeof ACCOUNT_TYPES)[number]["value"];
type HiringFor = (typeof HIRING_CATEGORIES)[number]["value"];
type TeamSize = (typeof TEAM_SIZES)[number]["value"];

const STEPS = [
  { label: "About you", hint: "Who's setting up this account." },
  { label: "Your hiring", hint: "What you hire for and how big you are." },
  { label: "Company details", hint: "Business info for invoices and trust." },
] as const;

const ACCOUNT_META: Record<AccountType, { icon: IconSvgElement; color: string; description: string }> = {
  "business-owner": { icon: Store01Icon, color: "text-orange-500", description: "You run the business and hire for it." },
  "hiring-manager": { icon: UserSettings01Icon, color: "text-sky-500", description: "You hire for a team inside a company." },
  recruiter: { icon: UserSearch01Icon, color: "text-emerald-500", description: "You source and screen candidates." },
  agency: { icon: Agreement02Icon, color: "text-rose-500", description: "You hire on behalf of clients." },
  solo: { icon: Rocket01Icon, color: "text-violet-500", description: "Freelance or hiring for a side project." },
};

const TEAM_META: Record<TeamSize, { icon: React.ReactNode; description: string }> = {
  solo: { icon: <Icon icon={UserIcon} />, description: "Just you, hiring occasionally." },
  small: { icon: <Icon icon={UserGroupIcon} />, description: "A growing team of 2–20." },
  agency: { icon: <Icon icon={Briefcase01Icon} />, description: "Hiring on behalf of clients." },
  enterprise: { icon: <Icon icon={Building03Icon} />, description: "50+ people. Business details required." },
};

/** "I need graphic design" → "Graphic design" for compact pills. */
function shortHiringLabel(label: string) {
  const trimmed = label.replace(/^I need /, "").replace(/^I hire in /, "");
  if (trimmed.startsWith("I'm a business owner")) return "Hiring across roles";
  if (trimmed.startsWith("I'm a recruiter")) return "Recruiting for clients";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

// "Hiring across roles" and "Recruiting for clients" describe the account, which
// step one already asks; with multi-select they're redundant here.
const HIRING_OPTIONS = HIRING_CATEGORIES.filter((option) => option.value !== "business-owner" && option.value !== "recruiter").map(
  (option) => ({ value: option.value, label: shortHiringLabel(option.label) }),
);
const MAX_HIRING = 3;

interface EmployerOnboardingFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isComplete?: boolean;
}

export default function EmployerOnboardingForm({ initialData, isComplete = false }: EmployerOnboardingFormProps) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [accountType, setAccountType] = useState<AccountType>("business-owner");
  const [hiringFor, setHiringFor] = useState<HiringFor[]>([]);
  const [teamSize, setTeamSize] = useState<TeamSize>("small");
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [registration, setRegistration] = useState("");
  const [requestVerification, setRequestVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [redirectTo, setRedirectTo] = useState<string | null>(isComplete ? "/employer/dashboard" : null);

  const enterprise = isEnterpriseTeam(teamSize);

  function validate(current: number) {
    if (current === 0 && (!firstName.trim() || !lastName.trim())) return "Add your first and last name.";
    if (current === 1 && hiringFor.length === 0) return "Pick at least one area you're hiring for.";
    if (current === 2 && enterprise && !companyName.trim()) return "Company name is required for enterprise accounts.";
    if (current === 2 && enterprise && (!vatNumber.trim() || !registration.trim()))
      return "Enterprise accounts need a VAT / tax ID and business registration number.";
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
      const formData = new FormData();
      formData.set("first_name", firstName);
      formData.set("last_name", lastName);
      formData.set("account_type", accountType);
      formData.set("hiring_for", hiringFor.join(","));
      formData.set("team_size", teamSize);
      formData.set("name", companyName);
      formData.set("vat_number", vatNumber);
      formData.set("business_registration", registration);
      if (requestVerification) formData.set("request_verification", "true");

      const result = await completeEmployerOnboarding(formData);
      if (result?.error) {
        setErrorMsg(result.error);
        setIsSubmitting(false);
        return;
      }
      setRedirectTo(result?.redirectTo ?? "/employer/dashboard");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Could not finish setup. Please try again.");
      setIsSubmitting(false);
    }
  }

  const back = step > 0 ? () => { setErrorMsg(""); setStep(step - 1); } : undefined;
  const optional = enterprise ? undefined : "Optional";

  return (
    <OnboardingShell
      title="Set up your hiring"
      steps={STEPS}
      currentStep={step}
      isComplete={Boolean(redirectTo)}
      email={initialData.email}
      wide={step === 0 && !redirectTo}
    >
      {redirectTo ? (
        <CompletionScreen
          title={`You're ready to hire, ${firstName.trim()}.`}
          description={
            requestVerification
              ? "Your hiring account is set up and your verification request is in. Post your first role whenever you're ready."
              : "Your hiring account is set up. Post your first role and start meeting candidates."
          }
          href={redirectTo}
          cta="Go to your dashboard"
        />
      ) : (
        <form key={step} noValidate onSubmit={handleSubmit}>
          {step === 0 ? (
            <>
              <StepHeading
                eyebrow="Welcome to JOMP"
                title="Let's set up your hiring account"
                description="Candidates will see your name on the roles you post."
              />
              <StepBody>
                <div className="grid max-w-[460px] gap-4 sm:grid-cols-2">
                  <TextField id="first_name" label="First name" autoComplete="given-name" autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ada" />
                  <TextField id="last_name" label="Last name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Obi" />
                </div>
                <TextField id="email" label="Work email" value={initialData.email} readOnly className="max-w-[460px] opacity-60" />
                <ChoiceTiles
                  name="account_type"
                  label="What best describes you?"
                  value={accountType}
                  onChange={setAccountType}
                  options={ACCOUNT_TYPES.map((option) => {
                    const meta = ACCOUNT_META[option.value];
                    return {
                      value: option.value,
                      label: option.label,
                      description: meta.description,
                      icon: <Icon icon={meta.icon} size={26} className={meta.color} />,
                    };
                  })}
                />
              </StepBody>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <StepHeading
                title="What are you hiring for?"
                description="We'll use this to tailor candidates and job templates for you."
              />
              <StepBody>
                <PillChoice name="hiring_for" label="Hiring for" values={hiringFor} onChange={setHiringFor} options={HIRING_OPTIONS} max={MAX_HIRING} />
                <ChoiceGrid
                  name="team_size"
                  label="Team size"
                  value={teamSize}
                  onChange={setTeamSize}
                  options={TEAM_SIZES.map((option) => ({ ...option, ...TEAM_META[option.value] }))}
                />
              </StepBody>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <StepHeading
                title="Tell us about your company"
                description={
                  enterprise
                    ? "Enterprise accounts need these details before posting roles."
                    : "All optional for now. Add them if you'd like invoices in your company's name."
                }
              />
              <StepBody>
                <TextField
                  id="name"
                  label={optional ? "Company name · optional" : "Company name"}
                  autoFocus
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Studios"
                  autoComplete="organization"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="vat_number"
                    label={optional ? "VAT / tax ID · optional" : "VAT / tax ID"}
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="e.g. 12345678-0001"
                  />
                  <TextField
                    id="business_registration"
                    label={optional ? "Registration no. · optional" : "Registration no."}
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                    placeholder="CAC / RC number"
                  />
                </div>
                <Toggle
                  checked={requestVerification}
                  onChange={setRequestVerification}
                  title="Request ID verification"
                  description="Only needed for higher spend limits or escrow. You can skip this for now."
                />
              </StepBody>
            </>
          ) : null}

          <StepActions
            onBack={back}
            primaryLabel={step === STEPS.length - 1 ? "Finish setup" : "Continue"}
            isSubmitting={isSubmitting}
            submittingLabel="Setting up…"
          />
          <FormError message={errorMsg} />
        </form>
      )}
    </OnboardingShell>
  );
}
