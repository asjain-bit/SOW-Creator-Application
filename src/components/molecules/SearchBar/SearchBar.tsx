/**
 * SearchBar — Molecule
 * Combines Input, Icon, and Button into a focused search control.
 * Used in: SiteHeader, DataTable
 */

import React, { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Input } from '@/components/atoms/Input'
import { SearchBarProps } from './SearchBar.types'

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState('')
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    onChange?.(e)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(currentValue)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center gap-2 w-full max-w-md ${className}`}
      data-testid="search-bar-form"
    >
      <div className="relative flex-grow flex items-center">
        <Icon
          name="search"
          size={16}
          className="absolute left-3 text-[var(--text-tertiary)] pointer-events-none"
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={currentValue}
          onChange={handleInputChange}
          className="pl-9 pr-3"
          aria-label="Search"
        />
      </div>
      <Button type="submit" variant="primary" size="md">
        Search
      </Button>
    </form>
  )
}
