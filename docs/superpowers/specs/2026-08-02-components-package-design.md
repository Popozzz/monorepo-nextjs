# Design: `@repo/components` package

Date: 2026-08-02

## Problem

All app-specific components currently live under `apps/app/` in two places:

- `apps/app/components/LocaleSwitcher.tsx` (client component, used by the root layout)
- `apps/app/[locale]/components/music/` — 6 files: `MusicShell`, `Sidebar`, `TopNav`,
  `SegmentedControl`, `PlaylistCard`, `AlbumCard`

The `packages/components/` directory already exists in the workspace but is empty —
an anticipated home for shared components. The goal is to move every component out of
`apps/app/` and into that package so feature components are reusable across apps and
follow the same package convention as `@repo/ui` and `@repo/i18n`.

## Decisions

- **Scope:** all 7 components move (music components + `LocaleSwitcher`).
- **Package identity:** new `@repo/components` package at `packages/components/`,
  following the `@repo/*` naming used by `@repo/ui` and `@repo/i18n`.
- **i18n:** components keep calling `getTranslations` / `useTranslations` and keep using
  `@repo/i18n/navigation` and `@repo/i18n/routing` as-is. No behavior change, no
  prop-drilling of translated strings. The package declares `next-intl` and
  `@repo/i18n` as dependencies.
- **No merge into `@repo/ui`:** that package stays a base primitive library
  (Button, Card, Text); feature components live in `@repo/components`.

## Package layout

```
packages/components/
  package.json
  tsconfig.json
  src/
    index.ts                 # barrel: re-exports all 7 components as named exports
    music/
      MusicShell.tsx
      Sidebar.tsx
      TopNav.tsx
      SegmentedControl.tsx
      PlaylistCard.tsx
      AlbumCard.tsx
    LocaleSwitcher.tsx
```

Component file contents are unchanged except that barrel imports replace nothing inside
the files — internal relative imports (`./Sidebar`, `./TopNav`) and package imports
(`@repo/i18n/navigation`, `@repo/ui/components/card`, `lucide-react`) are preserved.

### `package.json`

- `name`: `@repo/components`
- `version`: `1.0.0`, `private`: `true`, `type`: `module`
- `exports`: `{ ".": { "types": "./src/index.ts", "default": "./src/index.ts" } }`
- `scripts.test`: existing stub convention (`echo "Error: no test specified" && exit 1`)
- `packageManager`: `pnpm@10.15.1`
- dependencies: `next-intl`, `@repo/i18n` (workspace:*), `@repo/ui` (workspace:*),
  `lucide-react`, `react`, `react-dom`
- devDependencies: `typescript`, `@types/react`, `@types/react-dom`

### `tsconfig.json`

Extends `../../tsconfig.base.json` (same as `packages/ui/tsconfig.json`).

### Barrel `src/index.ts`

Named re-exports with default exports preserved in files:

```ts
export { default as MusicShell } from "./music/MusicShell"
export { default as Sidebar } from "./music/Sidebar"
export { default as TopNav } from "./music/TopNav"
export { default as SegmentedControl } from "./music/SegmentedControl"
export { default as PlaylistCard } from "./music/PlaylistCard"
export { default as AlbumCard } from "./music/AlbumCard"
export { default as LocaleSwitcher } from "./LocaleSwitcher"
```

## App wiring

- `tsconfig.base.json`: add path mappings
  `"@repo/components": ["packages/components/src"]` and
  `"@repo/components/*": ["packages/components/src/*"]` (matching existing `@repo/ui` /
  `@repo/i18n` entries).
- `apps/app/globals.css`: add `@source "../../packages/components/src";` so the Tailwind
  v4 PostCSS build scans the package source for utility classes (mirrors the existing
  `@source "../../packages/ui/src";` line).
- Call sites updated to import from `@repo/components`:
  - `apps/app/[locale]/layout.tsx`: `import LocaleSwitcher from "../components/LocaleSwitcher"`
    → `import { LocaleSwitcher } from "@repo/components"`
  - `apps/app/[locale]/music/layout.tsx`: `import MusicShell from "../components/music/MusicShell"`
    → `import { MusicShell } from "@repo/components"`
  - `apps/app/[locale]/music/page.tsx`: `AlbumCard` and `PlaylistCard` imports → same barrel
- Deleted after the move: `apps/app/[locale]/components/` and `apps/app/components/`.

## Verification

- `pnpm install` at the workspace root to link the new package (updates
  `pnpm-lock.yaml`).
- `pnpm --filter apps exec tsc --noEmit` — exit 0.
- `pnpm --filter apps build` — exit 0, static routes unchanged (`/en/music`,
  `/zh-CN/music`, `/en`, `/zh-CN`, home pages).
- `pnpm --filter apps test:a11y` — 3/3 pass (a11y must remain clean; translations
  resolve identically through the shared `@repo/i18n` request config).

## Out of scope

- No component code changes (no props, no styling, no a11y changes).
- No Storybook stories for the moved components.
- `packages/hooks`, `packages/layouts`, `packages/utils` untouched.
