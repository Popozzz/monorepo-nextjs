"use client"

import { useTransition, type ChangeEvent } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@repo/i18n/navigation"
import { routing } from "@repo/i18n/routing"

export default function LocaleSwitcher() {
  const locale = useLocale()
  const t = useTranslations("Switcher")
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <label className="fixed top-4 right-4 z-50 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <span>{t("label")}</span>
      <select
        defaultValue={locale}
        onChange={onSelectChange}
        disabled={isPending}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {routing.locales.map((cur) => (
          <option key={cur} value={cur}>
            {cur}
          </option>
        ))}
      </select>
    </label>
  )
}
