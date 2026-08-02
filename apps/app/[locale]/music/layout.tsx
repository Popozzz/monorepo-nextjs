import type { ReactNode } from "react"
import { setRequestLocale } from "next-intl/server"
import MusicShell from "../components/music/MusicShell"

export default async function MusicLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <MusicShell>{children}</MusicShell>
}
