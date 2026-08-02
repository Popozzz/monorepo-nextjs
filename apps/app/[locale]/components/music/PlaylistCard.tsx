import { Card, CardContent } from "@repo/ui/components/card"

const coverColors = ["#ffffff", "#ffee93", "#ffc1c1", "#f5f5f5"]

type PlaylistCardProps = {
  title: string
  description: string
  index: number
}

export default function PlaylistCard({
  title,
  description,
  index,
}: PlaylistCardProps) {
  return (
    <Card size="sm" className="pt-0">
      <div
        aria-hidden
        className="relative flex aspect-square items-end p-4"
        style={{ backgroundColor: coverColors[index % coverColors.length] }}
      >
        <span className="text-3xl font-semibold leading-none text-foreground">
          {title}
        </span>
      </div>
      <CardContent className="flex flex-col gap-1">
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-base text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
