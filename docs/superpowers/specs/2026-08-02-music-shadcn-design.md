# Design: Convert music components to shadcn/ui

Date: 2026-08-02

## Problem

The music components in `packages/components/src/` still contain hand-rolled UI elements
instead of shadcn/ui components, despite the app importing from the shadcn-based
`@repo/ui` package:

- `music/Sidebar.tsx` — raw `<aside>`, `<nav>`, `<ul>`, `<li>`, `<Link>` markup
- `music/SegmentedControl.tsx` — raw `<button>` group with `role="group"`/`aria-pressed`
- `music/PlaylistCard.tsx` / `music/AlbumCard.tsx` — raw `<h3>`/`<p>` inside shadcn cards
- `LocaleSwitcher.tsx` — raw `<select>`
- `music/MusicShell.tsx` — raw `<a>` skip link

`@repo/ui` is already a shadcn setup (style `base-nova` / Base UI, `@base-ui/react`
installed, full theme tokens including `sidebar` colors) with `button.tsx` and
`card.tsx` vendored.

## Decisions

- **Sidebar:** rebuild on the shadcn `sidebar` component structure (`SidebarProvider`,
  `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`,
  `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`), keeping the current static
  layout — `collapsible="none"`, no collapse toggle, no mobile sheet/hamburger, sidebar
  still hidden below `lg`.
- **SegmentedControl:** shadcn `tabs` (`TabsList` + `TabsTrigger`). Becomes a client
  component; clicking switches the active tab visually. No `TabsContent` panels yet —
  the pill group is a pure segmented control.
- **Scope:** all of the above plus LocaleSwitcher's `<select>` → shadcn `select`, and
  card inner `<h3>`/`<p>` → `CardTitle`/`CardDescription`.
- **Vendoring:** add the components to `@repo/ui` with the shadcn CLI
  (`shadcn add sidebar tabs select`, run in `packages/ui` so `components.json` aliases
  apply). If the registry fetch fails, hand-vendor the same components from the shadcn
  source.

## `@repo/ui` additions

```
packages/ui/src/components/
  sidebar.tsx        # plus pull-in deps the CLI adds (e.g. sheet.tsx, tooltip if needed)
  tabs.tsx
  select.tsx
```

Added by the CLI: any new runtime deps (Base UI primitives for tabs/select/dialog are
already covered by `@base-ui/react`). Lockfile updates via `pnpm install`.

## Refactors in `packages/components/src`

### `music/Sidebar.tsx` (client)

- Wrap in `SidebarProvider collapsible="none"`; outer wrapper keeps `hidden lg:flex`.
- `Sidebar` → `SidebarHeader` (brand `t("brand")`) → `SidebarContent` → two
  `SidebarGroup`s, each with `SidebarGroupLabel` (`t("discover")`, `t("library")`) and a
  `SidebarMenu`.
- Nav items: Home as `SidebarMenuButton asChild` wrapping `<Link>` with
  `isActive={isHomeActive}` (preserves `aria-current` behavior); the five static items
  (Search, Radio, Playlists, Songs, PersonalizedPicks) as `SidebarMenuButton` with a
  base-ui `render` prop to a non-interactive `<span>` so they stay non-clickable.
- Icons unchanged (lucide).

### `music/SegmentedControl.tsx` (client)

- Becomes `"use client"`; switch `getTranslations` → `useTranslations`.
- `Tabs defaultValue={tabs[0]}` → `TabsList` (full-width pill) → `TabsTrigger` per tab.
- `aria-label` from `t("tabsLabel")` moves to `Tabs`.

### `music/PlaylistCard.tsx` / `music/AlbumCard.tsx` (server)

- Replace `<h3>` with `CardTitle` and `<p>` with `CardDescription` inside `CardContent`.
- Cover blocks unchanged.

### `LocaleSwitcher.tsx` (client)

- Replace the raw `<select>` with shadcn `Select`: `Select.Root` (`value={locale}`,
  `onValueChange` → existing `startTransition(router.replace)` logic), `Select.Trigger`
  (`aria-label` from `t("label")`), `Select.Value`, `Select.Content`, `Select.Item` per
  `routing.locales`.
- The visible `<label>` text stays as-is.

### `music/MusicShell.tsx` (server) — explicit exclusion

The skip link stays a raw `<a href="#main">` with `sr-only`/`focus:` classes. It is an
accessibility utility whose visible-on-focus styling does not map to shadcn `Button`
variants; converting it would fight the button styles. Everything else in the shell is
semantic layout (`<div>`/`<main>`), not a shadcn component candidate.

### `music/TopNav.tsx` — no change

Already uses shadcn `Button`; `<header>` is a semantic layout element.

## Verification

- `pnpm install` (link new deps + lockfile).
- `pnpm --filter apps exec tsc --noEmit` — exit 0 (apps imports the new components via
  `@repo/components` → `@repo/ui`).
- `pnpm --filter apps build` — exit 0, static routes unchanged (`/en/music`,
  `/zh-CN/music`, `/en`, `/zh-CN`, home).
- `pnpm --filter apps test:a11y` — 3/3 pass with no serious/critical violations. This is
  the gate: sidebar/tabs/select change landmark, tablist, and combobox semantics, so the
  axe scan must stay clean.

## Out of scope

- No new behavior or features (no tab panels, no sidebar collapse/mobile sheet).
- No Storybook stories for the new components.
- No CSS token / theme changes (`packages/ui/src/styles/globals.css` untouched).
- `packages/i18n`, `packages/hooks`, `packages/layouts`, `packages/utils` untouched.
