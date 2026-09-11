import React from 'react'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
}
