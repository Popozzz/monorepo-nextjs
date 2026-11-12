import type { ReactNode } from "react"
import { cn } from "@repo/utils"

export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl", className)}>{children}</div>
  )
}
