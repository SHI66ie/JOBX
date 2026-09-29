import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[13px] font-medium text-neutral-500">{eyebrow}</p> : null}
        <h1 className="mt-0.5 text-[26px] font-semibold tracking-[-0.03em] text-neutral-900">{title}</h1>
        {description ? <p className="mt-1 text-[14px] text-neutral-500">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function LinkTabs({ tabs }: { tabs: { href: string; label: string; count?: number; active: boolean }[] }) {
  return (
    <nav className="flex gap-6 overflow-x-auto border-b border-neutral-200">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          scroll={false}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-3 text-[14px] transition-colors",
            tab.active ? "border-brand font-medium text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900",
          )}
        >
          {tab.label}
          {tab.count !== undefined ? (
            <span className={cn("text-[12px] tabular-nums", tab.active ? "text-neutral-500" : "text-neutral-400")}>{tab.count}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover"
    >
      {children}
    </Link>
  );
}

export function EmptyState({
  art,
  title,
  body,
  action,
}: {
  art: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-neutral-50/70 px-6 pb-14 pt-12 text-center">
      {art}
      <p className="mt-6 text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">{title}</p>
      <p className="mt-1.5 max-w-sm text-[14px] leading-6 text-neutral-500">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Pill({ className, children }: { className: string; children: ReactNode }) {
  return <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-medium", className)}>{children}</span>;
}
