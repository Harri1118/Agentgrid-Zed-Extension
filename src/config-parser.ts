import type { ZedSettings, ZedTerminalConfig } from './types'

export function parseZedSettings(raw: string): ZedSettings {
  const cleaned = stripJsoncComments(raw)

  try {
    return JSON.parse(cleaned) as ZedSettings
  } catch {
    return {}
  }
}

export function extractTerminalConfig(settings: ZedSettings): ZedTerminalConfig {
  const config: ZedTerminalConfig = {}

  const termFontFamily = settings.terminal?.font_family ?? settings.buffer_font_family

  if (termFontFamily) { config.fontFamily = termFontFamily }

  const termFontSize = settings.terminal?.font_size ?? settings.buffer_font_size

  if (typeof termFontSize === 'number') { config.fontSize = termFontSize }

  if (settings.terminal?.blinking === 'on') {
    config.cursorBlink = true
  } else if (settings.terminal?.blinking === 'off') {
    config.cursorBlink = false
  }

  if (settings.terminal?.line_height?.custom) {
    config.cellHeight = settings.terminal.line_height.custom
  }

  return config
}

export function resolveActiveThemeName(settings: ZedSettings): string {
  const mode = settings.theme?.mode ?? 'dark'

  if (mode === 'light') {
    return settings.theme?.light ?? 'One Light'
  }

  return settings.theme?.dark ?? 'Ayu Dark'
}

function stripJsoncComments(raw: string): string {
  let result = ''
  let inString = false
  let escapeNext = false
  let i = 0

  while (i < raw.length) {
    const ch = raw[i]!

    if (escapeNext) {
      result += ch
      escapeNext = false
      i++
      continue
    }

    if (ch === '\\' && inString) {
      result += ch
      escapeNext = true
      i++
      continue
    }

    if (ch === '"') {
      inString = !inString
      result += ch
      i++
      continue
    }

    if (inString) {
      result += ch
      i++
      continue
    }

    if (ch === '/' && raw[i + 1] === '/') {
      while (i < raw.length && raw[i] !== '\n') { i++ }
      continue
    }

    if (ch === '/' && raw[i + 1] === '*') {
      i += 2

      while (i < raw.length && !(raw[i] === '*' && raw[i + 1] === '/')) { i++ }

      i += 2
      continue
    }

    result += ch
    i++
  }

  return result
}
