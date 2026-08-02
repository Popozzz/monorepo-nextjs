import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { mergeConfig } from "vite"

import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [react(), tailwindcss()],
    })
  },
}

export default config
