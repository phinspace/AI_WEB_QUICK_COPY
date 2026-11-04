# Changelog

All notable changes to this project are documented in this file.

## 1.5.0
- New: **Copy all AI tabs** — press `Alt+C` (`⌃ Control+Shift+C` on macOS) to copy the latest response of every ChatGPT, Gemini, Grok and Claude tab in the current window in one go, in tab order (other browser windows are left out), each in its own identity block. Works from any tab, even one that is not an AI site.
- Choose which AIs are gathered: untick an AI in the settings (e.g. Gemini) and copy-all leaves it out; the toast names it. All are ticked by default; the single-answer `Ctrl+C` is not affected.
- Press `Ctrl+C` (`⌘C`) twice quickly on an AI page, with nothing selected, to copy all AI tabs (on by default; further quick presses give the same result). A single press still copies the answer on screen. Turn it off in the settings to keep `Ctrl+C` single-answer only. Recommended on Windows, where `Alt+C` may be swallowed by the browser menu.
- The toast lists which AIs were copied and why any tab was skipped: no response yet, still loading, asleep, not responding within 2 seconds, or needs a reload (opened before the extension was installed or updated). A stuck tab never holds up the copy.
- On x.com only Grok pages (`x.com/i/grok`) are gathered, so posts are never copied by mistake.
- Settings page: new "Copy tất cả tab AI" card with the current shortcut (or that it is unassigned), a button to change it, the per-AI checkboxes and the double `Ctrl+C` option.
- New permissions `activeTab` and `scripting`, used only to write the clipboard and show the toast in the tab you are on when you press `Alt+C`. `host_permissions` repeats the existing AI sites. None adds an install warning, so existing users are not asked to approve again.

## 1.4.1
- Added the extension icon (toolbar, extensions page and store listing).
- The settings page shows the current shortcut (`Ctrl+C` / `⌘C`) and reads its version from the manifest instead of a hard-coded `v1.3.1`.
- Added a privacy policy ([PRIVACY.md](PRIVACY.md)), store listing assets (`store/`) and `scripts/package.sh` to build the zip for Microsoft Edge Add-ons and the Chrome Web Store.

## 1.4.0
- The shortcut is now `Ctrl+C` (`⌘C` on macOS) instead of `Ctrl+Q`: with nothing highlighted, it copies the AI response on screen as Markdown.
- With text highlighted, or in an input field, `Ctrl+C` is left to the browser and copies as usual.
- Removed `Ctrl+Q` and the browser command; the "Hotkey không chạy?" card was removed from the settings page.

## 1.3.1
- Fixed code indentation being stripped inside code blocks (Python, YAML, etc. are now copied runnable).
- Fixed nested lists being flattened; sub-items and code blocks inside list items keep their indentation.
- Code block language labels shown by sites ("PowerShell", "Bash", "Plain text"...) become the fence language instead of a stray line.
- Multi-line code rendered without `<pre>` is copied as a fenced code block instead of inline code.
- Ordered lists keep their start number (`<ol start="3">`).
- Collapsed extra blank lines between paragraphs.
- Language labels are only removed when there is evidence they are site UI (a copy button in the code block's own wrapper, or the label sits inside the `<pre>`); answer text such as file names or words like "Note", "Go" and "Python" is kept. Without that evidence a label is left as text rather than risk deleting answer content.
- Code blocks inside blockquotes stay inside the quote; code in table cells becomes inline code.
- Code is copied with normal line endings and regular spaces (no CRLF or non-breaking spaces).
- Inline code containing backticks uses a longer delimiter so it renders correctly.
- KaTeX math is copied as TeX (`$...$` / `$$...$$`) instead of duplicated text.
- Selections keep their surrounding structure: list items keep markers, nesting and correct numbers (e.g. starting at item 4), quotes keep `>`, table cells stay in a table.
- Spaces inside bold/italic tags are kept (`**Note:** text`).

## 1.3.0
- `Ctrl+Q` now copies the response you are reading (the one in the middle of the screen) instead of always the latest. At the bottom of a chat this is still the latest response.
- Highlight text and press `Ctrl+Q` to copy only that passage, labeled as an excerpt. Partial selections inside code blocks stay fenced code blocks.
- When no response can be recognized, an orange tip asks you to highlight the passage and press `Ctrl+Q` again.
- Site adapters now return all responses (`findAll`); choosing which one to copy moved to `core.js`.

## 1.2.0
- Added AI identity blocks: each copy is wrapped with the AI name, optional role, source and timestamp at the top, plus an "End of answer" footer. On by default.
- Headings inside the response are shifted down two levels to nest under the block title.
- Settings page: toggle identity blocks and set a role per AI (e.g. Secretary, Dreamer, Critic Unit). Saved automatically.
- Clicking the toolbar icon now opens the settings page.
- Toast shows which AI the response was copied from.
- Added the `storage` permission (settings only; copied content is never stored).

## 1.1.3
- Changed the macOS shortcut from `Command+Q` to `Control+Q` (`MacCtrl+Q`). `Command+Q` quits the browser on macOS.
- Rewrote README in English.

## 1.1.2
- Fixed ChatGPT copying only "ChatGPT said:" screen-reader labels.
- Strip `.sr-only` / "ChatGPT said:" / "You said:" headings in DOM clone.
- Prefer real `.markdown` / `.prose` body; reject label-only nodes.

## 1.1.1
- Fixed ChatGPT adapter for the 2026 UI rollout (Chat/Work layout).
- Added support for new selectors: data-content-search-unit-key, data-turn-key, data-turn=assistant.
- Prefer .markdown / .prose content node when available for cleaner Markdown.
- Stronger user-turn exclusion so Ctrl+Q does not copy the user bubble.

## 1.1.0
- Added DOM-to-Markdown serializer.
- Added heading support.
- Added blockquote support.
- Added unordered/ordered list support.
- Added inline/fenced code support.
- Added links and tables.
- Reworked ChatGPT adapter with multiple selectors and heuristic fallback.
- Updated README and architecture docs.
- Updated UI toast to indicate Markdown output.

## 1.0.0
- Initial release.
- ChatGPT, Gemini, Grok, Claude adapters.
- Ctrl+Q shortcut.
- Browser command + in-page fallback.
- Clipboard fallback.
- Options page.
- Minimal permissions.
