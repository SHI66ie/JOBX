/** Legacy descriptions are plain text; new descriptions use semantic HTML. */
export function isRichText(value: string) {
  return /<(?:p|h[1-6]|ul|ol|li|blockquote|strong|em|div|br)(?:\s[^>]*|\s*\/?)>/i.test(value);
}

export function escapeText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function editorContent(value: string) {
  return isRichText(value) ? value : `<p>${escapeText(value).replace(/\n/g, "<br>")}</p>`;
}

/** Text-only excerpts. Output is always rendered as React text, never HTML. */
export function richTextExcerpt(value: string) {
  if (!isRichText(value)) return value;
  return value.replace(/<\/(?:p|h[1-6]|li|blockquote)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code: string) => {
      const n = code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
    })
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").trim();
}
