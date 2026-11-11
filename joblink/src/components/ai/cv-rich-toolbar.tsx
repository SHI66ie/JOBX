"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextAlignLeft01Icon,
  TextAlignCenterIcon,
  TextAlignRight01Icon,
  TextAlignJustifyIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Undo02Icon,
  Redo02Icon,
  TextClearIcon,
  ParagraphIcon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type ToolItem = {
  label: string;
  shortcut?: string;
  icon: IconSvgElement;
  active?: boolean;
  disabled?: boolean;
  run: () => void;
};

function FormatButton({ label, shortcut, icon, active, disabled, run }: ToolItem) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        "relative inline-flex size-7.5 shrink-0 items-center justify-center rounded-md border text-xs transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-30",
        active
          ? "border-brand/40 bg-brand text-brand-fg shadow-xs font-semibold"
          : "border-neutral-200/80 bg-surface text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900"
      )}
    >
      <Icon icon={icon} size={15} strokeWidth={active ? 2.2 : 1.7} />
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-neutral-200/80" />;
}

export function CVRichToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-neutral-200/80 bg-neutral-100/70 p-1.5 backdrop-blur-xs">
      {/* Headings / Paragraph */}
      <FormatButton
        label="Paragraph"
        icon={ParagraphIcon}
        active={editor.isActive("paragraph") && !editor.isActive("heading")}
        run={() => editor.chain().focus().setParagraph().run()}
      />
      <FormatButton
        label="Heading 1"
        icon={Heading01Icon}
        active={editor.isActive("heading", { level: 1 })}
        run={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <FormatButton
        label="Heading 2"
        icon={Heading02Icon}
        active={editor.isActive("heading", { level: 2 })}
        run={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <FormatButton
        label="Heading 3"
        icon={Heading03Icon}
        active={editor.isActive("heading", { level: 3 })}
        run={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <Divider />

      {/* Bold, Italic, Underline */}
      <FormatButton
        label="Bold"
        shortcut="Ctrl+B"
        icon={TextBoldIcon}
        active={editor.isActive("bold")}
        run={() => editor.chain().focus().toggleBold().run()}
      />
      <FormatButton
        label="Italic"
        shortcut="Ctrl+I"
        icon={TextItalicIcon}
        active={editor.isActive("italic")}
        run={() => editor.chain().focus().toggleItalic().run()}
      />
      <FormatButton
        label="Underline"
        shortcut="Ctrl+U"
        icon={TextUnderlineIcon}
        active={editor.isActive("underline")}
        run={() => editor.chain().focus().toggleUnderline().run()}
      />

      <Divider />

      {/* Alignment including Justify */}
      <FormatButton
        label="Align Left"
        icon={TextAlignLeft01Icon}
        active={editor.isActive({ textAlign: "left" }) || (!editor.isActive({ textAlign: "center" }) && !editor.isActive({ textAlign: "right" }) && !editor.isActive({ textAlign: "justify" }))}
        run={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <FormatButton
        label="Align Center"
        icon={TextAlignCenterIcon}
        active={editor.isActive({ textAlign: "center" })}
        run={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <FormatButton
        label="Align Right"
        icon={TextAlignRight01Icon}
        active={editor.isActive({ textAlign: "right" })}
        run={() => editor.chain().focus().setTextAlign("right").run()}
      />
      <FormatButton
        label="Justify"
        icon={TextAlignJustifyIcon}
        active={editor.isActive({ textAlign: "justify" })}
        run={() => editor.chain().focus().setTextAlign("justify").run()}
      />

      <Divider />

      {/* Lists */}
      <FormatButton
        label="Bullet List"
        icon={LeftToRightListBulletIcon}
        active={editor.isActive("bulletList")}
        run={() => editor.chain().focus().toggleBulletList().run()}
      />
      <FormatButton
        label="Numbered List"
        icon={LeftToRightListNumberIcon}
        active={editor.isActive("orderedList")}
        run={() => editor.chain().focus().toggleOrderedList().run()}
      />

      <Divider />

      {/* Clear Formatting, Undo & Redo */}
      <FormatButton
        label="Clear Formatting"
        icon={TextClearIcon}
        run={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      />
      <FormatButton
        label="Undo"
        shortcut="Ctrl+Z"
        icon={Undo02Icon}
        disabled={!editor.can().undo()}
        run={() => editor.chain().focus().undo().run()}
      />
      <FormatButton
        label="Redo"
        shortcut="Ctrl+Y"
        icon={Redo02Icon}
        disabled={!editor.can().redo()}
        run={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}

export function CVRichTextField({
  value,
  onChange,
  placeholder,
  minHeight = "min-h-[100px]",
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        code: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    immediatelyRender: false,
    content: value || "",
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": placeholder || "CV editor",
        "aria-multiline": "true",
        class: cn(
          "w-full rounded-b-lg border border-neutral-200/80 bg-surface px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-brand leading-relaxed",
          minHeight,
          className
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.isEmpty ? "" : ed.getHTML());
    },
  });

  return (
    <div className="w-full">
      <CVRichToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
