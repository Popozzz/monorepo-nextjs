# Design: Add next-intl internationalization to monorepo-nextjs

Date: 2026-08-02

## Goal

Add multi-language support to the Next.js app in this pnpm monorepo using
[next-intl](https://next-intl.dev) (v4), with translation infrastructure
reusable across future apps in the monorepo.

## Requirements

- Locales: `en` (default) and `zh-CN`.
- URL strategy: locale prefix always — `/en/...` and `/zh-CN/...`.
- Shared i18n code and messages live in `packages/i18n`, published as `@repo/i18n`.
  The app keeps only Next-specific wiring.
- Scope: full setup, migrate both existing pages under `/[locale]/`, translate
  their text, and add a language switcher.

## Architecture

### `packages/i18n` (shared package)

```
packages/i18n/
├── package.json          # name "@repo/i18n", type: module, exports map
├── tsconfig.json         # extends ../../tsconfig.base.json
├── src/
│   ├── index.ts          # re-exports public API
│   ├── routing.ts        # defineRouting
│   ├── navigation.ts     # createNavigation
│   └── request.ts        # getRequestConfig
└── messages/
    ├── en.json
    └── zh-CN.json
```

- `src/routing.ts`:
  ```ts
  import {defineRouting} from 'next-intl/routing';

  export const routing = defineRouting({
    locales: ['en', 'zh-CN'],
    defaultLocale: 'en',
    localePrefix: 'always'
  });
  ```
- `src/navigation.ts`: `createNavigation(routing)` → typed `Link`,
  `useRouter`, `usePathname`, `redirect`, `getPathname`.
- `src/request.ts`: `getRequestConfig` that validates the requested locale with
  `hasLocale` (falling back to `defaultLocale`) and loads
  `../messages/<locale>.json`.
- `src/index.ts` re-exports routing, navigation, and the request config.

`package.json`:
- `name`: `@repo/i18n`, `private: true`, `type: module`, no build step.
- `exports` map mirroring `@repo/ui` style (`.`, plus subpath exports for
  `./routing`, `./navigation`, `./request`).
- `dependencies`: `next-intl`.
- `peerDependencies`: `react`, `next`.

### App wiring (`apps/`)

- `apps/next.config.ts`: wrap config with
  `createNextIntlPlugin('./i18n/request.ts')`; add `@repo/i18n` to
  `transpilePackages` (alongside `@repo/ui`).
- `apps/proxy.ts` (Next.js 16; `middleware.ts` was renamed to `proxy.ts`):
  ```ts
  import createMiddleware from 'next-intl/middleware';
  import {routing} from '@repo/i18n/routing';

  export default createMiddleware(routing);

  export const config = {
    matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
  };
  ```
  Handles locale negotiation, redirects, and rewrites.
- `apps/i18n/request.ts`: thin re-export:
  ```ts
  export {default} from '@repo/i18n/request';
  ```
- `apps/package.json`: add `"@repo/i18n": "workspace:*"` dependency.
- `tsconfig.base.json`: add `"@repo/i18n": ["packages/i18n/src"]` path
  (matches the existing `@repo/ui` pattern).

### App router migration (`apps/app/`)

Before → after:

```
apps/app/
├── layout.tsx            ──►  [locale]/layout.tsx
├── page.tsx              ──►  [locale]/page.tsx (translated)
├── home/page.jsx         ──►  [locale]/home/page.tsx (translated, .jsx → .tsx)
├── home/page.module.css  ──►  [locale]/home/page.module.css
├── globals.css           (stays)
└── favicon.ico           (stays)
```

`[locale]/layout.tsx`:
- No root `layout.tsx` remains; this is the root html layout.
- `generateStaticParams()` from `routing.locales` for static rendering of both
  locales.
- `params` is awaited (`params: Promise<{locale: string}>`, Next.js 16).
- Validates locale with `hasLocale`, calls `notFound()` on invalid.
- Calls `setRequestLocale(locale)`.
- Renders `<html lang={locale}>`, body, `NextIntlClientProvider` with
  `getMessages()`.
- `generateMetadata` uses `getTranslations` (namespace `Metadata`).

`[locale]/page.tsx` and `[locale]/home/page.tsx`: translated with `next-intl`.
`[locale]/page.tsx` is a server component using `getTranslations`.
`[locale]/home/page.tsx` is migrated from `page.jsx` to `.tsx`, stays a client
component (`"use client"`), and uses `useTranslations` (messages come from the
provider in the layout).

### Language switcher

Client component `apps/app/components/LocaleSwitcher.tsx`:
- Uses `useLocale` (from `next-intl`) and `useRouter`/`usePathname` (from
  `@repo/i18n/navigation`).
- `router.replace(pathname, {locale: nextLocale})` inside `useTransition`.
- Rendered in the `[locale]` layout so it appears on every page.
- Select element listing `routing.locales` with current locale selected.

### Messages

Namespaces:
- `Metadata`: `title`, `description`.
- `Home`: default page text (title, description, template/link labels,
  "Deploy Now", "Documentation").
- `HomePage`: shadcn demo text (card title, card description, button variant
  labels).
- `Switcher`: `label` for accessibility.

`zh-CN.json` mirrors `en.json` structure exactly.

## Error handling

- Unknown locale → `notFound()` in the layout.
- Locale-specific `not-found.tsx` and `error.tsx` are out of scope (noted as
  follow-ups).
- Type-safe messages via `createMessagesDeclaration` is out of scope (noted as
  follow-up).

## Verification

- No automated test framework exists in the repo.
- `pnpm build` in `apps/` must succeed — validates static generation of both
  locales, route structure, and message loading.
- Manual: `pnpm dev`, check `/en` and `/zh-CN` render translated content, and
  the switcher navigates between locales preserving the current path.
