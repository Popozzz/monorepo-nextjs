import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { PlaylistCard } from "@repo/components"

const meta = {
  title: "Components/PlaylistCard",
  component: PlaylistCard,
  args: {
    title: "Chill Mix",
    description: "Made for you",
    index: 0,
  },
} satisfies Meta<typeof PlaylistCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
