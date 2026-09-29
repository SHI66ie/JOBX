"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight02Icon, Loading03Icon, ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

export function TextField({
  label,
  labelAction,
  hint,
  trailing,
  id,
  className,
  hideLabel = false,
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  labelAction?: ReactNode;
  hint?: ReactNode;
  trailing?: ReactNode;
  /** Keep the label for screen readers only (when the layout labels the field elsewhere). */
  hideLabel?: boolean;
}) {
  return (
    <div className={cn("group", className)}>
      <div className={cn("flex items-center justify-between", hideLabel && "sr-only")}>
        <label
          htmlFor={id}
          className="text-[14px] text-neutral-600 transition-colors duration-200 group-focus-within:text-neutral-900"
        >
          {label}
        </label>
        {labelAction}
      </div>
      <div
        className={cn(
          "flex h-11 items-center overflow-hidden rounded-xl bg-neutral-100 transition-colors duration-200 hover:bg-neutral-200/60 focus-within:bg-neutral-200/60",
          !hideLabel && "mt-2",
        )}
      >
        <input
          id={id}
          className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          {...inputProps}
        />
        {trailing ? (
          <span className="flex size-10 shrink-0 items-center justify-center">{trailing}</span>
        ) : null}
      </div>
      {hint ? <div className="mt-1.5 text-xs leading-5 text-neutral-500">{hint}</div> : null}
    </div>
  );
}

export function PasswordField(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    id: string;
    label: string;
    labelAction?: ReactNode;
    hint?: ReactNode;
  },
) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      spellCheck={false}
      type={isVisible ? "text" : "password"}
      trailing={
        <button
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          onClick={() => setIsVisible((visible) => !visible)}
          className={cn(
            "flex size-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700",
            FOCUS_RING,
          )}
        >
          <span key={isVisible ? "hide" : "show"} className="auth-pop flex">
            {isVisible ? <Icon icon={ViewOffSlashIcon} className="size-[17px]" /> : <Icon icon={ViewIcon} className="size-[17px]" />}
          </span>
        </button>
      }
    />
  );
}

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "group/btn relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand text-sm font-medium text-brand-fg shadow-[0_1px_2px_rgba(1,34,79,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] transition-[background-color,transform] duration-200 hover:bg-brand-hover active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-80",
        FOCUS_RING,
      )}
    >
      <span key={pending ? "pending" : "idle"} className="auth-swap inline-flex items-center gap-2">
        {pending ? (
          <>
            <Icon icon={Loading03Icon} className="size-4 animate-spin" />
            {pendingLabel}
          </>
        ) : (
          <>
            {label}
            <Icon icon={ArrowRight02Icon} className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </>
        )}
      </span>
    </button>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-surface text-sm font-medium text-neutral-800 transition-[background-color,border-color,transform] duration-200 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.985] disabled:opacity-70",
        FOCUS_RING,
      )}
    >
      {pending ? <Icon icon={Loading03Icon} className="size-4 animate-spin text-neutral-500" /> : <GoogleIcon />}
      {label}
    </button>
  );
}

export function OrDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
      <span className="auth-line h-px flex-1 origin-right bg-neutral-200" />
      {label}
      <span className="auth-line h-px flex-1 origin-left bg-neutral-200" />
    </div>
  );
}

export function FormMessage({ message }: { message: string | null }) {
  if (!message) return null;
  const isInfo = /check your email/i.test(message);

  return (
    <p
      role={isInfo ? "status" : "alert"}
      className={cn(
        "auth-rise rounded-xl px-3.5 py-3 text-[13px] leading-5",
        isInfo ? "bg-brand/[0.06] text-brand" : "bg-red-50 text-red-700",
      )}
    >
      {message}
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21.35 12.27c0-.7-.06-1.37-.18-2.02H12v3.78h5.24a4.5 4.5 0 0 1-1.94 2.95v2.48h3.18c1.86-1.72 2.87-4.25 2.87-7.19Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.75c2.66 0 4.89-.88 6.52-2.39l-3.18-2.48c-.88.59-2.01.94-3.34.94-2.57 0-4.74-1.73-5.52-4.06H3.19v2.55A9.84 9.84 0 0 0 12 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.48 13.76A5.92 5.92 0 0 1 6.17 12c0-.61.11-1.21.31-1.76V7.69H3.19A9.83 9.83 0 0 0 2.15 12c0 1.55.37 3.02 1.04 4.31l3.29-2.55Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.18c1.45 0 2.74.5 3.76 1.47l2.82-2.82A9.45 9.45 0 0 0 12 2.25a9.84 9.84 0 0 0-8.81 5.44l3.29 2.55C7.26 7.91 9.43 6.18 12 6.18Z"
        fill="#EA4335"
      />
    </svg>
  );
}
