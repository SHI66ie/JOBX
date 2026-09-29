"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Right-hand side sheet (full screen on mobile). Esc / backdrop close it; page scroll is locked while open. */
export function Sheet({
  open,
  onClose,
  label,
  width = "sm:max-w-[720px]",
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  width?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="app-theme fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={label}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="sheet-backdrop absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] dark:bg-black/60"
      />
      <div
        className={cn(
          "sheet-panel absolute inset-y-0 right-0 flex w-full flex-col bg-surface text-neutral-900 shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.35)] sm:rounded-l-2xl",
          width,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function SheetIconButton({
  icon,
  label,
  onClick,
  href,
  download,
}: {
  icon: IconSvgElement;
  label: string;
  onClick?: () => void;
  href?: string;
  download?: string;
}) {
  const className =
    "flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";
  if (href) {
    return (
      <a href={href} title={label} aria-label={label} className={className} {...(download ? { download } : { target: "_blank", rel: "noopener noreferrer" })}>
        <Icon icon={icon} size={18} />
      </a>
    );
  }
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={className}>
      <Icon icon={icon} size={18} />
    </button>
  );
}
