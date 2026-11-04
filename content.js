/**
 * AI Quick Copy v1.5
 * Responsibility: route the copy actions to the correct site adapter.
 */

(() => {
  const AQC = window.AIQuickCopy;
  const Settings = window.AIQuickCopySettings;
  const adapters = window.AIQuickCopyAdapters || {};

  function getAdapter() {
    const host = window.location.hostname.replace(/^www\./, "");

    for (const adapter of Object.values(adapters)) {
      if (adapter.matches(host)) return adapter;
    }

    return null;
  }

  const IS_MAC = /mac|iphone|ipad/i.test(
    navigator.userAgentData?.platform || navigator.platform
  );
  const COPY_KEY = IS_MAC ? "⌘C" : "Ctrl+C";

  const HINT_DURATION = 4500;
  const SELECT_HINT =
    "Không nhận diện được câu trả lời.\n" +
    `👉 Bôi đen đoạn cần copy rồi nhấn ${COPY_KEY}.`;

  /**
   * What to copy, in order of priority:
   * 1. the text the user highlighted;
   * 2. the response the user is reading (on screen);
   * 3. the latest response.
   */
  function findSource(adapter) {
    const selection = AQC.getSelectionElement();
    if (selection) return { element: selection, excerpt: true };

    const responses = adapter.findAll();
    const element =
      AQC.pickInView(responses) ||
      AQC.pickLatest(AQC.innermost(responses));

    return element ? { element, excerpt: false } : null;
  }

  function identityOf(adapter, settings) {
    return {
      id: adapter.id,
      name: adapter.name,
      icon: adapter.icon,
      role: settings.roles[adapter.id] || "",
      host: window.location.hostname.replace(/^www\./, "")
    };
  }

  // Markdown for one response, wrapped in an identity block when enabled.
  function render(adapter, source, settings) {
    const markdown = AQC.toMarkdown(source.element, {
      headingOffset: settings.blockMode ? AQC.BLOCK_HEADING_OFFSET : 0
    });

    if (!markdown) return null;

    const identity = identityOf(adapter, settings);

    return {
      identity,
      text: settings.blockMode
        ? AQC.toBlock(markdown, { ...identity, excerpt: source.excerpt })
        : markdown
    };
  }

  async function copyResponse() {
    const now = Date.now();

    if (now - AQC.state.lastTriggerAt < 500) return;
    AQC.state.lastTriggerAt = now;

    const adapter = getAdapter();

    if (!adapter) {
      AQC.showToast("Trang này chưa được hỗ trợ.", "error");
      return;
    }

    const source = findSource(adapter);

    if (!source) {
      AQC.showToast(SELECT_HINT, "hint", HINT_DURATION);
      return;
    }

    const settings = await Settings.load();
    const result = render(adapter, source, settings);

    if (!result) {
      AQC.showToast(SELECT_HINT, "hint", HINT_DURATION);
      return;
    }

    if (!settings.blockMode) {
      await AQC.copyText(
        result.text,
        source.excerpt ? "⚡ Đã copy đoạn bôi đen · Markdown" : undefined
      );
      return;
    }

    const copied = source.excerpt ? "Đã copy đoạn bôi đen" : "Đã copy";

    await AQC.copyText(
      result.text,
      `⚡ ${copied} · ${AQC.blockTitle(result.identity)}`
    );
  }

  // Double Ctrl+C / ⌘C (opt-in): the second press within this delay copies
  // all AI tabs instead of the answer on screen.
  const DOUBLE_PRESS_MS = 450;
  let lastCopyPressAt = 0;
  let doubleCopyAll = false;

  Settings.load().then((settings) => {
    doubleCopyAll = settings.doubleCopyAll;
  });

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes.settings) {
        doubleCopyAll = changes.settings.newValue?.doubleCopyAll === true;
      }
    });
  } catch (_) {}

  // The service worker gathers the AI tabs of this window; the clipboard is
  // written here, from the user's key press.
  async function copyAll() {
    let result = null;

    try {
      result = await chrome.runtime.sendMessage({ type: "aqc:copy-all" });
    } catch (_) {}

    if (!result) {
      AQC.showToast("Không thể copy. Hãy thử lại.", "error");
      return;
    }

    if (!result.text) {
      AQC.showToast(result.message, result.kind, result.duration);
      return;
    }

    await AQC.copyText(result.text, result.message, {
      type: result.kind,
      duration: result.duration
    });
  }

  /**
   * "Copy all AI tabs" (Alt+C, or double Ctrl+C): the service worker asks every AI tab
   * for its latest response and copies them together. The latest one is
   * used even when the user scrolled up, and selections are ignored.
   */
  async function collectLatest() {
    const adapter = getAdapter();
    if (!adapter) return { ok: false, reason: "unsupported" };

    const element = AQC.pickLatest(AQC.innermost(adapter.findAll()));
    const settings = await Settings.load();
    const result = element && render(adapter, { element, excerpt: false }, settings);

    if (!result) return { ok: false, reason: "empty", name: adapter.name };

    return {
      ok: true,
      name: adapter.name,
      title: AQC.blockTitle(result.identity),
      blockMode: settings.blockMode,
      text: result.text
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "aqc:collect-latest") {
      collectLatest().then(
        sendResponse,
        () => sendResponse({ ok: false, reason: "empty", name: getAdapter()?.name })
      );
      return true;
    }

    return false;
  });

  function isEditable(element) {
    return (
      element instanceof HTMLElement &&
      (
        element.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)
      )
    );
  }

  function hasSelection() {
    const selection = window.getSelection();
    return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.repeat) return;

      // Ctrl+C on Windows/Linux, ⌘C on macOS.
      const isCopy =
        (IS_MAC ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "c";

      if (!isCopy) return;

      // Never hijack copy while the user is typing.
      if (isEditable(event.target) || isEditable(document.activeElement)) return;

      // Text is highlighted: let the browser copy it as usual.
      if (hasSelection()) return;

      // Nothing highlighted: the browser would copy nothing, so copy the
      // response on screen instead (or every AI tab on a double press).
      event.preventDefault();
      event.stopPropagation();

      const now = Date.now();
      const isDouble = doubleCopyAll && now - lastCopyPressAt < DOUBLE_PRESS_MS;
      lastCopyPressAt = isDouble ? 0 : now;

      if (isDouble) copyAll();
      else copyResponse();
    },
    true
  );
})();
