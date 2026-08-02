import { Card, CardContent } from "@repo/ui/components/card"

type AlbumCardProps = {
  artist: string
  genre: string
}

export default function AlbumCard({ artist, genre }: AlbumCardProps) {
  return (
    <Card size="sm" className="pt-0">
      <div aria-hidden className="aspect-square bg-muted" />
      <CardContent className="flex flex-col gap-1">
        <h3 className="text-xl font-medium">{artist}</h3>
        <p className="text-base text-muted-foreground">{genre}</p>
      </CardContent>
    </Card>
  )
}
