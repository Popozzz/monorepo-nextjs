# Design: Add Storybook to `@repo/ui`

Date: 2026-08-02

## Goal

Add Storybook (v10.5.5) to the `@repo/ui` package in this pnpm monorepo so the
shared component library can be developed in isolation, plus one sample story
for the shadcn/base-ui `Button` component.

## Requirements

- Storybook lives in `packages/ui`, using the `@storybook/react-vite` framework
  (fast Vite builder; no Next.js coupling).
- Tailwind v4 is wired into Storybook so the Tailwind-based shadcn components
  render exactly as they do in the app.
- Sample case: a CSF story for `packages/ui/src/components/button.tsx` (the
  shadcn `Button`) with `variant`/`size` controls.
- No changes to the app, `@repo/i18n`, or `tsconfig.base.json` path aliases.

## Architecture

### Dependencies (`packages/ui/package.json`, all `devDependencies`)

- `storybook` ^10.5.5
- `@storybook/react-vite` ^10.5.5
- `@storybook/addon-docs` ^10.5.5 — controls/actions/viewport/backgrounds are
  built into core in Storybook 10; `@storybook/addon-essentials` was removed in
  9.0 and must not be used.
- `@vitejs/plugin-react` pinned to `^5.1.0` — newer versions return a 403 from
  the pnpm registry in this monorepo.
- `@tailwindcss/vite` (Tailwind v4 Vite plugin)
- `tailwindcss` (needed directly by Storybook's Vite build; currently only
  consumed transitively by the app)

Scripts:
- `"storybook": "storybook dev -p 6006"`
- `"build-storybook": "storybook build"`

### New files

```
packages/ui/
├── .storybook/
│   ├── main.ts            # framework + stories glob + addons + viteFinal
│   └── preview.ts         # imports ../src/styles/globals.css
└── src/components/
    └── button.stories.tsx # sample CSF story
```

`.storybook/main.ts`:
- `framework: { name: '@storybook/react-vite', options: {} }`.
- `stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)']` (colocated stories).
- `addons: ['@storybook/addon-docs']` (autodocs for the component; controls and
  actions are part of core in Storybook 10).
- `async viteFinal(config)` → `mergeConfig(config, { plugins: [
  react(), tailwindcss() ] })`. Storybook 8+ no longer auto-adds framework
  Vite plugins, so `@vitejs/plugin-react` must be added explicitly alongside
  `@tailwindcss/vite`.

`.storybook/preview.ts`:
- `import '../src/styles/globals.css'` — registers the Tailwind v4 stylesheet
  (`@import "tailwindcss"` + `tw-animate-css` + theme tokens) so component
  classes render correctly.
- Export a minimal `preview` object (`tags: ['autodocs']` optional; keep
  baseline minimal).

`src/components/button.stories.tsx`:
- `import { Button } from './button'`.
- CSF meta: `title: 'Components/Button'`, `component: Button`, `argTypes` for
  `variant` (control: select) and `size` (control: select), `args: { variant:
  'default', size: 'default', children: 'Button' }`.
- One default story plus a small set of explicit variant stories
  (`Default`, `Secondary`, `Destructive`, `Link`) for visual coverage.

### Component resolution

`button.tsx` imports `@repo/ui/lib/utils`, which resolves through the package's
own `exports` map (`"./lib/*": "./src/lib/*.ts"`). pnpm symlinks the workspace
package into `node_modules`, so Vite resolves this self-reference without extra
aliasing in `main.ts`. (Stories import the component via a relative path since
the shadcn components are not re-exported from `src/index.ts`.)

The base-ui `ButtonPrimitive` renders standalone without a provider, so no
global decorator is required.

### Out of scope (noted as follow-ups)

- Stories for the simple `Button`/`Text` and `Card`.
- `@storybook/test-runner`, a11y addon, dark-mode/themes addon.
- RBAC/access control for Storybook (handled via host/file-server config, not
  in `main.ts`).
- `storybook ai setup`; config is written by hand.

## Verification

- No automated test framework exists in the repo.
- `pnpm --filter @repo/ui exec storybook build` must succeed — proves the
  Tailwind pipeline compiles, the story is picked up, and the bundle builds.
- Manual: `pnpm --filter @repo/ui storybook`, open `http://localhost:6006`,
  confirm the Button story renders with Tailwind styles and `variant`/`size`
  controls work.
- `storybook-static/` added to root `.gitignore`.
