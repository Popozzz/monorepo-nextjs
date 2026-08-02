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
