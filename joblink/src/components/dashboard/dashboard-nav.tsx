"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowDown01Icon, Briefcase01Icon, Logout01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; exact?: boolean };

export function DashboardNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const active = item.exact || item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-lg px-3 py-2 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              active ? "font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-900",
            )}
          >
            {item.label}
            {active ? <span className="absolute inset-x-3 -bottom-[15px] h-0.5 rounded-full bg-brand" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile nav: a horizontal scroller under the header. */
export function DashboardNavMobile({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="-mx-1 flex gap-1 overflow-x-auto pb-3 md:hidden">
      {items.map((item) => {
        const active = item.exact || item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[13px] transition-colors",
              active ? "bg-neutral-100 font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-900",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function UserMenu({
  name,
  email,
  avatarUrl,
  hasEmployer = false,
  settingsHref = "/dashboard/settings",
  switchTo,
}: {
  name: string;
  email: string;
  avatarUrl?: string | null;
  hasEmployer?: boolean;
  settingsHref?: string;
  /** Mobile-only link to the other side of the app (the header pill covers larger screens). */
  switchTo?: { href: string; label: string };
}) {
  const modeLink = switchTo ?? (hasEmployer ? { href: "/employer/dashboard", label: "Employer mode" } : null);
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:pr-3"
      >
        <UserAvatar seed={email || name} imageUrl={avatarUrl} size={32} />
        <span className="hidden text-[14px] font-medium text-neutral-800 sm:block">{name}</span>
        <Icon icon={ArrowDown01Icon} size={16} className={cn("text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="auth-swap absolute right-0 top-full z-50 mt-2 w-60 rounded-xl bg-surface p-1.5 text-neutral-800 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-center gap-3 px-3 py-2.5">
            <UserAvatar seed={email || name} imageUrl={avatarUrl} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">{name}</p>
              <p className="truncate text-xs text-neutral-500">{email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-neutral-100" />
          <Link
            role="menuitem"
            href={settingsHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100"
          >
            <Icon icon={Settings01Icon} size={16} className="text-neutral-500" />
            Settings
          </Link>
          {modeLink ? (
            <Link
              role="menuitem"
              href={modeLink.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 lg:hidden"
            >
              <Icon icon={Briefcase01Icon} size={16} className="text-neutral-500" />
              {modeLink.label}
            </Link>
          ) : null}
          <form action="/auth/signout" method="post">
            <button
              role="menuitem"
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100"
            >
              <Icon icon={Logout01Icon} size={16} className="text-neutral-500" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
