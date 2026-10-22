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
  /** Only the Admin can change the Value/ROI inputs and recalculate (default: true) */
  canRecalculate?: boolean
}

export interface UsageWeek {
  start: string
  end: string
  label: string
  /** Short label for the chart axis, e.g. "Oct 12" */
  axisLabel: string
  /** Whether the week belongs to the current month (listed in the week dropdown) */
  inCurrentMonth: boolean
  sowsGenerated: number
  /** Tokens in millions */
  inputTokens: number
  outputTokens: number
  embeddingTokens: number
  searchCredits: number
}

export interface RoiInputs {
  hours: number
  costPerHour: number
  inputPrice: number
  outputPrice: number
  embeddingPrice: number
  searchPrice: number
}
