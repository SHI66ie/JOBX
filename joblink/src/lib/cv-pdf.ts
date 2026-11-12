/**
 * Standalone PDF generator for AI-crafted CVs with JOMP branding and watermark.
 * Produces standard PDF 1.4 documents using core Type-1 fonts (Helvetica)
 * with zero external binary or npm dependencies.
 *
 * Implements high-converting executive structure:
 * - Headline (multi-pillar)
 * - Profile / Executive Summary narrative
 * - Core Competencies (Pillar — scope)
 * - Professional Experience (Context + STAR bullets)
 * - Education & Certifications
 * - Selected Technical Work / Projects
 * - Additional Information (Availability, Languages, References)
 * - Embedded JOMP watermark
 */

export type CoreCompetencyItem = {
  pillar: string;
  scope: string;
};

export type StructuredExperienceItem = {
  role: string;
  company?: string;
  period?: string;
  context?: string;
  highlights: string[];
};

export type EducationItem = {
  degree: string;
  institution: string;
  year?: string;
  details?: string;
};

export type TechnicalWorkItem = {
  title: string;
  description: string;
};

export type AdditionalInfoItem = {
  locationAndRelocation?: string;
  languages?: string[];
  workArrangement?: string;
  referencesNote?: string;
};

export type CVPdfData = {
  fullName: string;
  headline?: string;
  location?: string;
  phone?: string;
  email?: string;
  links?: string[];
  languages?: string[];
  availability?: string;
  targetNiche?: string;
  suggestedTitle: string;
  executiveSummary: string;
  competencies?: CoreCompetencyItem[];
  skillsByCategory?: Record<string, string[]>;
  recommendedSkills?: string[];
  structuredExperience: StructuredExperienceItem[];
  education?: EducationItem[];
  selectedWork?: TechnicalWorkItem[];
  additionalInfo?: AdditionalInfoItem;
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
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // ~515pt
  const topMargin = 48;
  const bottomMargin = 50;

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
      // 1. Diagonal Watermark across the page background:
      // Faint, faded, embedded at the back of the document behind text.
      // Uses a visible soft gray-blue tint (0.87 0.89 0.93) combined with /GS1 (18% opacity)
      // so it renders consistently and visibly across Chrome, Edge, Safari, Adobe & mobile PDF viewers.
      page.commands.push(
        "q",
        "/GS1 gs",
        "0.62 0.68 0.78 rg", // Clear soft slate brand tone
        "BT",
        "/F2 130 Tf", // Prominent large "JOMP" across the page
        // Rotated ~54 degrees diagonal: cos(54)=0.5878, sin(54)=0.8090
        `0.5878 0.8090 -0.8090 0.5878 120 220 Tm`,
        `(${escapePdfText("JOMP")}) Tj`,
        "ET",
        "Q",
      );

      // 2. Top Banner Watermark
      page.commands.push(
        "BT",
        "/F1 7.5 Tf",
        "0.48 0.55 0.65 rg",
        `${marginX} ${pageHeight - 24} Td`,
        `(${escapePdfText("JOMP AI RESUME BUILDER  •  FREE VERSION (WATERMARKED)")}) Tj`,
        "ET",
      );

      // 3. Bottom Footer Watermark & Divider
      page.commands.push(
        "q",
        "0.85 0.88 0.92 RG",
        "0.5 w",
        `${marginX} 36 m ${pageWidth - marginX} 36 l S`,
        "Q",
        "BT",
        "/F1 8 Tf",
        "0.42 0.48 0.58 rg",
        `${marginX} 22 Td`,
        `(${escapePdfText("Created with JOMP AI  •  Subscribe to remove watermark  •  https://jomponline.com")}) Tj`,
        "ET",
        "BT",
        "/F1 8 Tf",
        "0.55 0.60 0.68 rg",
        `${pageWidth - marginX - 50} 22 Td`,
        `(${escapePdfText(`Page ${pageNum}`)}) Tj`,
        "ET",
      );
    } else {
      // Clean footer for subscribed tier
      page.commands.push(
        "q",
        "0.90 0.90 0.90 RG",
        "0.5 w",
        `${marginX} 36 m ${pageWidth - marginX} 36 l S`,
        "Q",
        "BT",
        "/F1 8 Tf",
        "0.55 0.60 0.68 rg",
        `${pageWidth - marginX - 50} 22 Td`,
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

  // Helper for section headings matching the benchmark
  function renderSectionHeading(title: string) {
    ensureSpace(32);
    currentPage.commands.push(
      "BT",
      "/F2 10.5 Tf",
      "0.004 0.133 0.31 rg", // JOMP Primary Navy (#01224F)
      `${marginX} ${currentY} Td`,
      `(${escapePdfText(title.toUpperCase())}) Tj`,
      "ET",
      "q",
      "0.004 0.133 0.31 RG",
      "1 w",
      `${marginX} ${currentY - 3} m ${pageWidth - marginX} ${currentY - 3} l S`,
      "Q",
    );
    currentY -= 16;
  }

  // Initialize first page
  pushPage();

  // -------------------------------------------------------------
  // HEADER SECTION
  // -------------------------------------------------------------
  const name = (data.fullName.trim() || "CANDIDATE").toUpperCase();
  currentPage.commands.push(
    "BT",
    "/F2 19 Tf",
    "0.004 0.133 0.31 rg", // JOMP Primary Navy (#01224F)
    `${marginX} ${currentY} Td`,
    `(${escapePdfText(name)}) Tj`,
    "ET",
  );
  currentY -= 18;

  // Multi-pillar Headline (e.g. IT / ICT Officer · End-User Support · Digital Records & Asset Control)
  const headline = data.headline || data.suggestedTitle.trim() || "Professional Specialist";
  currentPage.commands.push(
    "BT",
    "/F2 11 Tf",
    "0.10 0.25 0.50 rg", // Navy accent
    `${marginX} ${currentY} Td`,
    `(${escapePdfText(headline)}) Tj`,
    "ET",
  );
  currentY -= 14;

  // Contact line (Location · Phone · Email)
  const contactItems: string[] = [];
  if (data.location) contactItems.push(data.location);
  if (data.phone) contactItems.push(data.phone);
  if (data.email) contactItems.push(data.email);
  if (!contactItems.length) {
    contactItems.push("JOMP Verified Talent");
    if (data.email) contactItems.push(data.email);
  }
  currentPage.commands.push(
    "BT",
    "/F1 8.5 Tf",
    "0.35 0.40 0.48 rg",
    `${marginX} ${currentY} Td`,
    `(${escapePdfText(contactItems.join("  ·  "))}) Tj`,
    "ET",
  );
  currentY -= 12;

  // Secondary meta line (Links / Languages / Availability)
  const secondaryMeta: string[] = [];
  if (data.links?.length) secondaryMeta.push(...data.links);
  if (data.languages?.length) secondaryMeta.push(data.languages.join(" · "));
  if (data.availability) secondaryMeta.push(data.availability);
  else if (data.additionalInfo?.workArrangement) secondaryMeta.push(data.additionalInfo.workArrangement);

  if (secondaryMeta.length > 0) {
    const metaStr = secondaryMeta.join("  ·  ");
    const wrappedMeta = wrapText(metaStr, 8.5, contentWidth);
    for (const mLine of wrappedMeta) {
      currentPage.commands.push(
        "BT",
        "/F1 8.5 Tf",
        "0.40 0.45 0.55 rg",
        `${marginX} ${currentY} Td`,
        `(${escapePdfText(mLine)}) Tj`,
        "ET",
      );
      currentY -= 11.5;
    }
  }

  // Header separator
  currentPage.commands.push(
    "q",
    "0.82 0.86 0.92 RG",
    "1.5 w",
    `${marginX} ${currentY} m ${pageWidth - marginX} ${currentY} l S`,
    "Q",
  );
  currentY -= 16;

  // -------------------------------------------------------------
  // 1. PROFILE (EXECUTIVE SUMMARY)
  // -------------------------------------------------------------
  if (data.executiveSummary) {
    renderSectionHeading("Profile");
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
    currentY -= 6;
  }

  // -------------------------------------------------------------
  // 2. CORE COMPETENCIES (Pillar — Scope format)
  // -------------------------------------------------------------
  const competencies = data.competencies && data.competencies.length > 0
    ? data.competencies
    : Object.entries(data.skillsByCategory || {}).map(([pillar, items]) => ({
        pillar,
        scope: items.join(", "),
      }));

  if (competencies.length > 0) {
    renderSectionHeading("Core Competencies");
    for (const comp of competencies) {
      const fullText = `${comp.pillar} — ${comp.scope}`;
      const wrapped = wrapText(fullText, 9, contentWidth - 8);

      for (let i = 0; i < wrapped.length; i++) {
        ensureSpace(13);
        const line = wrapped[i];
        currentPage.commands.push(
          "BT",
          i === 0 ? "/F2 9 Tf" : "/F1 9 Tf",
          "0.15 0.20 0.28 rg",
          `${marginX + 6} ${currentY} Td`,
          `(${escapePdfText(line)}) Tj`,
          "ET",
        );
        currentY -= 12.5;
      }
      currentY -= 1.5;
    }
    currentY -= 6;
  }

  // -------------------------------------------------------------
  // 3. PROFESSIONAL EXPERIENCE
  // -------------------------------------------------------------
  if (data.structuredExperience?.length) {
    renderSectionHeading("Professional Experience");
    for (const exp of data.structuredExperience) {
      ensureSpace(38);

      // Role | Company — Location header
      const roleText = exp.role || "Professional";
      const companyLocation = exp.company ? ` | ${exp.company}` : "";
      const headerTitle = `${roleText}${companyLocation}`;
      const dateText = exp.period || "";

      // Print Title
      currentPage.commands.push(
        "BT",
        "/F2 9.5 Tf",
        "0.08 0.12 0.22 rg",
        `${marginX} ${currentY} Td`,
        `(${escapePdfText(headerTitle)}) Tj`,
        "ET",
      );

      // Print right-aligned date
      if (dateText) {
        const dateWidth = estimateTextWidth(dateText, 9);
        const dateX = Math.max(marginX + 220, pageWidth - marginX - dateWidth);
        currentPage.commands.push(
          "BT",
          "/F2 9 Tf",
          "0.30 0.35 0.45 rg",
          `${dateX} ${currentY} Td`,
          `(${escapePdfText(dateText)}) Tj`,
          "ET",
        );
      }
      currentY -= 13;

      // Optional Context Line (e.g. Contract staff. Followed the Principal...)
      if (exp.context) {
        ensureSpace(14);
        const ctxLines = wrapText(exp.context, 8.5, contentWidth - 10);
        for (const cLine of ctxLines) {
          currentPage.commands.push(
            "BT",
            "/F3 8.5 Tf",
            "0.35 0.40 0.50 rg",
            `${marginX} ${currentY} Td`,
            `(${escapePdfText(cLine)}) Tj`,
            "ET",
          );
          currentY -= 11.5;
        }
        currentY -= 2;
      }

      // Highlights (STAR bullets)
      for (const bullet of exp.highlights || []) {
        const bulletLines = wrapText(bullet, 9, contentWidth - 16);
        for (let bIdx = 0; bIdx < bulletLines.length; bIdx++) {
          ensureSpace(13);
          const bLine = bulletLines[bIdx];
          const bulletPrefix = bIdx === 0 ? "\\225  " : "    ";
          currentPage.commands.push(
            "BT",
            "/F1 9 Tf",
            "0.20 0.24 0.30 rg",
            `${marginX + 6} ${currentY} Td`,
            `(${escapePdfText(bulletPrefix + bLine)}) Tj`,
            "ET",
          );
          currentY -= 12.5;
        }
        currentY -= 1;
      }
      currentY -= 5;
    }
    currentY -= 4;
  }

  // -------------------------------------------------------------
  // 4. EDUCATION & CERTIFICATIONS
  // -------------------------------------------------------------
  if (data.education?.length) {
    renderSectionHeading("Education & Certifications");
    for (const edu of data.education) {
      ensureSpace(24);
      const degreeInst = [edu.degree, edu.institution].filter(Boolean).join(" | ");
      const yr = edu.year || "";

      currentPage.commands.push(
        "BT",
        "/F2 9.5 Tf",
        "0.10 0.15 0.24 rg",
        `${marginX} ${currentY} Td`,
        `(${escapePdfText(degreeInst)}) Tj`,
        "ET",
      );

      if (yr) {
        const yrWidth = estimateTextWidth(yr, 9);
        const yrX = Math.max(marginX + 200, pageWidth - marginX - yrWidth);
        currentPage.commands.push(
          "BT",
          "/F2 9 Tf",
          "0.35 0.40 0.50 rg",
          `${yrX} ${currentY} Td`,
          `(${escapePdfText(yr)}) Tj`,
          "ET",
        );
      }
      currentY -= 12.5;

      if (edu.details) {
        ensureSpace(13);
        const dLines = wrapText(edu.details, 8.5, contentWidth - 10);
        for (const dLine of dLines) {
          currentPage.commands.push(
            "BT",
            "/F3 8.5 Tf",
            "0.35 0.40 0.50 rg",
            `${marginX + 6} ${currentY} Td`,
            `(${escapePdfText(dLine)}) Tj`,
            "ET",
          );
          currentY -= 11.5;
        }
      }
      currentY -= 3;
    }
    currentY -= 4;
  }

  // -------------------------------------------------------------
  // 5. SELECTED TECHNICAL WORK / PROJECTS
  // -------------------------------------------------------------
  if (data.selectedWork?.length) {
    renderSectionHeading("Selected Technical Work & Internal Tools");
    for (const work of data.selectedWork) {
      ensureSpace(22);
      const fullWork = `${work.title} — ${work.description}`;
      const wLines = wrapText(fullWork, 9, contentWidth - 8);

      for (let i = 0; i < wLines.length; i++) {
        ensureSpace(13);
        currentPage.commands.push(
          "BT",
          i === 0 ? "/F2 9 Tf" : "/F1 9 Tf",
          "0.18 0.22 0.28 rg",
          `${marginX + 6} ${currentY} Td`,
          `(${escapePdfText(wLines[i])}) Tj`,
          "ET",
        );
        currentY -= 12;
      }
      currentY -= 2;
    }
    currentY -= 4;
  }

  // -------------------------------------------------------------
  // 6. ADDITIONAL INFORMATION
  // -------------------------------------------------------------
  const addl = data.additionalInfo;
  if (addl && (addl.locationAndRelocation || addl.languages?.length || addl.workArrangement || addl.referencesNote)) {
    renderSectionHeading("Additional Information");
    const points: string[] = [];
    if (addl.locationAndRelocation) points.push(addl.locationAndRelocation);
    if (addl.languages?.length) points.push(`Fluent in ${addl.languages.join(", ")}`);
    if (addl.workArrangement) points.push(addl.workArrangement);
    if (addl.referencesNote) points.push(addl.referencesNote);

    for (const pt of points) {
      ensureSpace(14);
      const ptLines = wrapText(pt, 8.5, contentWidth - 10);
      for (const line of ptLines) {
        currentPage.commands.push(
          "BT",
          "/F1 8.5 Tf",
          "0.30 0.35 0.45 rg",
          `${marginX + 6} ${currentY} Td`,
          `(${escapePdfText(`•  ${line}`)}) Tj`,
          "ET",
        );
        currentY -= 11.5;
      }
      currentY -= 1.5;
    }
  }

  // -------------------------------------------------------------
  // ASSEMBLE PDF DATA STRUCTURE
  // -------------------------------------------------------------
  const objects: string[] = [];

  // Obj 1: Catalog
  objects.push(`<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>`);

  // Font and ExtGState indices
  const fontF1Index = 3;
  const fontF2Index = 4;
  const fontF3Index = 5;
  const gs1Index = 6;

  // Obj 3: Font F1 (Helvetica regular)
  objects.push(`<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica\n  /Encoding /WinAnsiEncoding\n>>`);
  // Obj 4: Font F2 (Helvetica-Bold)
  objects.push(`<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica-Bold\n  /Encoding /WinAnsiEncoding\n>>`);
  // Obj 5: Font F3 (Helvetica-Oblique)
  objects.push(`<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica-Oblique\n  /Encoding /WinAnsiEncoding\n>>`);
  // Obj 6: ExtGState GS1 for faint background watermark (18% opacity)
  objects.push(`<<\n  /Type /ExtGState\n  /ca 0.18\n  /CA 0.18\n>>`);

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

  // Obj 2 with correct Kids
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
