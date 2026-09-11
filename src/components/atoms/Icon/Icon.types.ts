import React from 'react'

export type IconName =
  | 'sun'
  | 'moon'
  | 'laptop'
  | 'search'
  | 'check'
  | 'alert'
  | 'info'
  | 'close'
  | 'user'
  | 'settings'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-up'
  | 'arrow-down'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  size?: number | string
  className?: string
}
