import { useState, useEffect, useCallback } from 'react'

type SlotApi = {
  registerSlotComponent: (
    slotName: string,
    extensionId: string,
    component: React.ComponentType<Record<string, unknown>>,
  ) => () => void
}

type PluginsApi = {
  executeCommand(args: { commandId: string; payload?: unknown }): Promise<unknown>
}

type ZedPresetInfo = { id: string; label: string }

const api = (globalThis as Record<string, unknown>).__agentgrid_slot_api as SlotApi | undefined
const extId = (globalThis as Record<string, unknown>).__agentgrid_extension_id as string | undefined

function getPluginsApi(): PluginsApi {
  return ((window as unknown as Record<string, Record<string, unknown>>).electronAPI).plugins as unknown as PluginsApi
}

async function invokeCommand<T>(commandId: string, payload?: unknown): Promise<T> {
  return getPluginsApi().executeCommand({ commandId, payload }) as Promise<T>
}

function ZedSettingsSection(_props: Record<string, unknown>) {
  const [presets, setPresets] = useState<ZedPresetInfo[]>([])
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    void invokeCommand<ZedPresetInfo[]>('zed.listPresets').then(setPresets).catch(() => {})
    void invokeCommand<string | null>('zed.getActivePreset').then(setActivePreset).catch(() => {})
  }, [])

  const handleApplyPreset = useCallback(async (presetId: string) => {
    const result = await invokeCommand<{ ok: boolean }>('zed.applyTerminalTheme', presetId)

    if (result.ok) {
      setActivePreset(presetId)
    }
  }, [])

  const handleImport = useCallback(async () => {
    const result = await invokeCommand<{ ok: boolean; error?: string }>('zed.importConfig')

    if (result.ok) {
      setImportStatus('success')
      setActivePreset('auto')
      setTimeout(() => setImportStatus('idle'), 3000)
    } else {
      setImportStatus('error')
      setTimeout(() => setImportStatus('idle'), 3000)
    }
  }, [])

  return (
    <div className="zed-settings-section">
      <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
        Zed IDE Terminal
      </h3>

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => void handleImport()}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            borderRadius: 6,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          {importStatus === 'success' ? 'Imported' : importStatus === 'error' ? 'Not found' : 'Import from ~/.config/zed/settings.json'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => void handleApplyPreset(preset.id)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: activePreset === preset.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-default)',
              background: activePreset === preset.id ? 'var(--bg-hover)' : 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 12,
              textAlign: 'left',
              transition: 'border-color 0.15s',
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ZedStatusBarIndicator(_props: Record<string, unknown>) {
  const [activePreset, setActivePreset] = useState<string | null>(null)

  useEffect(() => {
    void invokeCommand<string | null>('zed.getActivePreset').then(setActivePreset).catch(() => {})
  }, [])

  if (!activePreset) { return null }

  const label = activePreset === 'auto' ? 'Zed (auto)' : activePreset.replace('zed-', '')

  return (
    <span
      style={{
        fontSize: 11,
        color: 'var(--text-secondary)',
        padding: '2px 6px',
        borderRadius: 4,
        background: 'var(--bg-surface)',
        whiteSpace: 'nowrap',
      }}
      title="Active Zed terminal theme"
    >
      {label}
    </span>
  )
}

if (api && extId) {
  api.registerSlotComponent('settings-section', extId, ZedSettingsSection)
  api.registerSlotComponent('status-bar-right', extId, ZedStatusBarIndicator)
}
