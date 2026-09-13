"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var import_node_os = __toESM(require("node:os"));

// src/config-parser.ts
function parseZedSettings(raw) {
  const cleaned = stripJsoncComments(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}
function extractTerminalConfig(settings) {
  const config = {};
  const termFontFamily = settings.terminal?.font_family ?? settings.buffer_font_family;
  if (termFontFamily) {
    config.fontFamily = termFontFamily;
  }
  const termFontSize = settings.terminal?.font_size ?? settings.buffer_font_size;
  if (typeof termFontSize === "number") {
    config.fontSize = termFontSize;
  }
  if (settings.terminal?.blinking === "on") {
    config.cursorBlink = true;
  } else if (settings.terminal?.blinking === "off") {
    config.cursorBlink = false;
  }
  if (settings.terminal?.line_height?.custom) {
    config.cellHeight = settings.terminal.line_height.custom;
  }
  return config;
}
function resolveActiveThemeName(settings) {
  const mode = settings.theme?.mode ?? "dark";
  if (mode === "light") {
    return settings.theme?.light ?? "One Light";
  }
  return settings.theme?.dark ?? "Ayu Dark";
}
function stripJsoncComments(raw) {
  let result = "";
  let inString = false;
  let escapeNext = false;
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (escapeNext) {
      result += ch;
      escapeNext = false;
      i++;
      continue;
    }
    if (ch === "\\" && inString) {
      result += ch;
      escapeNext = true;
      i++;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      i++;
      continue;
    }
    if (inString) {
      result += ch;
      i++;
      continue;
    }
    if (ch === "/" && raw[i + 1] === "/") {
      while (i < raw.length && raw[i] !== "\n") {
        i++;
      }
      continue;
    }
    if (ch === "/" && raw[i + 1] === "*") {
      i += 2;
      while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) {
        i++;
      }
      i += 2;
      continue;
    }
    result += ch;
    i++;
  }
  return result;
}

// src/presets.ts
var ZED_THEME_MAP = {
  "Ayu Dark": {
    background: "#0b0e14",
    foreground: "#bfbdb6",
    cursor: "#e6b450",
    cursorAccent: "#0b0e14",
    selectionBackground: "#409fff4d",
    selectionForeground: "#bfbdb6",
    black: "#01060e",
    red: "#ea6c73",
    green: "#91b362",
    yellow: "#f9af4f",
    blue: "#53bdfa",
    magenta: "#fae994",
    cyan: "#90e1c6",
    white: "#c7c7c7",
    brightBlack: "#686868",
    brightRed: "#f07178",
    brightGreen: "#c2d94c",
    brightYellow: "#ffb454",
    brightBlue: "#59c2ff",
    brightMagenta: "#ffee99",
    brightCyan: "#95e6cb",
    brightWhite: "#ffffff"
  },
  "Ayu Light": {
    background: "#fafafa",
    foreground: "#5c6166",
    cursor: "#ff9940",
    cursorAccent: "#fafafa",
    selectionBackground: "#035bd626",
    selectionForeground: "#5c6166",
    black: "#000000",
    red: "#f07171",
    green: "#86b300",
    yellow: "#f2ae49",
    blue: "#399ee6",
    magenta: "#a37acc",
    cyan: "#4cbf99",
    white: "#abb0b6",
    brightBlack: "#4a5767",
    brightRed: "#e65050",
    brightGreen: "#6cbf43",
    brightYellow: "#f0a22e",
    brightBlue: "#73b8ff",
    brightMagenta: "#d4bfff",
    brightCyan: "#5ebdab",
    brightWhite: "#fafafa"
  },
  "Ayu Mirage": {
    background: "#1f2430",
    foreground: "#cbccc6",
    cursor: "#ffcc66",
    cursorAccent: "#1f2430",
    selectionBackground: "#409fff4d",
    selectionForeground: "#cbccc6",
    black: "#191e2a",
    red: "#ed8274",
    green: "#a6cc70",
    yellow: "#fad07b",
    blue: "#6dcbfa",
    magenta: "#cfbafa",
    cyan: "#90e1c6",
    white: "#c7c7c7",
    brightBlack: "#686868",
    brightRed: "#f28779",
    brightGreen: "#bae67e",
    brightYellow: "#ffd580",
    brightBlue: "#73d0ff",
    brightMagenta: "#d4bfff",
    brightCyan: "#95e6cb",
    brightWhite: "#ffffff"
  },
  "One Dark": {
    background: "#282c34",
    foreground: "#abb2bf",
    cursor: "#528bff",
    cursorAccent: "#282c34",
    selectionBackground: "#3e4451",
    selectionForeground: "#abb2bf",
    black: "#282c34",
    red: "#e06c75",
    green: "#98c379",
    yellow: "#e5c07b",
    blue: "#61afef",
    magenta: "#c678dd",
    cyan: "#56b6c2",
    white: "#abb2bf",
    brightBlack: "#5c6370",
    brightRed: "#e06c75",
    brightGreen: "#98c379",
    brightYellow: "#e5c07b",
    brightBlue: "#61afef",
    brightMagenta: "#c678dd",
    brightCyan: "#56b6c2",
    brightWhite: "#ffffff"
  },
  "One Light": {
    background: "#fafafa",
    foreground: "#383a42",
    cursor: "#526fff",
    cursorAccent: "#fafafa",
    selectionBackground: "#e5e5e6",
    selectionForeground: "#383a42",
    black: "#383a42",
    red: "#e45649",
    green: "#50a14f",
    yellow: "#c18401",
    blue: "#4078f2",
    magenta: "#a626a4",
    cyan: "#0184bc",
    white: "#a0a1a7",
    brightBlack: "#696c77",
    brightRed: "#e45649",
    brightGreen: "#50a14f",
    brightYellow: "#c18401",
    brightBlue: "#4078f2",
    brightMagenta: "#a626a4",
    brightCyan: "#0184bc",
    brightWhite: "#fafafa"
  },
  "Gruvbox Dark": {
    background: "#282828",
    foreground: "#ebdbb2",
    cursor: "#ebdbb2",
    cursorAccent: "#282828",
    selectionBackground: "#504945",
    selectionForeground: "#ebdbb2",
    black: "#282828",
    red: "#cc241d",
    green: "#98971a",
    yellow: "#d79921",
    blue: "#458588",
    magenta: "#b16286",
    cyan: "#689d6a",
    white: "#a89984",
    brightBlack: "#928374",
    brightRed: "#fb4934",
    brightGreen: "#b8bb26",
    brightYellow: "#fabd2f",
    brightBlue: "#83a598",
    brightMagenta: "#d3869b",
    brightCyan: "#8ec07c",
    brightWhite: "#ebdbb2"
  },
  "Catppuccin Mocha": {
    background: "#1e1e2e",
    foreground: "#cdd6f4",
    cursor: "#f5e0dc",
    cursorAccent: "#1e1e2e",
    selectionBackground: "#45475a",
    selectionForeground: "#cdd6f4",
    black: "#45475a",
    red: "#f38ba8",
    green: "#a6e3a1",
    yellow: "#f9e2af",
    blue: "#89b4fa",
    magenta: "#f5c2e7",
    cyan: "#94e2d5",
    white: "#bac2de",
    brightBlack: "#585b70",
    brightRed: "#f38ba8",
    brightGreen: "#a6e3a1",
    brightYellow: "#f9e2af",
    brightBlue: "#89b4fa",
    brightMagenta: "#f5c2e7",
    brightCyan: "#94e2d5",
    brightWhite: "#a6adc8"
  },
  "Nord": {
    background: "#2e3440",
    foreground: "#d8dee9",
    cursor: "#d8dee9",
    cursorAccent: "#2e3440",
    selectionBackground: "#434c5e",
    selectionForeground: "#eceff4",
    black: "#3b4252",
    red: "#bf616a",
    green: "#a3be8c",
    yellow: "#ebcb8b",
    blue: "#81a1c1",
    magenta: "#b48ead",
    cyan: "#88c0d0",
    white: "#e5e9f0",
    brightBlack: "#4c566a",
    brightRed: "#bf616a",
    brightGreen: "#a3be8c",
    brightYellow: "#ebcb8b",
    brightBlue: "#81a1c1",
    brightMagenta: "#b48ead",
    brightCyan: "#8fbcbb",
    brightWhite: "#eceff4"
  },
  "Ros\xE9 Pine": {
    background: "#191724",
    foreground: "#e0def4",
    cursor: "#524f67",
    cursorAccent: "#191724",
    selectionBackground: "#2a283e",
    selectionForeground: "#e0def4",
    black: "#26233a",
    red: "#eb6f92",
    green: "#31748f",
    yellow: "#f6c177",
    blue: "#9ccfd8",
    magenta: "#c4a7e7",
    cyan: "#ebbcba",
    white: "#e0def4",
    brightBlack: "#6e6a86",
    brightRed: "#eb6f92",
    brightGreen: "#31748f",
    brightYellow: "#f6c177",
    brightBlue: "#9ccfd8",
    brightMagenta: "#c4a7e7",
    brightCyan: "#ebbcba",
    brightWhite: "#e0def4"
  },
  "Tokyo Night": {
    background: "#1a1b26",
    foreground: "#c0caf5",
    cursor: "#c0caf5",
    cursorAccent: "#1a1b26",
    selectionBackground: "#33467c",
    selectionForeground: "#c0caf5",
    black: "#15161e",
    red: "#f7768e",
    green: "#9ece6a",
    yellow: "#e0af68",
    blue: "#7aa2f7",
    magenta: "#bb9af7",
    cyan: "#7dcfff",
    white: "#a9b1d6",
    brightBlack: "#414868",
    brightRed: "#f7768e",
    brightGreen: "#9ece6a",
    brightYellow: "#e0af68",
    brightBlue: "#7aa2f7",
    brightMagenta: "#bb9af7",
    brightCyan: "#7dcfff",
    brightWhite: "#c0caf5"
  },
  "Solarized Dark": {
    background: "#002b36",
    foreground: "#839496",
    cursor: "#839496",
    cursorAccent: "#002b36",
    selectionBackground: "#073642",
    selectionForeground: "#93a1a1",
    black: "#073642",
    red: "#dc322f",
    green: "#859900",
    yellow: "#b58900",
    blue: "#268bd2",
    magenta: "#d33682",
    cyan: "#2aa198",
    white: "#eee8d5",
    brightBlack: "#586e75",
    brightRed: "#cb4b16",
    brightGreen: "#859900",
    brightYellow: "#b58900",
    brightBlue: "#268bd2",
    brightMagenta: "#6c71c4",
    brightCyan: "#2aa198",
    brightWhite: "#fdf6e3"
  },
  "Dracula": {
    background: "#282a36",
    foreground: "#f8f8f2",
    cursor: "#f8f8f2",
    cursorAccent: "#282a36",
    selectionBackground: "#44475a",
    selectionForeground: "#f8f8f2",
    black: "#21222c",
    red: "#ff5555",
    green: "#50fa7b",
    yellow: "#f1fa8c",
    blue: "#bd93f9",
    magenta: "#ff79c6",
    cyan: "#8be9fd",
    white: "#f8f8f2",
    brightBlack: "#6272a4",
    brightRed: "#ff6e6e",
    brightGreen: "#69ff94",
    brightYellow: "#ffffa5",
    brightBlue: "#d6acff",
    brightMagenta: "#ff92df",
    brightCyan: "#a4ffff",
    brightWhite: "#ffffff"
  }
};
var ZED_PRESETS = Object.entries(ZED_THEME_MAP).map(([name, terminalTheme]) => ({
  id: `zed-${name.toLowerCase().replace(/\s+/g, "-")}`,
  label: name,
  terminalTheme
}));

// src/extension.ts
function activate(context) {
  const api = globalThis["__agentgrid_api"];
  if (!api) {
    return;
  }
  const terminalEngine = api.terminalEngines.registerTerminalEngine({
    id: "zed",
    label: "Zed IDE",
    description: "Zed IDE terminal \u2014 loads your real Zed config and theme"
  });
  context.subscriptions.push(terminalEngine);
  const applyThemeCmd = api.commands.registerCommand("zed.applyTerminalTheme", (...args) => {
    const presetId = args[0] || "zed-ayu-dark";
    return applyPreset(api, context, presetId);
  });
  const importConfigCmd = api.commands.registerCommand("zed.importConfig", () => {
    loadRealZedConfig(api, context);
    return { ok: true, imported: true };
  });
  const listPresetsCmd = api.commands.registerCommand("zed.listPresets", () => {
    return ZED_PRESETS.map((p) => ({ id: p.id, label: p.label }));
  });
  const getActivePresetCmd = api.commands.registerCommand("zed.getActivePreset", () => {
    return context.globalState.get("activePreset") ?? null;
  });
  const getTerminalThemeCmd = api.commands.registerCommand("zed.getTerminalTheme", () => {
    const theme = context.globalState.get("terminalTheme") ?? ZED_THEME_MAP["Ayu Dark"];
    const config = context.globalState.get("terminalConfig") ?? {};
    return { theme, config };
  });
  context.subscriptions.push(applyThemeCmd, importConfigCmd, listPresetsCmd, getActivePresetCmd, getTerminalThemeCmd);
  loadRealZedConfig(api, context);
  console.log("[zed] extension activated");
}
function deactivate() {
  console.log("[zed] extension deactivated");
}
function loadRealZedConfig(api, context) {
  const configPath = resolveZedSettingsPath();
  let themeName = "Ayu Dark";
  let config = {};
  if (configPath && import_node_fs.default.existsSync(configPath)) {
    try {
      const raw = import_node_fs.default.readFileSync(configPath, "utf-8");
      const settings = parseZedSettings(raw);
      themeName = resolveActiveThemeName(settings);
      config = extractTerminalConfig(settings);
    } catch (err) {
      console.warn("[zed] failed to read settings.json:", err);
    }
  }
  const theme = resolveThemeColors(themeName);
  context.globalState.update("activePreset", "auto");
  context.globalState.update("terminalTheme", theme);
  context.globalState.update("terminalConfig", config);
  api.settings.update("zed.terminalTheme", theme);
  api.settings.update("zed.terminalConfig", config);
}
function resolveThemeColors(themeName) {
  const exact = ZED_THEME_MAP[themeName];
  if (exact) {
    return exact;
  }
  const lower = themeName.toLowerCase();
  for (const [name, theme] of Object.entries(ZED_THEME_MAP)) {
    if (name.toLowerCase() === lower) {
      return theme;
    }
  }
  for (const [name, theme] of Object.entries(ZED_THEME_MAP)) {
    if (lower.includes(name.toLowerCase()) || name.toLowerCase().includes(lower)) {
      return theme;
    }
  }
  return ZED_THEME_MAP["Ayu Dark"];
}
function applyPreset(api, context, presetId) {
  const preset = ZED_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    return { ok: false, error: `Unknown preset: ${presetId}` };
  }
  context.globalState.update("activePreset", preset.id);
  context.globalState.update("terminalTheme", preset.terminalTheme);
  api.settings.update("zed.terminalTheme", preset.terminalTheme);
  return { ok: true, preset: preset.id };
}
function resolveZedSettingsPath() {
  const xdgConfig = process.env["XDG_CONFIG_HOME"];
  const xdgPath = xdgConfig ? import_node_path.default.join(xdgConfig, "zed", "settings.json") : null;
  if (xdgPath && import_node_fs.default.existsSync(xdgPath)) {
    return xdgPath;
  }
  const homePath = import_node_path.default.join(import_node_os.default.homedir(), ".config", "zed", "settings.json");
  if (import_node_fs.default.existsSync(homePath)) {
    return homePath;
  }
  return null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
