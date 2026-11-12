import { NextIntlClientProvider } from "next-intl"
import messages from "@repo/i18n/messages/en.json"

import type { Preview } from "@storybook/nextjs-vite"

import "./storybook.css"

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/music",
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
}

export default preview
