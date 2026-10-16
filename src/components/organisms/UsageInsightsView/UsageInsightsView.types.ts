export interface UsageSOW {
  id: string
  name: string
  client?: string
  readiness?: number
}

export interface UsageInsightsViewProps {
  /** SOWs shown in the "SOWs by Readiness %" section */
  sows: UsageSOW[]
  notificationButton?: React.ReactNode
}

export interface UsageWeek {
  start: string
  end: string
  label: string
  sowsGenerated: number
  tokens: number
}

export interface RoiInputs {
  hours: number
  costPerHour: number
  tokenPrice: number
}
