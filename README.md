# AI Quick Copy

> Copy the AI chat response you are reading as clean Markdown — just press `Ctrl+C` with nothing selected.

![Version](https://img.shields.io/badge/version-1.5.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

AI Quick Copy is a lightweight Chrome / Edge extension that grabs the assistant response you are reading on ChatGPT, Gemini, Grok, or Claude and puts it on your clipboard as Markdown — headings, lists, code blocks, tables and all.

## Table of Contents

- [Features](#features)
- [AI Identity Blocks](#ai-identity-blocks)
- [Supported Sites](#supported-sites)
- [Installation](#installation)
- [Usage](#usage)
- [Privacy & Permissions](#privacy--permissions)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Changelog](#changelog)
- [License](#license)

## Features

- **The shortcut you already know** — press `Ctrl+C` (`⌘C` on macOS) with nothing highlighted to copy the AI response you are reading. At the bottom of a chat that is the latest one; scroll up and it copies the older answer on screen.
- **Copy every AI tab at once** — press `Alt+C` (`⌃ Control+C` on macOS) to copy the latest answer of every ChatGPT, Gemini, Grok and Claude tab in the current window in one go, each labeled with its AI. Ask the same question to several AIs, then gather all their answers into one Markdown file.
- **Normal copy is untouched** — with text highlighted, or inside an input field, `Ctrl+C` copies exactly as it always does.
- **Know who wrote what** — each copy is labeled with the AI's name (and an optional role) at the top and bottom, so answers from different AIs stay distinguishable in one file.
- **Real Markdown, not plain text** — the response DOM is serialized into Markdown:

  | HTML | Markdown |
  |---|---|
  | `h1`–`h6` | `#`–`######` |
  | `blockquote` | `>` |
  | `ul` / `ol` | `-` / `1.` lists (nested supported) |
  | `strong` / `b` | `**bold**` |
  | `em` / `i` | `*italic*` |
  | `del` / `s` | `~~strike~~` |
  | `code` | `` `inline code` `` |
  | `pre > code` | fenced code block with its language (`` ```python ``) |
  | KaTeX math | `$x^2$` / `$$...$$` (TeX source) |
  | `a` | `[text](url)` |
  | `table` | Markdown table |
  | `hr` | `---` |

- **Code you can run** — indentation, tabs and blank lines inside code blocks are kept exactly; Windows line endings and non-breaking spaces are normalized.
- **Structure kept** — nested lists keep their levels, code blocks stay inside their list item or quote, numbered lists keep their numbers (e.g. starting at 3).
- **Clean output** — copy buttons, toolbars, icons and screen-reader labels (e.g. "ChatGPT said:") are stripped. Language labels shown above code blocks ("PowerShell", "Bash"...) become the code block's language instead of a stray line.
- **Resilient detection** — each site has its own adapter with multiple selectors and heuristic fallbacks.
- **100% local** — no server, no analytics, no network requests.

## AI Identity Blocks

When you paste answers from several AIs into one Markdown file, it is easy to lose track of who wrote what. By default, every copy is wrapped in an identity block:

```markdown
<!-- aqc:start ai="gemini" role="Secretary" -->
## 🟦 GEMINI · Secretary
*gemini.google.com · 2026-10-02 14:32*

...response...

*— End of answer · GEMINI · Secretary —*
<!-- aqc:end -->

---
```

- **Header and footer** show the AI name and role, so you can identify the author from either end of a long answer.
- **Color icons** make blocks easy to scan: 🟩 ChatGPT · 🟦 Gemini · ⬛ Grok · 🟧 Claude.
- **Timestamp** tells repeated answers from the same AI apart.
- **Headings inside the response are shifted down two levels** (`#` → `###`) so they nest under the block title.
- **Hidden `aqc:start` / `aqc:end` comments** do not render, but let scripts split a file back into individual answers.

### Settings

Click the extension's toolbar icon (or open its **Options** page) to:

- Turn identity blocks on or off (on by default). When off, the plain Markdown response is copied as before.
- Give each AI a role, e.g. *Secretary*, *Dreamer*, *Critic Unit*. Leave it empty to show only the AI name.

Changes are saved automatically and apply to the next copy — no tab reload needed.

## Supported Sites

| Site | Domains |
|---|---|
| ChatGPT | `chatgpt.com`, `chat.openai.com` |
| Gemini | `gemini.google.com` |
| Grok | `grok.com`, `x.com` |
| Claude | `claude.ai` |

## Installation

The extension is not yet published on the Chrome Web Store. Install it manually:

1. Download the source:
   ```bash
   git clone https://github.com/one-studio-space/AI_WEB_FAST_COPY.git
   ```
   or click **Code → Download ZIP** on GitHub and extract it.
2. Open `chrome://extensions` (or `edge://extensions` on Microsoft Edge).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project folder (the one containing `manifest.json`).
5. Refresh any ChatGPT / Gemini / Grok / Claude tabs that were already open.

> **Note:** After updating the extension, refresh your AI tabs so the new content script is loaded.

## Usage

1. Open a conversation on a supported site.
2. Make sure nothing is highlighted and press:

   | Platform | Shortcut |
   |---|---|
   | Windows / Linux | `Ctrl` + `C` |
   | macOS | `⌘ Command` + `C` |

3. A toast confirms the copy and shows which AI was detected. Paste into VS Code, Obsidian, Notion, or any Markdown editor.

### Copy all AI tabs

Press `Alt+C` (`⌃ Control+C` on macOS) from **any** tab:

- The latest response of every ChatGPT, Gemini, Grok (`grok.com`, `x.com/i/grok`) and Claude tab **in the current window** is copied in one go, in tab order (several tabs of the same AI each give their own answer). Tabs in other browser windows are left out, so one window = one set of answers.
- With identity blocks on, each answer has its own block, so you can tell them apart; with them off, answers are separated by `---`.
- The toast lists what was copied, which tabs have no answer yet, and which tabs need a reload (tabs opened before installing or updating the extension).
- The latest answer is always used, even if you scrolled up in that tab.
- Tabs that are asleep, still loading or not responding within 2 seconds are skipped and named in the toast, so one stuck tab never holds up the copy.
- AI sites installed as apps open in their own window, so they are not gathered from a normal browser window.
- **Choose the AIs:** on the settings page, untick an AI (e.g. Gemini) to leave it out of copy-all. The toast names AIs left out. All are ticked by default; `Ctrl+C` on a single page is not affected.
- **Optional double `Ctrl+C`:** turn on *Nhấn Ctrl+C 2 lần liên tiếp* in the settings, then on an AI page, with nothing selected, press `Ctrl+C` (`⌘C`) twice quickly to copy all AI tabs. One press still copies the answer on screen. Off by default.
- On macOS the shortcut is `Control+C` (the ⌃ key), not `⌘C`: `⌘C` stays the normal copy.
- Change the shortcut at `edge://extensions/shortcuts` (`chrome://extensions/shortcuts` in Chrome), or with the **Đổi phím tắt** button on the settings page. If the settings page shows *Chưa gán*, another extension already uses the key: pick another one there.

### What gets copied

With nothing highlighted, `Ctrl+C` copies:

1. **The response on screen** — the answer crossing the middle of the screen, or the one taking up the most of it.
2. **The latest response** — when no answer is on screen.

The extension only acts when the browser would copy nothing. With text highlighted, or while you are typing in an input field, `Ctrl+C` is left to the browser as usual.

If no response can be recognized (for example after a site redesign), an orange tip appears asking you to highlight the passage and press `Ctrl+C` — a normal copy, so you can always copy, even when detection fails.

## Privacy & Permissions

- No API keys
- No backend server
- No analytics or tracking
- No external network requests
- No access to history, cookies, or bookmarks
- `storage` saves your settings (identity block on/off and AI roles)
- `activeTab` + `scripting` are used only when you press `Alt+C`: the combined answers are written to the clipboard, and a confirmation toast shown, in the tab you are on
- Host access is limited to the supported AI sites, to read their latest answer when you press `Alt+C`
- Copied responses are never stored — they go straight to your clipboard

Content scripts run only on the supported domains declared in [`manifest.json`](manifest.json). Responses are processed inside the tab and written directly to your clipboard.

Full policy: [PRIVACY.md](PRIVACY.md).

## Publishing

```bash
./scripts/package.sh   # → dist/ai-quick-copy-<version>.zip
```

Upload the zip to Microsoft Edge Add-ons or the Chrome Web Store. Listing text, permission justifications, reviewer notes and images are in [`store/`](store/LISTING.md).

## Project Structure

```text
.
├── manifest.json        # Extension declaration (Manifest V3)
├── service-worker.js    # Toolbar icon opens settings; Alt+C gathers all AI tabs
├── content.js           # Orchestration, Ctrl+C / ⌘C handler, answers the service worker
├── core.js              # Shared DOM helpers, clipboard, toast
├── markdown.js          # DOM → Markdown serializer
├── block.js             # Wraps Markdown in an AI identity block
├── settings.js          # Settings storage shared with the options page
├── sites/
│   ├── chatgpt.js       # ChatGPT response detection
│   ├── gemini.js        # Gemini response detection
│   ├── grok.js          # Grok response detection
│   └── claude.js        # Claude response detection
├── options.html         # Settings page
├── options.css
├── options.js
├── icons/               # Extension icons (SVG sources + PNGs)
├── scripts/
│   └── package.sh       # Builds the store upload zip into dist/
├── store/               # Store listing text, logo, promo tiles, screenshots
├── PRIVACY.md           # Privacy policy (linked from the store listing)
├── docs/
│   └── ARCHITECTURE.md  # Architecture overview
├── CHANGELOG.md
└── LICENSE
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full data flow.

## Troubleshooting

**Nothing happens when I press the shortcut**
- Refresh the AI tab after installing or updating the extension.
- Make sure nothing is highlighted — with a selection, `Ctrl+C` does a normal copy.
- Click outside the chat input before pressing the shortcut.

**`Alt+C` does nothing / says a tab needs a reload**
- Reload AI tabs opened before installing or updating the extension.
- Check the shortcut on the settings page; if it shows *Chưa gán*, assign one at `edge://extensions/shortcuts`.
- On browser pages (settings, new tab, the add-ons store) the toast cannot be shown and the copy cannot be made; the toolbar icon shows a red `!`. Switch to a normal web page or an AI tab and press it again.
- "Không thể copy — bấm vào trang": the address bar or DevTools had focus. Click the page and press it again.

**"Không nhận diện được câu trả lời" (response not recognized) / wrong content copied**

Highlight the passage you want and press `Ctrl+C` — a normal copy works on every supported site regardless of its layout.

To fix detection permanently: AI websites change their DOM frequently. Identify the affected adapter and update its selectors:

| Site | Adapter |
|---|---|
| ChatGPT | `sites/chatgpt.js` |
| Gemini | `sites/gemini.js` |
| Grok | `sites/grok.js` |
| Claude | `sites/claude.js` |

Do not modify `markdown.js` just because a selector stopped matching — detection and Markdown serialization are intentionally separated.

### Quick test

Ask the AI to reply with the following, then copy it and paste into a Markdown editor:

````markdown
# Heading

Normal paragraph.

> Quote

- Item A
- Item B

**Bold** and `inline code`

```js
console.log("test");
```

| A | B |
|---|---|
| 1 | 2 |
````

## Known Limitations

- **ChatGPT one-line code blocks** may be copied as a "Plain text" line followed by inline code instead of a fenced block. No content is lost.
- **Language labels without a copy button nearby** are kept as a plain text line. This is deliberate: text is only removed when it sits next to the code block's copy button, to avoid deleting answer words.
- **Math without a TeX source** (rare) is copied as plain text, e.g. `r²` becomes `r2`.
- **Site redesigns** can break response detection on one site until its adapter is updated. A normal copy (highlight + `Ctrl+C`) keeps working in the meantime.

## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-change`.
3. Commit your changes with a clear message.
4. Open a pull request describing what changed and how you tested it.

When fixing a site, please keep changes inside the relevant `sites/*.js` adapter.

## Roadmap

**Next**
- Fenced blocks for ChatGPT one-line code
- Wait for streaming responses to finish
- Copy as Markdown / Plain Text modes
- Popup showing the detected AI site
- Debug mode showing which selector matched

**v2**
- Cross-AI transfer workflow
- Windows global hotkey helper
- Optional clipboard history

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

Released under the [MIT License](LICENSE) © 2026 one-studio-space.
