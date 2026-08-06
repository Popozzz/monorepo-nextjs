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

  function onLocaleChange(nextLocale: string | null) {
    if (nextLocale === null) return
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
