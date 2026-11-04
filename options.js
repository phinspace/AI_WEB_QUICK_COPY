const Settings = window.AIQuickCopySettings;

const blockModeInput = document.getElementById("blockMode");
const rolesFieldset = document.getElementById("roles");
const roleInputs = [...document.querySelectorAll("[data-role]")];
const preview = document.getElementById("preview");
const status = document.getElementById("status");

let statusTimer = null;
let saveTimer = null;

function readForm() {
  const roles = {};

  for (const input of roleInputs) {
    roles[input.dataset.role] = input.value;
  }

  return {
    blockMode: blockModeInput.checked,
    roles
  };
}

function renderPreview(settings) {
  rolesFieldset.disabled = !settings.blockMode;

  if (!settings.blockMode) {
    preview.textContent = "...nội dung câu trả lời (Markdown thuần, không có header)...";
    return;
  }

  const role = Settings.cleanRole(settings.roles.gemini);
  const title = role ? `GEMINI · ${role}` : "GEMINI";
  const roleAttr = role ? ` role="${role}"` : "";

  preview.textContent = [
    `<!-- aqc:start ai="gemini"${roleAttr} -->`,
    `## 🟦 ${title}`,
    "*gemini.google.com · 2026-10-02 14:32*",
    "",
    "...nội dung câu trả lời...",
    "",
    `*— End of answer · ${title} —*`,
    "<!-- aqc:end -->",
    "",
    "---"
  ].join("\n");
}

function showStatus(message) {
  status.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    status.textContent = "";
  }, 1500);
}

async function save() {
  try {
    await Settings.save(readForm());
    showStatus("✓ Đã lưu");
  } catch (_) {
    showStatus("Không lưu được cài đặt.");
  }
}

function onChange(event) {
  renderPreview(readForm());

  // Text fields save after typing pauses; the checkbox saves immediately.
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, event.target.type === "text" ? 400 : 0);
}

function showVersion() {
  const version = `v${chrome.runtime.getManifest().version}`;
  document.querySelectorAll("[data-version]").forEach((el) => {
    el.textContent = version;
  });
}

const COMMAND_COPY_ALL = "copy-all-latest";

// "Alt+Shift+V" (Windows/Linux) or "⌥⇧V" (macOS) → one <kbd> per key.
function shortcutKeys(shortcut) {
  return shortcut.includes("+") ? shortcut.split("+") : [...shortcut];
}

async function showShortcut() {
  const target = document.getElementById("allShortcut");
  let shortcut = "";

  try {
    const commands = await chrome.commands.getAll();
    shortcut = commands.find((c) => c.name === COMMAND_COPY_ALL)?.shortcut || "";
  } catch (_) {}

  target.replaceChildren();

  if (!shortcut) {
    // The suggested key was already taken (by the browser or another extension).
    const unset = document.createElement("span");
    unset.className = "unset";
    unset.textContent = "Chưa gán — bấm “Đổi phím tắt” để chọn";
    target.append(unset);
    return;
  }

  shortcutKeys(shortcut).forEach((key, i) => {
    if (i) {
      const plus = document.createElement("b");
      plus.textContent = "+";
      target.append(plus);
    }
    const kbd = document.createElement("kbd");
    kbd.textContent = key;
    target.append(kbd);
  });
}

function openShortcutSettings() {
  // Edge redirects chrome:// to edge://.
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
}

async function init() {
  showVersion();
  showShortcut();
  document.getElementById("changeShortcut").addEventListener("click", openShortcutSettings);
  // Pick up a shortcut changed in the browser settings.
  window.addEventListener("focus", showShortcut);

  const settings = await Settings.load();

  blockModeInput.checked = settings.blockMode;

  for (const input of roleInputs) {
    input.maxLength = Settings.ROLE_MAX_LENGTH;
    input.value = settings.roles[input.dataset.role] || "";
  }

  renderPreview(settings);

  blockModeInput.addEventListener("change", onChange);
  roleInputs.forEach((input) => input.addEventListener("input", onChange));
}

init();
