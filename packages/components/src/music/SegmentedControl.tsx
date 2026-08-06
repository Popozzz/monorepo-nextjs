"use client"

import { useTranslations } from "next-intl"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs"

export default function SegmentedControl() {
  const t = useTranslations("Music")
  const tabs = t.raw("tabs") as string[]

  return (
    <Tabs defaultValue={tabs[0]}>
      <TabsList
        aria-label={t("tabsLabel")}
        className="max-w-full overflow-x-auto rounded-full"
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="flex-none rounded-full px-3">
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
