# AGENTS.md

本文件面向在本仓库中工作的 AI 与开发者。目标：保持 pnpm monorepo 的边界清晰、类型安全、可访问、可复用。

## 1. 项目概览

- 包管理器：pnpm 10.15.1（`packageManager` 已固定）。只使用 pnpm，不要使用 yarn 或 npm。
- 架构：pnpm workspace，包含 `apps/*` 与 `packages/*`。
- 应用框架：Next.js 16 App Router，默认使用 Server Components；仅在需要浏览器状态、事件或副作用时添加 `"use client"`。
- 样式：Tailwind CSS v4 + CSS Modules/SCSS，设计令牌集中在 `packages/ui/src/styles`。
- 国际化：next-intl，所有用户可见文本必须走 i18n。
- 组件示例：Storybook 10（`@storybook/nextjs-vite`）。
- 可访问性：目标 WCAG 2.2 AA，使用 Playwright + axe 做回归验证。

### 技术栈

| 分类 | 技术 |
| --- | --- |
| 运行时 | Node.js 22、React 19.2.3、React DOM 19.2.3 |
| 框架 | Next.js 16.4.6（App Router） |
| 语言 | TypeScript 5（`strict: true`） |
| 样式 | Tailwind CSS 4、PostCSS、CSS Modules、Sass |
| 基础组件 | shadcn 4、Base UI、class-variance-authority、lucide-react |
| 国际化 | next-intl 4 |
| 组件文档 | Storybook 10、`@storybook/nextjs-vite`、Vite 7 |
| 质量 | ESLint 9、TypeScript、Playwright、axe-core |
| 工程化 | pnpm workspace、Husky、Commitlint |

版本以各 `package.json` 为准。React 与 React DOM 已固定为 `19.2.3`，Next.js 已固定为 `16.4.6`，不要单独升级其中一个包。

## 2. 目录结构

```text
.
├── apps/
│   ├── web/                  # @repo/web，Next.js 应用与路由
│   │   ├── app/              # App Router：页面、布局、全局样式
│   │   ├── i18n/             # next-intl 请求配置
│   │   └── tests/            # Playwright 测试
│   └── storybook/            # @repo/storybook，组件文档与示例
│       ├── .storybook/       # Storybook 配置与全局样式
│       └── stories/          # ui/ 与 components/ 示例
├── packages/
│   ├── ui/                   # @repo/ui，通用基础组件与设计令牌
│   ├── components/           # @repo/components，业务/领域组件
│   ├── layouts/              # @repo/layouts，共享页面布局
│   ├── hooks/                # @repo/hooks，可复用 React Hook
│   ├── utils/                # @repo/utils，无状态纯函数
│   └── i18n/                 # @repo/i18n，路由、导航与文案
├── .agents/skills/           # 仓库内 Agent 工作流
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── commitlint.config.ts
```

### 包职责与依赖方向

| 位置 | 职责 | 不应包含 |
| --- | --- | --- |
| `apps/web` | 路由、页面、应用级 Provider、Next.js 配置 | 可复用的通用组件或纯函数 |
| `apps/storybook` | 组件示例与文档 | 业务逻辑、应用路由 |
| `packages/ui` | 通用、无业务语义的基础组件与设计令牌 | 业务数据、领域文案、页面路由 |
| `packages/components` | 有业务语义的组件，组合 `ui`、`hooks`、`utils`、`i18n` | 基础原子组件、全局样式入口 |
| `packages/layouts` | 页面骨架、容器、共享布局 | 具体业务页面 |
| `packages/hooks` | 有状态、副作用或浏览器 API 的可复用逻辑 | JSX、业务组件 |
| `packages/utils` | 纯函数、格式化、类型守卫、组合工具 | React、DOM、全局状态 |
| `packages/i18n` | next-intl 路由、导航、语言文件 | 组件样式 |

依赖方向：

```text
apps/web -> packages/*
packages/components -> packages/ui, packages/hooks, packages/utils, packages/i18n
packages/layouts -> packages/utils
packages/ui -> packages/hooks, packages/utils
packages/hooks -> react
packages/utils -> 无 React/DOM 依赖
packages/i18n -> next-intl
```

禁止循环依赖。内部包使用 `workspace:*`，不要通过相对路径跨包引用。

### 新代码放置决策

- 通用、无业务语义、可被任意页面复用的基础组件：`packages/ui/src/components/<kebab-case>.tsx`。
- 有业务语义、依赖领域数据或组合多个基础组件的组件：`packages/components/src/<domain>/<PascalCase>.tsx`。
- 页面骨架、容器、共享布局：`packages/layouts/src/<PascalCase>.tsx`。
- 有状态、副作用、浏览器 API 的可复用逻辑：`packages/hooks/src/use-<kebab-case>.ts`。
- 无状态纯函数、格式化、类型守卫：`packages/utils/src/<kebab-case>.ts`。
- 用户可见文案与路由配置：`packages/i18n`。
- 页面与路由：`apps/web/app`。
- 组件示例：`apps/storybook/stories/ui` 或 `apps/storybook/stories/components`。

## 3. 常用命令

在仓库根目录执行：

```bash
pnpm install --frozen-lockfile   # 按锁文件安装依赖
pnpm dev                         # 启动 apps/web
pnpm build                       # 构建所有带 build 脚本的包
pnpm lint                        # 运行所有包 lint
pnpm typecheck                   # 运行所有包类型检查
pnpm storybook                   # 启动 Storybook
pnpm build-storybook             # 构建 Storybook
pnpm --filter @repo/web test:a11y  # 运行 Playwright + axe 可访问性测试
```

不要使用 `yarn` 或 `npm` 启动项目；本仓库由 pnpm 管理。

## 4. 编码规范

### 4.1 文件与命名

1. 一个文件尽量不超过 1000 行。超过时应按职责拆分组件、Hook、类型或工具函数。
2. 变量、函数、组件命名应清晰，但不要过长。避免无意义缩写；常见缩写（`UI`、`URL`、`ID`、`API`）除外。
3. 布尔值使用 `is`、`has`、`can`、`should` 前缀；事件处理使用 `onXxx`；Hook 使用 `useXxx`；真正的常量使用 `UPPER_SNAKE_CASE`。
4. 文件命名保持与现有约定一致：
   - `packages/ui` 基础组件使用 kebab-case，如 `button.tsx`。
   - `packages/components` 业务组件使用 PascalCase，如 `AlbumCard.tsx`。
   - Hook 使用 `use-<kebab-case>.ts`。
   - 工具函数使用 kebab-case，如 `format-date.ts`。

### 4.2 TypeScript 与函数

1. 导出的函数、组件 Props、公共数据结构必须有明确类型；禁止使用 `any`。
2. 优先使用 `unknown` + 类型收窄，避免类型断言、非空断言 `!` 和隐式 `any`。
3. 函数尽量只做一件事，并尽量保持纯函数。副作用（请求、DOM、存储、日志）放在边界层。
4. 对入参做严格保护：校验空值、边界值、非法状态；使用早返回；不要用抛异常处理可预期的业务分支。
5. 明确处理 `null`、`undefined`、空数组、加载中、错误、空状态，避免运行时崩溃。
6. 复杂条件使用类型守卫或独立函数，不要堆叠难以阅读的表达式。
7. 组件 Props 使用 `type` 或 `interface` 显式声明；不要直接暴露内部可变对象。

### 4.3 Import 与包边界

1. 从具体文件或包的显式子路径导入，禁止使用 barrel 路径。

```ts
// 推荐
import { Button } from "@repo/ui/components/button"
import { routing } from "@repo/i18n/routing"

// 禁止新增
import { Button } from "@repo/ui"
import { AlbumCard } from "@repo/components"
```

2. 现有 `index.ts` 根导出属于历史兼容入口。新增代码不要依赖或扩大 barrel；修改相关代码时应逐步迁移到精确子路径。
3. 如果目标包尚未暴露子路径，先在对应 `package.json` 的 `exports` 中声明精确导出，再导入。
4. 同一包内部可以使用相对路径；跨包必须使用 `@repo/*` 包名。
5. 不要从其他包的 `src` 目录直接深层引用；通过 `exports` 暴露的公共入口访问。

### 4.4 React 与 Next.js

1. 默认使用 Server Components；只有需要状态、事件、浏览器 API 或客户端副作用时才添加 `"use client"`。
2. 中途才出现的浮层组件（如 Dialog、SideDrawer、命令面板）必须按需加载，避免首屏打包：
   - 在客户端组件中使用 `next/dynamic`，必要时设置 `ssr: false`。
   - 或使用 `React.lazy` + `Suspense`。
   - 不要在其他组件顶部同步导入重量级浮层。
3. 组件应尽可能复用。新页面遇到相似但有细微差异的组件时，优先通过 `variant`、`size`、插槽或组合扩展原组件；不要复制一份新组件。
4. 跨组件的横切逻辑（权限、埋点、错误边界等）可以使用 HOC；普通复用优先使用组合、插槽或 Hook。
5. 单个组件的 Props 不应超过 8 个。超过时考虑拆分子组件、使用复合组件模式，或把配置对象拆成独立类型。
6. 使用 Hook 时考虑性能：
   - `useMemo` / `useCallback` 只用于昂贵计算，或确实需要稳定引用以配合 `React.memo`、依赖数组等场景。
   - 非复杂计算、小数据量不要使用 `useMemo` / `useCallback`。
7. `useEffect` 的依赖数组只声明真正需要观察的值；不要“用到什么就加什么”。
   - 观察什么变化就触发什么。
   - 不要把每次渲染都会新建的对象/数组直接放进依赖数组。
   - 非响应式值使用 `useRef`，不要在 Effect 中读取过期闭包。
   - 必须正确清理订阅、定时器、事件监听和请求。

### 4.5 样式规范

1. 简单布局优先使用 Tailwind 工具类；复杂组件样式使用 CSS Modules 或 SCSS，避免超长 `className`。
2. CSS 类名遵循 BEM：

```css
.block { }
.block__element { }
.block--modifier { }
```

3. 尽量复用项目已有的设计令牌：
   - 全局 CSS 变量定义在 `packages/ui/src/styles/globals.css`。
   - SCSS 变量集中放在 `packages/ui/src/styles/variables/`。
   - 不要硬编码已有令牌对应的颜色、圆角、间距、字体或层级。
4. CSS 必须使用 `@layer`，统一顺序为：

```css
@layer theme, reset, base, vendor, components, utilities, pages, overrides;
```

   - 该声明应放在样式入口顶部、Tailwind 导入之前。
   - 新增样式放入对应 layer，避免无 layer 的全局裸样式。
   - 仅在必要时使用 `!important`；优先通过 layer、选择器优先级或组件 API 解决。
5. 交互状态使用 `:focus-visible`、`:hover`、`:disabled` 等标准伪类；不要移除可见焦点。
6. 移动端优先，使用响应式断点；颜色需同时考虑 `.dark` 主题。
7. 不要用内联样式实现本可由类名或令牌表达的样式；动态计算值除外。

### 4.6 可访问性（WCAG）

1. 使用语义化 HTML：`button`、`a`、`nav`、`main`、`section`、`label`、`input` 等；不要用可点击的 `div` 代替按钮。
2. 所有表单控件必须有可访问名称；图片必须有 `alt`；装饰性图片使用空 `alt`。
3. 保证键盘可操作、焦点顺序合理、焦点样式可见；Dialog/SideDrawer 必须管理焦点与关闭行为。
4. 使用 `aria-*` 时确保语义正确，不要用 ARIA 替代原生语义。
5. 颜色对比度、触控目标、动效偏好（`prefers-reduced-motion`）需符合 WCAG 2.2 AA。
6. 标题层级连续，区域使用 `aria-labelledby` 或明确标题。
7. 修改交互组件后运行 `pnpm --filter @repo/web test:a11y`。

### 4.7 国际化（i18n）

1. 所有用户可见文本必须使用 i18n，不得在组件或页面中硬编码纯文本。
2. 文案放在 `packages/i18n/messages/en.json` 与 `packages/i18n/messages/zh-CN.json`，两种语言必须同步新增。
3. 客户端组件使用 `useTranslations`；Server Components 使用 `getTranslations`；布局/页面中调用 `setRequestLocale`。
4. `aria-label`、`placeholder`、`title`、错误提示、空状态、按钮文案同样必须走 i18n。
5. 不要拼接翻译句子；需要变量时使用 ICU 参数，不要用字符串相加。
6. Storybook 中的演示文案可通过 args 或 i18n Provider 提供，但组件实现内部不得硬编码用户可见文本。

### 4.8 Storybook

1. `packages/components` 与 `packages/ui/src/components` 下的所有组件都必须有对应的 Storybook 示例。
2. Story 文件放在 `apps/storybook/stories/components/` 或 `apps/storybook/stories/ui/`，文件名使用 kebab-case。
3. 标题使用 `Components/<Name>` 或 `UI/<Name>`，与现有示例保持一致。
4. 至少覆盖：默认状态、主要变体、禁用/加载/空/错误状态中与本组件相关的场景。
5. Story 只负责展示与参数控制，不要复制组件内部逻辑。
6. 修改组件后运行 `pnpm build-storybook` 验证示例可构建。

## 5. 验证要求

完成代码修改后，按改动范围执行验证：

```bash
pnpm typecheck
pnpm lint
pnpm build                 # 涉及 Web、包代码或构建配置时
pnpm build-storybook       # 涉及组件、样式或 Story 时
pnpm --filter @repo/web test:a11y  # 涉及交互或可访问性时
```

- 依赖变更后先运行 `pnpm install --frozen-lockfile`。
- 不要在没有运行验证命令的情况下声称任务完成。
- 如果验证失败，先修复再继续；不要通过禁用规则、跳过 Hook 或 `--no-verify` 绕过。

## 6. 依赖与提交

- 新增内部依赖使用 `workspace:*`。
- 升级依赖前先确认版本，保持 React、React DOM、Next.js 等关联包版本一致；遵循 `.agents/skills/updating-dependencies`。
- 提交信息遵循 Conventional Commits 与 `commitlint.config.ts`；遵循 `.agents/skills/git-commit`。
- 不要自行 commit 或 push，除非用户明确要求。
- 不要使用 `git commit --no-verify`，不要修改 Husky 或 Commitlint 配置来绕过校验。
