/**
 * AI Quick Copy v1.5
 * Responsibility: user settings shared by content scripts and the options page.
 *
 * Only settings are stored (chrome.storage.sync). Copied responses are never stored.
 */

(() => {
  const DEFAULTS = {
    blockMode: true,
    roles: {
      chatgpt: "",
      gemini: "",
      grok: "",
      claude: ""
    },
    // AIs gathered by "copy all AI tabs" (Alt+C). Ctrl+C ignores this.
    include: {
      chatgpt: true,
      gemini: true,
      grok: true,
      claude: true
    },
    // Pressing Ctrl+C / ⌘C twice quickly copies all AI tabs. Off by default:
    // many people press Ctrl+C twice out of habit.
    doubleCopyAll: false
  };

  const ROLE_MAX_LENGTH = 40;

  // Roles end up in a Markdown heading and an HTML comment attribute,
  // so keep them on one line and free of characters that would break either.
  const cleanRole = (value) => {
    return String(value || "")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/["<>`*_#|\\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, ROLE_MAX_LENGTH);
  };

  const withDefaults = (stored) => {
    const roles = { ...DEFAULTS.roles };
    const include = { ...DEFAULTS.include };

    for (const id of Object.keys(roles)) {
      roles[id] = cleanRole(stored?.roles?.[id]);
      // Settings saved before v1.5 have no `include`: everything is on.
      include[id] = stored?.include?.[id] !== false;
    }

    return {
      blockMode: typeof stored?.blockMode === "boolean"
        ? stored.blockMode
        : DEFAULTS.blockMode,
      roles,
      include,
      doubleCopyAll: stored?.doubleCopyAll === true
    };
  };

  const load = async () => {
    try {
      const { settings } = await chrome.storage.sync.get("settings");
      return withDefaults(settings);
    } catch (_) {
      // Storage unavailable (e.g. extension reloaded under an open tab).
      return withDefaults(null);
    }
  };

  const save = async (settings) => {
    const clean = withDefaults(settings);
    await chrome.storage.sync.set({ settings: clean });
    return clean;
  };

  window.AIQuickCopySettings = {
    DEFAULTS,
    ROLE_MAX_LENGTH,
    cleanRole,
    load,
    save
  };
})();
