import React from 'react'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize
  className?: string
}
