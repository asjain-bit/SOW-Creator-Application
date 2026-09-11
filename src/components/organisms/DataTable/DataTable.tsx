/**
 * DataTable — Organism
 * Column-driven data grid with sorting, search filtering, and pagination controls.
 * Used in: SettingsPanel, page demo dashboard
 */

'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { SearchBar } from '@/components/molecules/SearchBar'
import { Column, DataTableProps } from './DataTable.types'

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 5,
  searchable = true,
  className = '',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const query = searchQuery.toLowerCase()
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(query)
      )
    )
  }, [data, searchQuery])

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData
    return [...filteredData].sort((a, b) => {
      const valA = String(a[sortKey] ?? '')
      const valB = String(b[sortKey] ?? '')
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortKey, sortOrder])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return
    if (sortKey === column.key) {
      if (sortOrder === 'asc') setSortOrder('desc')
      else setSortKey(null)
    } else {
      setSortKey(column.key)
      setSortOrder('asc')
    }
  }

  return (
    <div
      className={`rounded-[var(--radius-xl)] bg-[var(--bg-surface-1)] border border-[var(--border-default)] shadow-xs overflow-hidden flex flex-col ${className}`}
    >
      {searchable ? (
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
          <SearchBar
            placeholder="Filter records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
          <span className="text-xs text-[var(--text-tertiary)] font-medium shrink-0">
            {sortedData.length} records found
          </span>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--text-primary)] border-collapse">
          <thead className="bg-[var(--bg-surface-2)] text-xs text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-default)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={`px-4 py-3 font-semibold ${
                    col.sortable ? 'cursor-pointer select-none hover:text-[var(--text-primary)]' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable ? (
                      <span className="text-[var(--text-tertiary)]">
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <Icon name="arrow-up" size={14} />
                          ) : (
                            <Icon name="arrow-down" size={14} />
                          )
                        ) : (
                          <Icon name="arrow-up" size={14} className="opacity-30" />
                        )}
                      </span>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[var(--bg-hover)] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm">
                      {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]"
                >
                  No matching data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-1)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous Page"
          >
            <Icon name="chevron-left" size={14} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next Page"
          >
            <Icon name="chevron-right" size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
