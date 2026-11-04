# AI Quick Copy Architecture — v1.5

```text
Ctrl+C / ⌘C (keydown in the page)
      │
      ▼
content.js
      │
      ▼
selection? ──yes──► selected passage (excerpt)
      │ no
      ▼
site adapter → all responses
      │
      ▼
core.js → pick the one on screen (else the latest)
      │
      ▼
core.js → clone / cleanup
      │
      ▼
markdown.js
      │
      ▼
block.js (if identity blocks are on)
      │
      ▼
Markdown string
      │
      ▼
Clipboard
```

## Separation of responsibilities

### `sites/*.js`

Only answer:

> Where are the AI responses on this page?

Adapters return every response they find (`findAll()`); they do not decide which one to copy. `core.js` picks the one on screen (`pickInView`), falling back to the latest (`pickLatest`).

Each adapter also exposes its identity (`id`, `name`, `icon`), used for the identity block.

They should not contain clipboard logic or Markdown serialization.

### `markdown.js`

Only answer:

> How do we convert this response DOM into Markdown?

It should not know whether the source is ChatGPT, Gemini, Grok or Claude.

### `block.js`

Wraps the Markdown in an identity block (AI name, role, source, timestamp, footer). It receives the adapter's `id` / `name` / `icon` as plain data and does not know how the response was found.

### `settings.js`

Loads and saves user settings (`chrome.storage.sync`). Shared by the content scripts and the options page. Only settings are stored, never copied content.

### `core.js`

Shared browser utilities:

- visibility checks
- selector helpers
- picking the response on screen / the latest one
- reading the user's selection
- DOM clone/cleanup
- clipboard
- toast

### `content.js`

Coordinates the workflow.

## Hotkey

`content.js` listens for `keydown` (capture phase):

```text
Ctrl+C / ⌘C
 ├── typing in an input or text highlighted → browser copies as usual
 └── nothing highlighted → copy the response on screen
```

`Ctrl+C` is deliberately not a browser command (one would take over copy on every website), and the extension only acts when the browser would copy nothing. A 500ms guard prevents duplicate execution. The only browser command is `Alt+C` (below).

## Copy all AI tabs (`Alt+C` / macOS `Control+C`, or double `Ctrl+C`)

```text
chrome.commands "copy-all-latest"        double Ctrl+C in content.js (opt-in)
      │                                      │ runtime.sendMessage("aqc:copy-all")
      ▼                                      ▼
service-worker.js gather() → drop unticked AIs (settings.include) → tabs.query(AI sites in the current window; x.com only /i/grok*)
      │  for each tab: tabs.sendMessage("aqc:collect-latest")
      ▼
content.js → adapter.findAll() → pickLatest → markdown.js → block.js
      │  reply { ok, title, text } | { ok:false, reason:"empty" }
      ▼
service-worker.js → join in tab order
      │
      ▼
scripting.executeScript(active tab, activeTab) → clipboard + toast
      │  (browser pages where scripts cannot run → toolbar badge)
```

For the double `Ctrl+C`, `gather()` returns the text to the page that asked, which writes the clipboard itself from the user's key press (no `activeTab` needed). The command path delivers it with `scripting.executeScript` instead.

A tab that does not answer has no content script (opened before the extension was installed/updated) and is reported as "needs reload". The service worker has no clipboard, so it writes from the tab the user is on; `activeTab` is granted by the command, so this works on any normal page. An offscreen document is not used: writing the clipboard from it without a user gesture would require the `clipboardWrite` permission, which adds an install warning.

## Why not use `innerText`?

`innerText` loses semantic information.

For example:

```html
<h2>Section</h2>
<blockquote>Important</blockquote>
<pre><code>print("x")</code></pre>
```

becomes plain text.

The serializer reads the DOM tags and reconstructs Markdown instead.
