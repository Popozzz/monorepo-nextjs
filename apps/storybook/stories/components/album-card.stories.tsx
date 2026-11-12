import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AlbumCard } from "@repo/components"

const meta = {
  title: "Components/AlbumCard",
  component: AlbumCard,
  args: {
    artist: "The Midnight",
    genre: "Synthwave",
  },
} satisfies Meta<typeof AlbumCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
