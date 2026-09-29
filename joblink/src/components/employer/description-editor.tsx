"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Undo2, Redo2, Maximize2, X, Link2, Unlink, RemoveFormatting } from "lucide-react";
import { editorContent } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

const toolClass = "inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40";

export function DescriptionEditor({ value, error, onChange }: { value: string; error?: string; onChange: (value: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false, link: { openOnClick: false } })],
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    content: editorContent(value),
    editorProps: { attributes: { role: "textbox", "aria-label": "Job description", "aria-multiline": "true", "aria-required": "true", class: "job-rich-text min-h-64 p-4 text-sm leading-7 text-neutral-900 focus:outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  useEffect(() => {
    if (!expanded) return;
    const panel = dialog.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.showModal();
    editor?.commands.focus();
    return () => {
      panel?.close();
      document.body.style.overflow = previous;
    };
  }, [expanded, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.view.dom.setAttribute("aria-invalid", error ? "true" : "false");
    if (error) editor.view.dom.setAttribute("aria-describedby", "description-error");
    else editor.view.dom.removeAttribute("aria-describedby");
  }, [editor, error]);

  const count = editor?.getText().length ?? 0;
  const tools = editor ? [
    { label: "Bold (Ctrl/⌘ B)", icon: Bold, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic (Ctrl/⌘ I)", icon: Italic, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Underline (Ctrl/⌘ U)", icon: Underline, active: editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Strikethrough", icon: Strikethrough, active: editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run() },
    { label: "Bullet list", icon: List, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", icon: Quote, active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Clear formatting", icon: RemoveFormatting, run: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    { label: "Undo", icon: Undo2, disabled: !editor.can().undo(), run: () => editor.chain().focus().undo().run() },
    { label: "Redo", icon: Redo2, disabled: !editor.can().redo(), run: () => editor.chain().focus().redo().run() },
  ] : [];

  function applyLink() {
    if (!/^(https?:\/\/|mailto:)\S+$/i.test(url.trim())) { setLinkError("Enter an https://, http://, or mailto: link."); return; }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    setLinkOpen(false);
  }

  function closeExpanded() {
    setExpanded(false);
    requestAnimationFrame(() => expandButton.current?.focus());
  }

  const surface = (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 focus-within:ring-2 focus-within:ring-brand/60", expanded && "flex-1")}>
      <div role="group" aria-label="Description formatting" className="flex flex-wrap items-center border-b border-neutral-200 bg-neutral-100 p-2">
        <select aria-label="Paragraph style" disabled={!editor} value={editor?.isActive("heading", { level: 2 }) ? "2" : editor?.isActive("heading", { level: 3 }) ? "3" : "p"} onChange={(event) => {
          if (event.target.value === "p") editor?.chain().focus().setParagraph().run();
          else editor?.chain().focus().setHeading({ level: Number(event.target.value) as 2 | 3 }).run();
        }} className="h-10 rounded-lg bg-surface px-2 text-sm text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <option value="p">Normal text</option><option value="2">Heading</option><option value="3">Subheading</option>
        </select>
        {tools.map(({ label, icon: Icon, active, disabled, run }) => <button key={label} type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={run} className={cn(toolClass, active && "bg-brand/10 text-brand")}><Icon size={17} aria-hidden /></button>)}
        <button type="button" title="Add or edit link" aria-label="Add or edit link" aria-pressed={editor?.isActive("link") ?? false} disabled={!editor} className={toolClass} onClick={() => { setUrl(editor?.getAttributes("link").href || ""); setLinkError(""); setLinkOpen(!linkOpen); }}><Link2 size={17} aria-hidden /></button>
        {!expanded && <button ref={expandButton} type="button" title="Expand description editor" aria-label="Expand description editor" className={cn(toolClass, "ml-auto")} onClick={() => setExpanded(true)}><Maximize2 size={17} aria-hidden /></button>}
      </div>
      {linkOpen && <div className="border-b border-neutral-200 p-3">
        <label htmlFor={expanded ? "sheet-link" : "description-link"} className="mb-1 block text-xs font-medium text-neutral-700">Link URL</label>
        <div className="flex flex-wrap gap-2">
          <input id={expanded ? "sheet-link" : "description-link"} type="url" value={url} autoFocus onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyLink(); } }} />
          <button type="button" onClick={applyLink} className="rounded-lg bg-brand px-3 text-sm text-brand-fg focus-visible:ring-2 focus-visible:ring-brand">Apply</button>
          <button type="button" title="Remove link" aria-label="Remove link" className={toolClass} onClick={() => { editor?.chain().focus().extendMarkRange("link").unsetLink().run(); setLinkOpen(false); }}><Unlink size={17} /></button>
        </div>
        {linkError && <p role="alert" className="mt-2 text-xs text-red-700">{linkError}</p>}
      </div>}
      <div className={cn("relative overflow-y-auto", expanded ? "flex-1" : "max-h-96")}>
        {(!editor || editor.isEmpty) && <p className="pointer-events-none absolute left-4 top-4 text-sm leading-7 text-neutral-500">Describe the role and what success looks like…</p>}
        <EditorContent editor={editor} />
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500"><span>Use Tab to indent a list. Shift + Tab to outdent.</span><span className={count > 20000 ? "text-red-700" : ""}>{count.toLocaleString()} / 20,000</span></div>
    </div>
  );



  return <>
    <input type="hidden" name="description" value={value} />
    {!expanded ? surface : <button type="button" onClick={() => editor?.commands.focus()} className="w-full rounded-xl bg-neutral-100 p-6 text-left text-sm text-neutral-500">Editing description in the expanded view…</button>}
    {error && <p id="description-error" role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    {expanded && <dialog ref={dialog} aria-labelledby="description-sheet-title" onCancel={closeExpanded} onKeyDownCapture={(event) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeExpanded(); } }} className="description-sheet app-theme fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-3xl border-0 bg-surface p-0 text-neutral-900 backdrop:bg-neutral-950/40">
      <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
        <header className="flex items-center justify-between gap-4"><div><h2 id="description-sheet-title" className="text-xl font-semibold">Job description</h2><p className="mt-1 text-sm text-neutral-500">Give candidates a clear picture of the role.</p></div><button type="button" aria-label="Close expanded editor" className={toolClass} onClick={closeExpanded}><X size={20} /></button></header>
        {surface}
        <footer className="flex items-center justify-between gap-4"><p className="text-xs text-neutral-500">Edits stay in your form until you save the job.</p><button type="button" onClick={closeExpanded} className="h-10 rounded-full bg-brand px-5 text-sm font-medium text-brand-fg focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">Done</button></footer>
      </div>
    </dialog>}
  </>;
}
