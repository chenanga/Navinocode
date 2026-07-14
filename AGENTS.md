# AGENTS.md

## 项目概览

Navinocode 是一个 React 18 + Vite 5 的单页导航/新标签页应用，同时可构建为 Chrome Manifest V3 扩展。界面使用 Tailwind CSS、Radix UI/shadcn 风格组件和 Framer Motion；用户配置主要保存在浏览器 `localStorage`，可选通过 Supabase 前端直连进行多设备同步。

## 目录与职责

- `src/main.jsx`：应用入口和全局样式加载。
- `src/App.jsx`、`src/nav-items.jsx`：全局 Provider、`MemoryRouter` 和路由声明。
- `src/pages/Index.jsx`：主页面及大部分搜索、背景、设置、应用列表和云同步编排逻辑。
- `src/components/`：应用坞、可拖动组件、番茄钟、待办、热力图等业务组件。
- `src/components/ui/`：Radix UI/shadcn 基础组件。优先复用这些组件，不重复实现同类控件。
- `src/lib/`：云同步、使用事件和通用工具。
- `src/integrations/supabase/`：Supabase 客户端创建与本地配置读取。
- `src/index.css`、`tailwind.config.js`：全局样式、CSS 变量和 Tailwind 主题。
- `public/`：扩展清单、图标、字体和内置 SVG；通过 `/icons/...`、`/svgs/...` 等根路径引用。
- `scripts/`：Chrome 扩展构建、校验和图标生成脚本。
- `build/`、`extension/`：生成产物，不作为源代码直接编辑。

## 本地命令

项目的 Node 版本由 `.nvmrc` 指定为 18。

```bash
nvm use
npm install
npm run dev                # Vite 开发服务器：http://localhost:8080
npm run build              # 生产构建，输出到 build/
npm run build:dev          # development mode 构建
npm run lint               # ESLint 脚本（配置现状见下文）
npm run preview            # 本地预览生产构建
npm run build:extension    # 重建 build/ 和 extension/
npm run validate:extension # 校验 extension/ 中的 MV3 扩展产物
npm run package:edge       # 按当前版本生成 Edge 商店 ZIP
npm run release:edge -- patch # 提升版本并生成 Edge 商店发布包
```

`npm run build:extension` 会删除并重新生成 `build/`、`extension/`，只有在确实需要验证扩展产物时运行。扩展验证必须在扩展构建之后执行。`npm run release:edge` 会修改 `public/manifest.json` 和 `package.json` 中的版本；`releases/` 是生成目录，不直接编辑或提交。

## 架构与数据约定

- 这是纯前端应用，不要假设存在服务端 session、SSR 或 Node 运行时 API。
- 路由使用 `MemoryRouter`。新增页面时在 `src/nav-items.jsx` 集中注册，并确认 Chrome 新标签页场景仍可访问。
- 设置、应用列表、组件位置、待办和使用记录依赖 `localStorage`。修改 key、数据结构或默认值时，要保留已有用户数据；必要时像 `DEFAULT_APPS` 迁移逻辑一样做显式兼容。
- `localStorage` 和 JSON 解析可能失败，读取外部或历史数据时应校验类型并提供安全默认值。
- Supabase URL、anon key 和同步 ID 由用户在设置面板填写并存入 `localStorage`，相关逻辑位于 `src/integrations/supabase/client.js` 和 `src/lib/cloudSync.js`。不要硬编码凭据，也不要把 anon key 当作服务端密钥使用。
- Supabase 表名默认为 `navinocode_states`。修改同步 payload、冲突键或表结构会影响已有数据，需求不明确时不要改动。
- 外部请求包括 GitHub API、一言、Bing 建议、Supabase 和站点图标。新增来源时同时检查 Vite 代理需求及 `public/manifest.json` 的 `host_permissions`、CSP。
- Vite 的 `CHAT_VARIABLE`、`PUBLIC_PATH` 会影响生产 `base` 和输出目录；不要将 `build/` 路径写死到新的运行时代码中。

## 编码约定

- 使用现代函数组件和 Hooks；组件文件、组件名使用 PascalCase，自定义 Hook 以 `use` 开头，工具函数使用 camelCase。
- 优先使用 `@/` 别名引用 `src/` 下模块。修改现有文件时遵循该文件当前的引号、缩进和导入风格，避免仅为统一格式产生大范围 diff。
- 页面样式主要使用 JSX 中的 Tailwind utility；通用控件放入 `src/components/ui/`，业务组件放入 `src/components/`。
- 保留 Radix UI 提供的键盘操作、焦点管理和 aria 语义。涉及搜索建议、弹层、拖拽和快捷键时，手动检查键盘与鼠标交互。
- 定时器、事件监听、请求防抖和临时回调必须在 effect cleanup 中清理，避免页面长期打开后产生重复监听或状态更新。
- 不新增 TypeScript、状态管理库、测试框架或其他依赖，除非任务明确需要且已确认维护成本。

## 修改与验证

- 采用满足需求的最小局部修改，不顺手重构体量较大的 `src/pages/Index.jsx` 或格式化无关文件。
- 当前仓库没有自动化测试脚本，且 `package.json` 虽有 lint 脚本，仓库目前缺少 ESLint 配置文件，`npm run lint` 会在检查源码前失败。代码修改仍应尝试运行 `npm run lint` 并记录该基线问题，同时运行 `npm run build`；不要把既有失败误报为本次修改引入。
- UI 修改需通过 `npm run dev` 手动检查主页面、设置面板、搜索/跳转以及受影响组件，并检查窄屏布局。
- 涉及 Chrome 扩展、资源路径、CSP 或 `public/manifest.json` 时，再运行 `npm run build:extension` 和 `npm run validate:extension`，并在 Chrome 的“加载已解压的扩展程序”中做必要烟测。
- 涉及持久化或同步时，至少检查：无历史数据、已有历史数据、无效 JSON、Supabase 未配置和同步失败等路径。
- 完成后检查 `git diff` 和 `git status`，不要提交生成目录、凭据或与任务无关的文件。

## Git 与交付

- 提交信息沿用历史中的 Conventional Commits 风格，例如 `feat(search): ...`、`fix: ...`。
- 未经明确要求，不执行 commit、push、发布、部署、创建 PR 或远程同步。
- UI 变更的 PR 应提供截图或录屏；功能变更说明手动验证步骤，关联对应 issue（如有）。
