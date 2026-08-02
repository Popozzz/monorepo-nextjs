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
