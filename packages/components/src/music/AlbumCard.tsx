import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@repo/ui/components/card"

type AlbumCardProps = {
  artist: string
  genre: string
}

export default function AlbumCard({ artist, genre }: AlbumCardProps) {
  return (
    <Card size="sm" className="pt-0">
      <div aria-hidden className="aspect-square bg-muted" />
      <CardContent className="flex flex-col gap-1">
        <CardTitle className="text-xl">{artist}</CardTitle>
        <CardDescription className="text-base">{genre}</CardDescription>
      </CardContent>
    </Card>
  )
}
