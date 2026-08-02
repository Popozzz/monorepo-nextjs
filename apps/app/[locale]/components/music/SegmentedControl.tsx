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
              : "h-7 shrink-0 rounded-full px-3 text-sm font-medium whitespace-nowrap text-foreground/70"
          }
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
