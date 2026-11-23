#!/usr/bin/env node
/**
 * Markdown conversion tests (dev only, not packaged).
 *
 *   node tests/run.js
 *
 * Loads core.js + markdown.js into headless Chromium (Playwright), converts
 * each fixture and checks the result. Exits non-zero on any failure.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const fixture = (name) => fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");

const cases = [
  {
    name: "ChatGPT card keeps its title (#5)",
    html: fixture("chatgpt-card.html"),
    options: { unwrapChips: true },
    expect: [
      { has: "**1.** **Just Perfection**" },
      { has: "Mình đề xuất" },
      { has: "- Ẩn Top Bar." },
      { has: "[Cài Just Perfection](https://extensions.gnome.org/extension/3843/just-perfection/)" },
      { lacks: "utm_source" },
      { lacks: ".org//" }
    ]
  },
  {
    name: "ChatGPT inline chip keeps its word (#5)",
    html: fixture("chatgpt-inline-chip.html"),
    options: { unwrapChips: true },
    expect: [{ has: "Công nghệ mình muốn giới thiệu là Temporal." }]
  },
  {
    name: "ChatGPT source pill (\"GNOME Wiki Archive+1\") is dropped, not copied as text",
    html: fixture("chatgpt-source-pill.html"),
    options: { unwrapChips: true },
    expect: [
      { lacks: "GNOME Wiki Archive" },
      { lacks: "+1" },
      { has: "tách biệt hệ điều hành khỏi ứng dụng." }
    ]
  },
  {
    name: "Code block: label becomes the fence language, Copy buttons are removed",
    html: fixture("code-block-copy-button.html"),
    options: { unwrapChips: true },
    expect: [
      { has: '```python\nprint("hello")\n```' },
      { lacks: "Copy" },
      { has: "Xong" }
    ]
  },
  {
    name: "Other sites (no unwrapChips) behave as before: buttons are removed",
    html: fixture("chatgpt-inline-chip.html"),
    options: {},
    expect: [{ has: "Công nghệ mình muốn giới thiệu là ." }]
  }
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent("<!doctype html><meta charset=utf-8><body></body>");
  for (const file of ["core.js", "markdown.js"]) {
    await page.addScriptTag({ content: fs.readFileSync(path.join(ROOT, file), "utf8") });
  }

  let failed = 0;

  for (const test of cases) {
    const markdown = await page.evaluate(({ html, options }) => {
      const host = document.createElement("div");
      host.innerHTML = html;
      document.body.replaceChildren(host);
      return window.AIQuickCopy.toMarkdown(host, options);
    }, test);

    const problems = test.expect.filter((check) =>
      check.has !== undefined ? !markdown.includes(check.has) : markdown.includes(check.lacks)
    );

    if (problems.length) {
      failed++;
      console.log(`FAIL  ${test.name}`);
      for (const check of problems) {
        console.log(check.has !== undefined ? `      missing: ${JSON.stringify(check.has)}` : `      should not contain: ${JSON.stringify(check.lacks)}`);
      }
      console.log("      got:\n" + markdown.replace(/^/gm, "        "));
    } else {
      console.log(`ok    ${test.name}`);
    }
  }

  await browser.close();
  console.log(failed ? `\n${failed} of ${cases.length} failed` : `\nall ${cases.length} passed`);
  process.exit(failed ? 1 : 0);
})();
