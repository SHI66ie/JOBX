import { sanitizeRichText } from "@/lib/sanitize-rich-text";

export function RichDescription({ value }: { value: string | null }) {
  return <div className="job-rich-text mt-3 text-[15px] leading-7 text-neutral-700" dangerouslySetInnerHTML={{ __html: sanitizeRichText(value || "No description yet.") }} />;
}
