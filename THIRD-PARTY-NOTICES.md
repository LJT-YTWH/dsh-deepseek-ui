# Third-party notices

DeepSeek UI contains material derived from the following MIT-licensed projects.

## chat-demo v0.1.3

- Source: the `chat-demo` v0.1.3 sample application (MIT,
  `package.json` `license: "MIT"`), bundled with the development workspace.
- Used for:
  - `src/icons.js` — icon SVG geometry ported from
    `src/components/base/icons.tsx` (kept verbatim, mounted through React).
  - `src/sidebar.css` — sidebar geometry, the New Session pill, brand row, and
    rail rules derived from `src/components/sider/Sider.module.css` and
    `SessionItem.module.css`.
  - `src/theme.css`, `src/base.css` — the design-token table derived from
    `src/app/theme.css` and `src/app/global.css`.
  - `src/chat.css`, `src/composer.css` — conversation and composer styling
    derived from `src/components/messages/*.module.css` and
    `src/components/chatInput/ChatInput.module.css`.
  - `src/sheet.css` — dialog surface values derived from
    `src/components/settings/Settings.module.css` and the demo's modal styles.
- The demo's `services/` tree is not used: all chat, session, and workspace
  behaviour stays on the DeepSeek Harness Host.

## Reference implementation (design reference only)

- `dsh-codex-ui` by `jiangshen275-beep` (MIT, upstream `Loliyer520/dsh-codex-ui`),
  consulted from a local working copy of the upstream repository.
- Used as a design reference for the bundle shape (`dsh.bundle.patch`,
  `dsh.client`, sidebar takeover, tolerant slot mounting, CSS-Modules suffix
  mapping). No source file was copied; the sidebar shell, sheet, and CSS in this
  package were written for this plugin.

## DeepSeek application UI (design reference)

- The settings window follows the layout of the DeepSeek desktop application's
  own "系统设置" window (title bar, section rail, label/control rows, three-up
  theme cards, pill dropdowns). No application code or asset was copied; the
  window is drawn with this plugin's own components and the shared design
  tokens, and the brand artwork it shows comes from the DeepSeek Harness
  primitives.

## DeepSeek Harness

- Host package sources were read as API documentation under their own license
  (MIT). No host file is bundled or modified by this plugin.
