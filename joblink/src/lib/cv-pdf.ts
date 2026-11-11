/**
 * Standalone PDF generator for AI-crafted CVs with JOMP branding and watermark.
 * Produces standard PDF 1.4 documents using core Type-1 fonts (Helvetica)
 * with zero external binary or npm dependencies.
 */

export type CVPdfData = {
  fullName: string;
  email?: string;
  targetNiche?: string;
  suggestedTitle: string;
  executiveSummary: string;
  skillsByCategory: Record<string, string[]>;
  recommendedSkills?: string[];
  structuredExperience: {
    role: string;
    company?: string;
    period?: string;
    highlights: string[];
  }[];
  atsKeywords?: string[];
  nicheStrengths?: string[];
  watermark?: boolean; // defaults to true
};

/** Sanitize and escape string for PDF literal text: (string) Tj */
function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "\\225")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ");
}

/** Approximate Helvetica character widths for word wrapping */
function estimateCharWidth(char: string, fontSize: number): number {
  if (char === " " || char === "." || char === "," || char === ":" || char === ";") return fontSize * 0.28;
  if (char === "i" || char === "l" || char === "!" || char === "|" || char === "'") return fontSize * 0.25;
  if (char === "m" || char === "w" || char === "M" || char === "W") return fontSize * 0.75;
  if (char >= "A" && char <= "Z") return fontSize * 0.62;
  return fontSize * 0.52;
}

function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    width += estimateCharWidth(text[i], fontSize);
  }
  return width;
}

/** Break text into lines fitting within maxWidth */
function wrapText(text: string, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const candidate = `${currentLine} ${word}`;
    if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Generates a complete, valid PDF 1.4 file as a Uint8Array.
 */
export function generateAICVPdf(data: CVPdfData): Uint8Array {
  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const marginX = 42;
  const contentWidth = pageWidth - marginX * 2; // ~511pt
  const topMargin = 50;
  const bottomMargin = 52;

  type PageStream = {
    commands: string[];
  };

  const pages: PageStream[] = [];
  let currentPage: PageStream = { commands: [] };
  let currentY = pageHeight - topMargin;

  function pushPage() {
    currentPage = { commands: [] };
    pages.push(currentPage);
    currentY = pageHeight - topMargin;
    renderPageDecorations(currentPage, pages.length);
  }

  function renderPageDecorations(page: PageStream, pageNum: number) {
    if (data.watermark !== false) {
      // 1. Diagonal Watermark across the page
      page.commands.push(
        "q",
        "/GS1 gs",
        "0.78 0.82 0.88 rg",
        "BT",
        "/F2 38 Tf",
        // Rotate ~35 degrees: cos(35)=0.819, sin(35)=0.5735
        `0.819 0.5735 -0.5735 0.819 110 320 Tm`,
        `(${escapePdfText("CREATED WITH JOMP AI")}) Tj`,
        "ET",
        "Q",
      );

      // 2. Top Banner Watermark
      page.commands.push(
        "BT",
        "/F1 7.5 Tf",
        "0.48 0.55 0.65 rg",
        `${marginX} ${pageHeight - 28} Td`,
        `(${escapePdfText("JOMP AI RESUME BUILDER  •  FREE VERSION (WATERMARKED)")}) Tj`,
        "ET",
      );

      // 3. Bottom Footer Watermark & Divider
      page.commands.push(
        "q",
        "0.85 0.88 0.92 RG",
        "0.5 w",
        `${marginX} 38 m ${pageWidth - marginX} 38 l S`,
        "Q",
        "BT",
        "/F1 8 Tf",
        "0.42 0.48 0.58 rg",
        `${marginX} 24 Td`,
        `(${escapePdfText("Created with JOMP AI  •  Subscribe to remove watermark  •  https://jomponline.com")}) Tj`,
        "ET",
        "BT",
        "/F1 8 Tf",
        "0.55 0.60 0.68 rg",
        `${pageWidth - marginX - 50} 24 Td`,
        `(${escapePdfText(`Page ${pageNum}`)}) Tj`,
        "ET",
      );
    } else {
      // Footer page number only
      page.commands.push(
        "BT",
        "/F1 8 Tf",
        "0.55 0.60 0.68 rg",
        `${pageWidth - marginX - 50} 24 Td`,
        `(${escapePdfText(`Page ${pageNum}`)}) Tj`,
        "ET",
      );
    }
  }

  function ensureSpace(heightNeeded: number) {
    if (currentY - heightNeeded < bottomMargin) {
      pushPage();
    }
  }

  // Initialize first page
  pushPage();

  // -------------------------------------------------------------
  // HEADER SECTION (Page 1)
  // -------------------------------------------------------------
  const name = data.fullName.trim() || "Professional Candidate";
  currentPage.commands.push(
    "BT",
    "/F2 22 Tf",
    "0.004 0.133 0.31 rg", // JOMP Primary Navy (#01224F)
    `${marginX} ${currentY} Td`,
    `(${escapePdfText(name)}) Tj`,
    "ET",
  );
  currentY -= 20;

  // Title & Target Niche
  const title = data.suggestedTitle.trim() || "Remote Specialist";
  const niche = data.targetNiche ? `  •  Target Niche: ${data.targetNiche}` : "";
  currentPage.commands.push(
    "BT",
    "/F2 11 Tf",
    "0.15 0.35 0.65 rg", // Accent Blue
    `${marginX} ${currentY} Td`,
    `(${escapePdfText(`${title}${niche}`)}) Tj`,
    "ET",
  );
  currentY -= 15;

  // Contact info line
  const contactParts: string[] = [];
  if (data.email) contactParts.push(data.email);
  contactParts.push("JOMP Verified Talent Network");
  currentPage.commands.push(
    "BT",
    "/F1 9 Tf",
    "0.45 0.50 0.58 rg",
    `${marginX} ${currentY} Td`,
    `(${escapePdfText(contactParts.join("   |   "))}) Tj`,
    "ET",
  );
  currentY -= 14;

  // Divider line under header
  currentPage.commands.push(
    "q",
    "0.004 0.133 0.31 RG",
    "1.5 w",
    `${marginX} ${currentY} m ${pageWidth - marginX} ${currentY} l S`,
    "Q",
  );
  currentY -= 18;

  // Helper for section headings
  function renderSectionHeading(title: string) {
    ensureSpace(34);
    currentPage.commands.push(
      "BT",
      "/F2 10.5 Tf",
      "0.004 0.133 0.31 rg",
      `${marginX} ${currentY} Td`,
      `(${escapePdfText(title.toUpperCase())}) Tj`,
      "ET",
      "q",
      "0.82 0.86 0.90 RG",
      "0.75 w",
      `${marginX} ${currentY - 4} m ${pageWidth - marginX} ${currentY - 4} l S`,
      "Q",
    );
    currentY -= 18;
  }

  // -------------------------------------------------------------
  // 1. EXECUTIVE SUMMARY
  // -------------------------------------------------------------
  if (data.executiveSummary) {
    renderSectionHeading("Executive Summary");
    const summaryLines = wrapText(data.executiveSummary, 9.5, contentWidth);
    for (const line of summaryLines) {
      ensureSpace(14);
      currentPage.commands.push(
        "BT",
        "/F1 9.5 Tf",
        "0.18 0.22 0.28 rg",
        `${marginX} ${currentY} Td`,
        `(${escapePdfText(line)}) Tj`,
        "ET",
      );
      currentY -= 13.5;
    }
    currentY -= 8;
  }

  // -------------------------------------------------------------
  // 2. CORE SKILLS MATRIX
  // -------------------------------------------------------------
  const categories = Object.entries(data.skillsByCategory || {});
  if (categories.length > 0) {
    renderSectionHeading("Core Skills & Technical Proficiencies");
    for (const [category, skills] of categories) {
      if (!skills?.length) continue;
      ensureSpace(20);
      const prefix = `${category}: `;
      const skillsStr = skills.join(", ");
      const combined = `${prefix}${skillsStr}`;
      const wrapped = wrapText(combined, 9, contentWidth - 10);

      for (let i = 0; i < wrapped.length; i++) {
        ensureSpace(13);
        const line = wrapped[i];
        currentPage.commands.push(
          "BT",
          i === 0 ? "/F2 9 Tf" : "/F1 9 Tf",
          "0.15 0.20 0.28 rg",
          `${marginX + 8} ${currentY} Td`,
          `(${escapePdfText(line)}) Tj`,
          "ET",
        );
        currentY -= 12.5;
      }
      currentY -= 2;
    }
    currentY -= 6;
  }

  // -------------------------------------------------------------
  // 3. PROFESSIONAL EXPERIENCE (STAR BULLETS)
  // -------------------------------------------------------------
  if (data.structuredExperience?.length) {
    renderSectionHeading("Professional Experience & Key Achievements");
    for (const item of data.structuredExperience) {
      ensureSpace(36);
      // Role & period/company header
      const roleText = item.role || "Specialist";
      const meta = [item.company, item.period].filter(Boolean).join("  •  ");

      currentPage.commands.push(
        "BT",
        "/F2 10 Tf",
        "0.08 0.12 0.20 rg",
        `${marginX} ${currentY} Td`,
        `(${escapePdfText(roleText)}) Tj`,
        "ET",
      );

      if (meta) {
        const metaWidth = estimateTextWidth(meta, 9);
        const metaX = Math.max(marginX + 200, pageWidth - marginX - metaWidth);
        currentPage.commands.push(
          "BT",
          "/F3 9 Tf",
          "0.45 0.50 0.58 rg",
          `${metaX} ${currentY} Td`,
          `(${escapePdfText(meta)}) Tj`,
          "ET",
        );
      }
      currentY -= 14;

      // Bullets
      for (const bullet of item.highlights || []) {
        const bulletLines = wrapText(bullet, 9, contentWidth - 18);
        for (let bIdx = 0; bIdx < bulletLines.length; bIdx++) {
          ensureSpace(13);
          const bLine = bulletLines[bIdx];
          const bulletPrefix = bIdx === 0 ? "\\225  " : "    ";
          currentPage.commands.push(
            "BT",
            "/F1 9 Tf",
            "0.22 0.26 0.32 rg",
            `${marginX + 8} ${currentY} Td`,
            `(${escapePdfText(bulletPrefix + bLine)}) Tj`,
            "ET",
          );
          currentY -= 12.5;
        }
        currentY -= 1.5;
      }
      currentY -= 5;
    }
  }

  // -------------------------------------------------------------
  // 4. ATS KEYWORDS & NICHE POSITIONING
  // -------------------------------------------------------------
  if (data.atsKeywords?.length) {
    renderSectionHeading("Optimized ATS Keywords");
    ensureSpace(24);
    const kwText = data.atsKeywords.join("   •   ");
    const kwLines = wrapText(kwText, 8.5, contentWidth - 10);
    for (const kwLine of kwLines) {
      ensureSpace(12);
      currentPage.commands.push(
        "BT",
        "/F1 8.5 Tf",
        "0.35 0.40 0.50 rg",
        `${marginX + 5} ${currentY} Td`,
        `(${escapePdfText(kwLine)}) Tj`,
        "ET",
      );
      currentY -= 11.5;
    }
  }

  // -------------------------------------------------------------
  // ASSEMBLE PDF DATA STRUCTURE
  // -------------------------------------------------------------
  const objects: string[] = [];

  // Obj 1: Catalog
  objects.push(`<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>`);

  // Obj 2: Pages container (kids updated below)
  // Font Objects:
  // Obj 3: Font F1 (Helvetica)
  // Obj 4: Font F2 (Helvetica-Bold)
  // Obj 5: Font F3 (Helvetica-Oblique)
  // Obj 6: ExtGState GS1 for watermark transparency

  const fontF1Index = 3;
  const fontF2Index = 4;
  const fontF3Index = 5;
  const gs1Index = 6;

  // Obj 3
  objects.push(`<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica\n  /Encoding /WinAnsiEncoding\n>>`);
  // Obj 4
  objects.push(`<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica-Bold\n  /Encoding /WinAnsiEncoding\n>>`);
  // Obj 5
  objects.push(`<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica-Oblique\n  /Encoding /WinAnsiEncoding\n>>`);
  // Obj 6: GS1 for 10% opacity watermark
  objects.push(`<<\n  /Type /ExtGState\n  /ca 0.12\n  /CA 0.12\n>>`);

  // Next objects will be Page and Contents streams
  let nextObjIndex = 7;
  const pageObjectIndices: number[] = [];

  for (let p = 0; p < pages.length; p++) {
    const pageObjIdx = nextObjIndex++;
    const streamObjIdx = nextObjIndex++;
    pageObjectIndices.push(pageObjIdx);

    const streamContent = pages[p].commands.join("\n");
    const streamBytes = new TextEncoder().encode(streamContent);
    const streamLength = streamBytes.length;

    // Page object
    const pageObj = `<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${pageWidth} ${pageHeight}]\n  /Resources <<\n    /Font <<\n      /F1 ${fontF1Index} 0 R\n      /F2 ${fontF2Index} 0 R\n      /F3 ${fontF3Index} 0 R\n    >>\n    /ExtGState <<\n      /GS1 ${gs1Index} 0 R\n    >>\n  >>\n  /Contents ${streamObjIdx} 0 R\n>>`;

    // Stream object
    const streamObj = `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`;

    objects.push(pageObj);
    objects.push(streamObj);
  }

  // Now create Obj 2 with correct Kids
  const kidsStr = pageObjectIndices.map((idx) => `${idx} 0 R`).join(" ");
  const pagesObj = `<<\n  /Type /Pages\n  /Kids [${kidsStr}]\n  /Count ${pages.length}\n>>`;
  // Insert pagesObj as index 1 (0-based in objects array)
  objects.splice(1, 0, pagesObj);

  // Build binary buffer
  const encoder = new TextEncoder();
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [];

  for (let i = 0; i < objects.length; i++) {
    const objNum = i + 1;
    offsets.push(encoder.encode(pdf).length);
    pdf += `${objNum} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const startxref = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (const off of offsets) {
    const padded = String(off).padStart(10, "0");
    pdf += `${padded} 00000 n \n`;
  }

  pdf += `trailer\n<<\n  /Size ${objects.length + 1}\n  /Root 1 0 R\n>>\nstartxref\n${startxref}\n%%EOF\n`;

  return encoder.encode(pdf);
}
