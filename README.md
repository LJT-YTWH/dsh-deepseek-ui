# DeepSeek UI

**中文** | [English](#english)

一个把 DeepSeek Harness Web GUI 换成 DeepSeek 官方应用观感的纯插件（Host + Client，bundle 安装，无需改宿主源码）。

An installable DSH bundle that reskins the DeepSeek Harness Web GUI to look and feel like the official DeepSeek application.

- 版本 / Version: **0.2.6**
- 兼容 / Built against: **DeepSeek Harness 0.2.2-rc.5**
- 平台 / Platforms: macOS（主要 / primary）, Windows desktop

---

## 中文

### 这个插件做了什么

界面层完整替换为官方应用风格，同时把所有会话、工作区、消息、面板状态继续交给宿主管理——插件不持有任何会话数据。

- **侧边栏**：官方鱼形图标 + `deepseek HARNESS` 字标、开启新对话胶囊、按时间分组的会话列表（今天 / 昨天 / 7 天 / 30 天 / 按月）、行内操作（置顶、归档、重命名、删除）、底部设置入口、收起后的 icon rail。
- **会话操作**：打开、重命名、置顶/取消、归档/取消、删除，全部走宿主自带的 Client 服务。
- **删除会话**：删除级联由插件自己的 Host 路由实现（子会话谱系、运行中拒绝、释放活动 agent 并关闭写句柄、清 projection 缓存、删 JSONL 日志目录、清工作区账目），**不需要额外安装 `dsh-session-delete-cascade`**；删除成功后自动开启新对话。
- **设置窗口**：直接复用宿主**原版设置窗口**（账号与余额、通用设置、模型、内置插件、Agent 预设等全部页面保持原样，余额/查询用量/充值都能用），插件只换皮肤并新增一页「DeepSeek UI」放主题、语言、版本、入口点、快捷键列表。
- **对话区与输入框**：按官方 App 的会话样式重绘（气泡、代码块、工具卡片、思考行、时间戳），输入框为 24px 圆角胶囊 + 药丸形模型/权限 chip + 34px 品牌色发送圆钮。
- **窗口栏（收起态）**：macOS 使用 `shell.leading` 座位；Windows 自定义标题栏下侧边栏列宽为 0，因此把「鱼形 + 面板/搜索/新建」胶囊固定进原生 caption 行（与宿主侧边栏同位置，含 `--dsh-windows-menu-start` 避让）。
- **固定工作区**：界面没有工作区选择器，所有新对话都落在**用户文档目录**下的 `~/Documents/DeepSeekHarnessWorkspace`（不可写时回退 `<DSH_HOME>/workspace` 并提示）。放在用户目录而不是安装目录，是因为应用更新可能整目录替换安装目录，把文件放在那里等于把“哪天文件没了”的风险换了个触发条件。首次运行会把旧版安装目录里已有的文件**复制**过来（旧目录保留不删）。通过一段**英文系统提示词**告诉模型当前目录、不要询问/切换工作区，以及**文件操作可以引导、询问用户要在哪里创建或查看文件**（用户指定的目录只对当次操作生效）。
- **内置预设**：幂等注册「官网-纯聊天」「官网-可干活」两个官方预设，新对话默认「官网-纯聊天」；模式选择器中两者标题右侧带小号「推荐」标签（不改列表顺序）。
- **预设提示**：切到这两个预设时弹窗建议使用 **Flash 模型** 与 **low** 思考强度，可在关闭前勾选「今天不再提示」「今后不再提示」，选择持久化在浏览器，之后的新建对话 / 打开应用 / 切换模式都会按勾选判断是否再提醒。
- **滚动保护**：流式执行期间监听会话滚动容器，忽略用户手势，仅在"跟随底部时单次向上跳动超过半屏"时重新钉回底部，避免时不时跳回前几轮。
- **主题 / 语言 / 快捷键面板**：插件设置页内提供三张主题卡、界面语言切换、实时快捷键列表。

### 安装

1. 下载 Release 里的 `dsh-deepseek-ui-0.2.6.zip`，解压得到 `dsh-deepseek-ui/`；
2. 用 DSH 的插件管理安装该目录（`install_bundle`，target 指向解压后的 `dsh-deepseek-ui` 目录）；
3. 重启或让插件管理器应用变更。插件以 bundle patch 的方式禁用宿主自带 `ui-sidebar` 并接管侧边栏、窗口栏、设置页入口。

从源码开发：

```bash
cd dsh-deepseek-ui
node scripts/build.mjs          # 生成 lib/client.js、lib/index.js
node scripts/build.mjs --check  # 校验产物与源码一致
node --test tests/*.test.mjs    # 31 条测试
```

### 配置

`cordis.patch.yml` 的 `deepseek-ui` 行支持 `workspaceDir` 覆盖固定工作区目录：

```yaml
- id: deepseek-ui
  config:
    workspaceDir: /some/other/folder
```

### 兼容性限制

- 依赖宿主槽位与服务：`sidebar`、`shell.leading`、`shell.overlay`、`conversation.*`、`settings.section`、`ctx.systemPrompt`、`ctx.connection.fetch`、`ctx.get('agentPresets')`；宿主大版本升级后需重新验证。
- bundle patch 会禁用 `ui-sidebar`；启用本插件期间其他依赖该侧边栏的插件不可用。
- 工作区已移出安装目录（默认 `~/Documents/DeepSeekHarnessWorkspace`），应用更新不会再动它；仍可用 `workspaceDir` 指向其他长期位置。

### 文档

- [`docs/DETAIL.md`](docs/DETAIL.md)：实现细节、槽位与路由、失败策略
- `THIRD-PARTY-NOTICES.md`：内置官网预设与素材来源
- 细节与已知问题见仓库 Issues

### 许可

见 [`LICENSE`](LICENSE)。官方预设与 logo 素材版权归 DeepSeek 所有，详见 `THIRD-PARTY-NOTICES.md`。

---

## English

<a id="english"></a>

### What it does

It replaces the Web GUI's look with the official DeepSeek application's while the
Host keeps owning every session, workspace, message and panel — the plugin stores
no session data of its own.

- **Sidebar**: official fish + `deepseek HARNESS` wordmark, New-chat pill, time-grouped session list (today / yesterday / 7 days / 30 days / by month), row actions (pin, archive, rename, delete), Settings foot, and a collapsed icon rail.
- **Session actions**: open, rename, pin/unpin, archive/unarchive, delete — all through the Host's own client services.
- **Built-in delete cascade**: the plugin's Host route collects the subagent lineage, refuses while work is running, releases live agents and their persistence write handles, clears projection rows, deletes the durable JSONL directory, and updates workspace accounting. No `dsh-session-delete-cascade` needed, and a successful delete immediately opens a new conversation.
- **Settings window**: the shipped window is reused as-is (account/balance, general, models, plugins, agent presets and every other page keep working, including 查询用量/充值); the plugin only reskins it and adds one **DeepSeek UI** page with theme cards, language, version, entry points and the live shortcut list.
- **Conversation and composer**: skinned after the official app (bubbles, code blocks, tool cards, thinking rows, timestamps); the composer is a 24px hairline capsule with pill model/permission chips and a 34px brand send circle.
- **Collapsed chrome**: macOS uses the frame's `shell.leading` seat; on Windows the sidebar column collapses to zero width, so the fish + panel/search/new-chat pill is fixed into the native caption row (same coordinates as the shipped sidebar, widening `--dsh-windows-menu-start`).
- **Fixed workspace**: no workspace picker — every new conversation starts in `~/Documents/DeepSeekHarnessWorkspace` in the user's own Documents folder (falling back to `<DSH_HOME>/workspace` with a notice). Keeping it out of the install directory matters: an application update may replace the install tree, so storing files there would only move the "my files disappeared" risk to another trigger. On the first 0.2.6+ run the plugin **copies** any files from the old install-directory folder (the old folder is left untouched). An **English system-prompt section** tells the model the folder, forbids asking for/switching a workspace, and lets file operations **guide or ask the user where files should be created or viewed** (a user-named folder consents to that operation only).
- **Bundled presets**: idempotently registers 官网-纯聊天 / 官网-可干活 and defaults new conversations to 官网-纯聊天; both get a small **推荐** tag beside their title in the picker without reordering rows.
- **Preset tip**: selecting either preset shows a dialog recommending the **Flash model** with **low** thinking effort, with "don't show again today" and "don't show again" checkboxes persisted in the browser.
- **Scroll guard**: watches the conversation scroller, ignores reader gestures, and re-pins to the tail only when an unexpected jump moves more than half a viewport up from a tail-following position.
- **Theme / language / shortcut panels**: three theme cards, UI language switching, live shortcut list on the plugin's settings page.

### Install

1. Download `dsh-deepseek-ui-0.2.6.zip` from the Release and extract it to `dsh-deepseek-ui/`.
2. Install that directory through DSH's plugin manager (`install_bundle`, target = the extracted `dsh-deepseek-ui` folder).
3. Restart or let the plugin manager apply the change. As a bundle patch it disables the shipped `ui-sidebar` and owns the sidebar, window chrome and settings entry.

From source:

```bash
cd dsh-deepseek-ui
node scripts/build.mjs          # builds lib/client.js and lib/index.js
node scripts/build.mjs --check  # fails when lib/ drifts from src/
node --test tests/*.test.mjs    # 31 tests
```

### Configuration

The `deepseek-ui` row in `cordis.patch.yml` accepts `workspaceDir`:

```yaml
- id: deepseek-ui
  config:
    workspaceDir: /some/other/folder
```

### Compatibility limits

- Depends on Host slots/services: `sidebar`, `shell.leading`, `shell.overlay`, `conversation.*`, `settings.section`, `ctx.systemPrompt`, `ctx.connection.fetch`, `ctx.get('agentPresets')`; re-verify after a major DSH upgrade.
- The bundle patch disables `ui-sidebar`, so plugins that depend on that sidebar cannot work while this one is enabled.
- The workspace is outside the install tree by default (`~/Documents/DeepSeekHarnessWorkspace`), so an application update no longer touches it; `workspaceDir` can still point elsewhere.

### Docs

- [`docs/DETAIL.md`](docs/DETAIL.md): implementation notes, slots, routes, failure policy
- `THIRD-PARTY-NOTICES.md`: bundled official presets and artwork provenance

### License

See [`LICENSE`](LICENSE). The official presets and logo artwork remain DeepSeek's property; see `THIRD-PARTY-NOTICES.md`.
