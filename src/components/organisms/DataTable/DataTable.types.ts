import React from 'react'

export interface Column<T = Record<string, unknown>> {
  key: string
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  searchable?: boolean
  className?: string
}
