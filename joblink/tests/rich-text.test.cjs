/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness loads TypeScript utilities without a separate test framework. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const source = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const result = { exports: {} };
  new Function('require', 'module', 'exports', code)((id) => dependencies[id] ?? require(id), result, result.exports);
  return result.exports;
}
const rich = load('src/lib/rich-text.ts');
const { sanitizeRichText } = load('src/lib/sanitize-rich-text.ts', { '@/lib/rich-text': rich });
test('legacy text keeps line breaks and literal angle brackets', () => {
  assert.equal(sanitizeRichText('React & TypeScript\nPay < 500'), '<p>React &amp; TypeScript<br />Pay &lt; 500</p>');
});
test('formatting survives save and reload', () => {
  const html = '<h2>The role</h2><p><strong>Bold</strong> <em>Italic</em> <u>Underline</u></p><ol start="3"><li><p>Build</p></li></ol>';
  assert.equal(sanitizeRichText(html), html);
  assert.equal(sanitizeRichText(sanitizeRichText(html)), html);
});
test('untrusted pasted HTML cannot execute scripts or unsafe links', () => {
  const html = sanitizeRichText('<p onclick="alert(1)">Hello<script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">unsafe</a></p>');
  assert.ok(!/onclick|onerror|script|<img|javascript/i.test(html));
});
test('safe links have protections and arbitrary styles are removed', () => {
  const html = sanitizeRichText('<p style="color:red"><a href="https://example.com">Website</a></p>');
  assert.ok(html.includes('rel="noopener noreferrer"'));
  assert.ok(html.includes('href="https://example.com"'));
  assert.ok(!html.includes('style='));
});
test('excerpts contain readable text, not HTML or entities', () => {
  assert.equal(rich.richTextExcerpt('<p>Design &amp; build</p><ul><li>React</li><li>Next.js</li></ul>'), 'Design & build\nReact\nNext.js');
  assert.equal(rich.richTextExcerpt('<p><br></p>'), '');
});
