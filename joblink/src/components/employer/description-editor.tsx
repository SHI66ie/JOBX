"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  ArrowExpand01Icon,
  Cancel01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  ParagraphIcon,
  QuoteDownIcon,
  Redo02Icon,
  TextBoldIcon,
  TextClearIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
  Tick02Icon,
  Undo02Icon,
  Unlink01Icon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { Sheet, SheetIconButton } from "@/components/employer/sheet";
import { editorContent, richTextExcerpt } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

const LIMIT = 20000;
const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

type Tool = { label: string; shortcut?: string; icon: IconSvgElement; active?: boolean; disabled?: boolean; run: () => void };

/** Toolbar button: soft white chip when active, press-scale feedback, hover tooltip with the shortcut. */
function ToolButton({ label, shortcut, icon, active = false, disabled, run }: Tool) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={run}
      className={cn(
        "group/tool relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,box-shadow,transform] duration-200 active:scale-90 disabled:pointer-events-none disabled:opacity-35 sm:size-8",
        FOCUS_RING,
        active
          ? "bg-surface text-brand shadow-[0_1px_2px_rgba(1,34,79,0.08),0_2px_8px_-4px_rgba(1,34,79,0.25)]"
          : "text-neutral-500 hover:bg-surface/70 hover:text-neutral-900",
      )}
    >
      <Icon icon={icon} size={17} strokeWidth={active ? 2 : 1.6} />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 translate-y-0.5 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-[opacity,transform] duration-150 group-hover/tool:translate-y-0 group-hover/tool:opacity-100 group-hover/tool:delay-300 sm:block dark:bg-neutral-800"
      >
        {label}
        {shortcut ? <span className="ml-1.5 text-white/55">{shortcut}</span> : null}
      </span>
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-neutral-300/70" />;
}

function ToolGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 items-center gap-0.5">
      {children}
    </div>
  );
}

/** Text / Heading / Subheading as a segmented control rather than a native select. */
function BlockStyle({ editor }: { editor: Editor | null }) {
  const current = editor?.isActive("heading", { level: 2 }) ? "h2" : editor?.isActive("heading", { level: 3 }) ? "h3" : "p";
  const options = [
    { value: "p", label: "Normal text", icon: ParagraphIcon, run: () => editor?.chain().focus().setParagraph().run() },
    { value: "h2", label: "Heading", icon: Heading02Icon, run: () => editor?.chain().focus().setHeading({ level: 2 }).run() },
    { value: "h3", label: "Subheading", icon: Heading03Icon, run: () => editor?.chain().focus().setHeading({ level: 3 }).run() },
  ];
  return (
    <ToolGroup label="Paragraph style">
      {options.map((option) => (
        <ToolButton key={option.value} label={option.label} icon={option.icon} active={current === option.value} disabled={!editor} run={option.run} />
      ))}
    </ToolGroup>
  );
}

export function DescriptionEditor({ value, error, onChange }: { value: string; error?: string; onChange: (value: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const expandButton = useRef<HTMLButtonElement>(null);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false, link: { openOnClick: false } })],
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    content: editorContent(value),
    editorProps: { attributes: { role: "textbox", "aria-label": "Job description", "aria-multiline": "true", "aria-required": "true", class: "job-rich-text min-h-64 px-4 py-3.5 text-sm leading-7 text-neutral-900 focus:outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    editor.view.dom.setAttribute("aria-invalid", error ? "true" : "false");
    if (error) editor.view.dom.setAttribute("aria-describedby", "description-error");
    else editor.view.dom.removeAttribute("aria-describedby");
  }, [editor, error]);

  useEffect(() => {
    if (expanded) requestAnimationFrame(() => editor?.commands.focus());
  }, [expanded, editor]);

  const text = editor?.getText() ?? "";
  const count = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const nearLimit = count > LIMIT * 0.9;
  const inList = editor?.isActive("listItem") ?? false;

  const marks: Tool[] = editor ? [
    { label: "Bold", shortcut: "⌘B", icon: TextBoldIcon, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", shortcut: "⌘I", icon: TextItalicIcon, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Underline", shortcut: "⌘U", icon: TextUnderlineIcon, active: editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Strikethrough", icon: TextStrikethroughIcon, active: editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run() },
  ] : [];
  const blocks: Tool[] = editor ? [
    { label: "Bullet list", icon: LeftToRightListBulletIcon, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: LeftToRightListNumberIcon, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", icon: QuoteDownIcon, active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Link", icon: Link01Icon, active: editor.isActive("link") || linkOpen, run: toggleLink },
  ] : [];
  const history: Tool[] = editor ? [
    { label: "Clear formatting", icon: TextClearIcon, run: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    { label: "Undo", shortcut: "⌘Z", icon: Undo02Icon, disabled: !editor.can().undo(), run: () => editor.chain().focus().undo().run() },
    { label: "Redo", shortcut: "⇧⌘Z", icon: Redo02Icon, disabled: !editor.can().redo(), run: () => editor.chain().focus().redo().run() },
  ] : [];

  function toggleLink() {
    setUrl(editor?.getAttributes("link").href || "");
    setLinkError("");
    setLinkOpen((open) => !open);
  }

  function applyLink() {
    if (!/^(https?:\/\/|mailto:)\S+$/i.test(url.trim())) { setLinkError("Enter an https://, http://, or mailto: link."); return; }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    setLinkOpen(false);
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  }

  function closeExpanded() {
    setExpanded(false);
    requestAnimationFrame(() => expandButton.current?.focus());
  }

  const surface = (
    <div
      className={cn(
        "group/editor flex min-h-0 flex-col rounded-xl bg-neutral-100 transition-[background-color,box-shadow] duration-200",
        expanded ? "flex-1 bg-transparent" : "hover:bg-neutral-200/40 focus-within:bg-neutral-200/50",
        error && !expanded && "bg-red-50/60 ring-1 ring-inset ring-red-200 hover:bg-red-50/60",
      )}
    >
      <div
        role="toolbar"
        aria-label="Description formatting"
        className={cn(
          "flex items-center gap-0.5 overflow-x-auto border-b border-neutral-200/80 px-1.5 py-1.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden",
          expanded && "sticky top-0 z-10 rounded-xl border-b-0 bg-neutral-100 px-2",
        )}
      >
        <BlockStyle editor={editor} />
        <Divider />
        <ToolGroup label="Text style">{marks.map((tool) => <ToolButton key={tool.label} {...tool} />)}</ToolGroup>
        <Divider />
        <ToolGroup label="Blocks">{blocks.map((tool) => <ToolButton key={tool.label} {...tool} />)}</ToolGroup>
        <Divider />
        <ToolGroup label="History">{history.map((tool) => <ToolButton key={tool.label} {...tool} />)}</ToolGroup>
        {!expanded ? (
          <button
            ref={expandButton}
            type="button"
            onClick={() => setExpanded(true)}
            className={cn(
              "group/expand ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-neutral-500 transition-[background-color,color,transform] duration-200 hover:bg-surface/70 hover:text-neutral-900 active:scale-95",
              FOCUS_RING,
            )}
          >
            <Icon icon={ArrowExpand01Icon} size={15} className="transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/expand:scale-110" />
            <span className="hidden sm:inline">Expand</span>
            <span className="sr-only sm:hidden">Expand description editor</span>
          </button>
        ) : null}
      </div>

      {linkOpen ? (
        <div className={cn("auth-swap border-b border-neutral-200/80 px-3 py-2.5", expanded && "mt-2 rounded-xl border-b-0 bg-neutral-100")}>
          <label htmlFor="description-link" className="sr-only">Link URL</label>
          <div className="flex items-center gap-1.5">
            <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg bg-surface px-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-brand/60">
              <Icon icon={Link01Icon} size={15} className="shrink-0 text-neutral-400" />
              <input
                id="description-link"
                type="url"
                value={url}
                autoFocus
                onChange={(event) => { setUrl(event.target.value); setLinkError(""); }}
                placeholder="Paste a link — https://…"
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                onKeyDown={(event) => {
                  if (event.key === "Enter") { event.preventDefault(); applyLink(); }
                  if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setLinkOpen(false); editor?.commands.focus(); }
                }}
              />
            </div>
            <button type="button" onClick={applyLink} aria-label="Apply link" className={cn("inline-flex h-9 items-center gap-1 rounded-lg bg-brand px-3 text-[13px] font-medium text-brand-fg transition-[background-color,transform] duration-200 hover:bg-brand-hover active:scale-95", FOCUS_RING, "focus-visible:ring-offset-2")}>
              <Icon icon={Tick02Icon} size={15} strokeWidth={2.2} />
              <span className="hidden sm:inline">Apply</span>
            </button>
            {editor?.isActive("link") ? <ToolButton label="Remove link" icon={Unlink01Icon} run={removeLink} /> : null}
            <ToolButton label="Cancel" icon={Cancel01Icon} run={() => { setLinkOpen(false); editor?.commands.focus(); }} />
          </div>
          {linkError ? <p role="alert" className="auth-shake mt-2 px-0.5 text-xs text-red-700">{linkError}</p> : null}
        </div>
      ) : null}

      <div className={cn("relative cursor-text", expanded ? "flex-1 pt-2" : "max-h-96 overflow-y-auto")} onClick={(event) => { if (event.target === event.currentTarget) editor?.commands.focus("end"); }}>
        {!editor || editor.isEmpty ? (
          <p className={cn("pointer-events-none absolute left-4 text-sm leading-7 text-neutral-400", expanded ? "top-5.5" : "top-3.5")}>
            Describe the role and what success looks like…
          </p>
        ) : null}
        <EditorContent editor={editor} />
      </div>

      {!expanded ? (
        <div className="flex items-center justify-between gap-3 px-4 pb-2.5 pt-1 text-[12px] text-neutral-400">
          <span key={inList ? "list" : "text"} className="auth-swap truncate">
            {inList ? "Tab to indent · Shift + Tab to outdent" : words ? `${words.toLocaleString()} ${words === 1 ? "word" : "words"}` : " "}
          </span>
          <CharCount count={count} nearLimit={nearLimit} />
        </div>
      ) : null}
    </div>
  );

  const preview = richTextExcerpt(value).slice(0, 220);

  return (
    <>
      <input type="hidden" name="description" value={value} />
      {expanded ? (
        <button
          type="button"
          onClick={() => editor?.commands.focus()}
          className={cn("group/placeholder flex w-full items-start gap-3 rounded-xl bg-neutral-100 p-4 text-left transition-colors duration-200 hover:bg-neutral-200/50", FOCUS_RING)}
        >
          <span className="relative mt-1.5 flex size-2 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/40 motion-reduce:animate-none" />
            <span className="relative size-2 rounded-full bg-brand" />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium text-neutral-800">Editing in full screen</span>
            <span className="mt-1 line-clamp-2 block text-[13px] leading-5 text-neutral-500">{preview || "Nothing written yet."}</span>
          </span>
        </button>
      ) : (
        surface
      )}
      {error ? <p id="description-error" role="alert" className="auth-shake mt-2 text-xs text-red-700">{error}</p> : null}

      <Sheet open={expanded} onClose={closeExpanded} label="Job description" width="sm:max-w-[840px]">
        <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-8 sm:pt-7">
          <div className="min-w-0">
            <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-neutral-950">Job description</h2>
            <p className="mt-1 text-[13px] text-neutral-500">Give candidates a clear picture of the role, the team, and a typical week.</p>
          </div>
          <SheetIconButton icon={Cancel01Icon} label="Close expanded editor" onClick={closeExpanded} />
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-6 sm:px-6 [&_.job-rich-text]:min-h-[50vh] [&_.job-rich-text]:text-[15px] [&_.job-rich-text]:leading-[1.8] sm:[&_.job-rich-text]:px-5">
          {expanded ? surface : null}
        </div>
        <footer className="flex items-center justify-between gap-4 border-t border-neutral-100 px-5 py-3.5 sm:px-8">
          <p className="flex min-w-0 items-center gap-3 text-[12px] text-neutral-400">
            <span className="truncate">{words.toLocaleString()} {words === 1 ? "word" : "words"}</span>
            <CharCount count={count} nearLimit={nearLimit} />
          </p>
          <button
            type="button"
            onClick={closeExpanded}
            className={cn("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand px-5 text-[14px] font-medium text-brand-fg transition-[background-color,transform] duration-200 hover:bg-brand-hover active:scale-[0.97]", FOCUS_RING, "focus-visible:ring-offset-2")}
          >
            <Icon icon={Tick02Icon} size={16} strokeWidth={2.2} />
            Done
          </button>
        </footer>
      </Sheet>
    </>
  );
}

/** Quiet by default; only draws attention once the writer is close to the limit. */
function CharCount({ count, nearLimit }: { count: number; nearLimit: boolean }) {
  const over = count > LIMIT;
  return (
    <span
      key={over ? "over" : nearLimit ? "near" : "ok"}
      className={cn("shrink-0 tabular-nums", (nearLimit || over) && "auth-swap", over ? "font-medium text-red-700" : nearLimit ? "text-amber-700" : "text-neutral-400")}
    >
      {count.toLocaleString()} / {LIMIT.toLocaleString()}
    </span>
  );
}
