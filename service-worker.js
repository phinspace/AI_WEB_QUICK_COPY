/**
 * AI Quick Copy v1.5
 * Responsibility:
 * - open the settings page from the toolbar icon;
 * - "copy all AI tabs" (Alt+C, macOS Control+C, or double Ctrl+C on an AI
 *   page): gather the latest response of every ticked AI tab in the
 *   current window and put them on the clipboard in one copy.
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

const AI_BY_HOST = {
  "chatgpt.com": { id: "chatgpt", name: "CHATGPT" },
  "chat.openai.com": { id: "chatgpt", name: "CHATGPT" },
  "gemini.google.com": { id: "gemini", name: "GEMINI" },
  "grok.com": { id: "grok", name: "GROK" },
  "x.com": { id: "grok", name: "GROK" },
  "claude.ai": { id: "claude", name: "CLAUDE" }
};

const BADGE_DURATION = 2500;

let copying = false;

// Toolbar icon opens the settings page.
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === COMMAND_COPY_ALL) copyAllFromCommand(tab);
});

// Double Ctrl+C on an AI page: the page asks for the text and writes the
// clipboard itself, from the user's own key press.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "aqc:copy-all" || !sender.tab) return false;

  gather(sender.tab.windowId).then(sendResponse, () => sendResponse(null));
  return true;
});

function aiOf(tab) {
  try {
    const host = new URL(tab.url).hostname.replace(/^www\./, "");
    return AI_BY_HOST[host] || { id: "", name: host };
  } catch (_) {
    return { id: "", name: "AI" };
  }
}

// Only `include` is needed here; anything not explicitly unticked is on.
async function loadInclude() {
  try {
    const { settings } = await chrome.storage.sync.get("settings");
    return settings?.include || {};
  } catch (_) {
    return {};
  }
}

// A tab that is frozen or busy must not hold up the whole copy.
const COLLECT_TIMEOUT = 2000;

// Ask one tab for its latest response. A tab opened before the extension
// was installed or updated has no content script and does not answer.
// A tab still loading may simply not have its content script yet.
async function collect(tab) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ ok: false, reason: "timeout" }), COLLECT_TIMEOUT);
  });

  try {
    const reply = await Promise.race([
      chrome.tabs.sendMessage(tab.id, { type: "aqc:collect-latest" }),
      timeout
    ]);
    if (reply?.reason !== "timeout" && reply) return reply;
    return { ok: false, reason: tab.status === "loading" ? "loading" : (reply?.reason || "no-script") };
  } catch (_) {
    return { ok: false, reason: tab.status === "loading" ? "loading" : "no-script" };
  } finally {
    clearTimeout(timer);
  }
}

// Toast lines for the tabs that gave no answer, grouped by reason.
const SKIP_LABELS = {
  empty: "⚠️ Chưa có câu trả lời",
  loading: "⏳ Đang tải, thử lại sau giây lát",
  timeout: "⌛ Không phản hồi",
  "no-script": "↻ Cần tải lại tab",
  discarded: "💤 Tab đang ngủ, mở tab đó rồi thử lại"
};

function skipLines(skipped) {
  return Object.keys(SKIP_LABELS)
    .map((reason) => {
      const names = skipped
        .filter((item) => item.reason === reason)
        .map((item) => item.name);
      return names.length ? `${SKIP_LABELS[reason]}: ${names.join(", ")}` : null;
    })
    .filter(Boolean);
}

/**
 * Gather the latest response of every included AI tab in `windowId`.
 * Returns { text, message, kind, duration }; text is "" when nothing
 * could be copied.
 */
async function gather(windowId) {
  const include = await loadInclude();

  // Only the window the user is in: other windows can hold unrelated chats.
  const tabs = (await chrome.tabs.query(
    windowId !== undefined ? { url: AI_TAB_URLS, windowId } : { url: AI_TAB_URLS, lastFocusedWindow: true }
  )).sort((a, b) => a.index - b.index);

  const wanted = tabs.filter((tab) => include[aiOf(tab).id] !== false);
  const excluded = [...new Set(
    tabs.filter((tab) => !wanted.includes(tab)).map((tab) => aiOf(tab).name)
  )];

  const results = await Promise.all(
    wanted.map(async (tab) => ({
      tab,
      reply: tab.discarded ? { ok: false, reason: "discarded" } : await collect(tab)
    }))
  );

  const copied = results.filter(({ reply }) => reply.ok && reply.text);
  const skipped = results
    .filter(({ reply }) => !(reply.ok && reply.text))
    .map(({ tab, reply }) => ({ reason: reply.reason || "empty", name: reply.name || aiOf(tab).name }));

  const extra = skipLines(skipped);
  if (excluded.length) extra.push(`🚫 Đã bỏ tích trong cài đặt: ${excluded.join(", ")}`);

  if (!copied.length) {
    let headline = "Không lấy được câu trả lời AI nào trong cửa sổ này.";
    if (!tabs.length) headline = "Cửa sổ này chưa mở tab ChatGPT / Gemini / Grok / Claude nào.";
    else if (!wanted.length) headline = "Các AI đang mở đều đã bị bỏ tích trong cài đặt.";

    return { text: "", message: [headline, ...extra].join("\n"), kind: "error", duration: 4500 };
  }

  const blockMode = copied.every(({ reply }) => reply.blockMode);
  const text = copied
    .map(({ reply }) => reply.text.trim())
    .join(blockMode ? "\n\n" : "\n\n---\n\n") + "\n";

  return {
    text,
    message: [
      `⚡ Đã copy ${copied.length} câu trả lời`,
      copied.map(({ reply }) => reply.title).join(" · "),
      ...extra
    ].join("\n"),
    kind: extra.length ? "hint" : "success",
    duration: extra.length ? 4500 : 2200
  };
}

// Alt+C (macOS: Control+C), from any tab.
async function copyAllFromCommand(commandTab) {
  if (copying) return;
  copying = true;

  let activeTab = commandTab;

  try {
    if (activeTab?.id === undefined) {
      [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    }

    const result = await gather(activeTab?.windowId);
    await deliver(activeTab, result.text, result.message, result.kind, result.duration);
  } catch (_) {
    await deliver(activeTab, "", "Không thể copy. Hãy thử lại.", "error");
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
      // Fails when the page is not focused (address bar, DevTools...).
      // Never wait on a permission prompt either.
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => setTimeout(reject, 1500))
      ]);
      ok = true;
    } catch (_) {}
  }

  const colors = { success: "#111827", error: "#b42318", hint: "#b45309" };
  const failed = Boolean(text) && !ok;

  document.getElementById("ai-quick-copy-toast")?.remove();

  const toast = document.createElement("div");
  toast.id = "ai-quick-copy-toast";
  toast.textContent = failed
    ? "Không thể copy.\n👉 Bấm vào trang rồi nhấn lại phím tắt."
    : message;
  toast.style.cssText = [
    "position:fixed", "right:20px", "bottom:20px", "z-index:2147483647",
    "padding:10px 14px", "border-radius:10px",
    "font:600 13px/1.25 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "color:#fff", "background:" + colors[failed ? "error" : kind],
    "max-width:360px", "white-space:pre-line",
    "box-shadow:0 8px 24px rgba(0,0,0,.22)", "pointer-events:none"
  ].join(";");
  document.documentElement.appendChild(toast);
  setTimeout(() => toast.remove(), failed ? 4500 : duration);

  return ok;
}

// Copy `text` (or only show `message` when text is empty) on the active tab.
// On pages where extensions cannot run (browser settings, the add-ons store,
// the new tab page...) nothing can be copied: flash a red "!" on the icon.
async function deliver(tab, text, message, kind, duration = 4500) {
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

  try {
    await chrome.action.setBadgeBackgroundColor({ color: "#b42318" });
    await chrome.action.setBadgeText({ text: "!" });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), BADGE_DURATION);
  } catch (_) {}
  return false;
}
