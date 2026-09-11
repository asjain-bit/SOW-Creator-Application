# CLAUDE.md — Agent Guidelines & Project Architecture

This repository is a Next.js 15 App Router application built under strict Atomic Design and token-based styling constraints.

---

## 1. Available Scripts (pnpm)

Execute all package management and CLI commands via `pnpm`:

- `pnpm dev`: Start Next.js local development server on `http://localhost:3000`.
- `pnpm build`: Build production bundle for Next.js.
- `pnpm start`: Run Next.js production server.
- `pnpm lint`: Run ESLint checks across `src/`.
- `pnpm typecheck`: Run TypeScript typechecking with `tsc --noEmit`.
- `pnpm test`: Run unit and component test suite via Vitest.
- `pnpm test:watch`: Run Vitest in watch mode.
- `pnpm test:coverage`: Run Vitest code coverage report (90% threshold gate enforced).
- `pnpm test:e2e`: Run Playwright E2E tests in `e2e/`.
- `pnpm storybook`: Launch Storybook component workbench on `http://localhost:6006`.
- `pnpm build-storybook`: Build static Storybook bundle to `storybook-static/`.
- `pnpm prepare`: Initialize Husky git hooks.

---

## 2. Token Rules (Non-Negotiable)

- **No Raw Colors**: Never write hex (`#123456`), rgb, or hsl values inside components or style attributes.
- **Primitives Only**: Raw color ramps belong solely in `src/styles/tokens/primitives.css`.
- **Semantic Tokens**: Components must reference custom properties defined in `light.css` / `dark.css` (e.g. `--bg-default`, `--text-primary`, `--action-primary-bg-default`).
- **Tailwind Tokens**: Use Tailwind utility classes that resolve to tokens (e.g., `className="bg-[var(--bg-surface-1)] text-[var(--text-primary)]"`).
- **White-Labeling**: Modifications to theme variables belong in `src/styles/tokens/brand.css`.

---

## 3. Atomic Design File Conventions

Every component in `src/components/{layer}/{ComponentName}/` MUST follow this exact 5-file co-located layout:

```
src/components/{layer}/{ComponentName}/
├── ComponentName.tsx          # Component implementation
├── ComponentName.types.ts     # Props interface & types
├── ComponentName.test.tsx     # Co-located Vitest + React Testing Library test
├── ComponentName.stories.tsx  # Storybook stories (Default, variants, EdgeCases)
└── index.ts                   # Export component & type definitions
```

- **Top JSDoc**: Every component implementation file MUST include a top JSDoc header indicating its atomic layer, description, and usage.
- **Rule of Composition**: If a component composes other components, it is **NOT** an atom.

---

## 4. Path Aliases & Imports

- **Path Alias**: Always use `@/*` for imports mapping to `./src/*`.
- **Atomic Imports**: Always import components using absolute atomic paths, e.g. `@/components/atoms/Button` or `@/components/molecules/FormField`.
- **No Relative Layer Crossings**: NEVER write relative imports like `../../atoms/Button` across atomic boundaries.

---

## 5. Documentation Maintenance

- `DESIGN.md` lives at the repo root. Whenever adding new components, tokens, or layout slots, update `DESIGN.md` accordingly.

---

## 6. Git Hooks & Conventional Commits

- Git hooks are powered by Husky 9:
  - `pre-commit`: Runs `lint-staged` (`eslint --fix` & `prettier --write`).
  - `commit-msg`: Runs `commitlint` verifying Conventional Commit messages (e.g., `feat: add SearchBar molecule`).
  - `pre-push`: Runs `pnpm typecheck && pnpm test`.
