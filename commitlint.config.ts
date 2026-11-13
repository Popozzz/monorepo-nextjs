import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

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
];

const types = [
  "agent",
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
];

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [RuleConfigSeverity.Error, "always", types],
    "scope-enum": [RuleConfigSeverity.Error, "always", scopes],
  },
};

export default config;
