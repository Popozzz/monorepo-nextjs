"use client"

import { useTranslations } from "next-intl"
import { Button } from "@repo/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card"

export default function HomePage() {
  const t = useTranslations("HomePage")

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button>{t("buttons.default")}</Button>
          <Button variant="outline">{t("buttons.outline")}</Button>
          <Button variant="secondary">{t("buttons.secondary")}</Button>
          <Button variant="ghost">{t("buttons.ghost")}</Button>
          <Button variant="destructive">{t("buttons.destructive")}</Button>
          <Button variant="link">{t("buttons.link")}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
