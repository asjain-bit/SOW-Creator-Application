export interface SettingsPanelProps {
  initialName?: string
  initialEmail?: string
  onSave?: (data: { name: string; email: string }) => void
  className?: string
}
