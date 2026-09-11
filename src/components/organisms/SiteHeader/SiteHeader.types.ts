export interface NavItem {
  label: string
  href: string
  active?: boolean
}

export interface SiteHeaderProps {
  navItems?: NavItem[]
  onSearch?: (query: string) => void
  userFallback?: string
  className?: string
}
