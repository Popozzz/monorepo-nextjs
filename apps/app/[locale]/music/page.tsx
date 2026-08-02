import { getTranslations, setRequestLocale } from "next-intl/server"
import { AlbumCard, PlaylistCard } from "@repo/components"

export default async function MusicPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Music")

  const playlists = t.raw("playlistsData") as string[]
  const genres = t.raw("albumGenres") as string[]

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="playlists-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 id="playlists-heading" className="text-3xl font-semibold tracking-tight">
            {t("section1.title")}
          </h1>
          <p className="text-muted-foreground">{t("section1.subheading")}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {playlists.map((title, index) => (
            <PlaylistCard
              key={`playlist-${index}`}
              index={index}
              title={title}
              description={t("playlistDescription")}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="albums-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="albums-heading" className="text-2xl font-semibold tracking-tight">
            {t("section2.title")}
          </h2>
          <p className="text-muted-foreground">{t("section2.subheading")}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
          {genres.map((genre, index) => (
            <AlbumCard key={`album-${index}`} artist={t("albumArtist")} genre={genre} />
          ))}
        </div>
      </section>
    </div>
  )
}
