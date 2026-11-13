---
name: git-commit
description: Use when the user asks to commit staged changes, write or fix a Conventional Commits message, or validate a commit message in this pnpm monorepo. Triggers include "commit", "commit message", a failing `.husky/commit-msg` hook, or a commitlint scope/type error.
---

# Git Commit Skill

## 1. Objective

Create Git commits with clear, consistent, and meaningful commit messages.

All commit messages must comply with the project's existing Husky hooks, Commitlint configuration, and Conventional Commits conventions.

The agent must strictly follow these safety principles:

1. Only commit files that are already staged.
2. Never modify the Git staging area.
3. Generate commit messages exclusively from staged changes.
4. Never push commits to remote repositories.
5. Never bypass Git hooks or validation rules.

These safety rules take precedence over all other workflow instructions.

## 2. Inspect Project Configuration

Before committing, inspect the project to identify its commit conventions.

Check the following files if they exist:

- `package.json`
- `pnpm-workspace.yaml`
- `.husky/` (especially `.husky/commit-msg`)
- `commitlint.config.js`
- `commitlint.config.ts`
- `commitlint.config.mjs`
- `.commitlintrc`
- `.commitlintrc.json`
- `.commitlintrc.js`

Determine:

- Whether Husky is configured.
- Whether Commitlint is configured.
- Which commit message types are allowed.
- Whether `scope` is required.
- Whether subject length or capitalization rules exist.
- Whether additional commit message restrictions are configured.

**Important:** Existing project configuration takes precedence over the default conventions defined in this skill. `commitlint.config.ts` is the source of truth.

Do not modify Husky hooks or Commitlint configuration just to make a commit pass.

## 3. Project Conventions (Quick Reference)

This repository is a pnpm workspace with `apps/web`, `apps/storybook`, and `packages/*`. Use the tables below as a quick reference. If they disagree with `commitlint.config.ts`, the configuration wins.

### Allowed Types

| Type     | Usage                                           |
| -------- | ----------------------------------------------- |
| feat     | Introduce a new feature                         |
| fix      | Fix a bug                                       |
| docs     | Documentation changes only                      |
| style    | Formatting changes without affecting code logic |
| refactor | Refactor code without changing behavior         |
| perf     | Performance improvements                        |
| test     | Add or update tests                             |
| build    | Build system or dependency changes              |
| ci       | CI/CD configuration changes                     |
| chore    | Maintenance tasks and miscellaneous changes     |
| revert   | Revert a previous commit                        |
| agent    | Agent related changes                           |

### Allowed Scopes

Scope is optional. When present, it must be one of the following values:

| Scope        | Location                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `web`        | `apps/web`                                                                                                                |
| `storybook`  | `apps/storybook`                                                                                                          |
| `ui`         | `packages/ui`                                                                                                             |
| `components` | `packages/components`                                                                                                     |
| `hooks`      | `packages/hooks`                                                                                                          |
| `i18n`       | `packages/i18n`                                                                                                           |
| `layouts`    | `packages/layouts`                                                                                                        |
| `utils`      | `packages/utils`                                                                                                          |
| `workspace`  | Root workspace config: `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.mjs`, `*.code-workspace`, root scripts |
| `deps`       | Dependency changes in `package.json` and `pnpm-lock.yaml`                                                                 |
| `ci`         | CI configuration                                                                                                          |
| `repo`       | Repo-wide tooling: `.husky/`, `commitlint.config.ts`, other root config                                                   |

### Scope Selection

- Change inside a single app or package → use that package's scope (`web`, `ui`, `components`, ...).
- Cross-package or workspace-wide configuration → use `workspace` or `repo`.
- Dependency or lockfile-only change → use `deps`.
- Tooling, hooks, lint, or commitlint change → use `repo`.

Examples from this repository's history:

```text
refactor(workspace): move app to apps/web and complete shared packages
chore(storybook): unify ui and components stories in apps/storybook
chore(repo): add husky and commitlint for commit message linting
```

## 4. Inspect Git Staging Area

Only analyze changes that have already been staged by the user.

Run:

```bash
git status --short
git diff --cached
git diff --cached --name-status
```

Use `git diff --cached` as the only source of code changes when determining the commit type, scope, and subject.

### Strict Staging Rules

- Only commit files that are already staged in the Git index.
- Never execute `git add`.
- Never execute `git add .`.
- Never execute `git add -A`.
- Never execute `git add <file>`.
- Never stage unstaged changes automatically.
- Never include unstaged or untracked files in a commit.
- Never commit unrelated files such as `.agents/`, `.DS_Store`, or editor temp files. If they are already staged, stop and ask the user to unstage them.
- Never modify the staging area.
- Do not reset, restore, unstage, or otherwise modify the user's staged changes.
- If no files are staged, stop immediately and ask the user to stage files.
- If both staged and unstaged changes exist, only analyze and commit the staged changes.

Do not use the complete working tree diff to generate the commit message.

## 5. Determine Commit Type

Use the types listed in section 3.

Choose the most appropriate type based on the actual staged changes. Match the type to the primary intent of the change, not to the file extension.

Do not use `feat` or `fix` merely because they are common.

## 6. Commit Message Format

Use the following format:

```text
<type>(<scope>): <subject>
```

The scope is optional unless required by the project's Commitlint configuration.

Examples:

```text
feat(web): add landing page hero
fix(components): resolve dropdown focus trap
refactor(ui): simplify modal component architecture
perf(storybook): reduce startup bundle size
docs(repo): document commit conventions
test(utils): add cn helper unit tests
build(deps): upgrade Next.js dependencies
ci(repo): cache pnpm store in workflow
chore(storybook): unify stories under apps/storybook
```

Without a scope:

```text
feat: add user authentication
fix: resolve incorrect pagination behavior
refactor: simplify request context management
```

## 7. Commit Message Rules

Follow these rules:

1. Use English for commit messages unless the project explicitly requires another language.
2. Use lowercase commit types.
3. Use imperative mood for the subject.
4. Keep the subject concise and descriptive.
5. Do not end the subject with a period.
6. Describe what the change accomplishes, not merely which files were modified.
7. Avoid vague messages such as:
   - `fix: fix bug`
   - `feat: update code`
   - `chore: modify files`
   - `update: some changes`
8. Never invent a scope or describe functionality that is not present in the staged diff. Use only the allowlist values in section 3.
9. Follow any maximum header length configured by Commitlint.
10. Ensure the commit type, scope, and subject accurately reflect staged changes only.

## 8. Generate Commit Message

After reviewing staged changes:

1. Determine the primary purpose of the staged changes.
2. Select the appropriate commit type.
3. Identify a meaningful scope when applicable.
4. Generate a concise commit subject.
5. Validate the message against the project's commit conventions.

### Validate Before Committing

Run the message through the same linter the hook uses before creating the commit:

```bash
printf '%s\n' "feat(web): add landing page hero" | pnpm exec commitlint
```

If the command exits non-zero, fix the message and run it again. Only commit after it passes.

The hook `.husky/commit-msg` runs `pnpm exec commitlint --edit "$1"`, so a message that passes this check will also pass the hook.

### Multiple Unrelated Changes

If staged changes contain multiple unrelated features or fixes:

- Do not automatically stage or unstage files.
- Do not silently split or alter the staging area.
- Ask the user whether they want to split the changes into separate commits.
- Wait for explicit instructions before proceeding.

The commit message must always describe the actual staged changes.

Never use unstaged changes or untracked files to determine the commit type, scope, or subject.

## 9. Execute Commit

Before committing, verify:

- There are staged changes.
- The staged changes are the intended changes.
- The commit message follows the project's rules.
- The message passed the pre-commit `commitlint` check.
- No additional files need to be staged.
- No unstaged or untracked files will be included.

Execute:

```bash
git commit -m "feat(web): add landing page hero"
```

### Strict Commit Restrictions

Never execute:

```bash
git commit --no-verify
```

Never execute:

```bash
git commit --no-gpg-sign
```

Never bypass Husky hooks or Commitlint validation.

Never amend existing commits unless explicitly requested by the user.

Never use commands that modify the staging area as part of the commit workflow.

### Husky Hook Failure

If a Husky hook fails:

1. Read the error output.
2. Identify whether the issue is related to Commitlint, linting, tests, or another validation.
3. Explain the failure.
4. Fix the underlying issue only when it is safe and within the user's requested scope.
5. Retry the commit after the issue is resolved.
6. If the failure cannot be resolved safely, stop and explain the reason.

Never bypass hooks to force a successful commit.

## 10. Never Push to Remote

The agent is strictly prohibited from pushing any changes to remote repositories.

Never execute:

```bash
git push
git push --force
git push --force-with-lease
```

Additional restrictions:

- Never push branches or tags.
- Never execute `git push origin <branch>`.
- Never execute scripts or commands that implicitly push commits to remote repositories.
- Never configure automatic pushing after committing.
- Never perform remote synchronization after a successful commit.

The user is solely responsible for pushing commits to remote repositories.

After committing successfully, stop without performing any remote operations.

## 11. Verify Commit

After a successful commit, verify the result:

```bash
git log -1 --pretty=format:"%h %s"
git status --short
```

Report:

- Commit hash.
- Commit message.
- Commit type.
- Whether the commit succeeded.
- Whether there are remaining staged changes.
- Whether there are remaining unstaged or untracked changes.

Do not perform any additional staging or pushing operations.

## 12. Mandatory Safety Checklist

Before executing `git commit`, verify all conditions:

- [ ] There are staged changes.
- [ ] Only staged changes have been inspected for commit message generation.
- [ ] No files have been staged by the agent.
- [ ] The staging area has not been modified.
- [ ] The commit message accurately describes staged changes.
- [ ] The commit message complies with Husky and Commitlint rules.
- [ ] The message passed the pre-commit `commitlint` check.
- [ ] No unrelated changes are being silently combined.
- [ ] No unrelated files (`.agents/`, `.DS_Store`, editor temp files) are staged.
- [ ] No hooks or validation checks are bypassed.
- [ ] No push operation will be performed.

If any condition cannot be satisfied, stop and ask the user.

## 13. Expected Output

### Successful Commit

Provide a concise summary:

```text
Commit successful

Hash: abc1234
Message: feat(web): add landing page hero
Type: feat
Staged changes: committed
Working tree: clean
Remote push: not performed
```

### No Staged Changes

```text
No staged changes found.

Please stage the files you want to commit.
No files were staged automatically.
```

### Commit Failure

```text
Commit failed.

Reason: Husky / Commitlint validation failed.

Details:
[Error details]

No hooks were bypassed.
No remote push was performed.
```

### Final Principle

**Only commit what the user has staged. Generate commit messages only from staged changes and the project's allowed types and scopes. Never modify the staging area. Never push to remote repositories.**
