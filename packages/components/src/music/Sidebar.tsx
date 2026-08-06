"use client"

import { Home, ListMusic, Music, Radio, Search, Smile } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@repo/i18n/navigation"
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@repo/ui/components/sidebar"

export default function Sidebar() {
  const t = useTranslations("Music")
  const pathname = usePathname()
  const isHomeActive = pathname === "/" || pathname === "/home"

  return (
    <SidebarProvider className="w-fit shrink-0">
      <SidebarRoot
        collapsible="none"
        className="sticky top-0 hidden h-screen shrink-0 lg:flex"
      >
        <SidebarHeader>
          <p className="px-2 py-2 text-xl font-semibold">{t("brand")}</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("discover")}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <Link
                      href="/"
                      aria-current={isHomeActive ? "page" : undefined}
                    />
                  }
                >
                  <Home className="size-4" />
                  {t("home")}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {[
                { icon: Search, label: t("browse") },
                { icon: Radio, label: t("radio") },
              ].map(({ icon: Icon, label }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton render={<span />}>
                    <Icon className="size-4" />
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>{t("library")}</SidebarGroupLabel>
            <SidebarMenu>
              {[
                { icon: ListMusic, label: t("playlists") },
                { icon: Music, label: t("songs") },
                { icon: Smile, label: t("personalizedPicks") },
              ].map(({ icon: Icon, label }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton render={<span />}>
                    <Icon className="size-4" />
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </SidebarRoot>
    </SidebarProvider>
  )
}
