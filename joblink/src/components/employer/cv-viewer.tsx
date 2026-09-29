"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Cancel01Icon, Download04Icon, File01Icon, LinkSquare02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

function fileNameOf(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || "CV");
  } catch {
    return "CV";
  }
}

/** PDFs use the browser's viewer; Word docs go through Microsoft's online viewer. */
function viewerSrc(url: string) {
  const path = url.split("?")[0].toLowerCase();
  if (path.endsWith(".doc") || path.endsWith(".docx")) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }
  return `${url}#view=FitH`;
}

/** "View CV" link that opens the CV in a side sheet (full screen on mobile). */
export function CvViewer({ url, candidateName, candidateEmail }: { url: string; candidateName: string; candidateEmail?: string | null }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fileName = fileNameOf(url);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sheet = open ? (
    <div className="app-theme fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={`CV for ${candidateName}`}>
      <button type="button" aria-label="Close CV" onClick={() => setOpen(false)} className="sheet-backdrop absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] dark:bg-black/60" />

      <div className="sheet-panel absolute inset-y-0 right-0 flex w-full flex-col bg-surface text-neutral-900 shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.35)] sm:max-w-[720px] sm:rounded-l-2xl">
        <header className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
          <UserAvatar seed={candidateEmail || candidateName} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{candidateName}</p>
            <p className="flex items-center gap-1 truncate text-[12.5px] text-neutral-500">
              <Icon icon={File01Icon} size={13} />
              {fileName}
            </p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Icon icon={LinkSquare02Icon} size={18} />
          </a>
          <a
            href={url}
            download={fileName}
            title="Download"
            className="flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Icon icon={Download04Icon} size={18} />
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Icon icon={Cancel01Icon} size={18} />
          </button>
        </header>

        <div className="relative flex-1 bg-neutral-100">
          {!loaded ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-500">
              <Icon icon={Loading03Icon} size={22} className="animate-spin" />
              <p className="text-[13px]">Loading CV…</p>
            </div>
          ) : null}
          <iframe
            key={url}
            src={viewerSrc(url)}
            title={`CV for ${candidateName}`}
            onLoad={() => setLoaded(true)}
            className={cn("absolute inset-0 size-full border-0 transition-opacity", loaded ? "opacity-100" : "opacity-0")}
          />
        </div>

        <p className="border-t border-neutral-100 px-5 py-2.5 text-[12px] text-neutral-500">
          Not loading?{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">
            Open it in a new tab
          </a>
          .
        </p>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLoaded(false);
          setOpen(true);
        }}
        className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
      >
        <Icon icon={File01Icon} size={15} />
        View CV
      </button>
      {sheet ? createPortal(sheet, document.body) : null}
    </>
  );
}
