# /music Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/music` page in `apps/app` with a reusable music shell (sidebar + top nav + main), using `@repo/ui` shadcn components, translated to en + zh-CN, and verified by an automated axe (WCAG A+AA) scan.

**Architecture:** A nested `music/` layout renders a server `MusicShell` (skip link + `Sidebar` + `TopNav` + `<main id="main">`). `Sidebar` is the only client component (needs `usePathname` from `@repo/i18n/navigation` for the route-based active state); everything else is a server component using `getTranslations` + `t.raw`. The page (`music/page.tsx`) maps translated arrays over `PlaylistCard`/`AlbumCard` composites built from the shadcn `Card`/`CardContent`/`Button` in `@repo/ui`. New `Music` i18n namespace feeds all copy. A Playwright + `@axe-core/playwright` script scans `/en/music`, `/zh-CN/music`, `/en` and fails on serious/critical violations.

**Tech Stack:** Next.js 16.2.12 (App Router), next-intl 4, React 19.2.3, Tailwind CSS 4, `@repo/ui` (shadcn/base-ui), lucide-react 1.28.0, Playwright 1.62, @axe-core/playwright 4.12, axe-core 4.12, pnpm 10.

## Global Constraints

- pnpm package manager: `pnpm@10.15.1`. Use `pnpm`, never npm/yarn.
- `lucide-react` must stay `^1.28.0` (already in the lockfile via `@repo/ui`; all icon names verified present at that version).
- Only modify: `packages/i18n/messages/en.json`, `packages/i18n/messages/zh-CN.json`, `apps/package.json`; create: `apps/playwright.config.ts`, `apps/tests/a11y.spec.ts`, `apps/app/[locale]/music/layout.tsx`, `apps/app/[locale]/music/page.tsx`, and `apps/app/[locale]/components/music/{MusicShell,Sidebar,SegmentedControl,TopNav,PlaylistCard,AlbumCard}.tsx`. Do NOT touch `apps/app/[locale]/layout.tsx`, `apps/app/globals.css`, `tsconfig.base.json`, or anything under `packages/ui`.
- Placeholder copy verbatim from the spec's message schema (both locales). All `Music` keys must exist in BOTH message files or next-intl throws at build.
- `setRequestLocale` is called in the root layout AND in the new `music/layout.tsx` + `music/page.tsx` (static-rendering pattern already used by existing pages).
- `usePathname()` from `@repo/i18n/navigation` returns the pathname WITHOUT the locale prefix (e.g. `/en/music` → `/music`, `/en` → `/`). This drives the sidebar active state.
- Arrays and objects from messages are read with `t.raw(...)`.
- The axe test fails ONLY on `serious`/`critical` violations (moderate issues — e.g. `heading-order`, `region` — are accepted per the spec's structure).
- No automated test framework existed; Playwright is added by this plan. Verification = `next build` (static generation of both locales) + axe scan.
- Commit style: conventional commits, e.g. `feat(i18n): ...`, `feat(apps): ...`. Commit after each task.
- Work from the repo root unless a step says otherwise.

---

### Task 1: Add the `Music` i18n namespace

**Files:**
- Modify: `packages/i18n/messages/en.json`
- Modify: `packages/i18n/messages/zh-CN.json`

**Interfaces:**
- Consumes: nothing.
- Produces: the `Music` namespace consumed by Tasks 3–4. Exact keys: `skipToContent`, `navLabel`, `brand`, `discover`, `library`, `home`, `browse`, `radio`, `playlists`, `songs`, `personalizedPicks`, `tabsLabel`, `tabs` (array, 5 items), `cta`, `section1` (`{title, subheading}`), `section2` (`{title, subheading}`), `playlistDescription`, `playlistsData` (array, 4 items), `albumArtist`, `albumGenres` (array, 6 items).

- [ ] **Step 1: Add the `Music` namespace to `packages/i18n/messages/en.json`**

Insert the `Music` block between the `HomePage` block (ends line 25) and the `Switcher` block (starts line 26), i.e. after the `HomePage` object's closing `},`:

```json
  "Music": {
    "skipToContent": "Skip to main content",
    "navLabel": "Main navigation",
    "brand": "Music app",
    "discover": "Discover",
    "library": "Library",
    "home": "Home",
    "browse": "Browse",
    "radio": "Radio",
    "playlists": "Playlists",
    "songs": "Songs",
    "personalizedPicks": "Personalized picks",
    "tabsLabel": "Content type",
    "tabs": ["Music", "Podcasts", "Live", "Popular", "New Releases"],
    "cta": "Call to action",
    "section1": { "title": "Title", "subheading": "Subheading" },
    "section2": { "title": "Title", "subheading": "Subheading" },
    "playlistDescription": "Description of playlist",
    "playlistsData": ["Playlist 1", "Playlist 2", "Playlist 3", "Playlist 4"],
    "albumArtist": "Artist Name",
    "albumGenres": ["R&B", "Indie pop", "Hip hop", "Electronic", "R&B", "Rock"]
  },
```

- [ ] **Step 2: Add the `Music` namespace to `packages/i18n/messages/zh-CN.json`**

Insert the `Music` block in the same position (after the `HomePage` block, before `Switcher`):

```json
  "Music": {
    "skipToContent": "跳到主内容",
    "navLabel": "主导航",
    "brand": "音乐应用",
    "discover": "发现",
    "library": "音乐库",
    "home": "首页",
    "browse": "浏览",
    "radio": "电台",
    "playlists": "播放列表",
    "songs": "歌曲",
    "personalizedPicks": "个性化推荐",
    "tabsLabel": "内容类型",
    "tabs": ["音乐", "播客", "直播", "热门", "新发行"],
    "cta": "行动号召",
    "section1": { "title": "标题", "subheading": "副标题" },
    "section2": { "title": "标题", "subheading": "副标题" },
    "playlistDescription": "播放列表描述",
    "playlistsData": ["播放列表 1", "播放列表 2", "播放列表 3", "播放列表 4"],
    "albumArtist": "艺术家名称",
    "albumGenres": ["节奏布鲁斯", "独立流行", "嘻哈", "电子", "节奏布鲁斯", "摇滚"]
  },
```

- [ ] **Step 3: Verify both files are valid JSON and have identical key sets**

Run:
```bash
node -e "const en=require('./packages/i18n/messages/en.json');const zh=require('./packages/i18n/messages/zh-CN.json');const a=Object.keys(en.Music).sort();const b=Object.keys(zh.Music).sort();if(JSON.stringify(a)!==JSON.stringify(b)){console.error('KEY MISMATCH',a,b);process.exit(1)};console.log('OK',a.length,'keys')"
```
Expected: prints `OK` with the key count. No `KEY MISMATCH`.

- [ ] **Step 4: Commit**

```bash
git add packages/i18n/messages/en.json packages/i18n/messages/zh-CN.json
git commit -m "feat(i18n): add music page messages"
```

---

### Task 2: Add Playwright + axe test infrastructure

**Files:**
- Modify: `apps/package.json`
- Create: `apps/playwright.config.ts`
- Create: `apps/tests/a11y.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: the `test:a11y` script (`playwright test`) that Task 5 runs. The spec file scans `/en/music`, `/zh-CN/music`, `/en` and fails on serious/critical violations.

- [ ] **Step 1: Edit `apps/package.json`**

Add `"test:a11y": "playwright test"` to `scripts`:

```jsonc
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test:a11y": "playwright test"
  },
```

Add `"lucide-react": "^1.28.0"` to `dependencies` (alphabetically, after `@repo/ui`/`@repo/i18n` and before `next-intl`):

```jsonc
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/i18n": "workspace:*",
    "lucide-react": "^1.28.0",
    "next-intl": "^4.13.4",
    "clsx": "^2.1.1",
    "next": "16.2.12",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "sass": "^1.97.3"
  },
```

Add these to `devDependencies` (keep existing entries):

```jsonc
  "devDependencies": {
    "@axe-core/playwright": "^4.12.1",
    "@playwright/test": "^1.62.1",
    "axe-core": "^4.12.1",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.12",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
```

- [ ] **Step 2: Create `apps/playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

Notes:
- `webServer` runs `next dev` (port 3000, the Next.js default) from `apps/`.
- `reuseExistingServer` lets the run reuse a dev server already on 3000 during local dev.

- [ ] **Step 3: Create `apps/tests/a11y.spec.ts`**

```ts
import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const urls = ["/en/music", "/zh-CN/music", "/en"]

for (const url of urls) {
  test(`${url} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(url)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    const violations = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical"
    )
    expect(violations).toEqual([])
  })
}
```

- [ ] **Step 4: Install dependencies**

Run: `pnpm install`
Expected: resolves without errors; `lucide-react`, `@playwright/test`, `@axe-core/playwright`, `axe-core` installed for `apps`.

- [ ] **Step 5: Install the Playwright Chromium browser (one-time)**

Run: `pnpm --filter apps exec playwright install chromium`
Expected: downloads Chromium (~150 MB, needs network). On success it prints "chromium ... downloaded".

- [ ] **Step 6: Verify Playwright discovers the tests (no server boot in list mode)**

Run: `pnpm --filter apps exec playwright test --list`
Expected: prints 3 tests, each named `... has no serious or critical axe violations` (the `/en/music` and `/zh-CN/music` pages will 404 until Task 4 — that is expected at this point; do NOT run the tests yet).

- [ ] **Step 7: Commit**

```bash
git add apps/package.json pnpm-lock.yaml apps/playwright.config.ts apps/tests/a11y.spec.ts
git commit -m "feat(apps): add axe accessibility test infra"
```

---

### Task 3: Music shell composite components

**Files:**
- Create: `apps/app/[locale]/components/music/Sidebar.tsx`
- Create: `apps/app/[locale]/components/music/SegmentedControl.tsx`
- Create: `apps/app/[locale]/components/music/TopNav.tsx`
- Create: `apps/app/[locale]/components/music/MusicShell.tsx`
- Create: `apps/app/[locale]/components/music/PlaylistCard.tsx`
- Create: `apps/app/[locale]/components/music/AlbumCard.tsx`

**Interfaces:**
- Consumes: `Music` messages (Task 1); `usePathname`, `Link` from `@repo/i18n/navigation`; `Card`, `CardContent` from `@repo/ui/components/card`; `Button` from `@repo/ui/components/button`; `getTranslations` from `next-intl/server`.
- Produces (consumed by Task 4):
  - `MusicShell({ children }: { children: ReactNode })` — server component.
  - `Sidebar()` — client component, no props.
  - `TopNav()` — server component, no props.
  - `PlaylistCard({ title, description, index }: { title: string; description: string; index: number })`.
  - `AlbumCard({ artist, genre }: { artist: string; genre: string })`.

- [ ] **Step 1: Create `apps/app/[locale]/components/music/Sidebar.tsx`**

```tsx
"use client"

import { Home, ListMusic, Music, Radio, Search, Smile } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@repo/i18n/navigation"

export default function Sidebar() {
  const t = useTranslations("Music")
  const pathname = usePathname()
  const isHomeActive = pathname === "/" || pathname === "/home"

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col lg:flex">
      <p className="px-6 py-6 text-xl font-semibold">{t("brand")}</p>
      <nav aria-label={t("navLabel")} className="flex flex-col gap-6">
        <div>
          <p className="px-6 pb-1 text-xs font-medium text-muted-foreground">
            {t("discover")}
          </p>
          <ul>
            <li>
              <Link
                href="/"
                aria-current={isHomeActive ? "page" : undefined}
                className={
                  isHomeActive
                    ? "flex h-10 items-center gap-2 bg-muted px-6"
                    : "flex h-10 items-center gap-2 px-6"
                }
              >
                <Home className="size-4" />
                {t("home")}
              </Link>
            </li>
            <li className="flex h-10 items-center gap-2 px-6">
              <Search className="size-4" />
              {t("browse")}
            </li>
            <li className="flex h-10 items-center gap-2 px-6">
              <Radio className="size-4" />
              {t("radio")}
            </li>
          </ul>
        </div>
        <div>
          <p className="px-6 pb-1 text-xs font-medium text-muted-foreground">
            {t("library")}
          </p>
          <ul>
            <li className="flex h-10 items-center gap-2 px-6">
              <ListMusic className="size-4" />
              {t("playlists")}
            </li>
            <li className="flex h-10 items-center gap-2 px-6">
              <Music className="size-4" />
              {t("songs")}
            </li>
            <li className="flex h-10 items-center gap-2 px-6">
              <Smile className="size-4" />
              {t("personalizedPicks")}
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}
```

Notes:
- Only `Home` is a real link (→ `/[locale]`). The other five items have no target route and are rendered as non-link `<li>` text (no dead links, no fake `href="#"`).
- `usePathname()` strips the locale prefix, so the active check is `/` (for `/[locale]`) or `/home`.

- [ ] **Step 2: Create `apps/app/[locale]/components/music/SegmentedControl.tsx`**

```tsx
import { getTranslations } from "next-intl/server"

export default async function SegmentedControl() {
  const t = await getTranslations("Music")
  const tabs = t.raw("tabs") as string[]

  return (
    <div
      role="group"
      aria-label={t("tabsLabel")}
      className="inline-flex max-w-full items-center overflow-x-auto rounded-full bg-muted p-1"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          aria-pressed={index === 0}
          aria-current={index === 0 ? "page" : undefined}
          className={
            index === 0
              ? "h-7 shrink-0 rounded-full bg-background px-3 text-sm font-medium whitespace-nowrap text-foreground"
              : "h-7 shrink-0 rounded-full px-3 text-sm font-medium whitespace-nowrap text-muted-foreground"
          }
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
```

Notes:
- `role="group"` + `aria-pressed` is correct here because there are no tab panels (`role="tablist"` would be wrong).
- The first tab ("Music") is the current page → `aria-pressed` + `aria-current="page"`.
- `overflow-x-auto` + `shrink-0` + `whitespace-nowrap` keep the pill scrollable on small screens.

- [ ] **Step 3: Create `apps/app/[locale]/components/music/TopNav.tsx`**

```tsx
import { getTranslations } from "next-intl/server"
import { Button } from "@repo/ui/components/button"
import SegmentedControl from "./SegmentedControl"

export default async function TopNav() {
  const t = await getTranslations("Music")

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background px-8 py-6 lg:px-20">
      <SegmentedControl />
      <Button>{t("cta")}</Button>
    </header>
  )
}
```

Notes:
- `bg-background border-b` are added so the sticky bar is opaque over scrolled content.
- Known visual note (out of scope per spec): the global fixed `LocaleSwitcher` from the root layout (`top-4 right-4 z-50`) may overlap the CTA at lg widths. Not covered by axe; do not change the root layout.

- [ ] **Step 4: Create `apps/app/[locale]/components/music/MusicShell.tsx`**

```tsx
import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"
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
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main id="main" className="flex-1 overflow-y-auto px-8 py-6 lg:px-20">
          {children}
        </main>
      </div>
    </div>
  )
}
```

Notes:
- Skip link is the first focusable element; it points at `<main id="main">`.
- Landmarks: `<aside>` (sidebar), `<nav aria-label>` (in Sidebar), `<header>` (TopNav), `<main>`.

- [ ] **Step 5: Create `apps/app/[locale]/components/music/PlaylistCard.tsx`**

```tsx
import { Card, CardContent } from "@repo/ui/components/card"

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
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-base text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
```

Notes:
- `pt-0` on the Card makes the cover flush with the card top (tailwind-merge in `cn` drops the conflicting `py` top token).
- The cover text is `aria-hidden` (decorative) because the name is repeated in the `<h3>` below. Card titles are real `<h3>` elements (the library's `CardTitle` renders a `div`).
- Cover colors are hardcoded per the spec, not in i18n.

- [ ] **Step 6: Create `apps/app/[locale]/components/music/AlbumCard.tsx`**

```tsx
import { Card, CardContent } from "@repo/ui/components/card"

type AlbumCardProps = {
  artist: string
  genre: string
}

export default function AlbumCard({ artist, genre }: AlbumCardProps) {
  return (
    <Card size="sm" className="pt-0">
      <div aria-hidden className="aspect-square bg-muted" />
      <CardContent className="flex flex-col gap-1">
        <h3 className="text-xl font-medium">{artist}</h3>
        <p className="text-base text-muted-foreground">{genre}</p>
      </CardContent>
    </Card>
  )
}
```

Note: the gray cover is a decorative `div` (`bg-muted`), `aria-hidden`, no image, no alt.

- [ ] **Step 7: Typecheck the new components**

Run: `pnpm --filter apps exec tsc --noEmit`
Expected: exit 0, no type errors. (Components aren't imported by any page yet, but `tsc` still typechecks them because they're inside `apps/tsconfig.json`'s `include`.)

- [ ] **Step 8: Commit**

```bash
git add "apps/app/[locale]/components/music"
git commit -m "feat(apps): add music shell components"
```

---

### Task 4: Music layout + page

**Files:**
- Create: `apps/app/[locale]/music/layout.tsx`
- Create: `apps/app/[locale]/music/page.tsx`

**Interfaces:**
- Consumes: `MusicShell` from Task 3; `PlaylistCard`, `AlbumCard` from Task 3; `Music` messages from Task 1.
- Produces: routes `/en/music` and `/zh-CN/music` (statically generated).

- [ ] **Step 1: Create `apps/app/[locale]/music/layout.tsx`**

```tsx
import type { ReactNode } from "react"
import { setRequestLocale } from "next-intl/server"
import MusicShell from "../components/music/MusicShell"

export default async function MusicLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <MusicShell>{children}</MusicShell>
}
```

Note: follows the static-rendering pattern — the root `[locale]/layout.tsx` already calls `setRequestLocale`, and this nested layout does too so the server `getTranslations` calls inside `MusicShell`/`TopNav`/`SegmentedControl` and the page resolve during `next build`.

- [ ] **Step 2: Create `apps/app/[locale]/music/page.tsx`**

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server"
import AlbumCard from "../components/music/AlbumCard"
import PlaylistCard from "../components/music/PlaylistCard"

export default async function MusicPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Music")

  const playlists = t.raw("playlistsData") as string[]
  const genres = t.raw("albumGenres") as string[]

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="playlists-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 id="playlists-heading" className="text-3xl font-semibold tracking-tight">
            {t("section1.title")}
          </h1>
          <p className="text-muted-foreground">{t("section1.subheading")}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {playlists.map((title, index) => (
            <PlaylistCard
              key={`playlist-${index}`}
              index={index}
              title={title}
              description={t("playlistDescription")}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="albums-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="albums-heading" className="text-2xl font-semibold tracking-tight">
            {t("section2.title")}
          </h2>
          <p className="text-muted-foreground">{t("section2.subheading")}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
          {genres.map((genre, index) => (
            <AlbumCard key={`album-${index}`} artist={t("albumArtist")} genre={genre} />
          ))}
        </div>
      </section>
    </div>
  )
}
```

Notes:
- Section 1 is `<h1>` → 4 `PlaylistCard`s; Section 2 is `<h2>` → 6 `AlbumCard`s. Card titles are `<h3>`. The `h1 → h3` skip and the `h3 → h2` order produce a moderate `heading-order` axe note — accepted by the spec (the test only fails on serious/critical).
- Both section headings intentionally read "Title"/"Subheading" (verbatim Figma placeholder copy).

- [ ] **Step 3: Build the app and verify both music routes are statically generated**

Run: `pnpm --filter apps build`
Expected: exit 0; output includes the `/music` route for both locales. Then verify the generated pages exist:

```bash
ls apps/.next/server/app/en/music.html apps/.next/server/app/zh-CN/music.html
```

Expected: both files listed (proves next-intl found all `Music` keys for both locales and rendered the routes statically).

- [ ] **Step 4: Commit**

```bash
git add "apps/app/[locale]/music"
git commit -m "feat(apps): add /music page"
```

---

### Task 5: Run the axe scan and fix any serious/critical violations

**Files:**
- None required (verification + fixes, if any).

**Interfaces:**
- Consumes: everything from Tasks 1–4.

- [ ] **Step 1: Run the a11y test suite**

Run: `pnpm --filter apps test:a11y`
Expected: 3 tests pass. If any test fails, proceed to Step 2 (do not continue).

- [ ] **Step 2 (only if failures): Inspect and fix serious/critical violations**

If a test fails, Playwright prints the offending nodes. Likely fixes, in order:

- **Color contrast on muted text or the CTA**: the base shadcn tokens should already pass on white (`--muted-foreground` ≈ #6b6b6b is ~5.1:1). If a contrast failure is reported on a specific node, increase that node's text color (e.g. use `text-foreground/70` instead of `text-muted-foreground`, or darken the cover overlay) and re-run.
- **Missing heading/text on a control**: ensure every button/link has visible text and every card title is real text (already true in Task 3).
- **`landmark-one-main`, `page-has-heading-one`, `region`, `heading-order`, `document-title`** are moderate — they do NOT fail the test (filter is serious/critical only). Do not chase them.
- If the `/en` scan reports a serious/critical violation that is pre-existing in the Vercel landing page (unrelated to the music page), fix it in `apps/app/[locale]/page.tsx` minimally (e.g. adjust the offending contrast color) and note it in the commit message.

After each fix, re-run `pnpm --filter apps test:a11y` until all 3 tests pass.

- [ ] **Step 3: Final verification**

Run:
```bash
pnpm --filter apps build
pnpm --filter apps test:a11y
git status
```
Expected: build exits 0; all 3 a11y tests pass; `git status` shows no unintended changes (the `apps/.next/` output is gitignored).

- [ ] **Step 4: Commit any fixes (only if Step 2 changed files)**

```bash
git add -A
git commit -m "fix(apps): address axe accessibility findings"
```
If Step 2 made no changes, skip this step.

- [ ] **Step 5: Manual check (user, optional)**

`pnpm --filter apps dev`, open `http://localhost:3000/en/music` and `/zh-CN/music`: keyboard tab-through (skip link → sidebar nav → segmented tabs → CTA → cards), responsive at 1440px and <1024px (sidebar hides below `lg`), and both locales.

---

## Self-Review

- **Spec coverage:**
  - Route `/en/music` + `/zh-CN/music` under `[locale]` → Task 4. ✓
  - Reusable music shell via nested layout → Task 3 (`MusicShell`) + Task 4 (`music/layout.tsx`). ✓
  - `@repo/ui` `Card`/`CardContent`/`Button` used → Task 3 (PlaylistCard/AlbumCard use Card/CardContent; TopNav uses Button). ✓
  - Verbatim placeholder copy, en + zh-CN → Task 1 (exact values from the spec). ✓
  - Cover art = CSS placeholders → Task 3 (colored `div`s, `aria-hidden`, no images). ✓
  - Minimal interactivity: Home link real, everything else styled with correct ARIA (`aria-current`, `aria-pressed`) → Task 3. ✓
  - Accessibility: skip link, landmarks, h1→h2→h3, focus states, contrast → Tasks 3–5. ✓
  - Automated axe (WCAG A+AA) as a repo script → Task 2 + Task 5 (`test:a11y`, 0 serious/critical). ✓
  - Dependencies (`lucide-react`, Playwright trio) + `test:a11y` script → Task 2. ✓
- **Placeholder scan:** no TBD/TODO; every code step contains the full file contents; verification commands have expected outputs.
- **Type consistency:**
  - `MusicShell({ children }: { children: ReactNode })` defined in Task 3, consumed in Task 4 layout. ✓
  - `PlaylistCard({ title, description, index })` and `AlbumCard({ artist, genre })` defined in Task 3, used in Task 4 page. ✓
  - Message keys used (`t("section1.title")`, `t.raw("tabs")`, `t.raw("playlistsData")`, `t.raw("albumGenres")`, etc.) all exist in the Task 1 namespace in both locales. ✓
  - `usePathname()` locale-prefix behavior, `t.raw` for arrays, and `@axe-core/playwright` API all verified against current docs/packages before writing. ✓
- **Known accepted deviations (documented):** `skipToContent` key added beyond the spec's list (the spec requires a skip link but its message schema had no key for it); `pt-0` + `bg-background border-b` minor styling additions; `heading-order`/`region` moderate axe notes accepted (test filters serious/critical).
