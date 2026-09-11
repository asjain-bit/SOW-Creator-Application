# Design System & Token Architecture

Welcome to the Next.js 15 Atomic Architecture & Design System reference documentation.

---

## 1. Design Principles

- **Tokens-only Styling**: No raw hex, rgb, or hsl values outside `src/styles/tokens/primitives.css`. All components reference semantic token custom properties.
- **Bottom-Up Atomic Construction**: Build atoms first, compose atoms into molecules, combine molecules into organisms, and structural skeletons into templates.
- **Single Responsibility Per File**: Every file serves one strict purpose (types, implementation, unit test, story, index export).
- **Co-located Testing**: Every component ships with co-located RTL/Vitest unit tests (`ComponentName.test.tsx`) and Storybook stories (`ComponentName.stories.tsx`).
- **AI-Elements Opt-In**: Generated AI components are kept strictly isolated under `src/components/ai-elements/` and excluded from default lint/coverage gates.

---

## 2. Design Token System

### Layering Architecture

```
[Primitives] (primitives.css) -> Raw CSS variable ramps on :root (DO NOT EDIT)
      │
      ├──> [Light Mode] (light.css) -> Semantic role bindings for :root, [data-theme="light"]
      ├──> [Dark Mode]  (dark.css)  -> Semantic role bindings for [data-theme="dark"]
      │
      └──> [Brand Overrides] (brand.css) -> White-label modifications & WCAG AA contrast adjustments
```

### Semantic Token Role Groups

| Role Group | Custom Property Prefix | Description | Example Tokens |
| :--- | :--- | :--- | :--- |
| **Backgrounds** | `--bg-*` | Surface & container fills | `--bg-default`, `--bg-surface-1..5`, `--bg-overlay`, `--bg-input`, `--bg-tooltip`, `--bg-modal`, `--bg-sidebar`, `--bg-hover`, `--bg-pressed`, `--bg-selected`, `--bg-disabled` |
| **Text** | `--text-*` | Typography & icon colors | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-disabled`, `--text-placeholder`, `--text-inverse`, `--text-on-primary`, `--text-accent`, `--text-link`, `--text-success`, `--text-warning`, `--text-error`, `--text-info` |
| **Borders** | `--border-*` | Dividers, focus rings & strokes | `--border-default`, `--border-subtle`, `--border-strong`, `--border-focus` |
| **Actions** | `--action-*` | Interactive button fills & text | `--action-primary-bg-default`, `--action-primary-bg-hover`, `--action-primary-bg-pressed`, `--action-primary-text`, `--action-primary-bg-soft`, `--action-destructive-bg-default`, `--action-destructive-bg-hover`, `--action-destructive-text` |
| **Status** | `--status-*` | Alerts, toasts & status chips | `--status-success-{bg,text,border,icon}`, `--status-warning-*`, `--status-error-*`, `--status-info-*` |

---

## 3. Layout

### AppShell Layout Skeleton

```
┌──────────────────────────────────────────────────────────┐
│ topbar  (56px)                                            │
├───────────┬───────────────────────────────┬───────────────┤
│ leftbar   │ main (flex-grow)              │ rightbar      │
│ (165px /  │                                │ (~280px,      │
│ 48px      │                                │ hide/show)    │
│ collapsed)│                                │               │
└───────────┴───────────────────────────────┴───────────────┘
```

| Slot Prop Name | Element | Dimensions / Behavior |
| :--- | :--- | :--- |
| `topbar` | Header bar | Fixed 56px height, top z-index sticky |
| `leftbar` | Navigation sidebar | Collapsible (165px expanded / 48px collapsed) |
| `main` | Main content area | `flex-grow`, scrollable container |
| `rightbar` | Contextual panel | ~280px width, toggleable show/hide state |

---

## 4. Component Inventory

### Atoms (One DOM element, no component children)

| Name | Path | Description | Used in |
| :--- | :--- | :--- | :--- |
| `Icon` | `src/components/atoms/Icon` | Inline SVG icon primitive | Button, Badge, ThemeToggle, SearchBar, Toast, KPICard, SiteHeader, DataTable |
| `Button` | `src/components/atoms/Button` | Interactive action button | SearchBar, FormField, Toast, AppDialog, SiteHeader, SettingsPanel |
| `Input` | `src/components/atoms/Input` | Single-line form input control | FormField, SearchBar, SettingsPanel |
| `Textarea` | `src/components/atoms/Textarea` | Multiline text area input | FormField, SettingsPanel |
| `Select` | `src/components/atoms/Select` | Native dropdown select control | FormField, SettingsPanel, DataTable |
| `Badge` | `src/components/atoms/Badge` | Status chip indicator | Toast, KPICard, DataTable, Page Demo |
| `Spinner` | `src/components/atoms/Spinner` | Animated loading spinner | Button, AppDialog, DataTable |
| `Avatar` | `src/components/atoms/Avatar` | Profile image / initials avatar | SiteHeader, DataTable, SettingsPanel |
| `ThemeToggle` | `src/components/atoms/ThemeToggle` | Light/dark/system theme switch button | SiteHeader, AppShell, SettingsPanel |

### Molecules (Composes 2+ atoms, single focused purpose)

| Name | Path | Description | Used in |
| :--- | :--- | :--- | :--- |
| `FormField` | `src/components/molecules/FormField` | Input wrapper with label, helper, and error text | SettingsPanel, AppDialog |
| `SearchBar` | `src/components/molecules/SearchBar` | Search control combining Input, Icon, and Button | SiteHeader, DataTable |
| `Toast` | `src/components/molecules/Toast` | Inline notification banner | AppShell, SettingsPanel, Page Demo |
| `AppDialog` | `src/components/molecules/AppDialog` | Accessible modal dialog window overlay | SettingsPanel, Page Demo |
| `KPICard` | `src/components/molecules/KPICard` | Metric display card with badge and trend icon | SettingsPanel, Page Demo |

### Organisms (Distinct self-contained sections)

| Name | Path | Description | Used in |
| :--- | :--- | :--- | :--- |
| `SiteHeader` | `src/components/organisms/SiteHeader` | Top platform navigation bar | AppShell, Page Demo |
| `DataTable` | `src/components/organisms/DataTable` | Column-driven grid with sorting, search, and pagination | SettingsPanel, Page Demo |
| `SettingsPanel` | `src/components/organisms/SettingsPanel` | Account preferences form section | AppShell, Page Demo |
| `LoginScreen` | `src/components/organisms/LoginScreen` | Full SOW Creator authentication & OTP verification flow | `src/app/page.tsx` |

### Templates (Layout skeletons)

| Name | Path | Description | Used in |
| :--- | :--- | :--- | :--- |
| `AppShell` | `src/components/templates/AppShell` | Topbar/Leftbar/Main/Rightbar structural layout | `src/app/page.tsx` |

### App (Page routes & layouts)

| Name | Path | Description | Used in |
| :--- | :--- | :--- | :--- |
| `RootLayout` | `src/app/layout.tsx` | Next.js root layout loading fonts & ThemeProvider | Next.js App Router |
| `Home` | `src/app/page.tsx` | Interactive demo landing page | Next.js App Router |
