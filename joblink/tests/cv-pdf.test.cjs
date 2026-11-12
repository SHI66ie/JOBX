const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

test("generateAICVPdf creates a valid PDF structure with watermark", () => {
  const content = fs.readFileSync(path.join(__dirname, "../src/lib/cv-pdf.ts"), "utf8");
  assert.ok(content.includes('(${escapePdfText("JOMP")}) Tj'), "Contains diagonal JOMP watermark");
  assert.ok(content.includes("Subscribe to remove watermark"), "Contains footer watermark text");
  assert.ok(content.includes("JOMP AI RESUME BUILDER"), "Contains banner watermark");
  assert.ok(content.includes("/ExtGState"), "Contains transparency state");
});
