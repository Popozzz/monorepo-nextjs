# @repo/components Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all 7 components out of `apps/app/` into a new `@repo/components` package at `packages/components/`, then repoint the app to import from the package and delete the old component directories.

**Architecture:** Create a new pnpm workspace package (`packages/*` is already globbed in `pnpm-workspace.yaml`) with a TypeScript source tree mirroring the current layout, wire it into `tsconfig.base.json` and the Tailwind v4 build, then flip the 3 app import sites and remove the old files. Component file contents are untouched.

**Tech Stack:** pnpm@10.15.1, TypeScript (tsconfig.base.json paths), Tailwind v4 (`@source` in `apps/app/globals.css`), next-intl (resolved via `@repo/i18n`), React 19.

## Global Constraints

- Package name is exactly `@repo/components` (matches `@repo/ui` / `@repo/i18n` convention).
- Component file contents must not change — this is a move, not a refactor. Only their location and the app's imports of them change.
- Components keep calling `getTranslations` / `useTranslations` directly; no prop-drilling of strings.
- `@repo/ui` stays a base primitives package; do not merge components into it.
- Do not touch `packages/hooks`, `packages/layouts`, `packages/utils`.
- Tailwind v4 requires an `@source` entry in `apps/app/globals.css` for any package outside the app dir to have its classes scanned.
- Verification gate: `pnpm install`, `pnpm --filter apps exec tsc --noEmit`, `pnpm --filter apps build`, `pnpm --filter apps test:a11y` (must stay 3/3, no serious/critical violations).

---

### Task 1: Create `@repo/components` package and move component files in

**Files:**
- Create: `packages/components/package.json`
- Create: `packages/components/tsconfig.json`
- Create: `packages/components/src/index.ts`
- Create (copy verbatim from existing sources): `packages/components/src/music/MusicShell.tsx`, `packages/components/src/music/Sidebar.tsx`, `packages/components/src/music/TopNav.tsx`, `packages/components/src/music/SegmentedControl.tsx`, `packages/components/src/music/PlaylistCard.tsx`, `packages/components/src/music/AlbumCard.tsx`, `packages/components/src/LocaleSwitcher.tsx`
- Modify: `tsconfig.base.json` (add `@repo/components` path mappings)
- Modify: `apps/app/globals.css` (add `@source` for the new package)

**Interfaces:**
- Consumes: the 7 existing component files (read-only):
  - `apps/app/[locale]/components/music/{MusicShell,Sidebar,TopNav,SegmentedControl,PlaylistCard,AlbumCard}.tsx`
  - `apps/app/components/LocaleSwitcher.tsx`
- Produces: `@repo/components` package with `"."` export → `./src/index.ts`, whose barrel exposes `MusicShell`, `Sidebar`, `TopNav`, `SegmentedControl`, `PlaylistCard`, `AlbumCard`, `LocaleSwitcher` (all named, default-preserved). Task 2 imports these names.

- [ ] **Step 1: Create `packages/components/package.json`**

```json
{
  "name": "@repo/components",
  "version": "1.0.0",
  "description": "Shared feature components",
  "private": true,
  "type": "module",
  "types": "src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "packageManager": "pnpm@10.15.1",
  "dependencies": {
    "@repo/i18n": "workspace:*",
    "@repo/ui": "workspace:*",
    "lucide-react": "^1.28.0",
    "next-intl": "^4.13.4",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `packages/components/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json"
}
```

- [ ] **Step 3: Copy the 7 component files in, byte-for-byte unchanged**

Copy each file verbatim from its source to its destination (do not edit contents):

```
apps/app/[locale]/components/music/MusicShell.tsx      → packages/components/src/music/MusicShell.tsx
apps/app/[locale]/components/music/Sidebar.tsx         → packages/components/src/music/Sidebar.tsx
apps/app/[locale]/components/music/TopNav.tsx          → packages/components/src/music/TopNav.tsx
apps/app/[locale]/components/music/SegmentedControl.tsx→ packages/components/src/music/SegmentedControl.tsx
apps/app/[locale]/components/music/PlaylistCard.tsx    → packages/components/src/music/PlaylistCard.tsx
apps/app/[locale]/components/music/AlbumCard.tsx       → packages/components/src/music/AlbumCard.tsx
apps/app/components/LocaleSwitcher.tsx                 → packages/components/src/LocaleSwitcher.tsx
```

Internal relative imports (e.g. `./Sidebar`, `./TopNav`) and package imports
(`@repo/i18n/navigation`, `@repo/ui/components/card`, `lucide-react`) stay exactly as they are.

- [ ] **Step 4: Create `packages/components/src/index.ts`**

```ts
export { default as MusicShell } from "./music/MusicShell"
export { default as Sidebar } from "./music/Sidebar"
export { default as TopNav } from "./music/TopNav"
export { default as SegmentedControl } from "./music/SegmentedControl"
export { default as PlaylistCard } from "./music/PlaylistCard"
export { default as AlbumCard } from "./music/AlbumCard"
export { default as LocaleSwitcher } from "./LocaleSwitcher"
```

- [ ] **Step 5: Add `@repo/components` path mappings to `tsconfig.base.json`**

The current `paths` block is:

```json
    "paths": {
      "@repo/ui": ["packages/ui/src"],
      "@repo/ui/*": ["packages/ui/src/*"],
      "@repo/i18n": ["packages/i18n/src"],
      "@repo/i18n/*": ["packages/i18n/src/*"]
    }
```

Add after the `@repo/i18n/*` line:

```json
      "@repo/components": ["packages/components/src"],
      "@repo/components/*": ["packages/components/src/*"]
```

- [ ] **Step 6: Add the Tailwind `@source` to `apps/app/globals.css`**

Current file:

```css
@import "tailwindcss";
@source "../../packages/ui/src";
@import "@repo/ui/styles/globals.css";
```

Insert the new source line after line 2 so the build scans the new package:

```css
@import "tailwindcss";
@source "../../packages/ui/src";
@source "../../packages/components/src";
@import "@repo/ui/styles/globals.css";
```

- [ ] **Step 7: Install to link the new workspace package**

Run: `pnpm install`
Expected: `Done in ...` and `pnpm-lock.yaml` gains `packages/components` (the workspace glob `packages/*` already covers it).

- [ ] **Step 8: Verify the package compiles and the app still builds**

Run: `pnpm --filter apps exec tsc --noEmit`
Expected: exit 0 (no type errors — both the old relative imports and the new package resolve).

Run: `pnpm --filter apps build`
Expected: exit 0, static routes unchanged (`/en/music`, `/zh-CN/music` in the SSG table).

- [ ] **Step 9: Commit**

```bash
git add packages/components tsconfig.base.json apps/app/globals.css pnpm-lock.yaml
git commit -m "feat(components): add @repo/components package with music shell and locale switcher"
```

---

### Task 2: Repoint app imports to `@repo/components` and remove old directories

**Files:**
- Modify: `apps/app/[locale]/layout.tsx:11`
- Modify: `apps/app/[locale]/music/layout.tsx:3`
- Modify: `apps/app/[locale]/music/page.tsx:2-3`
- Delete: `apps/app/[locale]/components/` (whole directory)
- Delete: `apps/app/components/` (whole directory)

**Interfaces:**
- Consumes: the barrel named exports produced in Task 1 — `MusicShell`, `Sidebar`, `TopNav`, `SegmentedControl`, `PlaylistCard`, `AlbumCard`, `LocaleSwitcher` from `@repo/components`.

- [ ] **Step 1: Update `apps/app/[locale]/layout.tsx`**

Line 11 currently:

```tsx
import LocaleSwitcher from "../components/LocaleSwitcher";
```

Change to:

```tsx
import { LocaleSwitcher } from "@repo/components";
```

- [ ] **Step 2: Update `apps/app/[locale]/music/layout.tsx`**

Line 3 currently:

```tsx
import MusicShell from "../components/music/MusicShell"
```

Change to:

```tsx
import { MusicShell } from "@repo/components"
```

- [ ] **Step 3: Update `apps/app/[locale]/music/page.tsx`**

Lines 2–3 currently:

```tsx
import AlbumCard from "../components/music/AlbumCard"
import PlaylistCard from "../components/music/PlaylistCard"
```

Change to:

```tsx
import { AlbumCard, PlaylistCard } from "@repo/components"
```

- [ ] **Step 4: Delete the old component directories**

Run: `git rm -r "apps/app/[locale]/components" "apps/app/components"`

- [ ] **Step 5: Verify no dangling references**

Run: `grep -rn "components/music\|../components/LocaleSwitcher\|components/music/" apps --include="*.tsx" --include="*.ts"`
Expected: no matches.

- [ ] **Step 6: Full verification**

Run: `pnpm --filter apps exec tsc --noEmit`
Expected: exit 0.

Run: `pnpm --filter apps build`
Expected: exit 0, static routes `/en/music` and `/zh-CN/music` present.

Run: `pnpm --filter apps test:a11y`
Expected: 3 passed — `/en`, `/en/music`, `/zh-CN/music` have no serious or critical axe violations. The a11y behavior must be unchanged.

Also confirm the working tree has no stray untracked component copies: `git status --short` should show no `??` entries outside `apps/test-results/` (which is gitignored).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(apps): import shared components from @repo/components"
```

---

## Self-Review

**Spec coverage:**
- New package `@repo/components` with `package.json`/`tsconfig.json`/`src`/barrel → Task 1.
- Component contents unchanged; internal imports preserved → Task 1 Step 3.
- i18n kept as-is (no prop drilling) → implicit: files copied verbatim, still call `getTranslations`/`useTranslations`; deps declared.
- `tsconfig.base.json` paths → Task 1 Step 5.
- `globals.css` `@source` → Task 1 Step 6.
- Call-site updates for layout + music layout + music page → Task 2 Steps 1–3.
- Old dirs deleted → Task 2 Step 4.
- Verification (install, tsc, build, a11y) → Task 1 Steps 7–8, Task 2 Steps 5–6.
- Out-of-scope items honored (no `@repo/ui` merge, no stories, hooks/layouts/utils untouched) → no task touches them.

**Placeholder scan:** No TBD/TODO; every new file has full content; copies reference exact source paths; all edit sites show current→new code.

**Type consistency:** Barrel names (`MusicShell`, `Sidebar`, `TopNav`, `SegmentedControl`, `PlaylistCard`, `AlbumCard`, `LocaleSwitcher`) match the default exports of the moved files and the named imports used in Task 2. `@repo/components` path mapping matches the tsconfig/globals `@source` target (`packages/components/src`).
