"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Add01Icon, ArrowLeft02Icon, ArrowRight02Icon, Cancel01Icon, CloudUploadIcon, File01Icon, Loading03Icon, Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { searchSkills } from "@/lib/skills";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

/** Soft grey surface shared by every onboarding input. */
export const fieldSurface =
  "rounded-xl bg-neutral-100 transition-colors duration-200 hover:bg-neutral-200/60 focus-within:bg-neutral-200/60";

export function StepHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: ReactNode }) {
  return (
    <div className="auth-rise">
      {eyebrow ? <p className="mb-3 text-[13px] font-medium text-brand/70">{eyebrow}</p> : null}
      <h1 className="text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-neutral-950 sm:text-[32px]">
        {title}
      </h1>
      {description ? <p className="mt-3 text-[15px] leading-6 text-neutral-500">{description}</p> : null}
    </div>
  );
}

/** Staggers each direct child in. */
export function StepBody({ children }: { children: ReactNode[] | ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children];
  return (
    <div className="mt-9 space-y-7">
      {items.map((child, index) => (
        <div key={index} className="auth-rise" style={{ animationDelay: `${80 + index * 60}ms` }}>
          {child}
        </div>
      ))}
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  meta,
  hidden = false,
}: {
  htmlFor?: string;
  children: ReactNode;
  meta?: ReactNode;
  hidden?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between", hidden ? "sr-only" : "mb-2")}>
      <label htmlFor={htmlFor} className="text-[14px] text-neutral-600">
        {children}
      </label>
      {meta ? <span className="text-xs text-neutral-400">{meta}</span> : null}
    </div>
  );
}

export function TextArea({
  id,
  label,
  meta,
  className,
  hideLabel = false,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; label: string; meta?: ReactNode; hideLabel?: boolean }) {
  return (
    <div>
      <FieldLabel htmlFor={id} meta={meta} hidden={hideLabel}>
        {label}
      </FieldLabel>
      <div className={fieldSurface}>
        <textarea
          id={id}
          className={cn(
            "block min-h-[132px] w-full resize-none bg-transparent px-3.5 py-3 text-sm leading-6 text-neutral-900 placeholder:text-neutral-400 focus:outline-none",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}

/** Single-select option cards. */
export function ChoiceGrid<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  label: string;
  options: readonly { value: T; label: string; description?: string; icon?: ReactNode }[];
  value: T | "";
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-[14px] text-neutral-600">{label}</legend>
      <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-3")}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "group/choice relative flex cursor-pointer items-start gap-3 rounded-xl px-3.5 py-3 ring-1 ring-inset transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.985] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
                checked
                  ? "bg-surface shadow-[0_1px_2px_rgba(1,34,79,0.06),0_4px_14px_-6px_rgba(1,34,79,0.18)] ring-brand/80"
                  : "bg-neutral-100 ring-transparent hover:bg-neutral-200/60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.icon ? (
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 [&_svg]:size-4",
                    checked ? "bg-brand text-brand-fg" : "bg-surface text-neutral-500 group-hover/choice:text-neutral-800",
                  )}
                >
                  {option.icon}
                </span>
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-neutral-900">{option.label}</span>
                {option.description ? (
                  <span className="mt-0.5 block text-[13px] leading-5 text-neutral-500">{option.description}</span>
                ) : null}
              </span>
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-200",
                  checked ? "scale-100 bg-brand text-brand-fg" : "scale-90 bg-surface ring-1 ring-inset ring-neutral-300",
                )}
              >
                {checked ? <Icon icon={Tick02Icon} key="on" className="auth-pop size-3" strokeWidth={3.2} /> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Large option tiles with an icon, label and description (single-select). */
export function ChoiceTiles<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options: readonly { value: T; label: string; description: string; icon: ReactNode }[];
  value: T | "";
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3.5 text-[14px] text-neutral-600">{label}</legend>
      <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 md:grid-cols-3">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "group/tile flex h-full cursor-pointer flex-col rounded-2xl border-[1.5px] border-dashed p-4 transition-[background-color,border-color,transform] duration-200 active:scale-[0.98] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2",
                checked
                  ? "border-brand/55 bg-brand/[0.045]"
                  : "border-transparent bg-neutral-100 hover:bg-neutral-200/70",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="flex items-start justify-between">
                <span
                  aria-hidden
                  className="flex h-7 origin-bottom-left items-center transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/tile:-translate-y-0.5 group-hover/tile:-rotate-6"
                >
                  <span key={checked ? "on" : "off"} className={cn("flex", checked && "auth-wiggle")}>
                    {option.icon}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-brand-fg transition-colors duration-150",
                    checked ? "bg-brand" : "bg-neutral-200",
                  )}
                >
                  {checked ? <Icon icon={Tick02Icon} key="on" className="auth-pop size-3" strokeWidth={3.2} /> : null}
                </span>
              </span>
              <span className="mt-3 text-[15px] font-medium tracking-[-0.01em] text-neutral-900">{option.label}</span>
              <span className="mt-1 text-[13px] leading-5 text-neutral-500">{option.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Compact multi-select pills with an optional cap. */
export function PillChoice<T extends string>({
  name,
  label,
  options,
  values,
  onChange,
  max,
}: {
  name: string;
  label: string;
  options: readonly { value: T; label: string }[];
  values: T[];
  onChange: (values: T[]) => void;
  max?: number;
}) {
  const atLimit = max !== undefined && values.length >= max;

  function toggle(value: T) {
    if (values.includes(value)) onChange(values.filter((item) => item !== value));
    else if (!atLimit) onChange([...values, value]);
  }

  return (
    <fieldset>
      <legend className="mb-3 flex w-full items-center justify-between text-[14px] text-neutral-600">
        {label}
        {max !== undefined ? (
          <span key={values.length} className={cn("auth-swap text-xs", atLimit ? "text-brand" : "text-neutral-400")}>
            {values.length ? `${values.length} of ${max}` : `Pick up to ${max}`}
          </span>
        ) : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = values.includes(option.value);
          const disabled = atLimit && !checked;
          return (
            <label
              key={option.value}
              className={cn(
                "inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium ring-1 ring-inset transition-[background-color,color,box-shadow,opacity,transform] duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2",
                checked
                  ? "cursor-pointer bg-brand/[0.06] text-brand ring-brand/35 active:scale-95"
                  : disabled
                    ? "cursor-not-allowed bg-neutral-100 text-neutral-400 opacity-50 ring-transparent"
                    : "cursor-pointer bg-neutral-100 text-neutral-600 ring-transparent hover:bg-neutral-200/70 hover:text-neutral-900 active:scale-95",
              )}
            >
              <input
                type="checkbox"
                name={name}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Searchable skill combobox: pick from the catalogue or add your own. */
export function SkillPicker({
  id,
  label,
  tags,
  onChange,
  suggestions = [],
  placeholder,
  hideLabel = false,
}: {
  id: string;
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: readonly string[];
  placeholder?: string;
  hideLabel?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `${id}-options`;

  const query = draft.trim();
  const matches = useMemo(() => searchSkills(query, tags), [query, tags]);
  const hasExact =
    matches.some((skill) => skill.name.toLowerCase() === query.toLowerCase()) ||
    tags.some((tag) => tag.toLowerCase() === query.toLowerCase());
  const options: { key: string; name: string; category?: string; custom?: boolean }[] = [
    ...matches.map((skill) => ({ key: skill.name, name: skill.name, category: skill.category })),
    ...(query && !hasExact ? [{ key: `custom:${query}`, name: query, custom: true }] : []),
  ];
  const showList = isOpen && query.length > 0 && options.length > 0;

  function add(name: string) {
    const value = name.trim();
    if (!value || tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...tags, value]);
    setDraft("");
    setActive(0);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && options.length) {
      event.preventDefault();
      setIsOpen(true);
      setActive((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp" && options.length) {
      event.preventDefault();
      setActive((index) => (index - 1 + options.length) % options.length);
    } else if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (showList && options[active]) add(options[active].name);
      else if (query) add(query);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    } else if (event.key === "Backspace" && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  const available = suggestions.filter((item) => !tags.some((tag) => tag.toLowerCase() === item.toLowerCase()));

  return (
    <div>
      <FieldLabel htmlFor={id} meta={tags.length ? `${tags.length} added` : undefined} hidden={hideLabel}>
        {label}
      </FieldLabel>
      <div className="relative">
        <div
          className={cn(fieldSurface, "flex min-h-11 cursor-text flex-wrap items-center gap-1.5 px-2 py-1.5")}
          onClick={() => inputRef.current?.focus()}
        >
          <Icon icon={Search01Icon} aria-hidden className="ml-1.5 size-4 shrink-0 text-neutral-400" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="auth-pop inline-flex h-7 items-center gap-1 rounded-lg bg-surface pl-2.5 pr-1 text-[13px] font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(tags.filter((item) => item !== tag));
                }}
                className="flex size-5 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
              >
                <Icon icon={Cancel01Icon} className="size-3" strokeWidth={2.5} />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList ? `${listId}-${active}` : undefined}
            autoComplete="off"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setActive(0);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length ? "Add another…" : placeholder}
            className="h-8 min-w-[140px] flex-1 bg-transparent px-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        {showList ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={`${label} suggestions`}
            className="auth-swap absolute inset-x-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl bg-surface p-1 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)]"
          >
            {options.map((option, index) => (
              <li
                key={option.key}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => add(option.name)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm",
                  index === active ? "bg-neutral-100 text-neutral-900" : "text-neutral-700",
                )}
              >
                {option.custom ? (
                  <span className="flex items-center gap-2">
                    <Icon icon={Add01Icon} className="size-3.5 text-neutral-400" />
                    Add &ldquo;<span className="font-medium">{option.name}</span>&rdquo;
                  </span>
                ) : (
                  <>
                    <span className="truncate">
                      <Highlight text={option.name} query={query} />
                    </span>
                    <span className="shrink-0 text-xs text-neutral-400">{option.category}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {available.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {available.slice(0, 8).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => add(item)}
              className={cn(
                "inline-flex h-7 items-center rounded-full border border-dashed border-neutral-300 px-2.5 text-[12.5px] text-neutral-500 transition-colors hover:border-brand/50 hover:bg-surface hover:text-brand",
                FOCUS_RING,
              )}
            >
              + {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold text-neutral-950">{text.slice(index, index + query.length)}</span>
      {text.slice(index + query.length)}
    </>
  );
}

export function FileDrop({
  id,
  label,
  file,
  onFile,
  onError,
  accept = ".pdf,.docx",
  maxBytes = 5 * 1024 * 1024,
  hideLabel = false,
}: {
  id: string;
  label: string;
  file: File | null;
  onFile: (file: File | null) => void;
  onError: (message: string) => void;
  accept?: string;
  maxBytes?: number;
  hideLabel?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);

  function pick(next: File | undefined) {
    if (!next) return;
    if (next.size > maxBytes) {
      onError("That file is over 5MB. Try a smaller PDF or DOCX.");
      return;
    }
    onFile(next);
  }

  return (
    <div>
      <FieldLabel htmlFor={id} meta="Optional" hidden={hideLabel}>
        {label}
      </FieldLabel>
      {file ? (
        <div className="auth-rise flex items-center gap-3 rounded-xl bg-surface px-3.5 py-3 ring-1 ring-inset ring-neutral-200">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/[0.07] text-brand">
            <Icon icon={File01Icon} className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-neutral-900">{file.name}</span>
            <span className="block text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          </span>
          <button
            type="button"
            onClick={() => onFile(null)}
            className={cn("rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900", FOCUS_RING)}
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            pick(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed px-6 py-7 text-center transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
            isDragging ? "border-brand/60 bg-brand/[0.04]" : "border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100/70",
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-surface text-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <Icon icon={CloudUploadIcon} className="size-[18px]" />
          </span>
          <span className="mt-3 text-sm font-medium text-neutral-800">
            Drop your CV here, or <span className="text-brand underline underline-offset-4">browse</span>
          </span>
          <span className="mt-1 text-xs text-neutral-500">PDF or DOCX, up to 5MB</span>
          <input id={id} type="file" accept={accept} className="sr-only" onChange={(event) => pick(event.target.files?.[0])} />
        </label>
      )}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl bg-neutral-100 px-4 py-3.5 transition-colors hover:bg-neutral-200/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-neutral-900">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-5 text-neutral-500">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-brand" : "bg-neutral-300",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 size-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            checked && "translate-x-4",
          )}
        />
      </span>
    </label>
  );
}

export function StepActions({
  onBack,
  primaryLabel = "Continue",
  isSubmitting = false,
  submittingLabel = "Saving…",
}: {
  onBack?: () => void;
  primaryLabel?: string;
  isSubmitting?: boolean;
  submittingLabel?: string;
}) {
  return (
    <div className="auth-rise mt-10 flex items-center gap-2.5 [animation-delay:240ms]">
      {onBack ? (
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className={cn(
            "group/back flex size-11 items-center justify-center rounded-xl bg-surface text-neutral-600 ring-1 ring-inset ring-neutral-200 transition-colors hover:bg-neutral-50 hover:text-neutral-900 active:scale-95",
            FOCUS_RING,
          )}
        >
          <Icon icon={ArrowLeft02Icon} className="size-4 transition-transform duration-200 group-hover/back:-translate-x-0.5" />
        </button>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "group/btn flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-medium text-brand-fg shadow-[0_1px_2px_rgba(1,34,79,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] transition-[background-color,transform] duration-200 hover:bg-brand-hover active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-80 sm:flex-none sm:min-w-[160px]",
          FOCUS_RING,
        )}
      >
        <span key={isSubmitting ? "busy" : primaryLabel} className="auth-swap inline-flex items-center gap-2">
          {isSubmitting ? (
            <>
              <Icon icon={Loading03Icon} className="size-4 animate-spin" />
              {submittingLabel}
            </>
          ) : (
            <>
              {primaryLabel}
              <Icon icon={ArrowRight02Icon} className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </>
          )}
        </span>
      </button>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p key={message} role="alert" className="auth-shake mt-5 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] leading-5 text-red-700">
      {message}
    </p>
  );
}

export function CompletionScreen({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div>
      <span className="auth-pop relative inline-flex">
        <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-brand/25 [animation-iteration-count:1] [animation-duration:1s]" />
        <span className="relative flex size-12 items-center justify-center rounded-full bg-brand text-brand-fg">
          <Icon icon={Tick02Icon} className="size-6" strokeWidth={2.6} />
        </span>
      </span>
      <div className="mt-7">
        <StepHeading title={title} description={description} />
      </div>
      <div className="auth-rise mt-9 [animation-delay:160ms]">
        <a
          href={href}
          className={cn(
            "group/btn inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-medium text-brand-fg transition-colors hover:bg-brand-hover",
            FOCUS_RING,
          )}
        >
          {cta}
          <Icon icon={ArrowRight02Icon} className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
