# Navinocode

Navinocode 是一个可自定义的新标签页，支持多引擎搜索、快捷应用、待办事项、番茄钟、使用热力图、主题背景和可选的 Supabase 云同步。项目既可以作为普通 Web 页面运行，也可以构建为 Microsoft Edge / Chromium Manifest V3 扩展。

项目采用 MIT License。

## 功能

- Google、Bing、百度和 DuckDuckGo 多引擎搜索
- 搜索历史、Bing 建议和本地应用统一检索
- 可拖动、排序和编辑的应用 Dock
- 待办、番茄钟和使用热力图小组件
- 浅色、深色、跟随系统主题及自定义背景
- 本地配置 JSON 导入和导出
- 可选的用户自有 Supabase 云同步
- Edge/Chromium 新标签页扩展构建与商店 ZIP 打包

## 开发环境

项目使用 Node.js 18，版本记录在 `.nvmrc`。

```bash
nvm use
npm install
npm run dev
```

开发服务器默认运行在 <http://localhost:8080>。

常用命令：

```bash
npm run build              # Web 生产构建，输出到 build/
npm run build:dev          # development mode 构建
npm run preview            # 预览生产构建
npm run lint               # ESLint；当前仓库缺少配置，属于已知基线问题
npm run build:extension    # 生成可加载的 extension/ 目录
npm run validate:extension # 校验 Manifest、资源、CSP 和版本一致性
npm run generate-icons     # 用 public/icons/icon.png 生成各尺寸扩展图标，需要 ffmpeg
```

## 本地加载 Edge 扩展

```bash
npm run build:extension
npm run validate:extension
```

然后打开 `edge://extensions/`：

1. 开启“开发人员模式”。
2. 选择“加载解压缩的扩展”。
3. 选择项目下的 `extension/` 目录。
4. 新建标签页，检查搜索、应用 Dock、设置面板和小组件。

`build/` 和 `extension/` 都是生成目录，不应直接编辑或提交。

## Edge 商店发布包

Microsoft Edge Add-ons 接收 ZIP，且 `manifest.json` 必须位于 ZIP 根目录。项目提供了两种打包方式。

### 打包当前版本

```bash
npm run package:edge
```

该命令会依次：

1. 检查 `package.json` 与 `public/manifest.json` 版本一致。
2. 重新构建并校验扩展。
3. 生成 `releases/navinocode-edge-v<version>.zip`。
4. 生成同版本的 `.sha256` 和 `.json` 构建元数据。

同版本发布包默认不能被覆盖。仅在本地重新验证时使用：

```bash
npm run package:edge -- --force
```

校验生成包：

```bash
cd releases
sha256sum -c navinocode-edge-v<version>.sha256
```

Linux/macOS 打包需要系统提供 `zip` 命令；Windows 使用 PowerShell `Compress-Archive`。

### 发布新版本

```bash
npm run release:edge -- patch
npm run release:edge -- minor
npm run release:edge -- major
npm run release:edge -- 1.2.0
```

发布命令会先将 `public/manifest.json` 和 `package.json` 同步到更高版本，再构建发布包。它不会自动执行 Git commit、tag、push 或上传 Partner Center。

Edge 清单允许 1～4 个点分隔整数，每段范围为 `0`～`65535`，非零数字不能以 `0` 开头。为了同时兼容 `package.json`，本项目发布脚本进一步固定使用 `主版本.次版本.修订版本` 三段格式，例如 `1.2.0`。Edge 更新包必须使用高于已上架版本的版本号。

建议约定：

- `patch`：缺陷修复、样式微调、权限说明更新。
- `minor`：向后兼容的新功能。
- `major`：存在明显行为变化或数据迁移的大版本。

## Edge Add-ons 提交检查清单

提交前至少完成以下检查：

- 工作区中的版本修改已经审查，ZIP 对应唯一版本。
- 在 Edge 中通过“加载解压缩的扩展”完成真实烟测。
- ZIP 根目录存在 `manifest.json`，不包含 `.env`、源码映射或开发文件。
- 新标签页替换行为在商店描述中明确说明。
- 所有远程服务都可用；服务失败时核心新标签页仍能打开。
- Partner Center 的权限说明与 `manifest.json` 完全一致。
- 将 [PRIVACY.md](./PRIVACY.md) 发布到无需登录即可访问的 HTTPS 地址，并在 Partner Center 填写该 URL。
- 准备每种语言的扩展 Logo 和描述；可选小宣传图为 `440 x 280` PNG，大宣传图为 `1400 x 560` PNG。
- 截图最多 6 张，尺寸使用 `640 x 480` 或 `1280 x 800`。

推荐的单一用途描述：

> Navinocode 用一个可自定义的效率导航页替换 Microsoft Edge 新标签页，集中提供网页搜索、常用网站入口和本地效率小组件。

权限说明：

| 权限 | 用途 |
| --- | --- |
| `unlimitedStorage` | 在本地保存用户上传的背景图片、应用配置、待办和组件布局，避免较大的图片数据触发普通存储配额。 |
| `https://api.github.com/*` | 读取 Navinocode 公开仓库的 Star 数量。 |
| `https://api.bing.com/*` | 用户输入搜索内容时获取 Bing 搜索建议。 |
| `https://v1.hitokoto.cn/*` | 获取搜索框占位短句；失败时使用内置文本。 |
| `https://*.supabase.co/*` 等 | 仅在用户主动填写自己的 Supabase 配置后，同步应用、待办和外观设置。 |

扩展不下载或执行远程代码；上述地址只用于获取数据。图标、背景图片可能从用户配置或界面中明确展示的 HTTPS 地址加载。

Microsoft 官方资料：

- [发布 Microsoft Edge 扩展](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)
- [Edge 扩展清单格式](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/manifest-format)
- [Edge Add-ons 开发者政策](https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies)

## Supabase 云同步

云同步完全可选。URL、anon key 和同步 ID 由用户在设置面板中填写，保存在当前浏览器扩展的本地存储中；导出的配置文件不包含 Supabase URL 或 anon key。

基础表结构：

```sql
create table if not exists navinocode_states (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table navinocode_states enable row level security;
```

当前前端没有 Supabase 登录流程，因此不能仅依赖同步 ID 实现严格的用户身份隔离。不要在同步数据中保存密码、Token、财务信息等敏感数据。公开发布前，应根据自己的 Supabase Auth 方案创建最小权限 RLS；不建议把 `using (true)` 的匿名全表策略用于生产环境。

多台设备填写相同同步 ID 时会使用同一行数据。当前冲突策略为最后写入覆盖，重要配置建议同时保留本地导出文件。

## 目录概览

```text
src/                  React 应用代码
public/manifest.json  Edge/Chromium 扩展清单和版本源
scripts/              构建、校验和商店打包脚本
build/                Web 构建产物
extension/            解压加载目录
releases/             Edge 商店 ZIP、校验和与构建元数据
```

## 隐私

数据处理说明见 [PRIVACY.md](./PRIVACY.md)。提交 Edge Add-ons 前，需要将该文件托管到公开、稳定的 HTTPS URL；仓库公开后可使用：

```text
https://github.com/y-shi23/Navinocode/blob/main/PRIVACY.md
```
