# DeepSeek UI — implementation notes

DeepSeek UI is a pure DSH bundle: a Host row plus a browser half. The Host half is
empty; the browser half is one lazy CommonJS factory that takes over the
`sidebar` seat, adds a settings sheet, and re-skins the conversation.

## Extension points used

| Seat | Kind | Purpose here |
|---|---|---|
| `sidebar` | single | Replaces the shipped column shell; re-declares the children the shipped shell declared |
| `sidebar.workspaces` | single (declared, not rendered) | Keeps `ui-workspace`'s registrations activating; the list itself is drawn by this plugin |
| `sidebar.settings` | single (mounted hidden) | Keeps the shipped Settings trigger alive for the sheet's footer hand-off |
| `sidebar.footer.action` | list (rendered) | Host footer actions stay reachable |
| `sidebar.brand.mark` / `sidebar.brand.name` | single (rendered, with fallback) | Brand slot stays open to other plugins |
| `sidebar.toggle.badge` | single (rendered) | Desktop update badge stays visible in the rail |
| `sidebar.panellist` | list (declared, read through the registry) | Source of the sheet's feature grid |
| `shell.leading` | single | Reopen and New Session controls while the column is fully hidden |
| `shell.overlay` | list | The settings sheet layer |
| `sidebar.brand.mark` / `sidebar.brand.name` | single (rendered, official occupants) | Official fish + wordmark in the column header |

The new-session hero is deliberately untouched: the host already renders its own
official hero fish as that seat's fallback, so the plugin does not claim
`conversation.hero.brand.mark`.

## New-session behaviour

The shipped New Session path reuses a reusable blank Session in the Workspace, so
a press can leave the sidebar looking unchanged and a fresh row shows the
Workspace basename as its title. The plugin instead:

1. resolves the target Workspace (current Session's, else the most recently used);
2. calls `sessions.create({ workspaceId })`, which always creates a new Session;
3. opens it with `ctx.uiWorkspace.openSession`;
4. titles blank rows `新对话` / "New chat" until the Host projects a title.

## The settings window

The plugin does **not** draw its own settings window. It reuses the shipped one
and contributes one page to it, so every original page (account/wallet, general,
models, plugins, presets, …) and their behaviour stay authoritative — including
the Platform overlay that 查询用量 / 充值 open inside the app.

- Contribution: one `settings.section` entry (`id: deepseek-ui`, order −20,
  localized label) plus its `settings.section.icon`, so the page appears first in
  the window's own navigation. Its inject face carries the theme, locale, panel,
  and shortcut readers; its owner props supply the shell's `close`.
- Styling: addressed through the window's stable `data-shortcut-modal="settings"`
  hook and structural children (title row, `nav` with `aria-current="true"`,
  header row, options column) plus the mask sibling — never a hashed class.
- Opening it: the hidden `sidebar.settings` seat holds the shipped trigger; the
  hand-off presses that launcher, its first menu row (`Settings`), and then the
  requested page's navigation row by its localized label.
- Feedback surfaces (confirmation dialog, notices) render in `shell.overlay`
  above the window.

## Permission presets

The bundle patch overrides the `permission` row's complete config:

- `presets` lists only `read-only` (read-only sandbox, approval `ask`) and
  `danger-full-access` (full access, approval `never`). Labels equal their keys so
  the shipped client localizes them. The composer selector and the General
  settings row both read this table, so 工作区内修改 disappears from both.
- `defaultPreset: read-only` is the Host's seed for a new Session, which is why
  every new chat starts in 仅可查看.

The patch applies at profile composition, so changing it requires re-applying the
bundle (remove + install) or restarting the app.

## Sidebar HOC seat (`sidebar.session.action`)

The shipped sidebar wraps its New-session row in a HOC slot so plug-ins can add
an action next to it; `@deepseek-ai/dsh-deepseek-chat-import` is the shipped
occupant. This sidebar declares the seat in `DUI_SIDEBAR_CHILDREN` (`kind: 'hoc'`)
and renders it twice — around the wide New-chat button and around the collapsed
rail's New button — passing `{ wide }` and the row content as `children`. Without
that call the occupant never mounts and the import trigger is missing; with it the
trigger and its dialog mount unchanged (the occupant styles its own trigger).

## Bundled Agent presets

`index.js` carries the two official compositions as `BUNDLED_PRESETS` (the same
config shape the Mode manager writes into `@deepseek-ai/dsh-agent-preset` rows,
`!!js` rows kept as `{ __jsExpr }`). At activation `ensureBundledPresets`, an
`agentPresets.register()` call guarded by `list()`, adds only the presets missing
from the live roster — matched by id or display name — and resolves the preferred
`mode-mc2kfu` id. The workspace route returns it as `agentPreset`, and the
new-conversation action passes it to `sessions.create({ agentPreset })`, so the
selection does not depend on the registry default.

## Mode picker decoration and Windows chrome

- **Mode picker**: the shipped picker renders its rows from the Host roster with
  no per-row hook. A `MutationObserver` on `document.body` (direct children only,
  so streamed tokens never wake it) plus a slow fallback sweep find the open
  `[role="menu"]`, match the two official preset names, and append a
  brand-tinted "推荐" span to the name line. Order is untouched.
- **Windows chrome**: Windows keeps the sidebar column at zero width when
  collapsed (the frame's `leadingMounted` is macOS-only), so the shipped sidebar
  fixes its toggle and New Session into the native caption row via
  `position: fixed`. This plugin mirrors that: when platform is `win32` or
  `data-windows-titlebar` is present and the column is collapsed, the sidebar
  renders a fixed caption cluster (fish + panel/search/new pill) at the shipped
  coordinates, marks it `no-drag`, and widens `--dsh-windows-menu-start` so the
  native caption menus start after it. Sidebar top actions and the chrome strip
  share the downward tooltip rule.

## Fixed workspace

Two halves cooperate, and neither needs a picker:

- **Host half** (`index.js`): resolves `<user home>/Documents/DeepSeekHarnessWorkspace`
  (the user's own Documents folder, outside the install tree), creates it,
  verifies writability with a probe file, and falls back to `<DSH_HOME>/workspace`.
  On the first 0.2.6+ run, files still sitting in the legacy
  `<install dir>/DeepSeekHarnessWorkspace` are copied once into the new folder
  (the legacy folder is never deleted or written again). It publishes the resolved path
  on `GET /api/dsh-deepseek-ui/workspace` (registered with
  `ctx.connection.fetch.register`) and registers one global English prompt
  section (`ctx.systemPrompt.section`, order just before `FILE_REFERENCE`, fixed
  text, `interpolate: false`) so every request carries the situation. The text
  also tells the model that file operations are user-guided — it may ask where
  files should be created or viewed — while a user-named folder only consents to
  that one operation, never a permanent switch.
- **Browser half**: reads the route once (`duiFixedWorkspace`, cached), then
  `workspaces.create({ path })` (Host-idempotent) followed by
  `sessions.create({ workspaceId })` and `openSession` for every new
  conversation. When the route is unavailable it falls back to the old
  recent-workspace path.
- **Picker removal**: the `conversation.hero.workspace` seat is shadowed by an
  empty registration, and the chip is hidden by a structural rule
  (`div:has(> button[aria-haspopup="menu"]):has(~ * [data-composer-card])`) plus a
  runtime tag for layouts that move the control.
- After changing the client bundle, the browser needs a window refresh: client
  plugins reload through the HMR receiver, and a plugin installed while the page
  is stale keeps rendering its previous generation.

## Conversation styling and scroll stability

The transcript skin is surface-only: user bubble, reasoning row, tool rows,
action rows, markdown fills. Three things were deliberately removed from it
because they disturbed the chat's own measurement, which is what made the view
jump back to an earlier message while the last answer streamed:

1. **No percentage in `--dsh-chat-content-width`.** The host resolves that axis
   against the column; a percentage re-resolves on every scrollport resize and
   reflows every measured row.
2. **No scrollport or flow geometry overrides** (padding, gutter, bottom
   padding). The virtualizer and the follow engine measure that box directly.
3. **No DOM MutationObserver.** Composer markers are refreshed by a 1.5s
   interval instead, so streamed tokens never schedule competing frames.

## The composer skin

The shipped composer card and tool row have no per-control data attribute, and
`aria-busy` is also present on the model control, so attribute selectors alone
styled the model chip as a send circle. The plugin therefore tags the composer
once and keeps the markers current with a `MutationObserver`:

- `data-dsui-send` — the LAST `aria-busy` / stop-glyph button in the tool row,
  which is always the primary control of the trailing group.
- `data-dsui-model` — the first control inside the `conversation.input.model`
  seat.

The stylesheet only styles those markers plus documented surfaces
(`[data-composer-card]`, `[data-phase]`, `[data-composer-placeholder]`, the
attachments seat, and the `conversation.input.permission` / `.plan` slot anchors
for their toggle pills), so a host rebuild degrades the skin instead of breaking
the composer. A small `conversation.composer.dock` entry renders the app's
generation caveat under the composer readings.

## The session list

The sidebar is drawn from the Host's own snapshots, not from the shipped browser:

- `useSessions(s => s)` → `{ ids, byId }`; root conversations only
  (`parentId === undefined`), the one blank New Session row kept only while it is
  the current view, sorted by `updatedAt`.
- `useWorkspaces(s => s)` → `pinnedSessionIds` / `archivedSessionIds`, which drive
  the pinned group and the collapsible archived group.
- Grouping mirrors the demo's `groupSessions`: today, yesterday, previous 7 days,
  previous 30 days, then one group per calendar month (label via `Intl`).
- Actions reuse the shipped controllers: `ctx.uiWorkspace.openSession`,
  `pinSession`/`unpinSession`, `archiveSession({stopActivity})`/`unarchiveSession`,
  `ctx.sessions.using(id, …, reference.binding.session.rename(title))`, and the
  plugin Host's own `POST /api/dsh-deepseek-ui/session-delete` route (the
  `dsh-session-delete-cascade` sequence ported in: lineage, activity refusal,
  live-agent release plus write-handle close, projection rows, durable log,
  workspace accounting). The client still falls back to the optional bundle's
  route on an older build.
- Refusals become notices through the plugin's toast surface; none of them throw
  into the slot tree.

The shipped `conversation.chat.node` renderers are not wrapped: the host already
publishes per-row `data-chat-node-key` / `data-chat-flow-kind` attributes, so the
conversation skin is pure CSS and cannot disturb virtualisation or measurement.

## Preset tip and scroll guard

- **Preset tip**: the Host's workspace route also answers `recommendedPresets`
  (the ids of 官网-纯聊天 / 官网-可干活 resolved against the live roster). A
  `shell.overlay` occupant watches the current session's
  `projectionValues.agentPreset` and opens a dialog once per session+preset.
  Suppression lives in `localStorage` (`dsui-preset-tip-never`,
  `dsui-preset-tip-day`), is applied when the dialog closes (button, backdrop,
  or Escape), and is consulted before every show, so it covers new
  conversations, launches, and mode switches alike.
- **Delete then new chat**: `duiSessionActions.deleteSession` awaits the plugin's
  cascade route and then calls the shared `createNewConversation()`, so a
  removal always leaves a fresh conversation open.
- **Scroll guard**: `duiWatchScrollGuard` samples `[data-conversation-scroll]`
  (attaching lazily as the conversation mounts), classifies any wheel, touch,
  pointer, or key input as reader intent for 1.8s, and only corrects a single
  upward jump larger than `max(240px, 50% viewport)` that started within 48px of
  the tail. The correction re-pins once on the next frame, so streaming growth
  and the shipped fold animation keep working.

## Failure policy

Every mount point goes through `duiGuard`: a renamed slot, a missing service, or
a refused registration logs one warning and drops that feature. The page keeps
rendering. This mirrors the reference implementation's per-feature `try/catch`.

## Token strategy

`src/theme.css` re-declares the demo's design-token values on
`html[data-dsui] body` (light) and `html[data-dsui] body[data-ds-dark-theme]`
(dark). The host GUI and the demo share the same token names (`--dsw-*`,
`--ds-*`), so this one file re-skins every shipped component without touching
component CSS. Skin rules live under the same root attribute, so disabling the
bundle removes the entire skin with the attribute and the style element.

## Compatibility

- Baseline: DSH `0.2.2-rc.5`.
- Stable seams relied on: slot keys, `sidebar` owner props (`collapsed`,
  `width`, `drawer`), standard hooks, `data-slot`/`data-row-key`/
  `data-chat-node-key` attributes, and the platform module table (`react`,
  `@deepseek-ai/dsh-client-ui-primitives`).
- `duiHostClass(semantic)` resolves a shipped CSS-Modules class by its semantic
  suffix when a rule truly needs one. It is a fallback, not the main strategy.
- Conflicts: any other bundle that disables `ui-sidebar` and claims the same seat.

## How the settings hand-off works

The shipped `sidebar.settings` seat is occupied by the account launcher, not by
a Settings button: its press opens an account menu whose first row opens the
Settings dialog. The sheet's "Open all settings" therefore presses that launcher
inside its hidden seat and then its first menu row — the same path the shipped
sidebar's foot uses. A release that stops rendering a launcher falls back to the
platform's "open preferences" chord.

## Deliberate scope cut: composer controls

The composer's tool row is a measured, wrapping flex row whose compact state the
host drives from a ResizeObserver. Restyling control sizes or adding card padding
fed wrong numbers back into that row and made the model chip overlap the send
control, so the skin covers only the card surface, radii, borders, type, and
attachment chips. Control geometry stays the host's.
