---
name: updating-dependencies
description: Use when the user asks to upgrade, update, or bump dependencies in this pnpm workspace, asks to update all outdated packages, or asks how a dependency upgrade affects the monorepo. Triggers include "update <package>", "bump <package>", "upgrade dependencies", `pnpm outdated`, peer dependency warnings, or duplicate package versions.
---

# Updating Dependencies

## Overview

Upgrade dependencies safely in this pnpm workspace. Confirm the target version first, analyze which packages and libraries are affected, keep every `package.json` using the same dependency on the same version, and only keep upgrades automatically when no source code changes are needed.

**Core rule:** package.json / lockfile-only changes may be kept automatically; any required source-code change must be reported and approved by the user first.

## Safety Rules

1. Never change a version before the user chooses the target version.
2. Never edit source code without explicit approval.
3. Never commit or push; leave changes in the working tree.
4. Never run `--force`, `--no-verify`, or a global `pnpm up --latest` unless explicitly requested.
5. Do not touch unrelated dependencies, scripts, `packageManager`, or `ignoredBuiltDependencies`.
6. Keep all workspace `package.json` files consistent for the same dependency.

## Workflow

### 1. Inventory Usage

Find every `package.json` and every place the dependency is declared or imported:

```bash
find . -name package.json -not -path '*/node_modules/*' -not -path './.git/*'
grep -RIn --include=package.json '"<dep>"[[:space:]]*:' . --exclude-dir=node_modules --exclude-dir=.git
grep -RIn --exclude-dir=node_modules --exclude-dir=.git -E "from ['\"]<dep>|require\(['\"]<dep>" .
pnpm outdated -r
pnpm why -r <dep>
```

Record for each workspace package: dependency type (`dependencies` / `devDependencies` / `peerDependencies`), current range, and source files using it.

If the user did not name a package, use `pnpm outdated -r` to list candidates and ask which ones to update.

### 2. Ask for the Target Version

Show the user a table before changing anything:

| Package | Current range(s) | In-range latest | Absolute latest |
| ------- | ---------------- | --------------- | --------------- |

Use:

```bash
pnpm outdated -r
pnpm view <dep> version
pnpm view <dep> dist-tags --json
```

**Do not proceed until the user chooses the target version.**

### 3. Analyze Impact and Linked Libraries

Check what else must move with the upgrade:

- Dependents listed by `pnpm outdated -r`.
- Peer constraints: `pnpm view <dep>@<version> peerDependencies peerDependenciesMeta engines --json`.
- Duplicate resolved versions: `pnpm ls -r <dep>` and `pnpm why -r <dep>`.
- Source usage from step 1.
- Common pairings in this repository:

| Changed dependency | Also check / align |
| ------------------ | ------------------ |
| `next` | `eslint-config-next`, `next-intl` |
| `react`, `react-dom` | `@types/react`, `@types/react-dom`, `next`, `next-intl` |
| `tailwindcss` | `@tailwindcss/postcss`, `@tailwindcss/vite` |
| `@playwright/test` | `@axe-core/playwright`, `axe-core` |
| `eslint` | `typescript-eslint`, `eslint-config-next`, `eslint-plugin-react-hooks` |

Report affected workspace packages, source usage points, and linked libraries before upgrading.

### 4. Upgrade and Keep Versions Consistent

Update **every** `package.json` that declares the dependency — root, `apps/*`, and `packages/*` — to the same chosen range:

```bash
pnpm --filter <workspace-package> up <dep>@<version>
pnpm -r --include-workspace-root up <dep>@<version>
pnpm install
```

- If linked libraries only need a version bump, update them too and align them across all `package.json` files.

**Version consistency rules:**

- `dependencies`, `devDependencies`, and `optionalDependencies`: use the same chosen range in every `package.json` that declares the dependency.
- `peerDependencies`: keep a range that includes the target version (e.g. `^19`); do not pin it to an exact version unless the repository already does so.
- If root and workspace packages currently use different ranges for the same direct dependency, normalize them as part of the upgrade.

Verify consistency before running validation:

```bash
grep -RIn --include=package.json '"<dep>"[[:space:]]*:' . --exclude-dir=node_modules --exclude-dir=.git
pnpm why -r <dep>
```

All direct ranges must match. Resolved versions should be identical except where pnpm legitimately splits by peer context.

### 5. Core Verification

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
```

Additionally run these when the changed dependency affects Storybook or tests (for example Storybook, Vite, Tailwind Vite, Playwright, axe, or Next dev tooling):

```bash
pnpm build-storybook
pnpm test
```

### 6. Decision Gate

| Result | Action |
| ------ | ------ |
| All commands pass, diff is only `package.json` + `pnpm-lock.yaml`, versions are consistent | Keep the upgrade and report success |
| Only other workspace `package.json` files need version alignment | Update them too, then re-run verification |
| Any command fails, or source code must change | **STOP**, keep the upgrade changes, report the change points, and wait for the user |

When stopping for code changes, report:

- Failing command and error excerpt.
- `file:line` of each required change.
- Affected workspace package(s).
- Suggested fix.
- Any peer dependency or linked-library warning.
- Confirmation that no source files were modified.

Ask whether to continue with the code changes. Do not edit source code until the user approves.

### 7. Git

Do not commit or push. Report:

```bash
git status --short
```

Suggest a commit message such as:

```text
chore(deps): bump <dep> to <version>
```

## Output Templates

### Version Choice

```text
Dependency: <dep>
Current: <range(s) across package.json files>
In-range latest: <version>
Absolute latest: <version>

Which version should I use?
```

### Impact Report

```text
Affected workspace packages:
- <package> (<dependencies|devDependencies>): <current range>

Source usage:
- <file:line>

Linked libraries:
- <dep> <current> -> <target> (reason)

Shared-version check:
- <package.json>: <range>
```

### Success

```text
Dependency update complete

Updated: <dep> <old> -> <new>
Files changed: <n> package.json + pnpm-lock.yaml
Shared versions: consistent across all package.json files
Verification: typecheck, lint, build passed
Source code changes: none
Git: not committed, not pushed
```

### Code Changes Required

```text
Upgrade paused: source changes required

Failing command: <command>
Error: <excerpt>

Change points:
- <file:line>: <what must change>

Affected packages: <packages>
Linked libraries: <details>
Source files modified: none

Upgrade changes are kept in the working tree.
Do you want me to make these code changes?
```

## Common Mistakes

- Updating only one `package.json` in the monorepo.
- Forgetting the root `package.json` when it also declares the dependency.
- Forcing `peerDependencies` to an exact version instead of a compatible range.
- Leaving direct dependency ranges inconsistent (for example `^19.2.3` in root but `19.2.3` in a package).
- Silently changing source code to make the upgrade compile.
- Updating to latest without asking which version.
- Ignoring peer dependency warnings or duplicate resolved versions.
- Committing or pushing without being asked.
