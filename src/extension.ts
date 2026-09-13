import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { parseZedSettings, extractTerminalConfig, resolveActiveThemeName } from './config-parser'
import { ZED_THEME_MAP, ZED_PRESETS } from './presets'
import type { ZedTerminalTheme, ZedTerminalConfig, ZedEngineResponse } from './types'

type ExtensionContext = {
  subscriptions: Array<{ dispose(): void }>
  extensionPath: string
  extensionId: string
  globalState: {
    get<T>(key: string, defaultValue?: T): T | undefined
    update(key: string, value: unknown): void
    keys(): readonly string[]
  }
  storagePath: string
}

type AgentGridApi = {
  commands: {
    registerCommand(id: string, handler: (...args: unknown[]) => unknown): { dispose(): void }
    executeCommand(id: string, ...args: unknown[]): Promise<unknown>
  }
  terminalEngines: {
    registerTerminalEngine(engine: { id: string; label: string; description?: string }): { dispose(): void }
  }
  settings: {
    get(key: string): unknown
    update(key: string, value: unknown): void
  }
}

export function activate(context: ExtensionContext): void {
  const api = (globalThis as Record<string, unknown>)['__agentgrid_api'] as AgentGridApi | undefined

  if (!api) { return }

  const terminalEngine = api.terminalEngines.registerTerminalEngine({
    id: 'zed',
    label: 'Zed IDE',
    description: 'Zed IDE terminal — loads your real Zed config and theme',
  })

  context.subscriptions.push(terminalEngine)

  const applyThemeCmd = api.commands.registerCommand('zed.applyTerminalTheme', (...args: unknown[]) => {
    const presetId = (args[0] as string) || 'zed-ayu-dark'

    return applyPreset(api, context, presetId)
  })

  const importConfigCmd = api.commands.registerCommand('zed.importConfig', () => {
    loadRealZedConfig(api, context)

    return { ok: true, imported: true }
  })

  const listPresetsCmd = api.commands.registerCommand('zed.listPresets', () => {
    return ZED_PRESETS.map((p) => ({ id: p.id, label: p.label }))
  })

  const getActivePresetCmd = api.commands.registerCommand('zed.getActivePreset', () => {
    return context.globalState.get<string>('activePreset') ?? null
  })

  const getTerminalThemeCmd = api.commands.registerCommand('zed.getTerminalTheme', (): ZedEngineResponse => {
    const theme = context.globalState.get<ZedTerminalTheme>('terminalTheme') ?? ZED_THEME_MAP['Ayu Dark']!
    const config = context.globalState.get<ZedTerminalConfig>('terminalConfig') ?? {}

    return { theme, config }
  })

  context.subscriptions.push(applyThemeCmd, importConfigCmd, listPresetsCmd, getActivePresetCmd, getTerminalThemeCmd)

  loadRealZedConfig(api, context)

  console.log('[zed] extension activated')
}

export function deactivate(): void {
  console.log('[zed] extension deactivated')
}

function loadRealZedConfig(api: AgentGridApi, context: ExtensionContext): void {
  const configPath = resolveZedSettingsPath()

  let themeName = 'Ayu Dark'
  let config: ZedTerminalConfig = {}

  if (configPath && fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8')
      const settings = parseZedSettings(raw)

      themeName = resolveActiveThemeName(settings)
      config = extractTerminalConfig(settings)
    } catch (err) {
      console.warn('[zed] failed to read settings.json:', err)
    }
  }

  const theme = resolveThemeColors(themeName)

  context.globalState.update('activePreset', 'auto')
  context.globalState.update('terminalTheme', theme)
  context.globalState.update('terminalConfig', config)

  api.settings.update('zed.terminalTheme', theme)
  api.settings.update('zed.terminalConfig', config)
}

function resolveThemeColors(themeName: string): ZedTerminalTheme {
  const exact = ZED_THEME_MAP[themeName]

  if (exact) { return exact }

  const lower = themeName.toLowerCase()

  for (const [name, theme] of Object.entries(ZED_THEME_MAP)) {
    if (name.toLowerCase() === lower) { return theme }
  }

  for (const [name, theme] of Object.entries(ZED_THEME_MAP)) {
    if (lower.includes(name.toLowerCase()) || name.toLowerCase().includes(lower)) {
      return theme
    }
  }

  return ZED_THEME_MAP['Ayu Dark']!
}

function applyPreset(api: AgentGridApi, context: ExtensionContext, presetId: string): { ok: boolean; preset?: string; error?: string } {
  const preset = ZED_PRESETS.find((p) => p.id === presetId)

  if (!preset) {
    return { ok: false, error: `Unknown preset: ${presetId}` }
  }

  context.globalState.update('activePreset', preset.id)
  context.globalState.update('terminalTheme', preset.terminalTheme)

  api.settings.update('zed.terminalTheme', preset.terminalTheme)

  return { ok: true, preset: preset.id }
}

function resolveZedSettingsPath(): string | null {
  const xdgConfig = process.env['XDG_CONFIG_HOME']
  const xdgPath = xdgConfig ? path.join(xdgConfig, 'zed', 'settings.json') : null

  if (xdgPath && fs.existsSync(xdgPath)) { return xdgPath }

  const homePath = path.join(os.homedir(), '.config', 'zed', 'settings.json')

  if (fs.existsSync(homePath)) { return homePath }

  return null
}
