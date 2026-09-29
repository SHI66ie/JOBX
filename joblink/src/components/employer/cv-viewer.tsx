"use client";

import { useState, type ReactNode } from "react";
import { Cancel01Icon, Download04Icon, File01Icon, LinkSquare02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Sheet, SheetIconButton } from "@/components/employer/sheet";
import { cn } from "@/lib/utils";

export function fileNameOf(url: string) {
  try {
    // Base URL lets relative paths (e.g. /mock/sample-cv.pdf) parse too.
    return decodeURIComponent(new URL(url, "https://jomponline.com").pathname.split("/").pop() || "CV");
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

/** Header + embedded document. `leading` replaces the avatar (e.g. a back button). */
export function CvPane({
  url,
  candidateName,
  candidateEmail,
  onClose,
  leading,
}: {
  url: string;
  candidateName: string;
  candidateEmail?: string | null;
  onClose: () => void;
  leading?: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const fileName = fileNameOf(url);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
        {leading ?? <UserAvatar seed={candidateEmail || candidateName} size={36} />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{candidateName}</p>
          <p className="flex items-center gap-1 truncate text-[12.5px] text-neutral-500">
            <Icon icon={File01Icon} size={13} />
            {fileName}
          </p>
        </div>
        <SheetIconButton icon={LinkSquare02Icon} label="Open in new tab" href={url} />
        <SheetIconButton icon={Download04Icon} label="Download" href={url} download={fileName} />
        <SheetIconButton icon={Cancel01Icon} label="Close" onClick={onClose} />
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
    </>
  );
}

/** "View CV" link that opens the CV in a side sheet (full screen on mobile). */
export function CvViewer({ url, candidateName, candidateEmail }: { url: string; candidateName: string; candidateEmail?: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline">
        <Icon icon={File01Icon} size={15} />
        View CV
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} label={`CV for ${candidateName}`}>
        <CvPane url={url} candidateName={candidateName} candidateEmail={candidateEmail} onClose={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
