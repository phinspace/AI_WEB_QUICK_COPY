# Privacy Policy — AI Quick Copy

*Last updated: 2026-11-04*

AI Quick Copy is a browser extension that copies the AI response you are reading on ChatGPT, Gemini, Grok, or Claude to your clipboard as Markdown.

## Summary

**AI Quick Copy does not collect, transmit, sell, or share any personal data.** It has no server, no analytics, and makes no network requests.

## What the extension accesses

- **Page content on supported sites only** (`chatgpt.com`, `chat.openai.com`, `gemini.google.com`, `grok.com`, `x.com`, `claude.ai`). When you press `Ctrl+C` (`⌘C` on macOS) with nothing selected, the extension reads the AI response on screen, converts it to Markdown inside the tab, and writes it to your clipboard. That text is never stored and never leaves your device.
- **Copy all AI tabs (`Alt+C`, or `Ctrl+C` twice when that option is on).** When you use it, the extension asks each tab on the supported sites in the current window for its latest AI response, combines them, and writes the result to your clipboard from the tab you are on (that is the only use of the `activeTab` and `scripting` permissions). Nothing is read from that tab, and nothing is stored or sent anywhere.
- **Your clipboard (write only).** The extension writes the converted Markdown to the clipboard when you press a shortcut. It never reads your clipboard.

## What the extension stores

Only your settings: whether AI identity blocks are on, the optional role you gave each AI (for example "Secretary"), which AIs "copy all AI tabs" gathers, and whether double `Ctrl+C` is on. They are saved with the browser's `storage.sync` API, so if you are signed in to your browser with sync turned on, your browser may sync these settings across your devices through your browser provider's account. The extension developer never receives them.

Copied responses are never stored.

## What the extension does not do

- No accounts, API keys, or sign-in
- No analytics, telemetry, tracking, or ads
- No access to browsing history, cookies, or bookmarks; no reading of other websites
- No remote code: everything that runs is included in the extension package

## Changes

If this policy changes, the updated version will be published at this address with a new "Last updated" date.

## Contact

Questions: open an issue at <https://github.com/phinspace/AI_WEB_QUICK_COPY/issues>.
