/**
 * AI Quick Copy v1.5
 * Responsibility:
 * - open the settings page from the toolbar icon;
 * - "copy-all-latest" command (Alt+Shift+V): gather the latest response of
 *   every AI tab in the current window and put them on the clipboard in
 *   one copy, from the tab the user is on.
 */

const COMMAND_COPY_ALL = "copy-all-latest";

// Tabs that can hold an AI chat. On x.com only Grok pages count, so the
// generic fallback never picks up a random post.
const AI_TAB_URLS = [
  "https://chatgpt.com/*",
  "https://chat.openai.com/*",
  "https://gemini.google.com/*",
  "https://grok.com/*",
  "https://x.com/i/grok*",
  "https://claude.ai/*"
];

const NAME_BY_HOST = {
  "chatgpt.com": "CHATGPT",
  "chat.openai.com": "CHATGPT",
  "gemini.google.com": "GEMINI",
  "grok.com": "GROK",
  "x.com": "GROK",
  "claude.ai": "CLAUDE"
};

const BADGE_DURATION = 2500;

let copying = false;

// Toolbar icon opens the settings page.
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === COMMAND_COPY_ALL) copyAllLatest(tab);
});

function nameOf(tab) {
  try {
    const host = new URL(tab.url).hostname.replace(/^www\./, "");
    return NAME_BY_HOST[host] || host;
  } catch (_) {
    return "AI";
  }
}

// Ask one tab for its latest response. A tab opened before the extension
// was installed or updated has no content script and does not answer.
async function collect(tab) {
  try {
    const reply = await chrome.tabs.sendMessage(tab.id, { type: "aqc:collect-latest" });
    return reply || { ok: false, reason: "no-script" };
  } catch (_) {
    return { ok: false, reason: "no-script" };
  }
}

async function copyAllLatest(commandTab) {
  if (copying) return;
  copying = true;

  try {
    const activeTab = commandTab?.id !== undefined
      ? commandTab
      : (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];

    // Only the window the user is in: other windows can hold unrelated chats.
    const tabs = (await chrome.tabs.query({
      url: AI_TAB_URLS,
      ...(activeTab ? { windowId: activeTab.windowId } : { lastFocusedWindow: true })
    }))
      .filter((tab) => !tab.discarded)
      .sort((a, b) => a.index - b.index);

    const results = await Promise.all(
      tabs.map(async (tab) => ({ tab, reply: await collect(tab) }))
    );

    const copied = results.filter(({ reply }) => reply.ok && reply.text);
    const empty = results.filter(({ reply }) => !reply.ok && reply.reason === "empty");
    const needReload = results.filter(({ reply }) => !reply.ok && reply.reason === "no-script");

    if (!copied.length) {
      let message = tabs.length
        ? "Không tìm thấy câu trả lời AI nào trong các tab của cửa sổ này."
        : "Cửa sổ này chưa mở tab ChatGPT / Gemini / Grok / Claude nào.";

      if (needReload.length) {
        message += `\n↻ Tải lại ${needReload.length} tab AI rồi thử lại.`;
      }

      await deliver(activeTab, "", message, "error", "!");
      return;
    }

    const blockMode = copied.every(({ reply }) => reply.blockMode);
    const text = copied
      .map(({ reply }) => reply.text.trim())
      .join(blockMode ? "\n\n" : "\n\n---\n\n") + "\n";

    const lines = [
      `⚡ Đã copy ${copied.length} câu trả lời`,
      copied.map(({ reply }) => reply.title).join(" · ")
    ];

    if (empty.length) {
      lines.push(`⚠️ Chưa có câu trả lời: ${empty.map(({ reply, tab }) => reply.name || nameOf(tab)).join(", ")}`);
    }

    if (needReload.length) {
      lines.push(`↻ ${needReload.length} tab cần tải lại: ${needReload.map(({ tab }) => nameOf(tab)).join(", ")}`);
    }

    const warned = empty.length || needReload.length;

    await deliver(
      activeTab,
      text,
      lines.join("\n"),
      warned ? "hint" : "success",
      String(copied.length),
      warned ? 4500 : 2200
    );
  } finally {
    copying = false;
  }
}

// Runs inside the page the user is on (any site: the command grants
// activeTab). Writes the clipboard there, since a service worker has none,
// and shows the same toast as the Ctrl+C copy.
async function pageCopy(text, message, kind, duration) {
  let ok = false;

  if (text) {
    try {
      // Never wait on a permission prompt: fall back after a moment.
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => setTimeout(reject, 1500))
      ]);
      ok = true;
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position:fixed;left:-9999px;top:0";
      document.documentElement.appendChild(textarea);
      textarea.select();
      try { ok = document.execCommand("copy"); } catch (_) {}
      textarea.remove();
    }
  }

  const colors = { success: "#111827", error: "#b42318", hint: "#b45309" };
  const failed = text && !ok;

  document.getElementById("ai-quick-copy-toast")?.remove();

  const toast = document.createElement("div");
  toast.id = "ai-quick-copy-toast";
  toast.textContent = failed ? "Không thể copy. Hãy thử lại." : message;
  toast.style.cssText = [
    "position:fixed", "right:20px", "bottom:20px", "z-index:2147483647",
    "padding:10px 14px", "border-radius:10px",
    "font:600 13px/1.25 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "color:#fff", "background:" + colors[failed ? "error" : kind],
    "max-width:360px", "white-space:pre-line",
    "box-shadow:0 8px 24px rgba(0,0,0,.22)", "pointer-events:none"
  ].join(";");
  document.documentElement.appendChild(toast);
  setTimeout(() => toast.remove(), duration);

  return ok;
}

// Copy `text` (or only show `message` when text is empty) on the active tab.
// Pages where extensions cannot run (browser settings, the web store, the
// new tab page...) fall back to the toolbar badge.
async function deliver(tab, text, message, kind, badge, duration = 4500) {
  if (tab?.id !== undefined) {
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: pageCopy,
        args: [text, message, kind, duration]
      });
      return text ? Boolean(result?.result) : true;
    } catch (_) {}
  }

  const failed = Boolean(text);

  await chrome.action.setBadgeBackgroundColor({ color: failed || kind === "error" ? "#b42318" : "#047857" });
  await chrome.action.setBadgeText({ text: failed ? "!" : badge });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), BADGE_DURATION);
  return false;
}
