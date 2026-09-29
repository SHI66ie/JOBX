import sanitizeHtml from "sanitize-html";
import { editorContent } from "@/lib/rich-text";

export function sanitizeRichText(value: string) {
  return sanitizeHtml(editorContent(value), {
    allowedTags: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"], ol: ["start"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }) },
  });
}
