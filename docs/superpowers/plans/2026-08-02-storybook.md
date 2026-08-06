# Storybook for @repo/ui Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Storybook (v10.5.5) to `packages/ui` with Tailwind v4 wired in and a sample CSF story for the shadcn `Button`.

**Architecture:** `@storybook/react-vite` framework with a Vite config that adds `@vitejs/plugin-react` and `@tailwindcss/vite` via `viteFinal`. The preview imports `../src/styles/globals.css` so Tailwind classes render. A colocated story (`src/components/button.stories.tsx`) is picked up by the glob `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`. No changes to the app, `@repo/i18n`, or `tsconfig.base.json`.

**Tech Stack:** Storybook 10.5.5, `@storybook/react-vite`, Vite 7, Tailwind CSS 4, React 19, pnpm 10.

## Global Constraints

- pnpm package manager: `pnpm@10.15.1` (see `packageManager` in root `package.json`). Use `pnpm`, never npm/yarn.
- All Storybook packages pinned to `^10.5.5`. `@vitejs/plugin-react` MUST stay `^5.1.0` — higher versions (6.x) return a 403 from the pnpm registry in this monorepo.
- Only modify: `packages/ui/package.json`, new `packages/ui/.storybook/main.ts`, new `packages/ui/.storybook/preview.ts`, new `packages/ui/src/components/button.stories.tsx`, root `.gitignore`. Do NOT touch `apps/`, `packages/i18n/`, `tsconfig.base.json`, or `packages/ui/src/**` other than the new story file.
- No automated test framework exists in the repo. Verification = a successful `storybook build` + dev-server smoke test.
- Commit style: conventional commits with scope, e.g. `feat(ui): add storybook`, `feat(ui): add button stories`. Commit after each task.
- Work from the repo root unless a step says otherwise.

---

### Task 1: Add Storybook dependencies and scripts to `packages/ui/package.json`

**Files:**
- Modify: `packages/ui/package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: devDependencies and scripts used by Tasks 2–5.

- [ ] **Step 1: Edit `packages/ui/package.json`**

Add these scripts (keep the existing `"test"` script):

```jsonc
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
},
```

Add this `devDependencies` block (keep the existing `dependencies` block unchanged):

```jsonc
"devDependencies": {
  "@storybook/addon-docs": "^10.5.5",
  "@storybook/react-vite": "^10.5.5",
  "@tailwindcss/vite": "^4.3.3",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "@vitejs/plugin-react": "^5.1.0",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "storybook": "^10.5.5",
  "tailwindcss": "^4.3.3",
  "typescript": "^5",
  "vite": "^7.0.0"
}
```

Notes:
- `react`/`react-dom` are pinned to the app's exact versions (19.2.3); `@storybook/react-vite` declares them as peers.
- `vite@^7` is the intersection of the peer ranges of `@storybook/builder-vite` (^5–^8), `@vitejs/plugin-react@5.x` (^4.2–^7), and `@tailwindcss/vite` (^5.2–^8).
- `typescript` satisfies the `>= 4.9.x` peer of `@storybook/react-vite`.

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`
Expected: resolves without errors; `@repo/ui` now has devDependencies installed.

- [ ] **Step 3: Verify the Storybook CLI is available**

Run: `pnpm --filter @repo/ui exec storybook --version`
Expected: prints `10.5.5` (or the installed 10.x version).

- [ ] **Step 4: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): add storybook dev dependencies and scripts"
```

---

### Task 2: Create Storybook config (`.storybook/main.ts` + `preview.ts`)

**Files:**
- Create: `packages/ui/.storybook/main.ts`
- Create: `packages/ui/.storybook/preview.ts`

**Interfaces:**
- Consumes: devDependencies from Task 1.
- Produces: Storybook runtime config. Task 3's story must match the `stories` glob.

- [ ] **Step 1: Create `packages/ui/.storybook/main.ts`**

```ts
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { mergeConfig } from "vite"

import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [react(), tailwindcss()],
    })
  },
}

export default config
```

Notes:
- Storybook 8+ does NOT auto-add framework Vite plugins, so `@vitejs/plugin-react` is added explicitly alongside `@tailwindcss/vite`.
- Controls/actions/viewport are built into Storybook 10 core; `@storybook/addon-essentials` no longer exists and must not be added.
- `@tailwindcss/vite` compiles the Tailwind v4 CSS imported in preview.

- [ ] **Step 2: Create `packages/ui/.storybook/preview.ts`**

```ts
import type { Preview } from "@storybook/react-vite"

import "../src/styles/globals.css"

const preview: Preview = {
  tags: ["autodocs"],
}

export default preview
```

Notes:
- Importing `globals.css` registers the Tailwind v4 stylesheet (`@import "tailwindcss"`, `tw-animate-css`, `shadcn/tailwind.css`, theme tokens) so component classes render.
- `tags: ["autodocs"]` enables the docs page for each component.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/.storybook/main.ts packages/ui/.storybook/preview.ts
git commit -m "feat(ui): add storybook main and preview config"
```

---

### Task 3: Create the sample story for the shadcn `Button`

**Files:**
- Create: `packages/ui/src/components/button.stories.tsx`

**Interfaces:**
- Consumes: `Button` from `./button` (existing file, exports `Button` and `buttonVariants`).
- Produces: the sample case referenced by the plan's verification; later stories can reuse this file as a template.

- [ ] **Step 1: Create `packages/ui/src/components/button.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button"

const meta = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: "secondary" },
}

export const Destructive: Story = {
  args: { variant: "destructive" },
}

export const Link: Story = {
  args: { variant: "link" },
}
```

Notes:
- Imports `./button` relative, because the shadcn components are NOT re-exported from `src/index.ts` (only the simple `Button`/`Text` are).
- `button.tsx` internally imports `@repo/ui/lib/utils`, which resolves via the package's own `exports` map (pnpm self-reference) — no Vite aliasing needed.
- `variant`/`size` become select controls in the Controls panel (built into Storybook 10 core).

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/button.stories.tsx
git commit -m "feat(ui): add shadcn button sample story"
```

---

### Task 4: Ignore Storybook build output

**Files:**
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: a gitignore entry so `storybook build` output never gets committed.

- [ ] **Step 1: Edit root `.gitignore`**

Add this line in the `# production` section (after `dist/`):

```gitignore
# storybook
storybook-static/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore storybook-static output"
```

---

### Task 5: Verify the setup

**Files:**
- None (verification only). Fixes, if any, go to files from Tasks 1–4.

**Interfaces:**
- Consumes: everything from Tasks 1–4.

- [ ] **Step 1: Build Storybook (primary verification)**

Run: `pnpm --filter @repo/ui exec storybook build`
Expected: exit 0. Output includes a built `storybook-static/` directory and lists the story, e.g. `Components/Button`. This proves the Tailwind pipeline compiles, the story is discovered, and the bundle builds. If the build fails, fix the issue and re-run before continuing.

- [ ] **Step 2: Dev-server smoke test**

Run in a background process (worktree root):

```bash
pnpm --filter @repo/ui exec storybook dev --ci --port 6006 &
```

Wait for the server to be ready (poll up to ~60s), then check it serves:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:6006/
```

Expected: HTTP `200`. Then kill the background process:

```bash
kill %1
```

- [ ] **Step 3: Confirm no unintended changes**

Run: `git status`
Expected: clean working tree (no uncommitted changes). `storybook-static/` must NOT appear as an untracked file.

- [ ] **Step 4: Manual check (user, optional)**

`pnpm --filter @repo/ui storybook`, open `http://localhost:6006`, confirm the Button story renders with Tailwind styling and `variant`/`size` controls update the button.

---

## Self-Review

- **Spec coverage:** deps + scripts (T1) ✓; main.ts + preview.ts with Tailwind + react-vite (T2) ✓; sample shadcn Button story (T3) ✓; gitignore (T4) ✓; build + dev verification (T5) ✓. All requirements from `2026-08-02-storybook-design.md` are mapped to tasks.
- **Placeholder scan:** no TBD/TODO; every code step contains full file contents.
- **Type consistency:** `Meta`/`StoryObj` imported from `@storybook/react-vite` (matches SB10 framework docs); `StorybookConfig` type name matches SB10 usage; glob in main.ts matches the story's location `../src/components/button.stories.tsx`.
