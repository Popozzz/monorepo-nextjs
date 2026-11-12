import type { UserConfig } from "@commitlint/types"
import { RuleConfigSeverity } from "@commitlint/types"

const scopes = [
  "web",
  "storybook",
  "ui",
  "components",
  "hooks",
  "i18n",
  "layouts",
  "utils",
  "workspace",
  "deps",
  "ci",
  "repo",
]

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [RuleConfigSeverity.Error, "always", scopes],
  },
}

export default config
