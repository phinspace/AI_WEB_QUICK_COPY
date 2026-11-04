const Settings = window.AIQuickCopySettings;

const blockModeInput = document.getElementById("blockMode");
const rolesFieldset = document.getElementById("roles");
const roleInputs = [...document.querySelectorAll("[data-role]")];
const includeInputs = [...document.querySelectorAll("[data-include]")];
const doubleInput = document.getElementById("doubleCopyAll");
const allStatus = document.getElementById("allStatus");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

let statusTimer = null;
let saveTimer = null;

function readForm() {
  const roles = {};

  for (const input of roleInputs) {
    roles[input.dataset.role] = input.value;
  }

  const include = {};

  for (const input of includeInputs) {
    include[input.dataset.include] = input.checked;
  }

  return {
    blockMode: blockModeInput.checked,
    roles,
    include,
    doubleCopyAll: doubleInput.checked
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

// The status line next to the control that changed.
let statusTarget = status;

function showStatus(message) {
  const target = statusTarget;
  status.textContent = "";
  allStatus.textContent = "";
  target.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    target.textContent = "";
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
  statusTarget = event.target.closest("#roles, #blockMode")
    ? status
    : allStatus;
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

// "Alt+C" (Windows/Linux) or "⌃⇧C" (macOS) → one <kbd> per key.
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

  for (const input of includeInputs) {
    input.checked = settings.include[input.dataset.include] !== false;
    input.addEventListener("change", onChange);
  }

  doubleInput.checked = settings.doubleCopyAll;
  doubleInput.addEventListener("change", onChange);

  renderPreview(settings);

  blockModeInput.addEventListener("change", onChange);
  roleInputs.forEach((input) => input.addEventListener("input", onChange));
}

init();
