import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"
import { SidebarInset } from "@repo/ui/components/sidebar"
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
        <div id="main" className="flex-1 overflow-y-auto px-8 py-6 lg:px-20">
          {children}
        </div>
      </SidebarInset>
    </div>
  )
}
