/**
 * Avatar — Atom
 * Renders a user profile image or initials avatar primitive using design tokens.
 * Used in: SiteHeader, DataTable, SettingsPanel
 */

import React, { useState } from 'react'
import { AvatarProps } from './Avatar.types'

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  fallback = 'U',
  size = 'md',
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false)

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs'
      case 'lg':
        return 'w-12 h-12 text-base'
      case 'md':
      default:
        return 'w-10 h-10 text-sm'
    }
  }

  const showImage = src && !imageError

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--bg-surface-3)] text-[var(--text-primary)] font-semibold uppercase border border-[var(--border-default)] ${getSizeStyles()} ${className}`}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{fallback.substring(0, 2)}</span>
      )}
    </div>
  )
}
