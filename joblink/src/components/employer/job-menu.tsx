"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import {
  Archive02Icon,
  Copy01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  PauseIcon,
  PencilEdit02Icon,
  PlayIcon,
  UserGroupIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { deleteJob, duplicateJob, setJobStatus } from "@/app/employer/actions";
import { cn } from "@/lib/utils";

type Status = "open" | "draft" | "closed";

function isRedirect(error: unknown) {
  return error instanceof Error && error.message.includes("NEXT_REDIRECT");
}

/** "⋯" menu with every management action for a job. */
export function JobMenu({ jobId, status, className }: { jobId: string; status: Status; className?: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function run(action: () => Promise<unknown>) {
    setOpen(false);
    setError("");
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        if (isRedirect(err)) throw err;
        setError("That didn't work. Try again.");
      }
    });
  }

  const base = `/employer/jobs/${jobId}`;

  return (
    <div ref={ref} className={cn("relative", className, open && "z-50")}>
      <button
        type="button"
        aria-label="Job actions"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={isPending}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
          open && "bg-neutral-100 text-neutral-900",
          isPending && "opacity-50",
        )}
      >
        <Icon icon={MoreHorizontalIcon} size={20} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl bg-surface p-1.5 text-neutral-800 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.06)]"
        >
          <MenuLink href={`${base}/preview`} icon={ViewIcon} onSelect={() => setOpen(false)}>
            View listing
          </MenuLink>
          <MenuLink href={base} icon={UserGroupIcon} onSelect={() => setOpen(false)}>
            View applicants
          </MenuLink>
          <MenuLink href={`${base}/edit`} icon={PencilEdit02Icon} onSelect={() => setOpen(false)}>
            Edit
          </MenuLink>
          <MenuButton icon={Copy01Icon} onClick={() => run(() => duplicateJob(jobId))}>
            Duplicate
          </MenuButton>

          <div className="my-1 h-px bg-neutral-100" />

          {status === "open" ? (
            <MenuButton icon={PauseIcon} onClick={() => run(() => setJobStatus(jobId, "closed"))} hint="Hidden from job seekers">
              Pause listing
            </MenuButton>
          ) : (
            <MenuButton icon={PlayIcon} onClick={() => run(() => setJobStatus(jobId, "published"))}>
              {status === "draft" ? "Publish" : "Resume listing"}
            </MenuButton>
          )}
          {status !== "draft" ? (
            <MenuButton icon={Archive02Icon} onClick={() => run(() => setJobStatus(jobId, "draft"))}>
              Move to drafts
            </MenuButton>
          ) : null}

          <div className="my-1 h-px bg-neutral-100" />

          <MenuButton
            icon={Delete02Icon}
            danger
            onClick={() => {
              if (window.confirm("Delete this job and all its applications? This can't be undone.")) run(() => deleteJob(jobId));
              else setOpen(false);
            }}
          >
            Delete
          </MenuButton>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="absolute right-0 top-full z-40 mt-1 whitespace-nowrap rounded-lg bg-red-50 px-2.5 py-1 text-[12px] text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function MenuLink({ href, icon, onSelect, children }: { href: string; icon: IconSvgElement; onSelect: () => void; children: ReactNode }) {
  return (
    <Link role="menuitem" href={href} onClick={onSelect} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] hover:bg-neutral-100">
      <Icon icon={icon} size={16} className="text-neutral-500" />
      {children}
    </Link>
  );
}

function MenuButton({
  icon,
  onClick,
  danger = false,
  hint,
  children,
}: {
  icon: IconSvgElement;
  onClick: () => void;
  danger?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px]",
        danger ? "text-red-600 hover:bg-red-50" : "hover:bg-neutral-100",
      )}
    >
      <Icon icon={icon} size={16} className={danger ? "text-red-500" : "text-neutral-500"} />
      <span className="flex-1">
        {children}
        {hint ? <span className="block text-[11.5px] text-neutral-400">{hint}</span> : null}
      </span>
    </button>
  );
}
