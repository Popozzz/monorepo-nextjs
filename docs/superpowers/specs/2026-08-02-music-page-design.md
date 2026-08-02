# Design: /music page with reusable music shell

Date: 2026-08-02

## Goal

Build a `/music` page in the Next.js app (`apps/app`) matching the Figma design
`HbzxKxyrOJ2J11y4qWrVUL` node `1:2771` ("Music", 1440×960), reusing the shadcn
`@repo/ui` components, with accessibility-first implementation verified by an
automated axe scan.

## Requirements

- Route: `/en/music` and `/zh-CN/music` (under `[locale]/`, next-intl).
- Reusable **music shell** (sidebar + top nav + main) scoped to the music
  section via a nested layout, so future music routes reuse it.
- Use `@repo/ui` shadcn components (`Card`, `CardContent`, `Button`) wherever
  they fit.
- Placeholder copy verbatim from the Figma, translated to en + zh-CN.
- Cover art = CSS placeholders (no external images).
- Minimal interactivity: Home links to the existing root page; everything else
  is styled controls with correct ARIA.
- Accessibility: semantic landmarks, heading hierarchy, `aria-current`,
  focus states, contrast; automated axe (WCAG A+AA) scan added as a repo script.

## Architecture

### File structure

```
apps/app/
├── [locale]/
│   ├── layout.tsx                  (existing root layout — untouched)
│   ├── music/
│   │   ├── layout.tsx              NEW — music shell layout
│   │   └── page.tsx                NEW — server component page content
│   └── components/music/           NEW — app-local composite components
│       ├── MusicShell.tsx          sidebar + header + main
│       ├── Sidebar.tsx             brand + Discover/Library nav groups
│       ├── SegmentedControl.tsx    content-type tabs
│       ├── TopNav.tsx              segmented control + CTA button
│       ├── PlaylistCard.tsx        large card (cover + name + description)
│       └── AlbumCard.tsx           small card (cover + artist + genre)
```

- `music/layout.tsx` is a server component; it renders `MusicShell` with
  `{children}` in `<main>`.
- `music/page.tsx` is a server component (`getTranslations` + `setRequestLocale`).
- `Sidebar.tsx` is a **client component** (`"use client"`): the route-based
  active state needs `usePathname` from `@repo/i18n/navigation` (a client hook),
  and it uses the client `useTranslations`. Everything else (MusicShell,
  TopNav, SegmentedControl, cards, page) stays a server component.
- `@repo/ui` used: `Card`/`CardContent` in cards, `Button` for the CTA. Card
  titles are rendered as real `<h3>` elements (the library's `CardTitle`
  renders a `div` — unsuitable for the heading hierarchy).

### Dependencies

`apps/package.json`:
- `dependencies` += `lucide-react` (sidebar icons; already in the lockfile via
  `@repo/ui`).
- `devDependencies` += `@playwright/test`, `@axe-core/playwright`, `axe-core`.
- `scripts` += `"test:a11y": "playwright test"`.

### i18n

New `Music` namespace in `packages/i18n/messages/en.json` and `zh-CN.json`:

en:
```json
"Music": {
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
}
```

zh-CN mirrors the structure: 音乐应用, 发现, 音乐库, 首页, 浏览, 电台,
播放列表, 歌曲, 个性化推荐, 内容类型, tabs 音乐/播客/直播/热门/新发行,
行动号召, 标题/副标题, 播放列表描述, 播放列表 1–4, 艺术家名称, genres
节奏布鲁斯/独立流行/嘻哈/电子/节奏布鲁斯/摇滚.

Playlist cover colors are hardcoded in the component (white, yellow
`#ffee93`, pink `#ffc1c1`, gray `#f5f5f5`), not in i18n.

## Layout & components

### MusicShell

- `<div className="flex min-h-screen bg-background">`
- `Sidebar` fixed left `w-64`, `hidden lg:flex` (collapses below `lg`).
- Right column: `TopNav` + `<main id="main" className="flex-1 overflow-y-auto px-8 lg:px-20 py-6">`.
- Skip link: first child, "Skip to main content" → `href="#main"`, visually
  hidden until focused.

### Sidebar (`<aside>`)

- Brand "Music app" (20px/600) at top, `px-6 py-6`.
- `<nav aria-label={t("navLabel")}>`:
  - **Discover** group: header label + items Home, Browse, Radio.
  - **Library** group: header label + items Playlists, Songs, Personalized picks.
- Each item: lucide icon (Home, Search, Radio, ListMusic, Music, Smile) + label,
  `h-10` rows, `px-6`.
- Home is a `@repo/i18n/navigation` `Link` → `/[locale]`; it gets
  `aria-current="page"` + `bg-muted` active style only when the current route is
  `/[locale]` or `/[locale]/home` (route-based active state, honest for a11y).
- Browse/Radio/Playlists/Songs/Personalized picks have no target routes →
  rendered as non-link `<li>` text (no dead links, no fake `href="#"`).

### TopNav (`<header>`)

- Sticky top bar, `flex items-center justify-between px-8 lg:px-20 py-6`.
- Left: `SegmentedControl`; right: `@repo/ui` `Button` ("Call to action").

### SegmentedControl

- `role="group"`, `aria-label={t("tabsLabel")}`.
- Pill container: `inline-flex rounded-full bg-muted p-1`.
- Buttons: `aria-pressed={isActive}`; active "Music" also `aria-current="page"`.
- No tab panels exist → this pattern (not `role="tablist"`) is correct.

### PlaylistCard (large grid)

- `Card` (size sm) wrapping: colored cover (`aspect-square`) with playlist name
  overlaid at 32px/600, `aria-hidden` (decorative; name is repeated in the
  heading below) + copy area with `<h3>` (20px/500) and `<p>` description
  (16px/400, `text-muted-foreground`).

### AlbumCard (small grid)

- `Card` (size sm): square gray cover (`aspect-square`, `bg-muted`/`#f5f5f5`) +
  `<h3>` "Artist Name" (20px/500) + genre `<p>` (16px/400).

### Page content (`page.tsx`)

- Section 1: `<h1>` (section1.title) + subheading → large grid
  (`grid gap-4 grid-cols-2 lg:grid-cols-4`) with 4 PlaylistCards.
- Section 2: `<h2>` (section2.title) + subheading → small grid
  (`grid gap-4 grid-cols-3 lg:grid-cols-6`) with 6 AlbumCards.
- Grids wrap on small screens; segmented control scrollable on overflow.
- Both section headings read "Title"/"Subheading" (verbatim placeholder copy) —
  accepted trade-off.

## Accessibility

- Skip link → `<main id="main">`.
- Landmarks: `<aside>`, `<nav aria-label>`, `<header>`, `<main>`.
- Heading hierarchy: h1 → h2 → h3; card titles are real headings.
- `aria-current="page"` for route-active nav; `aria-pressed` for segmented tabs.
- Native `<a>`/`<button>` only; visible `focus-visible` rings on all
  interactive elements.
- Muted text ≥ 4.5:1 on white; dark text on light colored covers.
- Decorative covers are CSS divs (no `<img>`, no alt needed); overlaid text
  `aria-hidden`.

## Error handling

- Unknown locale handled by the existing root layout (`notFound()`).
- i18n arrays (`tabs`, `playlistsData`, `albumGenres`) are static per locale;
  keys must exist in both message files or next-intl throws at build — the
  build step verifies this.
- Out of scope: loading/error states for the page (static content), skeleton
  screens, dark mode.

## Verification

- `pnpm build` in `apps/` must succeed (static generation of both locales).
- **Automated a11y scan**: `pnpm --filter apps test:a11y` runs Playwright +
  `@axe-core/playwright` (WCAG A+AA) against the dev server on `/en/music`,
  `/zh-CN/music`, and `/en`; must pass with 0 serious/critical violations.
  `apps/playwright.config.ts` boots the app via `webServer`.
- Manual: keyboard tab-through (skip link → nav → tabs → CTA → cards),
  responsive check at 1440px and <1024px, both locales.
- Playwright chromium installed via `npx playwright install chromium` (one-time).
