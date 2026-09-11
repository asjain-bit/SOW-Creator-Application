import React from 'react'

export interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearch?: (term: string) => void
  className?: string
}
