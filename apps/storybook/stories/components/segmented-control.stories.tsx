import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { SegmentedControl } from "@repo/components"

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
} satisfies Meta<typeof SegmentedControl>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
