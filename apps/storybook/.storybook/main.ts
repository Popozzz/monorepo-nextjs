import tailwindcss from "@tailwindcss/vite"
import { mergeConfig } from "vite"

import type { StorybookConfig } from "@storybook/nextjs-vite"

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-mcp"],
  features: {
    componentsManifest: true,
  },
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
    })
  },
}

export default config
