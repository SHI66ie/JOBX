import Link from "next/link";
import type { ReactNode } from "react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import { JompMark, JompWordmark } from "@/components/brand/logo";

type StepState = "done" | "current" | "upcoming";

/** Onboarding frame: step rail on the left, one focused step on the right. */
export function OnboardingShell({
  title,
  steps,
  currentStep,
  isComplete = false,
  email,
  wide = false,
  children,
}: {
  title: string;
  steps: readonly { label: string; hint: string }[];
  currentStep: number;
  isComplete?: boolean;
  email?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const progress = isComplete ? 1 : currentStep / steps.length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-neutral-900">
      <SidebarGlow />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          aria-label={`${APP_NAME} home`}
          className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01224F] focus-visible:ring-offset-2"
        >
          <JompMark className="h-8 w-8" />
          <JompWordmark className="h-[18px] w-auto" />
        </Link>

        <div className="flex items-center gap-3">
          {email ? (
            <span className="hidden max-w-[220px] truncate text-[13px] text-neutral-500 sm:block">{email}</span>
          ) : null}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01224F]"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Mobile progress */}
      <div className="relative z-10 px-5 sm:px-8 lg:hidden">
        <div className="h-1 overflow-hidden rounded-full bg-neutral-200/80">
          <div
            className="h-full rounded-full bg-[#01224F] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${Math.max(progress, 0.08) * 100}%` }}
          />
        </div>
        {!isComplete ? (
          <p className="mt-3 text-xs font-medium text-neutral-500">
            Step {currentStep + 1} of {steps.length}
            <span className="mx-1.5 text-neutral-300">·</span>
            <span key={currentStep} className="auth-swap inline-block text-[#01224F]">
              {steps[currentStep]?.label}
            </span>
          </p>
        ) : null}
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-6xl lg:grid-cols-[300px_1fr]">
        <aside className="hidden items-center px-9 lg:flex">
          <StepRail title={title} steps={steps} currentStep={currentStep} isComplete={isComplete} />
        </aside>

        <main className="flex items-start px-5 pb-16 pt-8 sm:px-8 lg:items-center lg:px-20 lg:pb-24 lg:pt-0">
          <div className={cn("w-full transition-[max-width] duration-300", wide ? "max-w-[640px]" : "max-w-[460px]")}>{children}</div>
        </main>
      </div>
    </div>
  );
}

function StepRail({
  title,
  steps,
  currentStep,
  isComplete,
}: {
  title: string;
  steps: readonly { label: string; hint: string }[];
  currentStep: number;
  isComplete: boolean;
}) {
  return (
    <nav aria-label={title} className="w-full max-w-[240px]">
      <p className="auth-rise text-[13px] text-neutral-500">{title}</p>
      <ol className="mt-5">
        {steps.map((step, index) => {
          const state: StepState =
            isComplete || index < currentStep ? "done" : index === currentStep ? "current" : "upcoming";
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.label}
              aria-current={state === "current" ? "step" : undefined}
              className="auth-rise relative flex gap-3 pb-5 last:pb-0"
              style={{ animationDelay: `${60 + index * 50}ms` }}
            >
              {!isLast ? (
                <span aria-hidden className="absolute left-[3.5px] top-[15px] h-[calc(100%-12px)] w-px overflow-hidden bg-neutral-200">
                  <span
                    className={cn(
                      "absolute inset-0 origin-top bg-[#01224F]/60 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      state === "done" ? "scale-y-100" : "scale-y-0",
                    )}
                  />
                </span>
              ) : null}

              <span
                aria-hidden
                className={cn(
                  "relative mt-[7px] size-2 shrink-0 rounded-full transition-[background-color,box-shadow] duration-300",
                  state === "done" && "bg-[#01224F]/60",
                  state === "current" && "bg-[#01224F] shadow-[0_0_0_3px_rgba(1,34,79,0.12)]",
                  state === "upcoming" && "bg-white ring-1 ring-inset ring-neutral-300",
                )}
              />

              <span className="min-w-0">
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-[14px] leading-[22px] transition-colors duration-300",
                    state === "current" ? "font-medium text-neutral-900" : state === "done" ? "text-neutral-500" : "text-neutral-400",
                  )}
                >
                  {step.label}
                  {state === "done" ? (
                    <>
                      <Icon icon={Tick02Icon} aria-hidden className="auth-pop size-3.5 text-[#01224F]/60" strokeWidth={2.5} />
                      <span className="sr-only">(completed)</span>
                    </>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-300",
                    state === "current" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <span className="overflow-hidden">
                    <span className="block pt-0.5 text-[12.5px] leading-[18px] text-neutral-500">{step.hint}</span>
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SidebarGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-sky-200/45 blur-[110px]" />
      <div className="absolute -left-24 top-[38%] h-[420px] w-[380px] rounded-full bg-amber-100/60 blur-[110px]" />
      <div className="absolute -bottom-40 -left-32 h-[520px] w-[460px] rounded-full bg-rose-200/40 blur-[120px]" />
      <div className="absolute inset-y-0 left-[260px] right-0 hidden bg-gradient-to-r from-transparent to-[#fafafa] to-[18%] lg:block" />
    </div>
  );
}
