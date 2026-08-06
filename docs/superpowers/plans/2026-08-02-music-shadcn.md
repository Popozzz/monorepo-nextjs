# Music Components to shadcn/ui Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the remaining hand-rolled UI in `packages/components/src/` with shadcn/ui components from `@repo/ui` (sidebar, tabs, select, card subcomponents), preserving the current design and a11y.

**Architecture:** Vendor `sidebar`, `tabs`, `select` into `@repo/ui` with the shadcn CLI (base-nova/Base UI style), then refactor the consumers: Sidebar + SegmentedControl (client-side), then PlaylistCard/AlbumCard + LocaleSwitcher. The a11y Playwright suite is the gate — sidebar/tabs/select change landmark, tablist, and combobox semantics.

**Tech Stack:** shadcn CLI 4.16.1 (base-nova style, `@base-ui/react`), pnpm@10.15.1, React 19, next-intl (via `@repo/i18n`).

## Global Constraints

- Preserve the current design: sidebar flush-left and sticky, content beside it, sidebar hidden below `lg`, `min-h-screen bg-background` shell, `main` keeps `px-8 py-6 lg:px-20`.
- All i18n text and the `Music`/`Switcher` message keys stay exactly as-is.
- No new behavior except: SegmentedControl becomes clickable (active tab switches visually) and LocaleSwitcher becomes shadcn `Select`. No tab panels, no sidebar collapse/mobile sheet.
- `music/MusicShell.tsx` keeps the raw `<a href="#main">` skip link (a11y utility — do not convert to `Button`).
- Do not touch `packages/ui/src/styles/globals.css`, `packages/i18n`, `packages/hooks`, `packages/layouts`, `packages/utils`.
- Verification gate per task that touches consumers: `pnpm --filter apps exec tsc --noEmit` (exit 0), `pnpm --filter apps build` (exit 0, `/en/music` + `/zh-CN/music` SSG), `pnpm --filter apps test:a11y` (3 passed, no serious/critical axe violations on `/en`, `/en/music`, `/zh-CN/music`).

---

### Task 1: Vendor `sidebar`, `tabs`, `select` into `@repo/ui`

**Files:**
- Create (via CLI): `packages/ui/src/components/sidebar.tsx`, `packages/ui/src/components/tabs.tsx`, `packages/ui/src/components/select.tsx`
- Create (via CLI, if pulled in): any sidebar deps it registers (e.g. `sheet.tsx`, `tooltip.tsx`)
- Modify (via CLI): `packages/ui/package.json` (any new runtime deps it declares)
- Modify: `pnpm-lock.yaml` (via `pnpm install`)

**Interfaces:**
- Produces: named exports consumed by Task 2 and Task 3 —
  - `@repo/ui/components/sidebar`: `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarInset`
  - `@repo/ui/components/tabs`: `Tabs`, `TabsList`, `TabsTrigger`
  - `@repo/ui/components/select`: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`

- [ ] **Step 1: Run the shadcn CLI**

Run (from the worktree root):
```bash
pnpm --filter @repo/ui exec shadcn add sidebar tabs select -y
```

Expected: writes `packages/ui/src/components/sidebar.tsx`, `tabs.tsx`, `select.tsx` (and any dependencies the CLI registers, e.g. `sheet.tsx`/`tooltip.tsx`), and adds any new runtime deps to `packages/ui/package.json`. If the CLI cannot reach the registry, hand-vendor the three components from the official shadcn base-nova source (same component names/API as above) and declare their deps manually.

- [ ] **Step 2: Install**

Run: `pnpm install` (from the worktree root). Expected: `Done in ...`; lockfile reflects the new components/deps.

- [ ] **Step 3: Verify the vendored components compile**

Run: `pnpm --filter apps exec tsc --noEmit` — exit 0.
Run: `pnpm --filter apps build` — exit 0, same SSG route table (`/en/music`, `/zh-CN/music`). (Nothing consumes the new components yet, so this is a smoke check that the package is not broken.)
Run: `git status --short` — clean apart from the new files.

- [ ] **Step 4: Commit**

```bash
git add packages/ui packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): add shadcn sidebar, tabs, select components"
```

---

### Task 2: Convert Sidebar and SegmentedControl to shadcn

**Files:**
- Modify: `packages/components/src/music/Sidebar.tsx` (full rewrite)
- Modify: `packages/components/src/music/SegmentedControl.tsx` (full rewrite)
- Modify: `packages/components/src/music/MusicShell.tsx` (adopt `SidebarProvider`/`SidebarInset` layout)

**Interfaces:**
- Consumes: Task 1's exports (list above); `@repo/i18n/navigation` (`Link`, `usePathname`); `@repo/ui/components/card` unchanged.
- Produces: `SegmentedControl` becomes a client component (uses `useTranslations`); `Sidebar` keeps its default export name `Sidebar` and stays a client component.

- [ ] **Step 1: Rewrite `packages/components/src/music/Sidebar.tsx`**

Target:

```tsx
"use client"

import { Home, ListMusic, Music, Radio, Search, Smile } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@repo/i18n/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@repo/ui/components/sidebar"

export default function Sidebar() {
  const t = useTranslations("Music")
  const pathname = usePathname()
  const isHomeActive = pathname === "/" || pathname === "/home"

  return (
    <SidebarProvider collapsible="none">
      <Sidebar>
        <SidebarHeader>
          <p className="px-2 py-2 text-xl font-semibold">{t("brand")}</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("discover")}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isHomeActive}>
                  <Link href="/">
                    <Home className="size-4" />
                    {t("home")}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {[
                { icon: Search, label: t("browse") },
                { icon: Radio, label: t("radio") },
              ].map(({ icon: Icon, label }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton render={<span />}>
                    <Icon className="size-4" />
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>{t("library")}</SidebarGroupLabel>
            <SidebarMenu>
              {[
                { icon: ListMusic, label: t("playlists") },
                { icon: Music, label: t("songs") },
                { icon: Smile, label: t("personalizedPicks") },
              ].map(({ icon: Icon, label }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton render={<span />}>
                    <Icon className="size-4" />
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
```

Reconciliation notes (the vendored `sidebar.tsx` is the source of truth for its props):
- `SidebarMenuButton render={<span />}` renders a non-interactive `<span>` for the five static items — they must stay non-clickable. If the vendored `SidebarMenuButton` does not forward a `render` prop, render those items as a plain `<span>` carrying the menu-button padding/icon classes instead.
- `isActive` on the Home button must produce `aria-current="page"` on the rendered link, preserving the current a11y behavior.
- The `hidden lg:flex` mobile behavior: the shadcn `Sidebar` hides itself off-canvas on mobile (no `SidebarTrigger` is rendered, so it cannot open). Confirm the current `<aside>` wrapper is removed entirely — the shadcn `Sidebar` owns the `<aside>` landmark now.

- [ ] **Step 2: Rewrite `packages/components/src/music/SegmentedControl.tsx`**

Target:

```tsx
"use client"

import { useTranslations } from "next-intl"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs"

export default function SegmentedControl() {
  const t = useTranslations("Music")
  const tabs = t.raw("tabs") as string[]

  return (
    <Tabs defaultValue={tabs[0]}>
      <TabsList aria-label={t("tabsLabel")}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
```

Reconciliation notes:
- `TabsList` renders the `rounded-full bg-muted` pill and `TabsTrigger` the active `bg-background` segment, matching the current design. Adjust `TabsList`/`TabsTrigger` classes only if the vendored defaults visibly diverge (e.g. `overflow-x-auto max-w-full` on the list).
- Keep the `aria-label` from `t("tabsLabel")`. No `TabsContent` panels — this is a pure segmented control; do not add panels.

- [ ] **Step 3: Adapt `packages/components/src/music/MusicShell.tsx` to the sidebar layout**

The shell must adopt the shadcn sidebar layout while preserving the design. Target:

```tsx
import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"
import {
  SidebarInset,
  SidebarProvider,
} from "@repo/ui/components/sidebar"
import Sidebar from "./Sidebar"
import TopNav from "./TopNav"

export default async function MusicShell({
  children,
}: {
  children: ReactNode
}) {
  const t = await getTranslations("Music")

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        {t("skipToContent")}
      </a>
      <Sidebar />
      <SidebarInset>
        <TopNav />
        <main id="main" className="flex-1 overflow-y-auto px-8 py-6 lg:px-20">
          {children}
        </main>
      </SidebarInset>
    </div>
  )
}
```

Note: `Sidebar` already renders its own `SidebarProvider` (from Step 1), so MusicShell does not need to wrap it again. If the vendored `SidebarInset` adds conflicting padding/width, reconcile so the final layout matches the design: sidebar flush-left and sticky, content column beside it, `main` with `px-8 py-6 lg:px-20`.

- [ ] **Step 4: Verify**

Run: `pnpm --filter apps exec tsc --noEmit` — exit 0.
Run: `pnpm --filter apps build` — exit 0, `/en/music` + `/zh-CN/music` present.
Run: `pnpm --filter apps test:a11y` — 3 passed, no serious/critical violations.

If axe reports new serious/critical violations from the sidebar/tabs semantics, fix them (this is the gate) before committing.

- [ ] **Step 5: Commit**

```bash
git add packages/components
git commit -m "feat(components): use shadcn sidebar and tabs in music shell"
```

---

### Task 3: Convert cards' inner elements and LocaleSwitcher to shadcn

**Files:**
- Modify: `packages/components/src/music/PlaylistCard.tsx`
- Modify: `packages/components/src/music/AlbumCard.tsx`
- Modify: `packages/components/src/LocaleSwitcher.tsx`

**Interfaces:**
- Consumes: Task 1's `@repo/ui/components/select` exports; existing `@repo/ui/components/card` exports (`Card`, `CardContent`, `CardTitle`, `CardDescription`).

- [ ] **Step 1: Rewrite `packages/components/src/music/PlaylistCard.tsx`**

Target:

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@repo/ui/components/card"

const coverColors = ["#ffffff", "#ffee93", "#ffc1c1", "#f5f5f5"]

type PlaylistCardProps = {
  title: string
  description: string
  index: number
}

export default function PlaylistCard({
  title,
  description,
  index,
}: PlaylistCardProps) {
  return (
    <Card size="sm" className="pt-0">
      <div
        aria-hidden
        className="relative flex aspect-square items-end p-4"
        style={{ backgroundColor: coverColors[index % coverColors.length] }}
      >
        <span className="text-3xl font-semibold leading-none text-foreground">
          {title}
        </span>
      </div>
      <CardContent className="flex flex-col gap-1">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Rewrite `packages/components/src/music/AlbumCard.tsx`**

Target:

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@repo/ui/components/card"

type AlbumCardProps = {
  artist: string
  genre: string
}

export default function AlbumCard({ artist, genre }: AlbumCardProps) {
  return (
    <Card size="sm" className="pt-0">
      <div aria-hidden className="aspect-square bg-muted" />
      <CardContent className="flex flex-col gap-1">
        <CardTitle className="text-xl">{artist}</CardTitle>
        <CardDescription className="text-base">{genre}</CardDescription>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Rewrite `packages/components/src/LocaleSwitcher.tsx`**

Target:

```tsx
"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@repo/i18n/navigation"
import { routing } from "@repo/i18n/routing"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select"

export default function LocaleSwitcher() {
  const locale = useLocale()
  const t = useTranslations("Switcher")
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function onLocaleChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <span>{t("label")}</span>
      <Select value={locale} onValueChange={onLocaleChange} disabled={isPending}>
        <SelectTrigger
          aria-label={t("label")}
          className="h-8 rounded-md border border-zinc-300 bg-white px-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {routing.locales.map((cur) => (
            <SelectItem key={cur} value={cur}>
              {cur}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

Note: the wrapper is now a `<div>` (the shadcn trigger is a button; `aria-label` on the trigger keeps the accessible name). The visible label text is unchanged. If the vendored `Select` API differs (e.g. `render` instead of `value`/`onValueChange`), follow the vendored component's props while preserving this behavior: controlled by `locale`, `router.replace(pathname, { locale })` inside `startTransition`, disabled while `isPending`.

- [ ] **Step 4: Verify**

Run: `pnpm --filter apps exec tsc --noEmit` — exit 0.
Run: `pnpm --filter apps build` — exit 0, `/en/music` + `/zh-CN/music` present.
Run: `pnpm --filter apps test:a11y` — 3 passed, no serious/critical violations.

- [ ] **Step 5: Commit**

```bash
git add packages/components
git commit -m "feat(components): use shadcn card and select primitives"
```

---

## Self-Review

**Spec coverage:**
- Vendor sidebar/tabs/select into `@repo/ui` → Task 1.
- Sidebar → shadcn sidebar structure (Provider/Sidebar/Header/Content/Group/Label/Menu/MenuItem/MenuButton, collapsible="none", no mobile sheet, hidden <lg) → Task 2 Step 1 + Step 3.
- SegmentedControl → shadcn `tabs`, client, no panels → Task 2 Step 2.
- PlaylistCard/AlbumCard `h3`/`p` → `CardTitle`/`CardDescription` → Task 3 Steps 1–2.
- LocaleSwitcher `<select>` → shadcn `Select`, same locale-switch behavior → Task 3 Step 3.
- MusicShell skip link excluded → Task 2 Step 3 keeps the raw `<a>`; stated in Global Constraints.
- TopNav unchanged (already shadcn `Button`) → no task touches it.
- Verification gate (tsc/build/a11y) per consumer task → Task 2 Step 4, Task 3 Step 4.

**Placeholder scan:** No TBD/TODO. Every new file has target code. The two "reconciliation notes" are concrete instructions tied to a named requirement, not placeholders — they exist because the vendored component source is fetched at runtime by the CLI, so its exact props cannot be written into the plan. Each names the requirement to preserve and the fallback.

**Type consistency:** Export names consumed in Task 2/3 (`SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarInset`; `Tabs`, `TabsList`, `TabsTrigger`; `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`) are the canonical shadcn base-nova exports and are consistent across tasks. `Sidebar` default export and `SegmentedControl` default export unchanged, so `@repo/components` barrel and app imports are unaffected.
