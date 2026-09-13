export type ZedSettings = {
  theme?: {
    mode?: 'dark' | 'light' | 'system'
    dark?: string
    light?: string
  }
  buffer_font_family?: string
  buffer_font_size?: number
  ui_font_size?: number
  terminal?: {
    font_family?: string
    font_size?: number
    line_height?: { custom?: number }
    blinking?: 'terminal_controlled' | 'off' | 'on'
    shell?: string
    env?: Record<string, string>
  }
}

export type ZedTerminalTheme = {
  background: string
  foreground: string
  cursor: string
  cursorAccent: string
  selectionBackground: string
  selectionForeground: string
  black: string
  red: string
  green: string
  yellow: string
  blue: string
  magenta: string
  cyan: string
  white: string
  brightBlack: string
  brightRed: string
  brightGreen: string
  brightYellow: string
  brightBlue: string
  brightMagenta: string
  brightCyan: string
  brightWhite: string
}

export type ZedTerminalConfig = {
  fontFamily?: string
  fontSize?: number
  cursorStyle?: 'block' | 'bar' | 'underline'
  cursorBlink?: boolean
  boldIsBright?: boolean
  minimumContrast?: number
  scrollback?: number
  cellHeight?: number
}

export type ZedEngineResponse = {
  theme: ZedTerminalTheme
  config: ZedTerminalConfig
}

export type ZedPreset = {
  id: string
  label: string
  terminalTheme: ZedTerminalTheme
}
