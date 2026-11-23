window.__ModuleLoader__.load({
  id: "dsh-deepseek-ui",
  factory(require) {
    'use strict';
    const React = require('react');
    const h = React.createElement;
    const Fragment = React.Fragment;
    const {
      useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback, useSyncExternalStore,
    } = React;
    const duiPrimitives = (() => {
      try { return require('@deepseek-ai/dsh-client-ui-primitives'); } catch (error) {
        console.warn('[dsh-deepseek-ui] UI primitives unavailable', error);
        return {};
      }
    })();
    const DUI_CSS = [
      /* theme.css */
"/* chat-demo design tokens (MIT), scoped to html[data-dsui] so disabling the plugin restores the host palette. */\n\nhtml[data-dsui]:root {\n  --dsw-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n  font-variant-ligatures: no-contextual;\n}\n\nhtml[data-dsui] body {\n  --ds-control-height-xl: 44px;\n  --ds-control-height-l: 40px;\n  --ds-control-height-m: 36px;\n  --ds-control-height-s: 32px;\n  --ds-control-height-xs: 28px;\n  --ds-font-size-m: 14px;\n  --ds-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);\n  --ds-font-family-code: Menlo, Monaco, Consolas, 'Cascadia Mono', 'Ubuntu Mono', 'DejaVu Sans Mono', 'Liberation Mono', 'JetBrains Mono', 'Fira Code', Cousine, 'Roboto Mono', 'Courier New', Courier, sans-serif, system-ui;\n  --ds-transition-duration: 0.2s;\n  --ds-transition-duration-slow: 0.3s;\n}\n\nhtml[data-dsui] body {\n  --dsw-static-amber-100: rgb(254, 245, 231);\n  --dsw-static-amber-400: rgb(247, 173, 49);\n  --dsw-static-amber-500: rgb(245, 158, 11);\n  --dsw-static-amber-600: rgb(221, 134, 41);\n  --dsw-static-amber-900: rgb(39, 36, 31);\n  --dsw-static-blue-100: rgb(228, 237, 253);\n  --dsw-static-blue-200: rgb(211, 226, 255);\n  --dsw-static-blue-300: rgb(183, 200, 254);\n  --dsw-static-blue-400: rgb(103, 158, 254);\n  --dsw-static-blue-450: rgb(86, 134, 254);\n  --dsw-static-blue-500: rgb(57, 100, 254);\n  --dsw-static-blue-50: rgb(237, 243, 254);\n  --dsw-static-blue-600: rgb(72, 104, 178);\n  --dsw-static-blue-800: rgb(52, 65, 91);\n  --dsw-static-blue-900: rgb(40, 49, 66);\n  --dsw-static-green-100: rgb(230, 250, 237);\n  --dsw-static-green-400: rgb(78, 209, 126);\n  --dsw-static-green-500: rgb(34, 197, 94);\n  --dsw-static-green-900: rgb(35, 60, 44);\n  --dsw-static-neutral-850: rgb(33, 33, 35);\n  --dsw-static-neutral-bluish-00: rgb(255, 255, 255);\n  --dsw-static-neutral-bluish-1000: rgb(15, 17, 21);\n  --dsw-static-neutral-bluish-100: rgb(235, 238, 242);\n  --dsw-static-neutral-bluish-150: rgb(233, 236, 242);\n  --dsw-static-neutral-bluish-200: rgb(225, 229, 238);\n  --dsw-static-neutral-bluish-300: rgb(207, 211, 214);\n  --dsw-static-neutral-bluish-400: rgb(173, 178, 184);\n  --dsw-static-neutral-bluish-50: rgb(249, 250, 251);\n  --dsw-static-neutral-bluish-600: rgb(129, 133, 140);\n  --dsw-static-neutral-bluish-60: rgb(245, 246, 247);\n  --dsw-static-neutral-bluish-700: rgb(97, 102, 107);\n  --dsw-static-neutral-bluish-750: rgb(67, 69, 74);\n  --dsw-static-neutral-bluish-75: rgb(241, 243, 245);\n  --dsw-static-neutral-bluish-800: rgb(53, 54, 56);\n  --dsw-static-neutral-bluish-850: rgb(44, 44, 46);\n  --dsw-static-neutral-bluish-900: rgb(27, 27, 28);\n  --dsw-static-neutral-bluish-950: rgb(21, 21, 23);\n  --dsw-static-neutral-100: rgb(245, 245, 245);\n  --dsw-static-neutral-300: rgb(212, 212, 212);\n  --dsw-static-neutral-550: rgb(101, 103, 107);\n  --dsw-static-red-400: rgb(242, 90, 90);\n  --dsw-static-red-600: rgb(236, 19, 19);\n}\n\nhtml[data-dsui] body[data-ds-dark-theme] {\n  --dsw-static-amber-100: rgb(254, 245, 231);\n  --dsw-static-amber-400: rgb(247, 173, 49);\n  --dsw-static-amber-500: rgb(245, 158, 11);\n  --dsw-static-amber-600: rgb(221, 134, 41);\n  --dsw-static-amber-900: rgb(39, 36, 31);\n  --dsw-static-blue-100: rgb(228, 237, 253);\n  --dsw-static-blue-200: rgb(211, 226, 255);\n  --dsw-static-blue-300: rgb(183, 200, 254);\n  --dsw-static-blue-400: rgb(103, 158, 254);\n  --dsw-static-blue-450: rgb(86, 134, 254);\n  --dsw-static-blue-500: rgb(57, 100, 254);\n  --dsw-static-blue-50: rgb(237, 243, 254);\n  --dsw-static-blue-600: rgb(72, 104, 178);\n  --dsw-static-blue-800: rgb(52, 65, 91);\n  --dsw-static-blue-900: rgb(40, 49, 66);\n  --dsw-static-green-100: rgb(230, 250, 237);\n  --dsw-static-green-400: rgb(78, 209, 126);\n  --dsw-static-green-500: rgb(34, 197, 94);\n  --dsw-static-green-900: rgb(35, 60, 44);\n  --dsw-static-neutral-850: rgb(33, 33, 35);\n  --dsw-static-neutral-bluish-00: rgb(255, 255, 255);\n  --dsw-static-neutral-bluish-1000: rgb(15, 17, 21);\n  --dsw-static-neutral-bluish-100: rgb(235, 238, 242);\n  --dsw-static-neutral-bluish-150: rgb(233, 236, 242);\n  --dsw-static-neutral-bluish-200: rgb(225, 229, 238);\n  --dsw-static-neutral-bluish-300: rgb(207, 211, 214);\n  --dsw-static-neutral-bluish-400: rgb(173, 178, 184);\n  --dsw-static-neutral-bluish-50: rgb(249, 250, 251);\n  --dsw-static-neutral-bluish-600: rgb(129, 133, 140);\n  --dsw-static-neutral-bluish-60: rgb(249, 250, 251);\n  --dsw-static-neutral-bluish-700: rgb(97, 102, 107);\n  --dsw-static-neutral-bluish-750: rgb(67, 69, 74);\n  --dsw-static-neutral-bluish-75: rgb(241, 243, 245);\n  --dsw-static-neutral-bluish-800: rgb(53, 54, 56);\n  --dsw-static-neutral-bluish-850: rgb(44, 44, 46);\n  --dsw-static-neutral-bluish-900: rgb(27, 27, 28);\n  --dsw-static-neutral-bluish-950: rgb(21, 21, 23);\n  --dsw-static-neutral-100: rgb(245, 245, 245);\n  --dsw-static-neutral-300: rgb(212, 212, 212);\n  --dsw-static-neutral-550: rgb(101, 103, 107);\n  --dsw-static-red-400: rgb(242, 90, 90);\n  --dsw-static-red-600: rgb(236, 19, 19);\n}\n\nhtml[data-dsui] body {\n  --dsw-alias-bg-base: var(--dsw-static-neutral-bluish-00);\n  --dsw-alias-bg-layer-2: var(--dsw-static-neutral-bluish-00);\n  --dsw-alias-bg-layer-3: var(--dsw-static-neutral-bluish-00);\n  --dsw-alias-bg-skeleton: rgba(0, 0, 0, 0.04);\n  --dsw-alias-border-inverted: rgba(0, 0, 0, 0);\n  --dsw-alias-border-l1: rgba(0, 0, 0, 0.04);\n  --dsw-alias-border-l2-darkmode-thin: rgba(0, 0, 0, 0.1);\n  --dsw-alias-border-l2: rgba(0, 0, 0, 0.1);\n  --dsw-alias-border-l3: rgba(0, 0, 0, 0.12);\n  --dsw-alias-brand-primary-invert: var(--dsw-static-blue-500);\n  --dsw-alias-brand-primary: var(--dsw-static-blue-500);\n  --dsw-alias-brand-text: var(--dsw-static-blue-500);\n  --dsw-alias-button-contrast-fill: var(--dsw-static-neutral-bluish-700);\n  --dsw-alias-button-elevated-fill: var(--dsw-static-neutral-bluish-00);\n  --dsw-alias-button-ghost-active-border: var(--dsw-static-blue-300);\n  --dsw-alias-button-ghost-active-fill: var(--dsw-static-blue-50);\n  --dsw-alias-button-ghost-active-hover: var(--dsw-static-blue-100);\n  --dsw-alias-button-primary-fill: var(--dsw-alias-brand-primary);\n  --dsw-alias-button-primary-hover: var(--dsw-static-blue-450);\n  --dsw-alias-interactive-bg-active: rgba(38, 49, 72, 0.1);\n  --dsw-alias-interactive-bg-hover-danger: rgba(236, 19, 19, 0.05);\n  --dsw-alias-interactive-bg-hover: rgba(38, 49, 72, 0.06);\n  --dsw-alias-interactive-bg-hover-accent: rgba(38, 49, 72, 0.14);\n  --dsw-alias-label-caption: var(--dsw-static-neutral-bluish-400);\n  --dsw-alias-label-dimmed: var(--dsw-static-neutral-bluish-200);\n  --dsw-alias-label-primary-foreground: var(--dsw-static-neutral-bluish-00);\n  --dsw-alias-label-primary-inverted: var(--dsw-static-neutral-bluish-00);\n  --dsw-alias-label-primary: var(--dsw-static-neutral-bluish-1000);\n  --dsw-alias-label-secondary: var(--dsw-static-neutral-bluish-700);\n  --dsw-alias-label-tertiary: var(--dsw-static-neutral-bluish-600);\n  --dsw-alias-markdown-citation: var(--dsw-static-neutral-bluish-100);\n  --dsw-alias-markdown-code-block-banner: var(--dsw-static-neutral-bluish-50);\n  --dsw-alias-markdown-code-block: var(--dsw-static-neutral-bluish-50);\n  --dsw-alias-markdown-inline-code: var(--dsw-static-neutral-bluish-100);\n  --dsw-alias-markdown-placeholder: var(--dsw-static-neutral-bluish-60);\n  --dsw-alias-markdown-tag: var(--dsw-static-neutral-bluish-75);\n  --dsw-alias-state-error-primary: var(--dsw-static-red-600);\n  --dsw-alias-state-error-secondary: var(--dsw-static-red-400);\n  --dsw-alias-toast-bg: var(--dsw-static-neutral-bluish-800);\n  --dsw-specific-bubble: var(--dsw-static-blue-50);\n  --dsw-specific-input-major: var(--dsw-static-neutral-bluish-00);\n  --dsw-specific-login-input: var(--dsw-static-neutral-bluish-50);\n  --dsw-specific-menu: var(--dsw-alias-bg-layer-3);\n  --dsw-alias-tooltip-bg: var(--dsw-static-neutral-bluish-850);\n  --dsw-specific-selector: var(--dsw-static-neutral-bluish-75);\n  --dsw-specific-sidebar-fill: var(--dsw-static-neutral-bluish-50);\n  --dsw-specific-sidebar-nav-item-active-accent: var(--dsw-static-blue-100);\n  --dsw-specific-sidebar-nav-item-hover: var(--dsw-static-neutral-bluish-75);\n}\n\nhtml[data-dsui] body[data-ds-dark-theme] {\n  --dsw-alias-bg-base: var(--dsw-static-neutral-bluish-950);\n  --dsw-alias-bg-layer-2: var(--dsw-static-neutral-bluish-850);\n  --dsw-alias-bg-layer-3: var(--dsw-static-neutral-bluish-800);\n  --dsw-alias-bg-skeleton: rgba(255, 255, 255, 0.08);\n  --dsw-alias-border-inverted: rgba(255, 255, 255, 0.06);\n  --dsw-alias-border-l1: rgba(255, 255, 255, 0.06);\n  --dsw-alias-border-l2-darkmode-thin: rgba(255, 255, 255, 0.06);\n  --dsw-alias-border-l2: rgba(255, 255, 255, 0.12);\n  --dsw-alias-border-l3: rgba(255, 255, 255, 0.16);\n  --dsw-alias-brand-primary-invert: var(--dsw-static-neutral-bluish-00);\n  --dsw-alias-brand-primary: var(--dsw-static-blue-450);\n  --dsw-alias-brand-text: var(--dsw-static-blue-400);\n  --dsw-alias-button-contrast-fill: var(--dsw-static-neutral-bluish-50);\n  --dsw-alias-button-elevated-fill: var(--dsw-static-neutral-bluish-750);\n  --dsw-alias-button-ghost-active-border: var(--dsw-static-blue-600);\n  --dsw-alias-button-ghost-active-fill: var(--dsw-static-blue-900);\n  --dsw-alias-button-ghost-active-hover: var(--dsw-static-blue-800);\n  --dsw-alias-button-primary-fill: var(--dsw-alias-brand-primary);\n  --dsw-alias-button-primary-hover: var(--dsw-static-blue-500);\n  --dsw-alias-interactive-bg-active: rgba(255, 255, 255, 0.14);\n  --dsw-alias-interactive-bg-hover-danger: rgba(242, 90, 90, 0.15);\n  --dsw-alias-interactive-bg-hover: rgba(255, 255, 255, 0.08);\n  --dsw-alias-interactive-bg-hover-accent: rgba(255, 255, 255, 0.24);\n  --dsw-alias-label-caption: var(--dsw-static-neutral-bluish-600);\n  --dsw-alias-label-dimmed: var(--dsw-static-neutral-bluish-750);\n  --dsw-alias-label-primary-foreground: var(--dsw-static-neutral-bluish-00);\n  --dsw-alias-label-primary-inverted: var(--dsw-static-neutral-bluish-800);\n  --dsw-alias-label-primary: var(--dsw-static-neutral-bluish-50);\n  --dsw-alias-label-secondary: var(--dsw-static-neutral-bluish-300);\n  --dsw-alias-label-tertiary: var(--dsw-static-neutral-bluish-400);\n  --dsw-alias-markdown-citation: var(--dsw-static-neutral-bluish-800);\n  --dsw-alias-markdown-code-block-banner: var(--dsw-static-neutral-bluish-850);\n  --dsw-alias-markdown-code-block: var(--dsw-static-neutral-bluish-900);\n  --dsw-alias-markdown-inline-code: var(--dsw-static-neutral-bluish-850);\n  --dsw-alias-markdown-placeholder: var(--dsw-static-neutral-bluish-850);\n  --dsw-alias-markdown-tag: var(--dsw-static-neutral-bluish-850);\n  --dsw-alias-state-error-primary: var(--dsw-static-red-400);\n  --dsw-alias-state-error-secondary: var(--dsw-static-red-400);\n  --dsw-alias-toast-bg: var(--dsw-static-neutral-bluish-750);\n  --dsw-specific-bubble: var(--dsw-static-neutral-bluish-850);\n  --dsw-specific-input-major: var(--dsw-static-neutral-bluish-850);\n  --dsw-specific-login-input: var(--dsw-static-neutral-bluish-900);\n  --dsw-specific-menu: var(--dsw-alias-bg-layer-3);\n  --dsw-alias-tooltip-bg: var(--dsw-static-neutral-bluish-750);\n  --dsw-specific-selector: var(--dsw-static-neutral-bluish-750);\n  --dsw-specific-sidebar-fill: var(--dsw-static-neutral-bluish-900);\n  --dsw-specific-sidebar-nav-item-active-accent: var(--dsw-static-neutral-bluish-800);\n  --dsw-specific-sidebar-nav-item-hover: var(--dsw-static-neutral-bluish-850);\n}\n\nhtml[data-dsui] body {\n  --dsw-shadow-lv3: 0 0 1px 0 rgba(0, 0, 0, 0.2), 0 0 4px 0 rgba(0, 0, 0, 0.02), 0 12px 32px 0 rgba(0, 0, 0, 0.08);\n}\n\nhtml[data-dsui] body {\n  --dsw-font-markdown-h1: 700 24px/34px var(--dsw-font-family);\n  --dsw-font-markdown-h2: 700 22px/32px var(--dsw-font-family);\n  --dsw-font-markdown-h3: 700 20px/30px var(--dsw-font-family);\n  --dsw-font-markdown-h4: 600 16px/28px var(--dsw-font-family);\n  --dsw-font-markdown-base: 16px/28px var(--dsw-font-family);\n  --dsw-font-markdown-base-strong: 600 16px/28px var(--dsw-font-family);\n  --dsw-font-markdown-table: 15px/25px var(--dsw-font-family);\n  --dsw-font-markdown-table-head: 500 15px/25px var(--dsw-font-family);\n  --dsw-font-markdown-small: 14px/24px var(--dsw-font-family);\n  --dsw-font-markdown-small-strong: 600 14px/24px var(--dsw-font-family);\n  --dsw-font-markdown-code: 14px/22px var(--ds-font-family-code);\n  --dsw-font-markdown-code-block: 13px/22px var(--ds-font-family-code);\n  --dsw-font-s-strong-14: 500 14px/22px var(--dsw-font-family);\n  --dsw-font-xs-13: 13px/20px var(--dsw-font-family);\n}\n\n/* The host base.css declares --dsw-font-family on body, so the demo stack must be restated there to win. */\nhtml[data-dsui] body {\n  --dsw-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n}\n",
      /* base.css */
"/* Host shell surfaces plus the plugin's shared dsui- atoms, all scoped to html[data-dsui]. */\n\nhtml[data-dsui] {\n  --message-list-max-width: 840px;\n  --message-list-padding-horizontal: 44px;\n}\n\n@media (max-width: 1023px) {\n  html[data-dsui] {\n    --message-list-max-width: 712px;\n    --message-list-padding-horizontal: 36px;\n  }\n}\n\nhtml[data-dsui] body {\n  margin: 0;\n  word-break: break-word;\n  font-family: var(--dsw-font-family);\n  font-size: var(--ds-font-size-m);\n  color: var(--dsw-alias-label-primary);\n  background-color: var(--dsw-alias-bg-base);\n  font-feature-settings: 'kern';\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-text-size-adjust: none;\n  -webkit-tap-highlight-color: transparent;\n  --scroll-color: rgba(0, 0, 0, 0.08);\n  --scroll-color-hover: rgba(0, 0, 0, 0.15);\n}\n\nhtml[data-dsui] body[data-ds-dark-theme] {\n  color-scheme: dark;\n  --scroll-color: rgba(255, 255, 255, 0.15);\n  --scroll-color-hover: rgba(255, 255, 255, 0.24);\n}\n\nhtml[data-dsui] .dsui-whale {\n  display: block;\n  color: var(--dsw-alias-brand-primary);\n}\n\nhtml[data-dsui] .dsui-icon-button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  width: 28px;\n  height: 28px;\n  padding: 0;\n  border: none;\n  border-radius: 8px;\n  background-color: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 16px;\n  cursor: pointer;\n  transition: background-color var(--ds-transition-duration) var(--ds-ease-in-out), color var(--ds-transition-duration) var(--ds-ease-in-out);\n}\n\nhtml[data-dsui] .dsui-icon-button:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml[data-dsui] .dsui-icon-button:focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n}\n\nhtml[data-dsui] .dsui-spinner {\n  display: inline-block;\n  box-sizing: border-box;\n  vertical-align: middle;\n  border: 2px solid var(--dsw-alias-border-l2);\n  border-top-color: var(--dsw-alias-brand-primary);\n  border-radius: 50%;\n  animation: dsui-spin 0.8s linear infinite;\n}\n\n@keyframes dsui-spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n\nhtml[data-dsui] [data-dsui-tip] {\n  position: relative;\n}\n\nhtml[data-dsui] [data-dsui-tip]::after {\n  content: attr(data-dsui-tip);\n  position: absolute;\n  inset-inline-start: calc(100% + 8px);\n  top: 50%;\n  z-index: 60;\n  padding: 6px 8px;\n  border-radius: 8px;\n  background: var(--dsw-alias-tooltip-bg);\n  color: var(--dsw-alias-label-primary-foreground);\n  font-size: 12px;\n  white-space: nowrap;\n  pointer-events: none;\n  opacity: 0;\n  transform: translateY(-50%);\n  transition: opacity 0.12s ease 0.3s;\n}\n\nhtml[data-dsui] [data-dsui-tip]:hover::after,\nhtml[data-dsui] [data-dsui-tip]:focus-visible::after {\n  opacity: 1;\n}\n\n/* The window chrome's top strip sits flush against the column's right edge, so\n   a right-hand tooltip is clipped by the layout: those buttons open downward\n   instead, anchored to their own right edge. */\nhtml[data-dsui] .dsui-top-strip [data-dsui-tip]::after {\n  inset-inline-start: auto;\n  inset-inline-end: 0;\n  top: calc(100% + 6px);\n  transform: none;\n}\n\n/* The sidebar's own top-right controls sit against the column's right edge, so\n   their tooltips open downward like the window-chrome strip's. */\nhtml[data-dsui] .dsui-sider-top-actions [data-dsui-tip]::after {\n  inset-inline-start: auto;\n  inset-inline-end: 0;\n  top: calc(100% + 6px);\n  transform: none;\n}\n\n/* The recommended-mode tag inside the agent-preset menu: a quiet brand-tinted\n   chip instead of a solid pill, so it reads as a label beside the mode name\n   rather than a button. */\nhtml[data-dsui] .dsui-recommend {\n  display: inline-flex;\n  align-items: center;\n  height: 14px;\n  margin-inline-start: 4px;\n  padding: 0 4px;\n  border: 0.5px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent);\n  border-radius: 4px;\n  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent);\n  color: var(--dsw-alias-brand-primary);\n  font-size: 10px;\n  font-weight: 500;\n  line-height: 1;\n  letter-spacing: 0.01em;\n  white-space: nowrap;\n  vertical-align: 1px;\n}\n\nhtml[data-dsui] body[data-ds-dark-theme] .dsui-recommend {\n  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 34%, transparent);\n  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);\n}\n\n/* A probe element left in the DOM by a hot-reloaded debug build of this plugin\n   is never part of the interface; hide it without needing a page reload. */\nhtml[data-dsui] #dsui-probe,\nhtml[data-dsui] #dsui-check {\n  display: none !important;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html[data-dsui] .dsui-icon-button {\n    transition: none;\n  }\n  html[data-dsui] [data-dsui-tip]::after {\n    transition: none;\n  }\n  html[data-dsui] .dsui-spinner {\n    animation: none;\n  }\n}\n",
      /* sidebar.css */
"/*\n * chat-demo sidebar, ported 1:1.\n *\n * Geometry and type come from chat-demo v0.1.3 (MIT):\n *   src/components/sider/Sider.module.css          column, top row, New chat pill,\n *                                                  section captions, footer settings row\n *   src/components/sider/SessionItem.module.css    session row, active fill, hover actions,\n *                                                  inline rename field\n * Flattened to plain CSS (the demo uses nested rules) and scoped under\n * `html[data-dsui]` so disabling the plugin removes the skin with the attribute.\n */\n\nhtml[data-dsui] .dsui-sider {\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  padding: 6px 12px 0;\n  border-right: 1px solid var(--dsw-alias-border-l1);\n  background-color: var(--dsw-specific-sidebar-fill);\n  color: var(--dsw-alias-label-primary);\n  font-size: 14px;\n}\n\nhtml[data-dsui] .dsui-sider--drawer {\n  border-right: none;\n  border-top-right-radius: 16px;\n  border-bottom-right-radius: 16px;\n  box-shadow: var(--dsw-shadow-lv3);\n}\n\n/* ---- top row: brand + collapse ---- */\n\n/* The macOS hiddenInset strip clears the traffic lights and keeps the toggle. */\nhtml[data-dsui] .dsui-top-strip {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  flex-shrink: 0;\n  box-sizing: border-box;\n  height: 52px;\n  padding: 0 4px;\n}\n\nhtml[data-dsui] .dsui-sider-top {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  box-sizing: border-box;\n  height: 48px;\n  margin-bottom: 16px;\n  padding: 15px 0 10px 4px;\n  flex-shrink: 0;\n}\n\nhtml[data-dsui] .dsui-brand {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  min-width: 0;\n  padding-left: 4px;\n}\n\nhtml[data-dsui] .dsui-brand-mark {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  width: 24px;\n  height: 24px;\n  color: var(--dsw-alias-brand-primary);\n}\n\nhtml[data-dsui] .dsui-brand-wordmark {\n  min-width: 0;\n  overflow: hidden;\n  font-size: 20px;\n  line-height: 22px;\n  font-weight: 600;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  color: var(--dsw-alias-brand-primary);\n}\n\nhtml[data-dsui] .dsui-sider-top-actions {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  flex-shrink: 0;\n}\n\nhtml[data-dsui] .dsui-collapse,\nhtml[data-dsui] .dsui-search-toggle {\n  width: 28px;\n  height: 28px;\n}\n\nhtml[data-dsui] .dsui-search-toggle--on {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\n/* ---- New chat pill ---- */\n\nhtml[data-dsui] .dsui-new-chat-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n}\n\nhtml[data-dsui] .dsui-new-chat-row .dsui-new-chat {\n  flex: 1 1 auto;\n  min-width: 0;\n  width: auto;\n}\n\n/* The action a plug-in seats beside New session (DeepSeek chat import) wears the\n   same surface as the pill: identical height, 100px corner, elevated fill, and\n   hover lift — only its content differs. */\nhtml[data-dsui] .dsui-new-chat-row > :not(.dsui-new-chat) {\n  flex: none;\n  display: flex;\n  align-items: center;\n}\n\nhtml[data-dsui] .dsui-new-chat-row button:not(.dsui-new-chat) {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  box-sizing: border-box;\n  width: 40px;\n  height: 40px;\n  padding: 0;\n  border: 1px solid rgba(103, 158, 254, 0);\n  border-radius: 100px;\n  background: var(--dsw-alias-button-elevated-fill);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  cursor: pointer;\n  transition: box-shadow var(--ds-transition-duration-slow, 0.3s) var(--ds-ease-in-out, ease);\n  box-shadow:\n    0 -2px 2px rgba(72, 104, 178, 0.04),\n    0 2px 2px rgba(106, 111, 117, 0.09),\n    0 1px 2px rgba(72, 104, 178, 0.08);\n}\n\nhtml[data-dsui] .dsui-new-chat-row button:not(.dsui-new-chat) > svg {\n  width: 16px;\n  height: 16px;\n}\n\nhtml[data-dsui] .dsui-new-chat-row button:not(.dsui-new-chat):hover {\n  background: var(--dsw-alias-button-elevated-fill);\n  box-shadow:\n    0 4px 4px 0 rgba(72, 104, 178, 0.04),\n    0 -3px 4px 0 rgba(72, 104, 178, 0.04),\n    0 6px 6px 0 rgba(106, 111, 117, 0.1);\n}\n\nhtml[data-dsui] .dsui-new-chat-row button:not(.dsui-new-chat):focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n  outline-offset: 2px;\n}\n\nhtml[data-dsui] body[data-ds-dark-theme] .dsui-new-chat-row button:not(.dsui-new-chat) {\n  border: none;\n  box-shadow:\n    inset 0 1px 1px rgba(255, 255, 255, 0.1),\n    0 2px 4px rgba(106, 111, 117, 0.08);\n}\n\nhtml[data-dsui] .dsui-new-chat {\n\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  box-sizing: border-box;\n  width: 100%;\n  height: 40px;\n  padding: 0 16px;\n  border: 1px solid rgba(103, 158, 254, 0);\n  border-radius: 100px;\n  background: var(--dsw-alias-button-elevated-fill);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 14px;\n  font-weight: 500;\n  cursor: pointer;\n  user-select: none;\n  box-shadow:\n    0 -2px 2px rgba(72, 104, 178, 0.04),\n    0 2px 2px rgba(106, 111, 117, 0.09),\n    0 1px 2px rgba(72, 104, 178, 0.08);\n  transition: box-shadow var(--ds-transition-duration-slow, 0.3s) var(--ds-ease-in-out, ease);\n}\n\nhtml[data-dsui] .dsui-new-chat:hover {\n  box-shadow:\n    0 4px 4px 0 rgba(72, 104, 178, 0.04),\n    0 -3px 4px 0 rgba(72, 104, 178, 0.04),\n    0 6px 6px 0 rgba(106, 111, 117, 0.1);\n}\n\nhtml[data-dsui] .dsui-new-chat:focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n  outline-offset: 2px;\n}\n\nhtml[data-dsui] body[data-ds-dark-theme] .dsui-new-chat {\n  border: none;\n  box-shadow:\n    inset 0 1px 1px rgba(255, 255, 255, 0.1),\n    0 2px 4px rgba(106, 111, 117, 0.08);\n}\n\nhtml[data-dsui] .dsui-new-chat-icon {\n  display: flex;\n  align-items: center;\n  margin-right: 6px;\n}\n\n/* ---- inline session search (replaces the shipped browser's search) ---- */\n\nhtml[data-dsui] .dsui-search-row {\n  flex-shrink: 0;\n  margin-top: 8px;\n}\n\nhtml[data-dsui] .dsui-search-input {\n  box-sizing: border-box;\n  width: 100%;\n  height: 34px;\n  padding: 0 12px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 12px;\n  outline: none;\n  background-color: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 13px;\n}\n\nhtml[data-dsui] .dsui-search-input:focus {\n  border-color: var(--dsw-alias-brand-primary);\n}\n\nhtml[data-dsui] .dsui-search-input::placeholder {\n  color: var(--dsw-alias-label-caption);\n}\n\n/* ---- scrolling session list ---- */\n\nhtml[data-dsui] .dsui-sider-list {\n  position: relative;\n  display: flex;\n  flex: 1;\n  min-height: 0;\n  margin-top: 24px;\n}\n\nhtml[data-dsui] .dsui-sider-scroll {\n  box-sizing: border-box;\n  flex: 1;\n  min-width: 0;\n  min-height: 0;\n  margin: 0 -2px;\n  padding: 0 2px;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: thin;\n  scrollbar-color: var(--scroll-color, rgba(0, 0, 0, 0.08)) transparent;\n}\n\nhtml[data-dsui] .dsui-section {\n  position: relative;\n}\n\nhtml[data-dsui] .dsui-section:first-child {\n  margin-top: 0;\n}\n\nhtml[data-dsui] .dsui-section {\n  margin-top: 16px;\n  padding-top: 4px;\n}\n\nhtml[data-dsui] .dsui-group-header {\n  position: sticky;\n  top: 0;\n  z-index: 20;\n  padding: 2px 10px;\n  font-size: 12px;\n  line-height: 18px;\n  font-weight: 500;\n  color: var(--dsw-alias-label-tertiary);\n  background-color: var(--dsw-specific-sidebar-fill);\n  user-select: none;\n}\n\nhtml[data-dsui] .dsui-group-toggle {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  width: 100%;\n  padding: 2px 10px;\n  border: none;\n  background: none;\n  color: var(--dsw-alias-label-tertiary);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  font-weight: 500;\n  text-align: left;\n  cursor: pointer;\n  user-select: none;\n}\n\nhtml[data-dsui] .dsui-group-count {\n  color: var(--dsw-alias-label-caption);\n}\n\nhtml[data-dsui] .dsui-group-chevron {\n  margin-left: auto;\n  transition: transform var(--ds-transition-duration, 0.2s) var(--ds-ease-in-out, ease);\n}\n\nhtml[data-dsui] .dsui-group-chevron--open {\n  transform: rotate(90deg);\n}\n\n/* ---- one session row (SessionItem) ---- */\n\nhtml[data-dsui] .dsui-item {\n  position: relative;\n  display: flex;\n  align-items: center;\n  box-sizing: border-box;\n  height: 40px;\n  padding: 9px 6px 9px 10px;\n  border-radius: 12px;\n  font-size: 14px;\n  line-height: 22px;\n  color: var(--dsw-alias-label-primary);\n  cursor: pointer;\n  user-select: none;\n}\n\nhtml[data-dsui] .dsui-item--active {\n  background-color: var(--dsw-specific-sidebar-nav-item-active-accent);\n  color: var(--dsw-alias-brand-primary-invert);\n}\n\nhtml[data-dsui] .dsui-item-title {\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  line-height: 18px;\n}\n\nhtml[data-dsui] .dsui-item-actions {\n  display: none;\n  flex-shrink: 0;\n  align-items: center;\n  gap: 2px;\n  margin-left: 4px;\n}\n\nhtml[data-dsui] .dsui-item-action {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  padding: 0;\n  border: none;\n  border-radius: 6px;\n  background: none;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n}\n\nhtml[data-dsui] .dsui-item--active .dsui-item-action {\n  color: var(--dsw-alias-brand-primary-invert);\n}\n\nhtml[data-dsui] .dsui-item-action:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\n@media (hover: hover) {\n  html[data-dsui] .dsui-item:not(.dsui-item--active):hover {\n    background-color: var(--dsw-specific-sidebar-nav-item-hover);\n  }\n\n  html[data-dsui] .dsui-item:hover .dsui-item-actions,\n  html[data-dsui] .dsui-item--active .dsui-item-actions,\n  html[data-dsui] .dsui-item:focus-within .dsui-item-actions {\n    display: flex;\n  }\n}\n\n@media (hover: none) {\n  html[data-dsui] .dsui-item-actions {\n    display: flex;\n  }\n}\n\nhtml[data-dsui] .dsui-item:focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n  outline-offset: -2px;\n}\n\n/* Inline rename (SessionItem .renameInput). */\nhtml[data-dsui] .dsui-rename-input {\n  box-sizing: border-box;\n  width: 100%;\n  height: 40px;\n  padding: 0 10px;\n  border: 1px solid var(--dsw-alias-brand-primary);\n  border-radius: 12px;\n  outline: none;\n  background-color: var(--dsw-specific-input-major);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 14px;\n}\n\nhtml[data-dsui] .dsui-empty {\n  margin: 0;\n  padding: 18px 10px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  line-height: 20px;\n}\n\n/* ---- row overflow menu ---- */\n\nhtml[data-dsui] .dsui-menu {\n  position: fixed;\n  z-index: 1000;\n  min-width: 184px;\n  padding: 4px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 12px;\n  background-color: var(--dsw-alias-bg-layer-3);\n  box-shadow: var(--dsw-shadow-lv3);\n}\n\nhtml[data-dsui] .dsui-menu-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  box-sizing: border-box;\n  width: 100%;\n  height: 34px;\n  padding: 0 10px;\n  border: none;\n  border-radius: 8px;\n  background: none;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 14px;\n  text-align: left;\n  cursor: pointer;\n}\n\nhtml[data-dsui] .dsui-menu-item:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml[data-dsui] .dsui-menu-item--danger {\n  color: var(--dsw-alias-state-error-primary);\n}\n\nhtml[data-dsui] .dsui-menu-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 16px;\n  height: 16px;\n  color: currentColor;\n}\n\n/* ---- footer ---- */\n\nhtml[data-dsui] .dsui-sider-bottom {\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n  gap: 2px;\n  min-height: 64px;\n  padding: 4px 0 8px;\n}\n\nhtml[data-dsui] .dsui-footer-actions {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n\nhtml[data-dsui] .dsui-footer-actions:empty {\n  display: none;\n}\n\nhtml[data-dsui] .dsui-settings-row {\n  display: flex;\n  align-items: center;\n  box-sizing: border-box;\n  width: 100%;\n  margin-block: auto;\n  padding: 6px 2px 6px 6px;\n  border: none;\n  border-radius: 12px;\n  background: none;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  user-select: none;\n  outline: none;\n}\n\nhtml[data-dsui] .dsui-settings-row:hover {\n  background-color: var(--dsw-specific-sidebar-nav-item-hover);\n}\n\nhtml[data-dsui] .dsui-settings-row:focus-visible {\n  box-shadow: inset 0 0 0 2px var(--dsw-alias-button-primary-fill);\n}\n\nhtml[data-dsui] .dsui-settings-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  width: 32px;\n  height: 32px;\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml[data-dsui] .dsui-settings-label {\n  min-width: 0;\n  margin-left: 4px;\n  overflow: hidden;\n  font-size: 14px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  color: var(--dsw-alias-label-primary);\n}\n\n/* The shipped Settings seat stays mounted but invisible. */\nhtml[data-dsui] .dsui-host-seats {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip-path: inset(50%);\n  white-space: nowrap;\n}\n\n/* ---- collapsed rail (web keeps a 56px column) ---- */\n\nhtml[data-dsui] .dsui-rail {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  padding: 12px 0;\n  border-right: 1px solid var(--dsw-alias-border-l1);\n  background-color: var(--dsw-specific-sidebar-fill);\n}\n\nhtml[data-dsui] .dsui-rail-spacer {\n  flex: 1;\n}\n\nhtml[data-dsui] .dsui-rail-button {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  width: 36px;\n  height: 36px;\n  border: none;\n  border-radius: 10px;\n  background: none;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n}\n\nhtml[data-dsui] .dsui-rail-button:hover {\n  background-color: var(--dsw-specific-sidebar-nav-item-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml[data-dsui] .dsui-rail-button:focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n}\n\n/* ---- window-chrome seat beside the traffic lights / drawer reopen ---- */\n\n/*\n * The frame publishes `--dsh-frame-leading-clearance` for a band holding two\n * 28px controls. This seat is wider (fish + a three-button pill), so the plugin\n * republishes the clearance for its own measured width; the conversation title\n * row pads by it instead of running under the controls.\n *\n *   darwin, column collapsed or drawer: seat starts at x=88\n *     88 + (26 fish + 12 gap + 2 + 30*3 + 2*2 pill) + 8 air = 232\n *   darwin fullscreen: seat starts at x=12  → 154\n */\nhtml[data-dsui][data-platform='darwin'] [data-sidebar-collapsed],\nhtml[data-dsui][data-platform='darwin'] [data-sidebar-drawer] {\n  --dsh-frame-leading-clearance: 232px;\n}\n\n/* Windows keeps no rail either: the caption's leading seat is the only way back,\n   and it now carries the same fish + three-control pill. Its clearance is the\n   pill itself (no traffic lights in front of it). */\nhtml[data-dsui][data-platform='win32'] [data-sidebar-collapsed],\nhtml[data-dsui][data-platform='win32'] [data-sidebar-drawer],\nhtml[data-dsui][data-windows-titlebar] [data-sidebar-collapsed],\nhtml[data-dsui][data-windows-titlebar] [data-sidebar-drawer] {\n  --dsh-frame-leading-clearance: 148px;\n}\n\nhtml[data-dsui][data-platform='darwin'][data-fullscreen] [data-sidebar-collapsed],\nhtml[data-dsui][data-platform='darwin'][data-fullscreen] [data-sidebar-drawer] {\n  --dsh-frame-leading-clearance: 154px;\n}\n\n/* The collapsed desktop layout: the official fish, then one pill holding the\n   expand control, session search, and New chat. */\nhtml[data-dsui] .dsui-leading {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n/* Windows caption cluster: the collapsed column is zero-width, so the same\n   fish + pill is fixed into the native caption row (shipped sidebar position). */\nhtml[data-dsui][data-windows-titlebar] .dsui-caption-controls,\nhtml[data-dsui][data-platform='win32'] .dsui-caption-controls {\n  position: fixed;\n  top: calc((var(--dsh-windows-titlebar-height, 40px) - 30px) / 2);\n  left: 12px;\n  z-index: 30;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  -webkit-app-region: no-drag;\n}\n\nhtml[data-dsui] .dsui-leading-brand {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  width: 24px;\n  height: 24px;\n  color: var(--dsw-alias-brand-primary);\n}\n\nhtml[data-dsui] .dsui-leading-pill {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  box-sizing: border-box;\n  height: 30px;\n  padding: 1px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 999px;\n  background-color: var(--dsw-alias-bg-layer-3);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);\n}\n\nhtml[data-dsui] .dsui-leading-button {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  width: 28px;\n  height: 28px;\n  border: none;\n  border-radius: 999px;\n  background: none;\n  color: var(--dsw-alias-label-primary);\n  cursor: pointer;\n}\n\n/* The browser drawer keeps one compact opener: the footprint the frame's\n   clearance expects when there is no desktop chrome row. */\n/* Shipped icons ship at fixed intrinsic sizes; pin them so the pill keeps the\n   compact 16px glyph rhythm of the application's own chrome. */\nhtml[data-dsui] .dsui-leading-button > svg {\n  width: 16px;\n  height: 16px;\n}\n\nhtml[data-dsui] .dsui-leading-brand > svg {\n  width: 24px;\n  height: 24px;\n}\n\nhtml[data-dsui] .dsui-leading:not(:has(.dsui-leading-pill)) .dsui-leading-button {\n  width: 28px;\n  height: 28px;\n}\n\nhtml[data-dsui] .dsui-leading-button:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml[data-dsui] .dsui-leading-button:focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n  outline-offset: -2px;\n}\n\n@media (max-width: 767px) {\n  html[data-dsui] .dsui-sider {\n    padding: 6px 12px 0;\n  }\n\n  html[data-dsui] .dsui-sider-list {\n    margin-top: 16px;\n  }\n\n  html[data-dsui] .dsui-group-header,\n  html[data-dsui] .dsui-group-toggle {\n    padding: 4px 10px 3px;\n    font-size: 14px;\n    line-height: 22px;\n  }\n\n  html[data-dsui] .dsui-item {\n    height: 44px;\n    padding: 11px 6px 11px 12px;\n    border-radius: 16px;\n    font-size: 16px;\n  }\n\n  html[data-dsui] .dsui-item-title {\n    line-height: 22px;\n  }\n\n  html[data-dsui] .dsui-rename-input {\n    height: 44px;\n    padding: 0 12px;\n    border-radius: 16px;\n    font-size: 16px;\n  }\n\n  html[data-dsui] .dsui-settings-row {\n    padding: 9px 10px;\n  }\n\n  html[data-dsui] .dsui-settings-icon {\n    width: auto;\n    height: auto;\n  }\n\n  html[data-dsui] .dsui-settings-label {\n    margin-left: 10px;\n    font-size: 16px;\n    line-height: 22px;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html[data-dsui] .dsui-new-chat,\n  html[data-dsui] .dsui-group-chevron {\n    transition: none;\n  }\n}\n\n/* ---- footer row: Settings + the panels launcher added by this plugin ---- */\n\nhtml[data-dsui] .dsui-bottom-row {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n\nhtml[data-dsui] .dsui-bottom-row .dsui-settings-row {\n  flex: 1;\n  min-width: 0;\n}\n\nhtml[data-dsui] .dsui-panels-button {\n  flex-shrink: 0;\n  color: var(--dsw-alias-label-secondary);\n}\n\n/* ---- quick pin on a row ---- */\n\nhtml[data-dsui] .dsui-item-action--on {\n  color: var(--dsw-alias-brand-primary);\n}\n\nhtml[data-dsui] .dsui-item--active .dsui-item-action--on {\n  color: var(--dsw-alias-brand-primary-invert);\n}\n",
      /* sheet.css */
"/*\n * Settings surface.\n *\n * The shipped Settings window keeps every original page (account, general,\n * models, plugins, …) and its Platform overlay; this stylesheet only restyles\n * that window to the DeepSeek application's look, then styles the plugin's own\n * section content (theme, language, panels, shortcuts) and the feedback\n * surfaces (confirmation dialog, notices).\n *\n * The window is addressed through its stable `data-shortcut-modal=\"settings\"`\n * hook and its structural children; its navigation buttons expose\n * `aria-current=\"true\"` for the active page.\n */\n\n/* ---------- the shipped Settings window ---------- */\n\nhtml[data-dsui] [data-shortcut-modal=\"settings\"] {\n  width: 900px;\n  height: min(700px, calc(100vh - 96px));\n  grid-template-columns: 220px minmax(0, 1fr);\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 20px;\n  background: var(--dsw-alias-bg-layer-2);\n  box-shadow: var(--dsw-shadow-lv3);\n  overflow: hidden;\n}\n\nhtml[data-dsui] [data-shortcut-modal=\"settings\"]:focus {\n  outline: none;\n}\n\n/* Title row */\nhtml[data-dsui] [data-shortcut-modal=\"settings\"] > div:first-of-type {\n  padding: 24px 20px 10px 24px;\n  font-size: 20px;\n  line-height: 28px;\n  font-weight: 600;\n}\n\n/* Navigation rail */\nhtml[data-dsui] [data-shortcut-modal=\"settings\"] > nav {\n  padding: 6px 12px 16px;\n}\n\nhtml[data-dsui] [data-shortcut-modal=\"settings\"] > nav button {\n  height: 40px;\n  padding: 0 12px;\n  gap: 10px;\n  border-radius: 12px;\n  font-size: 14px;\n}\n\nhtml[data-dsui] [data-shortcut-modal=\"settings\"] > nav button:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml[data-dsui] [data-shortcut-modal=\"settings\"] > nav button[aria-current=\"true\"] {\n  background-color: var(--dsw-alias-interactive-bg-active);\n}\n\n/* Content header (actions + close) */\nhtml[data-dsui] [data-shortcut-modal=\"settings\"] > div:nth-of-type(2) {\n  height: 62px;\n  padding: 22px 16px 8px 8px;\n}\n\nhtml[data-dsui] [data-shortcut-modal=\"settings\"] > div:nth-of-type(2) button {\n  border-radius: 8px;\n}\n\n/* Options column */\nhtml[data-dsui] [data-shortcut-modal=\"settings\"] > div:nth-of-type(3) {\n  padding: 0 28px 28px 8px;\n}\n\n/* Mask behind the window */\nhtml[data-dsui] body > div[role=\"presentation\"]:has(> [data-shortcut-modal=\"settings\"]) > [aria-hidden=\"true\"] {\n  background: rgba(10, 12, 16, 0.45);\n  backdrop-filter: blur(3px);\n}\n\n/* ---------- the plugin's own section ---------- */\n\nhtml[data-dsui] .dsui-section-lede {\n  margin: 0 0 16px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 18px;\n}\n\nhtml[data-dsui] .dsui-group {\n  margin-bottom: 18px;\n}\n\nhtml[data-dsui] .dsui-group:last-child {\n  margin-bottom: 0;\n}\n\nhtml[data-dsui] .dsui-group-title {\n  margin: 0 0 8px;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  font-weight: 500;\n}\n\nhtml[data-dsui] .dsui-group-card {\n  box-sizing: border-box;\n  padding: 4px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 16px;\n  background-color: var(--dsw-alias-bg-layer-1);\n}\n\nhtml[data-dsui] .dsui-row {\n  display: flex;\n  align-items: center;\n  gap: 24px;\n  box-sizing: border-box;\n  min-height: 58px;\n  padding: 10px 12px;\n  border-radius: 12px;\n}\n\nhtml[data-dsui] .dsui-row--stretch {\n  align-items: flex-start;\n  padding-top: 14px;\n  padding-bottom: 16px;\n}\n\nhtml[data-dsui] .dsui-row-label {\n  flex-shrink: 0;\n  width: 110px;\n  color: var(--dsw-alias-label-primary);\n  font-size: 14px;\n  line-height: 22px;\n}\n\nhtml[data-dsui] .dsui-row-control {\n  display: flex;\n  flex: 1;\n  align-items: center;\n  justify-content: flex-end;\n  min-width: 0;\n}\n\nhtml[data-dsui] .dsui-row--stretch .dsui-row-control {\n  justify-content: flex-start;\n}\n\nhtml[data-dsui] .dsui-row-value {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13px;\n}\n\n/* Clickable rows: every hover fill carries its own radius. */\nhtml[data-dsui] .dsui-link-row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  box-sizing: border-box;\n  width: 100%;\n  min-height: 52px;\n  padding: 8px 10px;\n  border: none;\n  border-radius: 12px;\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: background-color var(--ds-transition-duration, 0.2s) var(--ds-ease-in-out, ease);\n}\n\nhtml[data-dsui] .dsui-link-row + .dsui-link-row {\n  margin-top: 2px;\n}\n\nhtml[data-dsui] .dsui-link-row:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml[data-dsui] .dsui-link-row:focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n  outline-offset: -2px;\n}\n\nhtml[data-dsui] .dsui-link-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  width: 28px;\n  height: 28px;\n  border-radius: 8px;\n  background-color: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml[data-dsui] .dsui-link-copy {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  min-width: 0;\n}\n\nhtml[data-dsui] .dsui-link-label {\n  overflow: hidden;\n  color: var(--dsw-alias-label-primary);\n  font-size: 14px;\n  line-height: 22px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n\nhtml[data-dsui] .dsui-link-hint {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 17px;\n}\n\nhtml[data-dsui] .dsui-row-chevron {\n  display: flex;\n  align-items: center;\n  flex-shrink: 0;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n/* Theme cards */\nhtml[data-dsui] .dsui-theme-cards {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 10px;\n  width: 100%;\n}\n\nhtml[data-dsui] .dsui-theme-card {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  box-sizing: border-box;\n  height: 92px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 14px;\n  background-color: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 13px;\n  cursor: pointer;\n  transition: background-color var(--ds-transition-duration, 0.2s) var(--ds-ease-in-out, ease),\n    border-color var(--ds-transition-duration, 0.2s) var(--ds-ease-in-out, ease);\n}\n\nhtml[data-dsui] .dsui-theme-card:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n  border-color: var(--dsw-alias-border-l2);\n}\n\nhtml[data-dsui] .dsui-theme-card--active {\n  border-color: var(--dsw-alias-brand-primary);\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml[data-dsui] .dsui-theme-card:focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n  outline-offset: 2px;\n}\n\nhtml[data-dsui] .dsui-theme-card-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml[data-dsui] .dsui-theme-card-label {\n  line-height: 18px;\n}\n\nhtml[data-dsui] .dsui-theme-card-check {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background-color: var(--dsw-alias-brand-primary);\n  color: var(--dsw-alias-label-primary-foreground);\n}\n\n/* Language picker */\nhtml[data-dsui] .dsui-select {\n  box-sizing: border-box;\n  max-width: 220px;\n  height: 34px;\n  padding: 0 34px 0 14px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 999px;\n  outline: none;\n  background-color: var(--dsw-alias-bg-layer-2);\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");\n  background-repeat: no-repeat;\n  background-position: right 14px center;\n  background-size: 12px 12px;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 13px;\n  appearance: none;\n  cursor: pointer;\n}\n\nhtml[data-dsui] .dsui-select:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\n/* Shortcut rows */\nhtml[data-dsui] .dsui-key-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 24px;\n  min-height: 46px;\n  padding: 6px 12px;\n  border-radius: 10px;\n}\n\nhtml[data-dsui] .dsui-key-row:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml[data-dsui] .dsui-key-label {\n  min-width: 0;\n  overflow: hidden;\n  color: var(--dsw-alias-label-primary);\n  font-size: 14px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n\nhtml[data-dsui] .dsui-keys {\n  display: inline-flex;\n  flex-shrink: 0;\n  gap: 3px;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n}\n\n/* ---------- confirmation dialog ---------- */\n\nhtml[data-dsui] .dsui-confirm-layer {\n  position: fixed;\n  inset: 0;\n  z-index: 1100;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  pointer-events: auto;\n}\n\nhtml[data-dsui] .dsui-confirm-backdrop {\n  position: absolute;\n  inset: 0;\n  background-color: rgba(15, 17, 21, 0.34);\n  backdrop-filter: blur(2px);\n}\n\nhtml[data-dsui] body[data-ds-dark-theme] .dsui-confirm-backdrop {\n  background-color: rgba(0, 0, 0, 0.56);\n}\n\nhtml[data-dsui] .dsui-confirm {\n  position: relative;\n  box-sizing: border-box;\n  width: 380px;\n  max-width: calc(100vw - 48px);\n  padding: 20px 20px 16px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 16px;\n  background-color: var(--dsw-alias-bg-layer-3);\n  box-shadow: var(--dsw-shadow-lv3);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml[data-dsui] .dsui-confirm-title {\n  margin: 0 0 8px;\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 600;\n}\n\nhtml[data-dsui] .dsui-confirm-body {\n  margin: 0 0 16px;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 14px;\n  line-height: 22px;\n}\n\nhtml[data-dsui] .dsui-confirm-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n\nhtml[data-dsui] .dsui-confirm-button {\n  height: 32px;\n  padding: 0 14px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 999px;\n  background-color: var(--dsw-alias-button-elevated-fill);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 13px;\n  cursor: pointer;\n}\n\nhtml[data-dsui] .dsui-confirm-button:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml[data-dsui] .dsui-confirm-button--primary {\n  border-color: transparent;\n  background-color: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n}\n\nhtml[data-dsui] .dsui-confirm-button--danger {\n  border-color: transparent;\n  background-color: var(--dsw-alias-state-error-primary);\n  color: var(--dsw-alias-label-primary-foreground);\n}\n\nhtml[data-dsui] .dsui-confirm-button:focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n  outline-offset: 2px;\n}\n\n/* ---------- transient notices ---------- */\n\nhtml[data-dsui] .dsui-toasts {\n  position: fixed;\n  bottom: 24px;\n  left: 50%;\n  z-index: 1200;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  transform: translateX(-50%);\n  pointer-events: none;\n}\n\nhtml[data-dsui] .dsui-toast {\n  max-width: min(520px, calc(100vw - 48px));\n  padding: 10px 14px;\n  border-radius: 12px;\n  background-color: var(--dsw-alias-toast-bg);\n  color: var(--dsw-alias-label-primary-foreground);\n  font-size: 13px;\n  line-height: 20px;\n  box-shadow: var(--dsw-shadow-lv3);\n}\n\nhtml[data-dsui] .dsui-toast--error {\n  background-color: var(--dsw-alias-state-error-primary);\n}\n\n\n/* The preset tip reuses the confirmation dialog's card, title, body, and\n   buttons; only the two opt-out rows and their checkboxes are new. */\nhtml[data-dsui] .dsui-confirm--tip {\n  width: 400px;\n}\n\nhtml[data-dsui] .dsui-tip-options {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  margin: -2px 0 18px;\n}\n\nhtml[data-dsui] .dsui-tip-option {\n  display: inline-flex;\n  align-items: center;\n  gap: 9px;\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  line-height: 20px;\n  cursor: pointer;\n  user-select: none;\n}\n\nhtml[data-dsui] .dsui-tip-option input {\n  appearance: none;\n  -webkit-appearance: none;\n  display: inline-grid;\n  place-content: center;\n  width: 16px;\n  height: 16px;\n  margin: 0;\n  border: 1px solid var(--dsw-alias-border-l3);\n  border-radius: 5px;\n  background-color: var(--dsw-alias-bg-layer-1);\n  cursor: inherit;\n  transition: background-color 120ms ease, border-color 120ms ease;\n}\n\nhtml[data-dsui] .dsui-tip-option input::after {\n  content: '';\n  width: 8px;\n  height: 4px;\n  border-left: 1.5px solid var(--dsw-alias-label-primary-foreground);\n  border-bottom: 1.5px solid var(--dsw-alias-label-primary-foreground);\n  opacity: 0;\n  transform: translateY(-1px) rotate(-45deg);\n}\n\nhtml[data-dsui] .dsui-tip-option:hover input {\n  border-color: var(--dsw-alias-border-l4);\n}\n\nhtml[data-dsui] .dsui-tip-option input:checked {\n  border-color: var(--dsw-alias-brand-primary);\n  background-color: var(--dsw-alias-brand-primary);\n}\n\nhtml[data-dsui] .dsui-tip-option input:checked::after {\n  opacity: 1;\n}\n\nhtml[data-dsui] .dsui-tip-option input:focus-visible {\n  outline: 2px solid var(--dsw-alias-button-primary-fill);\n  outline-offset: 2px;\n}\n",
      /* chat.css */
"/* Conversation skin: the chat-demo message system over the host Chat flow.\n *\n * Scope: every rule starts with html[data-dsui], so disabling the plugin puts the\n * shipped conversation CSS back with no residue.\n *\n * Layout note: each host chat row is a `[data-chat-flow-kind]` element whose\n * children arrive through the `display: contents` slot anchor\n * `[data-slot=\"conversation.chat.node\"]`, which generates no box. Vertical\n * rhythm therefore rides padding on the renderer element inside a row, never a\n * margin on a wrapper box, and the\n * host's own inter-row gaps (which its fold/scroll animations transition) are\n * left alone. Rows are addressed from their kind attribute, not from the flow\n * outlet, because a folded process group re-parents its member rows into a\n * second `[data-chat-flow]` box of its own.\n *\n * Additive only: nothing here hides content, changes hit targets, or takes a\n * host element out of the pointer path.\n *\n * Host seams relied on (stable data attributes, never hashed module classes):\n *   [data-conversation-content]                   ConversationContent root; owns --dsh-chat-content-width\n *   [data-conversation-scroll]                    the conversation scrollport\n *   [data-chat-flow]                              Chat message column (also the process-group body)\n *   [data-step-process-content]                   process-group member box\n *   [data-slot=\"conversation.chat.flow\"]          flow outlet anchor (display: contents)\n *   [data-slot=\"conversation.chat.node\"]          per-row node outlet anchor\n *   [data-chat-flow-kind=\"...\"]                   row kind: user, steering, assistant-step,\n *                                                 tool-call, turn-tail, turn-process, question-reply\n *   [data-message-bubble]                         primitives UserMessageBubble surface\n *   [data-turn-tail]                              TurnTailNodeView root (finished-turn actions)\n *   [data-clock=\"start|end\"]                      MessageIconActions row\n *   [data-variant=\"think\"] / [data-expanded]      ReasoningRow root and open state\n *   [data-markdown-variant=\"compact\"]             compact reasoning markdown root\n *   [data-disclosure-header]                      DisclosureRow header (sticky inside an open row)\n *   [data-chat-call-id]                           ToolCallTree call row\n *   .md-code-block / [data-code-block-banner] / [data-code-block-content]\n *                                                 primitives code block (global, unhashed hook)\n */\n\n/* ---------- Measure, scrollport, selection ---------- */\n\n/* Demo message measure: the 840px list minus its 44px side padding (712/36\n   below 1024px — both published by this plugin's base.css). A width the user\n   dragged still wins. The host derives the composer cap from this variable, so\n   the card follows at measure + 32px, the demo's own 776/840 pair. */\n/* chat-demo MessageList: an 840px column with 44px side padding, so the text\n   measure is 752px. The host publishes the same axis as\n   `--dsh-chat-content-width` and derives the composer cap from it, so the card\n   follows at measure + 32px — exactly the demo's 840/776 pair. */\nhtml[data-dsui] [data-conversation-content] {\n  /* Px-only maths on purpose: a percentage here is re-resolved on every\n     scrollport resize, reflowing rows and disturbing the chat's anchors. */\n  --dsh-chat-content-width: clamp(680px, calc(var(--dsh-conversation-column-width, 0px) * 0.64), 752px);\n}\n\n@media (max-width: 1023px) {\n  html[data-dsui] [data-conversation-content] {\n    --dsh-chat-content-width: clamp(560px, calc(var(--dsh-conversation-column-width, 0px) * 0.64), 712px);\n  }\n}\n\n/* Scrollport: tint only. Its padding, gutter, and overflow stay the host's —\n   the transcript's virtualizer and follow engine measure that box, and any\n   extra inset feeds wrong numbers into their landing maths. */\nhtml[data-dsui] [data-conversation-scroll] {\n  scrollbar-color: var(--scroll-color) transparent;\n  scrollbar-width: thin;\n}\n\n/* Rows shrink instead of pushing the transcript sideways: wide tables and code\n   blocks scroll inside their own boxes. */\nhtml[data-dsui] :is([data-slot=\"conversation.chat.flow\"], [data-step-process-content]) > * {\n  min-width: 0;\n}\n\n/* Demo text selection: a translucent tint of the demo brand blue. */\nhtml[data-dsui] [data-chat-flow] ::selection {\n  background-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 24%, transparent);\n  color: inherit;\n}\n\n/* ---------- Message rhythm ---------- */\n\n/* The column's foot room stays the host's: the follow engine reserves the\n   composer's height there itself, and an extra padding makes its landing\n   maths overshoot. */\n\n/* A user message owns the demo's 16px tail (UserMessage .container\n   padding-bottom: 16px); the host already contributes an inter-row gap, so\n   only the remainder is added here. */\nhtml[data-dsui] :is([data-chat-flow-kind=\"user\"], [data-chat-flow-kind=\"steering\"]) > [data-slot=\"conversation.chat.node\"] > div {\n  padding-bottom: 8px;\n}\n\n/* A user message that follows an answer keeps that tighter rhythm (no extra\n   top space); only the transcript's first message opens with the demo's\n   .isFirst clearance of 34px above the bubble. */\nhtml[data-dsui] [data-slot=\"conversation.chat.flow\"] > [data-chat-flow-kind=\"user\"]:first-child > [data-slot=\"conversation.chat.node\"] > div {\n  padding-top: 22px;\n}\n\n/* ---------- User message bubble ---------- */\n\n/* The demo message stack takes at most 76% of the measure (and 0.702 of it on\n   the default column — the demo's own figma share). The `conversation.chat.user.content`\n   factory outlet renders no wrapper element, so the stack is the row element's\n   direct child that holds the bubble. */\n/* The bubble cap itself is the host's (0.702 of the measure, capped at 82% of\n   the row): re-capping it here collapses against a shrink-to-fit parent. */\n\n/* The right-aligned bubble, matching the DeepSeek app: 20px radius, 10/18\n   padding, the raised bubble fill and 16/24 type. */\nhtml[data-dsui] :is([data-chat-flow-kind=\"user\"], [data-chat-flow-kind=\"steering\"], [data-chat-flow-kind=\"question-reply\"]) [data-message-bubble] {\n  box-sizing: border-box;\n  padding: 10px 18px;\n  border-radius: 20px;\n  background-color: var(--dsw-specific-bubble);\n  color: var(--dsw-alias-label-primary);\n  font-size: 16px;\n  line-height: 24px;\n  white-space: pre-wrap;\n  word-break: break-word;\n}\n\n/* The standalone bubble — the only element of its row, with no attachment\n   strip above it — keeps the same right edge and cap. */\nhtml[data-dsui] [data-chat-flow] [data-message-bubble]:only-child {\n  margin-left: auto;\n}\n\n/* Demo's narrow-viewport cap. */\n/* User action row: circular secondary icons with the demo hover fill. */\nhtml[data-dsui] :is([data-chat-flow-kind=\"user\"], [data-chat-flow-kind=\"steering\"]) [data-clock=\"start\"] {\n  gap: 14px;\n}\n\nhtml[data-dsui] :is([data-chat-flow-kind=\"user\"], [data-chat-flow-kind=\"steering\"]) [data-clock=\"start\"] button {\n  border-radius: 50%;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n@media (hover: hover) {\n  html[data-dsui] :is([data-chat-flow-kind=\"user\"], [data-chat-flow-kind=\"steering\"]) [data-clock=\"start\"] button:hover {\n    background-color: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\n\n/* ---------- Assistant answer + finished-turn actions ---------- */\n\n/* Assistant body: no bubble, full measure, demo 16/28 markdown type in the\n   primary label colour, and the demo's 6px under the body. */\nhtml[data-dsui] [data-chat-flow-kind=\"assistant-step\"] > [data-slot=\"conversation.chat.node\"] > div {\n  padding-bottom: 4px;\n  color: var(--dsw-alias-label-primary);\n  font: var(--dsw-font-markdown-base);\n}\n\n/* Demo heading ladder (markdown.css); sizes come from the ported tokens. The\n   think overrides further down own reasoning headings at a higher weight. */\nhtml[data-dsui] [data-chat-flow-kind=\"assistant-step\"] :where(h1) {\n  margin: 32px 0 16px;\n  font: var(--dsw-font-markdown-h1);\n}\n\nhtml[data-dsui] [data-chat-flow-kind=\"assistant-step\"] :where(h2) {\n  margin: 32px 0 16px;\n  font: var(--dsw-font-markdown-h2);\n}\n\nhtml[data-dsui] [data-chat-flow-kind=\"assistant-step\"] :where(h3) {\n  margin: 32px 0 16px;\n  font: var(--dsw-font-markdown-h3);\n}\n\nhtml[data-dsui] [data-chat-flow-kind=\"assistant-step\"] :where(h4) {\n  margin: 16px 0;\n  font: var(--dsw-font-markdown-h4);\n}\n\nhtml[data-dsui] [data-chat-flow-kind=\"assistant-step\"] :where(h5, h6) {\n  margin: 16px 0;\n  font: var(--dsw-font-markdown-base-strong);\n}\n\n/* The finished-turn action row (demo AssistantMessage .bottom): small icon\n   buttons in the secondary colour over the demo hover fill. */\nhtml[data-dsui] [data-chat-flow-kind=\"turn-tail\"] > [data-slot=\"conversation.chat.node\"] > [data-turn-tail] {\n  gap: 4px;\n  padding-bottom: 16px;\n}\n\n/* The row's own flow gap (12px by default) is what pushed the action row down\n   the furthest; a finished turn needs only a hairline between body and actions.\n   Scoped deep enough to outrank the shipped `response + next` gap rule, which\n   re-declares the variable on this very row. */\nhtml[data-dsui] [data-chat-flow-kind=\"turn-tail\"] {\n  --dsh-chat-flow-gap: 4px !important;\n}\n\nhtml[data-dsui] [data-chat-flow-kind=\"turn-tail\"] [data-clock=\"end\"] {\n  gap: 14px;\n  margin-top: 0;\n  padding-top: 0;\n}\n\nhtml[data-dsui] [data-chat-flow-kind=\"turn-tail\"] [data-clock=\"end\"] button {\n  border-radius: 50%;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n@media (hover: hover) {\n  html[data-dsui] [data-chat-flow-kind=\"turn-tail\"] [data-clock=\"end\"] button:hover {\n    background-color: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\n\n/* Turn duration control: the demo's flat label treatment instead of a ruled\n   band. */\nhtml[data-dsui] [data-chat-flow-kind=\"turn-process\"] button {\n  border-bottom-color: var(--dsw-alias-border-l1);\n  color: var(--dsw-alias-label-secondary);\n}\n\n/* ---------- Reasoning (think) and tool-call cards ---------- */\n\n/* Think text reads the demo's small tier in the secondary label colour\n   (thinking.markdown.css). The collapsed row keeps the host's dense 24px\n   metric, so no padding is added there. */\nhtml[data-dsui] [data-chat-flow] [data-variant=\"think\"] {\n  color: var(--dsw-alias-label-secondary);\n  font: var(--dsw-font-markdown-small);\n}\n\nhtml[data-dsui] [data-chat-flow] [data-variant=\"think\"] [data-markdown-variant=\"compact\"] {\n  color: var(--dsw-alias-label-secondary);\n  font: var(--dsw-font-markdown-small);\n}\n\nhtml[data-dsui] [data-chat-flow] [data-variant=\"think\"] :where(h1, h2, h3, h4, h5, h6) {\n  margin: 12px 0;\n  font: var(--dsw-font-markdown-small-strong);\n}\n\nhtml[data-dsui] [data-chat-flow] [data-variant=\"think\"] :where(th) {\n  font: var(--dsw-font-markdown-small-strong);\n}\n\nhtml[data-dsui] [data-chat-flow] [data-variant=\"think\"] :where(td) {\n  font: var(--dsw-font-markdown-small);\n}\n\n/* Reasoning, the app's way: no card at all. The header is one flat line whose\n   glyph and title read in the brand colour, and the open body hangs off a\n   hairline rule with the small secondary tier. */\nhtml[data-dsui] [data-chat-flow] [data-variant=\"think\"][data-expanded] {\n  box-sizing: border-box;\n  padding: 0;\n  border: 0;\n  border-radius: 0;\n  background-color: transparent;\n}\n\nhtml[data-dsui] [data-chat-flow] [data-variant=\"think\"] [data-disclosure-header] {\n  background-color: transparent;\n}\n\n/* The disclosure glyph carries the brand tint; the label and its preview keep\n   the neutral tiers. The header is the first child of the open row's wrapper\n   and the body is whatever follows it — structural, hash-free hooks. */\nhtml[data-dsui] [data-chat-flow] [data-variant=\"think\"] [data-disclosure-row] > :first-child svg {\n  color: var(--dsw-alias-brand-text);\n}\n\nhtml[data-dsui] [data-chat-flow] [data-variant=\"think\"][data-expanded] [data-open] > :not([data-disclosure-header]) {\n  box-sizing: border-box;\n  margin: 2px 0 6px 3px;\n  padding: 2px 0 4px 16px;\n  border-left: 1px solid var(--dsw-alias-border-l2);\n  color: var(--dsw-alias-label-secondary);\n}\n\n/* One tool call at the top of its tree: flat demo card. Nested sub-calls keep\n   the host's indented column, so cards never nest inside themselves. */\n/* chat-demo's reply area draws its disclosure rows flat: a 34px title line in\n   the secondary label colour that turns primary on hover, no card, no border.\n   The tool card root is stripped back to that surface and the row's own hover\n   carries the affordance. */\nhtml[data-dsui] [data-chat-flow-kind=\"tool-call\"] > [data-slot=\"conversation.chat.node\"] > [data-chat-call-id] {\n  box-sizing: border-box;\n  padding: 0;\n  border: 0;\n  border-radius: 12px;\n  background-color: transparent;\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml[data-dsui] [data-chat-flow-kind=\"tool-call\"] > [data-slot=\"conversation.chat.node\"] > [data-chat-call-id]:hover {\n  color: var(--dsw-alias-label-primary);\n}\n\n/* Nested tool calls keep the host's indent rule; only its stroke lightens. */\nhtml[data-dsui] [data-chat-flow] [data-subcalls] {\n  border-left-color: var(--dsw-alias-border-l1);\n}\n\n/* ---------- Markdown body ---------- */\n\nhtml[data-dsui] [data-chat-flow] :where(pre) {\n  max-width: 100%;\n  overflow-x: auto;\n}\n\n/* Inline code (demo markdown.css): 6px radius, code font, markdown inline-code\n   fill. The host sheet pins `.875em !important`; the demo renders 13px, so this\n   size keeps !important and the heading rule below restores the inherited\n   size. */\nhtml[data-dsui] [data-chat-flow] :not(pre) > code {\n  padding: 0 5px;\n  border: 0.5px solid var(--dsw-alias-border-l1);\n  border-radius: 6px;\n  background-color: var(--dsw-alias-markdown-inline-code);\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--ds-font-family-code);\n  font-size: 13px !important;\n  line-height: 22px;\n}\n\n/* Code inside a heading keeps the heading's own size (host parity). */\nhtml[data-dsui] [data-chat-flow] :is(h1, h2, h3, h4, h5, h6) code {\n  font-size: inherit !important;\n  line-height: inherit;\n}\n\n/* Code block (demo .md-code-block): 12px radius, banner tint on the header,\n   block tint behind the code, code-block type on the body. The --dsl-* set is\n   the primitive's own theming contract, so the primitive keeps painting. */\nhtml[data-dsui] [data-chat-flow] .md-code-block {\n  --dsl-code-block-background: var(--dsw-alias-markdown-code-block);\n  --dsl-code-block-banner-background-color: var(--dsw-alias-markdown-code-block-banner);\n  --dsl-code-block-border-radius: 12px;\n  --dsl-code-block-banner-font: var(--dsw-font-xs-13);\n  --dsl-code-block-content-font: var(--dsw-font-markdown-code-block);\n  overflow: hidden;\n  border: 0.5px solid var(--dsw-alias-border-l1);\n  border-radius: 12px;\n  background-color: var(--dsw-alias-markdown-code-block);\n}\n\nhtml[data-dsui] [data-chat-flow] .md-code-block [data-code-block-banner] {\n  padding: 9px 14px;\n  background-color: var(--dsw-alias-markdown-code-block-banner);\n  color: var(--dsw-alias-label-secondary);\n  font: var(--dsw-font-xs-13);\n}\n\nhtml[data-dsui] [data-chat-flow] .md-code-block [data-code-block-content] pre {\n  max-width: 100%;\n  padding: 16px;\n  overflow-x: auto;\n  border-radius: 0 0 12px 12px;\n  background-color: var(--dsw-alias-markdown-code-block);\n  color: var(--dsw-alias-label-primary);\n  font: var(--dsw-font-markdown-code-block);\n}\n\n/* Tables (demo markdown.css): the table ladder over the demo border pair. */\nhtml[data-dsui] [data-chat-flow] :where(th) {\n  border-bottom: 1px solid var(--dsw-alias-border-l3);\n  font: var(--dsw-font-markdown-table-head);\n  text-align: start;\n}\n\nhtml[data-dsui] [data-chat-flow] :where(td) {\n  border-bottom: 1px solid var(--dsw-alias-border-l2);\n  font: var(--dsw-font-markdown-table);\n}\n\n/* Blockquote and rule. */\nhtml[data-dsui] [data-chat-flow] :where(blockquote) {\n  margin: 16px 0;\n  padding-left: 14px;\n  border-left: 2px solid var(--dsw-alias-label-caption);\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml[data-dsui] [data-chat-flow] :where(hr) {\n  height: 1px;\n  margin: 32px 0;\n  border: none;\n  background-color: var(--dsw-alias-border-l2);\n}\n\n/* Links use the demo brand text colour (demo markdown.css .ds-markdown a). */\nhtml[data-dsui] [data-chat-flow] :where(a) {\n  color: var(--dsw-alias-brand-text);\n  font-weight: 500;\n}\n\n@media (hover: hover) {\n  html[data-dsui] [data-chat-flow] a:hover {\n    text-decoration: underline;\n  }\n}\n",
      /* composer.css */
"/* Composer skin: chat-demo's input card over the host Conversation composer.\n *\n * Ported from chat-demo v0.1.3 `src/components/chatInput/ChatInput.module.css`\n * (MIT):\n *   .wrapper      24px radius, 1px hairline border, the raised input surface,\n *                 the demo's session shadow (dropped in dark)\n *   .textarea     16/24 draft type, 16px left inset, brand caret\n *   .toggle       34px pill chips, hairline border, transparent fill\n *   .sendButton   34px circle, brand fill, on-colour ink, 0.4 when disabled\n *   .attachment   64px chips, 16px radius\n *\n * Surface-only: control widths stay the host's, because the shipped tool row is\n * a measured wrapping flex row. Radii, borders, fills, and heights are skinned.\n *\n * Host seams (stable data attributes): `[data-composer-card]`, `[data-input-scroll]`,\n * `[data-phase]`, `[data-composer-placeholder]`, the composer bar slot anchor, and\n * the shipped controls' own ARIA markers (`button[aria-haspopup=\"listbox\"]` for the\n * add control, `button[aria-busy]` / `:has(> svg > rect)` for send and stop).\n */\n\n/* ---------- the card ---------- */\n\nhtml[data-dsui] [data-slot=\"conversation.composer.bar\"] [data-composer-card] {\n  border: 1px solid var(--dsw-alias-border-l2-darkmode-thin);\n  border-radius: 24px;\n  background: var(--dsw-specific-input-major);\n  box-shadow:\n    0 4px 10px rgba(0, 0, 0, 0.02),\n    0 2px 4px rgba(0, 0, 0, 0.04);\n}\n\nhtml[data-dsui] body[data-ds-dark-theme] [data-slot=\"conversation.composer.bar\"] [data-composer-card] {\n  box-shadow: none;\n}\n\n/* ---------- draft text ---------- */\n\nhtml[data-dsui] [data-slot=\"conversation.composer.bar\"] [data-composer-card] [data-phase] {\n  color: var(--dsw-alias-label-primary);\n  caret-color: var(--dsw-alias-brand-text);\n  font-size: 16px;\n  line-height: 24px;\n}\n\nhtml[data-dsui] [data-slot=\"conversation.composer.bar\"] [data-composer-card] [data-composer-placeholder] {\n  color: var(--dsw-alias-label-caption);\n  font-size: 16px;\n  line-height: 24px;\n}\n\nhtml[data-dsui] [data-slot=\"conversation.composer.bar\"] [data-composer-card] ::selection {\n  background-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 24%, transparent);\n  color: inherit;\n}\n\n/* ---------- tool row: demo pill chips ---------- */\n\n/* Mode / model chips read as the demo's 34px outlined pills. The measured row\n   keeps its own width maths; only the chip chrome changes. */\nhtml[data-dsui] [data-slot=\"conversation.composer.bar\"] [data-composer-card] select {\n  box-sizing: border-box;\n  height: 34px;\n  padding-left: 12px;\n  padding-right: 28px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 17px;\n  background-color: transparent;\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  line-height: 20px;\n  font-weight: 500;\n}\n\nhtml[data-dsui] [data-slot=\"conversation.composer.bar\"] [data-composer-card] select:hover:not(:disabled) {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\n/* No workspace selection: the blank-session hero's workspace chip is hidden.\n   The tag is placed by the runtime (duiTagWorkspaceChip) on the hero row's first\n   button, because the shipped chip's markup differs from the source packages and\n   carries no stable attribute of its own. */\nhtml[data-dsui] [data-dsui-workspace-chip] {\n  display: none !important;\n}\n\n/* Permission and plan controls: the app's 34px outlined toggle pills, the same\n   silhouette as its 深度思考 / 智能搜索 switches. */\nhtml[data-dsui] [data-composer-card] [data-slot=\"conversation.input.permission\"] button,\nhtml[data-dsui] [data-composer-card] [data-slot=\"conversation.input.plan\"] button {\n  box-sizing: border-box;\n  height: 34px;\n  padding: 0 14px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 17px;\n  background-color: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13px;\n  line-height: 20px;\n  font-weight: 500;\n}\n\nhtml[data-dsui] [data-composer-card] [data-slot=\"conversation.input.permission\"] button:hover,\nhtml[data-dsui] [data-composer-card] [data-slot=\"conversation.input.plan\"] button:hover {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\n/* Add control: the demo's circular attach button, transparent until hover. */\nhtml[data-dsui] [data-slot=\"conversation.composer.bar\"] [data-composer-card] button[aria-haspopup=\"listbox\"] {\n  width: 32px;\n  height: 32px;\n  padding: 0;\n  border: none;\n  border-radius: 50%;\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml[data-dsui] [data-slot=\"conversation.composer.bar\"] [data-composer-card] button[aria-haspopup=\"listbox\"]:hover:not(:disabled) {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\n/* Send / stop: the demo's 34px brand circle with on-colour ink. */\nhtml[data-dsui] [data-dsui-send] {\n  display: grid;\n  place-items: center;\n  border-radius: 50%;\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-static-neutral-bluish-00);\n}\n\nhtml[data-dsui] [data-dsui-send]:hover:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover);\n}\n\nhtml[data-dsui] [data-dsui-send]:disabled {\n  opacity: 0.4;\n}\n\n/* Model chip: the demo's pill silhouette. */\nhtml[data-dsui] [data-dsui-model] {\n  box-sizing: border-box;\n  height: 34px;\n  padding: 0 14px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 17px;\n  background-color: transparent;\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  line-height: 20px;\n}\n\nhtml[data-dsui] [data-dsui-model]:hover:not(:disabled) {\n  background-color: var(--dsw-alias-interactive-bg-hover);\n}\n\n/* ---------- attachment chips ---------- */\n\nhtml[data-dsui] [data-slot=\"conversation.input.attachments\"] :has(> img) {\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 16px;\n  background-color: var(--dsw-alias-bg-skeleton);\n}\n\nhtml[data-dsui] [data-slot=\"conversation.input.attachments\"] div[title] {\n  border-color: var(--dsw-alias-border-l2);\n  border-radius: 12px;\n  background-color: var(--dsw-alias-bg-layer-2);\n}\n\n/* The app's generation caveat sits under the composer readings as its own\n   full-width line: the dock wraps so the readings keep their row and the caveat\n   never squeezes between them. */\nhtml[data-dsui] [data-composer-dock] {\n  flex-wrap: wrap;\n  row-gap: 2px;\n}\n\nhtml[data-dsui] .dsui-caveat {\n  order: 99;\n  flex: 0 0 100%;\n  margin: 2px 0 0;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11px;\n  line-height: 16px;\n  letter-spacing: 0.02em;\n  text-align: center;\n  user-select: none;\n}\n",
    ].join('\n');
    const DUI_VERSION_CONST = "0.2.6";
    const DUI_LOCALES = {"en":{"meta":{"title":"DeepSeek UI","description":"Turns DeepSeek Harness into the DeepSeek app: official artwork and palette, a time-grouped sidebar, a system settings window with wallet balance and Usage/Top-up actions, the collapsed window-chrome pill, and a chat-demo conversation and composer. Sessions, panels, shortcuts, and account data stay on the shipped implementations.","detail":"docs/DETAIL.md"},"brand":{"fallback":"DeepSeek"},"sidebar":{"newSession":"New chat","newSessionLabel":"Start a new chat","collapse":"Collapse sidebar","expand":"Expand sidebar","settings":"Settings","sessions":"Chats","railLabel":"Navigation","openRail":"Open navigation","untitled":"Untitled chat","search":"Search chats","searchPlaceholder":"Search chats…","more":"More","rename":"Rename","renameLabel":"Chat name","pin":"Pin","unpin":"Unpin","archive":"Archive","unarchive":"Unarchive","delete":"Delete chat","empty":"No chats yet. Start one with New chat above.","groups":{"today":"Today","yesterday":"Yesterday","week":"Previous 7 days","month":"Previous 30 days","pinned":"Pinned","archived":"Archived"},"confirm":{"delete":{"title":"Delete chat","body":"The chat log and its derived data are removed permanently. This cannot be undone.","action":"Delete"},"archiveRunning":{"title":"Chat is running","body":"Archiving stops the work it is currently running."},"stopAndArchive":"Stop and archive"},"newChatTitle":"New chat","panels":"Panels"},"sheet":{"title":"Settings","close":"Close","features":"Features","preferences":"Preferences","more":"More","back":"Back","openHostSettings":"Open all settings","panels":"Panels","appearance":"Appearance","themeLight":"Light","themeDark":"Dark","themeSystem":"System","themeLabel":"Theme","shortcuts":"Keyboard shortcuts","about":{"name":"DeepSeek UI","version":"Version","tagline":"The chat-demo visual system on DeepSeek Harness","source":"Artwork and palette from chat-demo (MIT) and official DeepSeek Harness assets","restore":"Disable or uninstall this plugin to restore the shipped interface"},"aboutText":"DeepSeek UI · chat-demo visual system on DeepSeek Harness","modelLabel":"Model","modelHint":"Choose the model in the composer","emptyPanels":"No panels are registered","lede":"Everything you use day to day lives here.","shortcutsHint":"Configured in the full settings dialog","sections":{"demo":"DeepSeek UI","general":"General","panels":"Panels","shortcuts":"Shortcuts","data":"Data","terms":"Terms"},"general":{"themeHint":"Follow system uses the macOS light/dark switch","hostSettings":"All settings","hostSettingsHint":"Open every DeepSeek Harness settings page (models, plugins, subagents, …)","openAction":"Open"},"panelsHint":"Pick a row to open that panel. Panels registered by other plugins appear here automatically.","shortcutsEmpty":"No shortcuts are available","shortcutsHint2":"Edit the full list in the host settings","systemTitle":"System Settings","languageLabel":"Language","data":{"plugins":"Plugins","pluginsHint":"Install, enable, or remove plugins","hostSettings":"All settings","hostSettingsHint":"Host pages for models, account, subagents, and the rest","version":"Version"},"terms":{"mit":"This plugin is released under the MIT license","sources":"Artwork and palette from chat-demo (MIT) and official DeepSeek Harness assets","asIs":"Provided “as is”, without warranty of any kind"},"pane":{"demo":"Account balance and quick actions","general":"Theme, language, and version","panels":"Global panels registered by the host","shortcuts":"Keyboard shortcuts in effect","data":"Plugin and host settings entry points","terms":"License and provenance"},"account":{"balance":"Balance","bonus":"Bonus","usage":"Usage","topUp":"Top up","refresh":"Refresh balance","loading":"Loading…","failed":"Balance could not be read; use Usage to check on the platform","signedOut":"Not signed in to DeepSeek","signedOutHint":"Sign in to see the balance, usage, and top-up entry points here","openAccount":"Open account settings","signedIn":"Signed in"},"sectionLede":"DeepSeek UI's own appearance settings. Account balance, models, plugins, and the rest stay on the original Settings pages.","panelsTitle":"Entry points","shortcutsTitle":"Shortcuts"},"leading":{"openSidebar":"Open sidebar","newSession":"New chat","search":"Search chats"},"common":{"cancel":"Cancel"},"composerCaveat":"AI-generated content, please verify","settingsTitle":"DeepSeek UI","workspace":{"fixedLabel":"Fixed workspace","profileFallback":"The Documents folder was not available, so the fixed workspace is at"},"presetTip":{"title":"Want the official app experience?","body":"These modes work best with the Flash model and low thinking effort — that pairing feels closest to the official app. Both can be switched under the composer at any time.","today":"Don't show again today","never":"Don't show again","confirm":"Got it"}},"zh":{"meta":{"title":"DeepSeek UI","description":"把 DeepSeek Harness 换成 DeepSeek 应用的样子：官方图标与配色、时间分组侧栏、系统设置窗口（含账号余额、查询用量、充值）、收起侧栏后的顶部胶囊，以及 chat-demo 风格的会话区与输入框。会话、面板、快捷键与账号数据全部沿用宿主实现。","detail":"docs/DETAIL.md"},"brand":{"fallback":"DeepSeek"},"sidebar":{"newSession":"开启新对话","newSessionLabel":"开启新对话","collapse":"收起侧栏","expand":"展开侧栏","settings":"设置","sessions":"对话","railLabel":"导航","openRail":"打开导航","untitled":"未命名对话","search":"搜索会话","searchPlaceholder":"搜索会话…","more":"更多","rename":"重命名","renameLabel":"会话名称","pin":"置顶","unpin":"取消置顶","archive":"归档","unarchive":"取消归档","delete":"删除会话","empty":"还没有会话。点上面的「开启新对话」开始。","groups":{"today":"今天","yesterday":"昨天","week":"7 天内","month":"30 天内","pinned":"置顶","archived":"已归档"},"confirm":{"delete":{"title":"删除会话","body":"将彻底删除这条会话的日志与派生数据，无法恢复。","action":"删除"},"archiveRunning":{"title":"会话正在运行","body":"归档前会先停止它正在执行的工作。"},"stopAndArchive":"停止并归档"},"newChatTitle":"新对话","panels":"面板"},"sheet":{"title":"设置","close":"关闭","features":"功能入口","preferences":"偏好","more":"更多","back":"返回","openHostSettings":"打开完整设置","panels":"面板","appearance":"外观","themeLight":"浅色","themeDark":"深色","themeSystem":"跟随系统","themeLabel":"主题","shortcuts":"快捷键","about":{"name":"DeepSeek UI","version":"版本","tagline":"在 DeepSeek Harness 上套用 chat-demo 视觉系统","source":"图标与配色来自 chat-demo（MIT）与 DeepSeek Harness 官方素材","restore":"禁用或卸载本插件即可恢复原生侧栏"},"aboutText":"DeepSeek UI · 在 DeepSeek Harness 上套用 chat-demo 视觉系统","modelLabel":"模型","modelHint":"在输入框里选择模型","emptyPanels":"暂无已注册面板","lede":"日常要用的都收在这里。","shortcutsHint":"在完整设置中调整","sections":{"demo":"DeepSeek UI","general":"通用设置","panels":"面板","shortcuts":"快捷键","data":"数据管理","terms":"服务协议"},"general":{"themeHint":"跟随系统时由 macOS 的浅色/深色开关决定","hostSettings":"完整设置","hostSettingsHint":"打开 DeepSeek Harness 的全部设置页（模型、插件、子智能体等）","openAction":"打开"},"panelsHint":"点任意一行打开对应面板。第三方插件注册的面板会自动出现在这里。","shortcutsEmpty":"当前没有可用的快捷键","shortcutsHint2":"完整快捷键列表在宿主设置里编辑","systemTitle":"系统设置","languageLabel":"语言","data":{"plugins":"插件管理","pluginsHint":"安装、启用或卸载插件","hostSettings":"全部设置","hostSettingsHint":"模型、账号、子智能体等宿主设置页","version":"版本信息"},"terms":{"mit":"本插件以 MIT 许可证发布","sources":"图标与配色来自 chat-demo（MIT）与 DeepSeek Harness 官方素材","asIs":"按“现状”提供，不附带任何明示或暗示的担保"},"pane":{"demo":"账号余额与常用入口","general":"主题、语言与版本","panels":"宿主注册的全局面板","shortcuts":"当前生效的键盘快捷键","data":"插件与宿主设置入口","terms":"许可证与来源"},"account":{"balance":"余额","bonus":"赠送余额","usage":"查询用量","topUp":"充值","refresh":"刷新余额","loading":"读取中…","failed":"余额读取失败，可点「查询用量」到平台核对","signedOut":"未登录 DeepSeek 账号","signedOutHint":"登录后可以在这里看到余额、用量与充值入口","openAccount":"打开账号设置","signedIn":"已登录"},"sectionLede":"这些是 DeepSeek UI 自己的外观设置；账号余额、模型、插件等仍由原版设置页提供。","panelsTitle":"功能入口","shortcutsTitle":"快捷键"},"leading":{"openSidebar":"打开侧栏","newSession":"开启新对话","search":"搜索会话"},"common":{"cancel":"取消"},"composerCaveat":"内容由 AI 生成，请仔细甄别","settingsTitle":"DeepSeek UI","workspace":{"fixedLabel":"固定工作区","profileFallback":"用户文档目录不可用，固定工作区已改到"},"presetTip":{"title":"想获得官方 App 同款效果？","body":"这个模式建议搭配「Flash 模型」，并把思考强度设为「low」，回复速度与语气会更接近官方 App。可在输入框下方随时切换。","today":"今天不再提示","never":"今后不再提示","confirm":"我知道了"}}};

    const duiDictionaries = {};
    for (const id of Object.keys(DUI_LOCALES)) {
      duiDictionaries[id] = DUI_LOCALES[id];
    }

    // ---- src/compat.js ----
/**
 * Defensive helpers shared by every module of the client factory.
 *
 * The Client slot system is an evolution seam: a DSH upgrade may rename a slot,
 * move a service, or change a props shape. The shipped reference implementation
 * (`dsh-codex-ui`) learned the hard way that one failed registration must not
 * blank the page, so every mount point below goes through `duiGuard`, which
 * logs and degrades instead of throwing.
 */

/** Log prefix used by every diagnostic in this plugin. */
const DUI_LOG = '[dsh-deepseek-ui]';

/** Report a degraded feature without breaking the caller. */
function duiWarn(label, error) {
  try {
    console.warn(`${DUI_LOG} ${label}`, error);
  } catch {
    /* a console that throws is not worth a second failure */
  }
}

/** Run one feature setup; return its value, or undefined when it threw. */
function duiGuard(label, run) {
  try {
    return run();
  } catch (error) {
    duiWarn(`${label} unavailable`, error);
    return undefined;
  }
}

/** Join class names, dropping falsy entries (a tiny clsx). */
function duiCls(...names) {
  let out = '';
  for (const name of names) {
    if (typeof name !== 'string' || name === '') continue;
    out = out === '' ? name : `${out} ${name}`;
  }
  return out;
}

/** True when the document can be touched at all (node boot tests cannot). */
function duiHasDom() {
  return typeof document !== 'undefined' && document !== null && typeof window !== 'undefined';
}

/** Insert one owned `<style>` element; returns a disposer. */
function duiInjectStyle(id, css) {
  const existing = document.getElementById(id);
  if (existing !== null && existing.parentNode !== null) {
    existing.textContent = css;
    return () => {
      existing.remove();
    };
  }
  const element = document.createElement('style');
  element.id = id;
  element.setAttribute('data-plugin-css', 'dsh-deepseek-ui');
  element.textContent = css;
  document.head.appendChild(element);
  return () => {
    element.remove();
  };
}

/** Read `collapsed`-style boolean props without assuming the slot passes them. */
function duiBool(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

/** Tolerant slot mount: missing `slots.inject` or a refused registration only drops one feature. */
function duiMountSlot(ctx, key, register) {
  if (ctx === undefined || ctx === null) return undefined;
  const slots = ctx.slots;
  if (slots === undefined || slots === null || typeof slots.inject !== 'function') {
    duiWarn(`slot "${key}" not mounted`, new Error('ctx.slots.inject is missing'));
    return undefined;
  }
  return duiGuard(`slot "${key}"`, () => slots.inject(key, register));
}

/** Register one entry, tolerating a refused mount. */
function duiRegister(ctx, options, component) {
  const slots = ctx === undefined ? undefined : ctx.slots;
  if (slots === undefined || typeof slots.register !== 'function') {
    duiWarn(`registration "${options && options.name}" skipped`, new Error('ctx.slots.register is missing'));
    return undefined;
  }
  const dispose = duiGuard(`registration "${options && options.name}"`, () => slots.register(options, component));
  return typeof dispose === 'function' ? dispose : () => {};
}

/** Live entries of one slot, in registration shape, or an empty list. */
function duiSlotEntries(ctx, slotName) {
  const slots = ctx === undefined ? undefined : ctx.slots;
  if (slots === undefined || slots === null) return [];
  const read = duiGuard(`entries "${slotName}"`, () => {
    if (typeof slots.entries === 'function') return slots.entries(slotName);
    if (typeof slots.entriesOfSlot === 'function') return slots.entriesOfSlot(slotName);
    return [];
  });
  return Array.isArray(read) ? read : [];
}

/**
 * Resolve one host CSS Modules class by its semantic suffix.
 *
 * The shipped UI styles its components with CSS Modules: a production build
 * emits `._row_l4nv8_26` (semantic name + hash + line). The semantic part is
 * stable across builds, the hash is not, so a skin that needs to touch an
 * unlabelled host element looks the class up here instead of hard-coding a
 * hash. Everything reachable through the documented `data-slot` / `data-row-key`
 * seams is styled without this.
 */
function duiHostClass(semantic) {
  const pattern = new RegExp(`^_${semantic}_[A-Za-z0-9]{4,8}_\\d+$`);
  const sheets = typeof document === 'undefined' ? [] : Array.from(document.styleSheets);
  for (const sheet of sheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet: nothing to read
    }
    if (rules === undefined || rules === null) continue;
    for (const rule of rules) {
      const selector = rule.selectorText;
      if (typeof selector !== 'string' || !selector.startsWith('.')) continue;
      const [first] = selector.slice(1).split(/[.:\s>,[]/);
      if (pattern.test(first)) return first;
    }
  }
  return undefined;
}

/** A tuple of sheet-rule text, used by tests to prove the compat lookup is pure. */
function duiClassMatchesSemantic(className, semantic) {
  return new RegExp(`^_${semantic}_[A-Za-z0-9]{4,8}_\\d+$`).test(className);
}

/**
 * Open the shipped Settings dialog from the sidebar foot.
 *
 * The shipped `sidebar.settings` seat is occupied by the account launcher, not
 * by a settings button: its click opens an account menu whose first row is the
 * Settings entry that opens the dialog. This helper therefore drives that same
 * two-step path (click the launcher, then its Settings row) instead of
 * synthesising a keystroke the host's arbitration does not have to honour.
 *
 * @param seat - the hidden element holding the shipped `sidebar.settings` render.
 * @returns whether the first step found a launcher to press.
 */
function duiOpenHostSettings(seat, sectionLabel) {
  if (seat === null || seat === undefined) return false;
  const launcher = seat.querySelector('button, [role="button"]');
  if (launcher === null) return false;
  const launcherLabel = launcher.getAttribute('aria-label');
  try {
    launcher.click();
  } catch (error) {
    duiWarn('host settings launcher failed', error);
    return false;
  }
  const clickSettingsRow = () => {
    const menus = Array.from(document.querySelectorAll('[role="menu"]'));
    const menu = menus.length === 0 ? null : menus[menus.length - 1];
    if (menu === null) return false;
    const rows = Array.from(menu.querySelectorAll('[role="menuitem"], button, [role="button"]'));
    if (rows.length === 0) return false;
    const labelled = launcherLabel === null
      ? undefined
      : rows.find((row) => (row.getAttribute('aria-label') ?? row.textContent ?? '').includes(launcherLabel));
    const target = labelled === undefined ? rows[0] : labelled;
    try {
      target.click();
      return true;
    } catch (error) {
      duiWarn('host settings row failed', error);
      return false;
    }
  };
  // The menu renders in a portal on the next frame; one retry covers slow ones.
  requestAnimationFrame(() => {
    if (clickSettingsRow()) {
      duiSelectSettingsSection(sectionLabel);
      return;
    }
    setTimeout(() => {
      if (clickSettingsRow()) {
        duiSelectSettingsSection(sectionLabel);
        return;
      }
      duiDispatchSettingsChord();
    }, 120);
  });
  return true;
}

/**
 * Select one page of the shipped Settings window after it opens.
 *
 * The window's navigation is a plain button list; the label is the one this
 * plugin registered for its own section, so the match is exact in the active
 * language. Retried briefly because the panel portals in after the click.
 *
 * @param label - navigation label of the section to select, or empty for none.
 */
function duiSelectSettingsSection(label) {
  if (typeof label !== 'string' || label === '') return;
  const attempts = 12;
  let tried = 0;
  const pick = () => {
    tried += 1;
    const panel = document.querySelector('[data-shortcut-modal="settings"]');
    const nav = panel === null ? null : panel.querySelector('nav');
    if (nav !== null) {
      const rows = Array.from(nav.querySelectorAll('button'));
      const target = rows.find((row) => (row.textContent ?? '').includes(label));
      if (target !== undefined) {
        target.click();
        return;
      }
    }
    if (tried < attempts) setTimeout(pick, 60);
  };
  setTimeout(pick, 60);
}

/**
 * Last resort: dispatch the platform's "open preferences" chord.
 *
 * The shipped shell installs `settings.open` on the platform chord; a release
 * that stops rendering an account launcher may still answer this. Kept behind
 * the menu path because a synthetic keystroke depends on the host's keyboard
 * arbitration accepting untrusted events.
 */
function duiDispatchSettingsChord() {
  if (typeof KeyboardEvent !== 'function') return false;
  const platform = typeof navigator === 'undefined' ? '' : String(navigator.platform ?? '');
  const macLike = /mac/i.test(platform)
    || /darwin/i.test(document.documentElement.getAttribute('data-platform') ?? '');
  const init = {
    key: ',',
    code: 'Comma',
    keyCode: 188,
    which: 188,
    bubbles: true,
    cancelable: true,
    metaKey: macLike,
    ctrlKey: !macLike,
    shiftKey: false,
    altKey: false,
  };
  let dispatched = false;
  for (const target of [document, window]) {
    try {
      target.dispatchEvent(new KeyboardEvent('keydown', init));
      dispatched = true;
    } catch (error) {
      duiWarn('settings chord dispatch failed', error);
    }
  }
  return dispatched;
}

/**
 * Mark the composer's primary (send / stop) control and model chip.
 *
 * The shipped composer renders its primary control as a `<button>` that also
 * carries `aria-busy` in its resting state, and the model seat can render a
 * button with the same attribute, so attribute selectors alone would style the
 * model chip as a send circle. Tagging the LAST candidate in the tool row — the
 * primary control is always the last control of the trailing group — is exact.
 *
 * The marker is re-applied on DOM changes because React may recreate the nodes.
 */
function duiTagComposer() {
  if (!duiHasDom()) return;
  for (const card of document.querySelectorAll('[data-composer-card]')) {
    const row = card.lastElementChild;
    if (row === null || row === undefined) continue;
    const buttons = Array.from(row.querySelectorAll('button'));
    if (!row.querySelector('[data-dsui-send]')) {
      const candidates = buttons.filter((button) => button.getAttribute('aria-busy') !== null
        // The interrupted-turn primary renders a stop glyph instead.
        || button.querySelector(':scope > svg > rect') !== null);
      const primary = candidates.length === 0 ? undefined : candidates[candidates.length - 1];
      if (primary !== undefined) primary.setAttribute('data-dsui-send', '');
    }
    // The model chip is the wide control immediately before the trailing group.
    if (!row.querySelector('[data-dsui-model]')) {
      const modelSeat = card.ownerDocument.querySelector('[data-slot="conversation.input.model"]');
      const controls = modelSeat === null ? [] : Array.from(modelSeat.querySelectorAll('button, select'));
      const chip = controls.length === 0 ? undefined : controls[0];
      if (chip !== undefined) chip.setAttribute('data-dsui-model', '');
    }
  }
}

/** Copy the fixed-workspace chip carries; published by the plugin's apply. */
let duiWorkspaceChipCopy = { label: '', hint: '', title: '' };

/** Publish the chip copy and retag immediately. */
function duiSetWorkspaceChip(copy) {
  duiWorkspaceChipCopy = { label: copy.label ?? '', hint: copy.hint ?? '', title: copy.title ?? '' };
  duiTagWorkspaceChip();
}

/**
 * Neutralize the blank-session workspace control.
 *
 * This interface has no workspace picker: every new conversation runs in the one
 * fixed folder the Host publishes. The shipped hero still renders a chip that
 * opens a menu, so the chip is retagged as a static label — no menu affordance,
 * no chevron, no pointer target — and hidden entirely while it still shows the
 * host's "choose a workspace" placeholder.
 *
 * Located structurally: the composer card's accessory is the only `aria-haspopup`
 * button that is not inside the card's tool row (the card's last child).
 */
function duiTagWorkspaceChip() {
  if (!duiHasDom()) return;
  // Identified by its label text, not by markup: the chip reads the fixed
  // workspace's own title (or the shipped "choose a workspace" placeholder).
  // Text matching keeps the tagger away from header and message controls.
  const names = [duiWorkspaceChipCopy.title, '选择工作区', 'Choose workspace'].filter((name) => name !== '');
  let chip = null;
  if (names.length > 0) {
    for (const button of document.querySelectorAll('button')) {
      if (chip !== null) break;
      if (button.closest('[data-composer-card],[role="menu"],[role="listbox"]') !== null) continue;
      const text = (button.textContent ?? '').trim();
      if (names.includes(text)) chip = button;
    }
  }
  for (const stale of document.querySelectorAll('[data-dsui-workspace-chip]')) {
    if (stale === chip) continue;
    stale.removeAttribute('data-dsui-workspace-chip');
    const original = stale.getAttribute('data-dsui-workspace-orig-label');
    if (original === null) stale.removeAttribute('aria-label');
    else stale.setAttribute('aria-label', original);
    stale.removeAttribute('data-dsui-workspace-orig-label');
    stale.removeAttribute('data-dsui-workspace-orig-title');
    if (duiWorkspaceChipCopy.title !== '') stale.removeAttribute('title');
  }
  if (chip === null) return;
  if (chip.getAttribute('data-dsui-workspace-chip') === null) {
    chip.setAttribute('data-dsui-workspace-orig-label', chip.getAttribute('aria-label') ?? '');
    chip.setAttribute('data-dsui-workspace-orig-title', chip.getAttribute('title') ?? '');
  }
  chip.setAttribute('data-dsui-workspace-chip', 'fixed');
  if (duiWorkspaceChipCopy.label !== '') chip.setAttribute('aria-label', duiWorkspaceChipCopy.label);
  if (duiWorkspaceChipCopy.hint !== '') chip.setAttribute('title', duiWorkspaceChipCopy.hint);
}

/** The two DeepSeek-official presets the mode picker recommends, in order. */
const DUI_RECOMMENDED_PRESETS = ['官网-纯聊天', '官网-可干活'];

/**
 * Decorate the agent-preset menu: badge the two DeepSeek-official modes.
 *
 * The shipped picker builds its rows from the Host roster and offers no per-row
 * hook, so this walks the open menu's menuitems and adds a "推荐" pill beside the
 * two official preset names. Rows keep the Host roster order; only the badge is
 * presentation.
 */
function duiDecoratePresetMenu() {
  if (!duiHasDom()) return;
  for (const menu of document.querySelectorAll('[role="menu"]')) {
    const items = [...menu.querySelectorAll('button[role="menuitem"]')];
    if (items.length === 0) continue;
    for (const name of DUI_RECOMMENDED_PRESETS) {
      const item = items.find((button) => (button.textContent ?? '').includes(name));
      if (item === undefined || item.querySelector('[data-dsui-recommend]') !== null) continue;
      // The title span whose whole text is the preset name: appending inside it
      // keeps the tag on the title line, right after the name.
      const nameNode = [...item.querySelectorAll('span')]
        .find((node) => (node.textContent ?? '').trim() === name);
      if (nameNode === undefined) continue;
      const badge = document.createElement('span');
      badge.className = 'dsui-recommend';
      badge.setAttribute('data-dsui-recommend', '');
      badge.textContent = '推荐';
      nameNode.append(badge);
    }
  }
}

/** localStorage keys holding the preset-tip suppression choices. */
const DUI_TIP_NEVER_KEY = 'dsui-preset-tip-never';
const DUI_TIP_DAY_KEY = 'dsui-preset-tip-day';

/** Today as a local-calendar key (`YYYY-MM-DD`), matching the "today" choice. */
function duiTodayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Read one suppression value; storage failures read as "not chosen". */
function duiReadTipFlag(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

/** Write one suppression value; storage failures are ignored. */
function duiWriteTipFlag(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    /* private mode or a blocked storage partition: keep the tip unsuppressed */
  }
}

/**
 * Whether the preset tip is currently suppressed: the permanent choice wins,
 * and the daily choice expires with the local calendar day.
 * @returns whether the tip should stay hidden.
 */
function duiPresetTipSuppressed() {
  return duiReadTipFlag(DUI_TIP_NEVER_KEY) === '1'
    || duiReadTipFlag(DUI_TIP_DAY_KEY) === duiTodayKey();
}

/**
 * Persist the dialog's choices. The permanent choice wins when both are set.
 * @param choices - `{ today, never }` as checked in the dialog.
 */
function duiRememberPresetTip(choices) {
  if (choices.never) duiWriteTipFlag(DUI_TIP_NEVER_KEY, '1');
  if (choices.today) duiWriteTipFlag(DUI_TIP_DAY_KEY, duiTodayKey());
}

/**
 * Watch the conversation scroller and undo an unexpected jump toward older
 * turns while the reader is following the tail.
 *
 * While a turn streams, the shipped transcript re-anchors its window as rows
 * fold and expand; a re-anchor that lands far above the previous position
 * yanks the reader out of the running turn even though no gesture asked for it.
 * This guard remembers the last position, ignores anything the reader requested
 * (wheel, touch, keys, pointer), and re-pins to the tail when a single jump
 * moves more than half a viewport upward from a tail-following position.
 * @returns teardown for the effect.
 */
function duiWatchScrollGuard() {
  if (!duiHasDom()) return () => {};
  let scroller = null;
  let lastTop = 0;
  let userUntil = 0;
  let pinned = false;
  const markUser = () => {
    userUntil = performance.now() + 1800;
  };
  const findScroller = () => document.querySelector('[data-conversation-scroll]');
  const attach = () => {
    const next = findScroller();
    if (next === scroller) return;
    scroller = next;
    lastTop = scroller === null ? 0 : scroller.scrollTop;
  };
  const onScroll = (event) => {
    if (scroller === null || event.target !== scroller) return;
    const now = performance.now();
    const top = scroller.scrollTop;
    const floor = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const delta = top - lastTop;
    const wasFollowing = floor - lastTop <= 48;
    lastTop = top;
    if (pinned || now <= userUntil || !wasFollowing) return;
    const jumpLimit = Math.max(240, scroller.clientHeight * 0.5);
    if (delta >= -jumpLimit) return;
    pinned = true;
    requestAnimationFrame(() => {
      const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      if (Math.abs(scroller.scrollTop - max) > 1) scroller.scrollTop = max;
      lastTop = scroller.scrollTop;
      pinned = false;
    });
  };
  const onIntent = () => {
    markUser();
  };
  attach();
  const timer = setInterval(attach, 1000);
  document.addEventListener('scroll', onScroll, true);
  document.addEventListener('wheel', onIntent, { capture: true, passive: true });
  document.addEventListener('touchstart', onIntent, { capture: true, passive: true });
  document.addEventListener('pointerdown', onIntent, true);
  document.addEventListener('keydown', onIntent, true);
  return () => {
    clearInterval(timer);
    document.removeEventListener('scroll', onScroll, true);
    document.removeEventListener('wheel', onIntent, true);
    document.removeEventListener('touchstart', onIntent, true);
    document.removeEventListener('pointerdown', onIntent, true);
    document.removeEventListener('keydown', onIntent, true);
  };
}

/**
 * Watch profile menus: the picker renders into a body portal, so a childList
 * observer on the body (no subtree: streamed tokens never touch it) plus a slow
 * fallback sweep keep the decoration in place while a menu is open.
 */
function duiWatchMenus() {
  if (!duiHasDom()) return () => {};
  duiDecoratePresetMenu();
  const observer = new MutationObserver((records) => {
    if (records.every((record) => record.addedNodes.length === 0)) return;
    requestAnimationFrame(() => {
      duiDecoratePresetMenu();
    });
  });
  observer.observe(document.body, { childList: true });
  const timer = setInterval(duiDecoratePresetMenu, 1200);
  return () => {
    observer.disconnect();
    clearInterval(timer);
  };
}

/**
 * Keep the composer markers current.
 *
 * Deliberately NOT a MutationObserver: the transcript mutates on every streamed
 * token, and an observer would run this walk (and its requestAnimationFrame)
 * dozens of times a second, competing with the chat's own scroll settling. A
 * slow interval costs nothing and cannot interfere with streaming.
 */
function duiWatchComposer() {
  if (!duiHasDom()) return () => {};
  duiTagComposer();
  duiTagWorkspaceChip();
  const timer = setInterval(() => {
    duiTagComposer();
    duiTagWorkspaceChip();
  }, 1500);
  return () => {
    clearInterval(timer);
  };
}

/** Focus an element without drawing the focus ring, when the host helper is absent. */
function duiFocus(element) {
  if (element === undefined || element === null || typeof element.focus !== 'function') return;
  try {
    element.focus({ preventScroll: true });
  } catch {
    try {
      element.focus();
    } catch {
      /* an unfocusable node is not an error here */
    }
  }
}

/** Whether the reduced-motion preference asks for instant transitions. */
function duiPrefersReducedMotion() {
  if (typeof matchMedia !== 'function') return false;
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Whether the viewport is in the drawer range used by the frame (below 768px). */
function duiIsDrawerWidth() {
  if (typeof matchMedia !== 'function') return false;
  return matchMedia('(max-width: 767px)').matches;
}

    // ---- src/icons.js ----
/**
 * Icon artwork ported from chat-demo v0.1.3 (MIT), `src/components/base/icons.tsx`.
 * The SVG body is kept verbatim and mounted through `dangerouslySetInnerHTML`
 * so the stroke geometry stays byte-identical to the source artwork; only the
 * outer `<svg>` element is React-owned (size, colour, accessibility).
 */

/** chat-demo icon bodies keyed by their upstream component name. */
const DUI_ICON_ART = {
  IconEditOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M9.94076 1.34942C10.7047 0.90231 11.6503 0.902415 12.4143 1.34942C12.7061 1.52015 12.9688 1.79118 13.3104 2.13284C13.6521 2.47448 13.9231 2.73721 14.0939 3.02894C14.5408 3.79294 14.5409 4.73856 14.0939 5.50251C13.9231 5.79415 13.652 6.05704 13.3104 6.39861L6.65932 13.0497C6.28068 13.4284 6.00695 13.7108 5.66543 13.9097C5.32391 14.1085 4.94315 14.2074 4.42705 14.3498L3.24394 14.6761C2.77527 14.8054 2.34538 14.9262 2.00131 14.9684C1.65196 15.0112 1.17964 15.0013 0.810764 14.6325C0.441921 14.2637 0.432107 13.7913 0.47486 13.442C0.517035 13.0979 0.6379 12.668 0.767181 12.1993L1.09352 11.0162C1.23588 10.5001 1.33481 10.1193 1.5336 9.77784C1.7325 9.43632 2.0149 9.1626 2.39355 8.78395L9.04466 2.13284C9.38625 1.79126 9.64911 1.52016 9.94076 1.34942ZM15.5427 14.8398H7.55223L8.96707 13.425H15.5427V14.8398ZM3.39382 9.78422C2.965 10.213 2.84244 10.3436 2.75709 10.49C2.67183 10.6366 2.61862 10.8079 2.45733 11.3925L2.13099 12.5756C2.00183 13.0439 1.92194 13.3419 1.88863 13.5536C2.10041 13.5204 2.39872 13.4416 2.86764 13.3123L4.05075 12.9859C4.63544 12.8246 4.80669 12.7715 4.95323 12.6862C5.09968 12.6008 5.23022 12.4783 5.65905 12.0494L10.721 6.98644L8.45577 4.72121L3.39382 9.78422ZM11.7 2.57079C11.3774 2.38198 10.9777 2.38198 10.6551 2.57079C10.5602 2.62647 10.4487 2.72931 10.0449 3.13311L9.45604 3.72094L11.7213 5.98617L12.3102 5.39833C12.7139 4.99457 12.8168 4.88307 12.8725 4.78818C13.0613 4.46561 13.0612 4.06585 12.8725 3.74326C12.8169 3.64827 12.7146 3.53752 12.3102 3.13311C11.9057 2.72863 11.795 2.6264 11.7 2.57079Z\" fill=\"currentColor\" />" },
  IconTrashOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M14.4782 4.84067L14.2138 10.1152C14.1102 12.1872 14.067 13.0115 13.3866 13.9607C13.1044 14.3546 12.7498 14.6912 12.3424 14.9535C11.8239 15.2872 11.2415 15.4316 10.5585 15.4998C9.88727 15.5668 9.04946 15.5656 7.99998 15.5656C6.95051 15.5656 6.1127 15.5668 5.44142 15.4998C4.75851 15.4316 4.17602 15.2872 3.65753 14.9535C3.25012 14.6912 2.89559 14.3546 2.61332 13.9607C1.93296 13.0115 1.88979 12.1872 1.78619 10.1152L1.52179 4.84067L2.89006 4.77277L3.15343 10.0463C3.26221 12.2218 3.32452 12.6015 3.72646 13.1624C3.90825 13.4161 4.13686 13.6334 4.39927 13.8023C4.66204 13.9714 5.00263 14.0792 5.57825 14.1367C6.16562 14.1953 6.92298 14.1963 7.99998 14.1963C9.07699 14.1963 9.83434 14.1953 10.4217 14.1367C10.9973 14.0792 11.3379 13.9714 11.6007 13.8023C11.8631 13.6334 12.0917 13.4161 12.2735 13.1624C12.6755 12.6015 12.7378 12.2218 12.8465 10.0463L13.1099 4.77277L14.4782 4.84067ZM5.43011 6.22849H6.7994V11.3909H5.43011V6.22849ZM9.20056 6.22849H10.5699V11.3909H9.20056V6.22849ZM8.53597 0.434431C9.17976 0.434431 9.6522 0.426926 10.0966 0.571258C10.2357 0.616451 10.3717 0.672554 10.502 0.738948C10.9182 0.951107 11.2464 1.29099 11.7015 1.74612L12.4978 2.54136H15.3742V3.91169H0.625732V2.54136H3.50218L4.29845 1.74612C4.75358 1.29099 5.08174 0.951107 5.49801 0.738948C5.62831 0.672554 5.76425 0.616451 5.90334 0.571258C6.34776 0.426926 6.82021 0.434431 7.46399 0.434431H8.53597ZM7.46399 1.80476C6.73208 1.80476 6.51641 1.81187 6.32617 1.87369C6.25545 1.89667 6.18668 1.92533 6.12041 1.95907C5.96398 2.03878 5.82348 2.16253 5.44142 2.54136H10.5585C10.1765 2.16253 10.036 2.03878 9.87955 1.95907C9.81329 1.92533 9.74452 1.89667 9.6738 1.87369C9.48356 1.81187 9.26789 1.80476 8.53597 1.80476H7.46399Z\" fill=\"currentColor\" />" },
  IconPanelLeftOutline16: { viewBox: "0 0 16 16", html: "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M9.67272 0.522841C10.8339 0.522841 11.76 0.522714 12.4963 0.602493C13.2453 0.683657 13.8789 0.854248 14.4264 1.25197C14.7504 1.48739 15.0355 1.77247 15.2709 2.0965C15.6686 2.64394 15.8392 3.27758 15.9204 4.02655C16.0002 4.7629 16 5.68895 16 6.85014V9.14986C16 10.3111 16.0002 11.2371 15.9204 11.9735C15.8392 12.7224 15.6686 13.3561 15.2709 13.9035C15.0355 14.2275 14.7504 14.5126 14.4264 14.748C13.8789 15.1458 13.2453 15.3163 12.4963 15.3975C11.76 15.4773 10.8339 15.4772 9.67272 15.4772H6.3273C5.16611 15.4772 4.24006 15.4773 3.50371 15.3975C2.75474 15.3163 2.1211 15.1458 1.57366 14.748C1.24963 14.5126 0.964549 14.2275 0.729131 13.9035C0.331407 13.3561 0.160817 12.7224 0.0796529 11.9735C-0.000126137 11.2371 1.25338e-09 10.3111 1.25338e-09 9.14986V6.85014C1.25329e-09 5.68895 -0.000126137 4.7629 0.0796529 4.02655C0.160817 3.27758 0.331407 2.64394 0.729131 2.0965C0.964549 1.77247 1.24963 1.48739 1.57366 1.25197C2.1211 0.854248 2.75474 0.683657 3.50371 0.602493C4.24006 0.522714 5.16611 0.522841 6.3273 0.522841H9.67272ZM5.54303 1.88715V14.1118C5.78636 14.1128 6.04709 14.1169 6.3273 14.1169H9.67272C10.8639 14.1169 11.7032 14.1164 12.3493 14.0465C12.9824 13.9779 13.3497 13.8494 13.6268 13.6482C13.8354 13.4966 14.0195 13.3125 14.1711 13.1039C14.3723 12.8268 14.5007 12.4595 14.5693 11.8264C14.6393 11.1803 14.6398 10.341 14.6398 9.14986V6.85014C14.6398 5.65896 14.6393 4.81967 14.5693 4.1736C14.5007 3.54048 14.3723 3.17318 14.1711 2.89609C14.0195 2.68747 13.8354 2.50337 13.6268 2.35179C13.3497 2.1506 12.9824 2.02212 12.3493 1.95353C11.7032 1.88358 10.8639 1.88307 9.67272 1.88307H6.3273C6.04709 1.88307 5.78636 1.8862 5.54303 1.88715ZM4.1828 1.91166C3.99125 1.9216 3.8148 1.93577 3.65076 1.95353C3.01764 2.02212 2.65034 2.1506 2.37325 2.35179C2.16463 2.50337 1.98052 2.68747 1.82895 2.89609C1.62776 3.17318 1.49928 3.54048 1.43069 4.1736C1.36074 4.81967 1.36023 5.65896 1.36023 6.85014V9.14986C1.36023 10.341 1.36074 11.1803 1.43069 11.8264C1.49928 12.4595 1.62776 12.8268 1.82895 13.1039C1.98052 13.3125 2.16463 13.4966 2.37325 13.6482C2.65034 13.8494 3.01764 13.9779 3.65076 14.0465C3.81478 14.0642 3.99127 14.0774 4.1828 14.0873V1.91166Z\" fill=\"currentColor\" />" },
  IconSettingsOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M14.0861 5.51366C13.8717 5.0575 13.588 4.58542 13.2889 4.18108C13.208 4.07172 13.1596 4.04373 13.0243 4.03054C12.4277 3.97255 11.8245 4.05527 11.2269 3.9972C10.7224 3.94816 10.3133 3.71661 10.0115 3.30919C9.66986 2.84777 9.43973 2.31343 9.09824 1.85234C9.01771 1.74365 8.96805 1.71589 8.83354 1.70282C8.29432 1.65044 7.70402 1.65061 7.16656 1.70282C7.03205 1.71589 6.98239 1.74365 6.90186 1.85234C6.56067 2.31303 6.33025 2.84774 5.98855 3.30919C5.68681 3.71661 5.27774 3.94816 4.77317 3.9972C4.17564 4.05527 3.57239 3.97255 2.97585 4.03054C2.84046 4.04373 2.79208 4.07172 2.71115 4.18108C2.41212 4.58542 2.12835 5.0575 1.91403 5.51366C1.85299 5.64359 1.85286 5.7018 1.91403 5.8319C2.14865 6.33077 2.49748 6.76892 2.73237 7.26854C2.9594 7.7515 2.96041 8.24717 2.73338 8.73044C2.49837 9.23061 2.14891 9.66837 1.91403 10.1681C1.85291 10.2982 1.85299 10.3564 1.91403 10.4863C2.12856 10.9429 2.41185 11.4142 2.71115 11.8189C2.79208 11.9283 2.84046 11.9563 2.97585 11.9694C3.57239 12.0274 4.17564 11.9447 4.77317 12.0028C5.27774 12.0518 5.68681 12.2834 5.98855 12.6908C6.33024 13.1522 6.56037 13.6866 6.90186 14.1476C6.98239 14.2563 7.03205 14.2841 7.16656 14.2972C7.70402 14.3494 8.29432 14.3495 8.83354 14.2972C8.96805 14.2841 9.01771 14.2563 9.09824 14.1476C9.43944 13.687 9.66985 13.1522 10.0115 12.6908C10.3133 12.2834 10.7224 12.0518 11.2269 12.0028C11.8244 11.9447 12.4271 12.0275 13.0243 11.9694C13.1596 11.9563 13.208 11.9283 13.2889 11.8189C13.5891 11.4131 13.872 10.942 14.0861 10.4863C14.1471 10.3564 14.1472 10.2982 14.0861 10.1681C13.8513 9.66861 13.5017 9.23061 13.2667 8.73044C13.0397 8.24717 13.0407 7.7515 13.2677 7.26854C13.5026 6.7689 13.8513 6.33106 14.0861 5.8319C14.1472 5.7018 14.1471 5.64359 14.0861 5.51366ZM15.3035 6.40373C15.0685 6.90359 14.7188 7.34119 14.4841 7.84037C14.4231 7.97025 14.423 8.02855 14.4841 8.15861C14.7189 8.65833 15.0685 9.09611 15.3035 9.59626C15.5308 10.0801 15.5308 10.5744 15.3035 11.0582C15.052 11.5933 14.7225 12.1426 14.37 12.6191C14.0685 13.0265 13.6581 13.259 13.1536 13.3081C12.5566 13.366 11.9541 13.2835 11.3573 13.3414C11.2228 13.3545 11.1731 13.3823 11.0926 13.491C10.7511 13.9521 10.521 14.4864 10.1793 14.9478C9.87828 15.3542 9.46719 15.5869 8.96387 15.6358C8.34008 15.6964 7.66194 15.6966 7.03623 15.6358C6.53291 15.5869 6.12182 15.3542 5.82084 14.9478C5.47911 14.4863 5.24878 13.9517 4.90753 13.491C4.82701 13.3823 4.77734 13.3545 4.64284 13.3414C4.04647 13.2835 3.44373 13.366 2.84653 13.3081C2.34201 13.259 1.93164 13.0265 1.63013 12.6191C1.27867 12.144 0.948453 11.5941 0.696621 11.0582C0.469315 10.5744 0.469279 10.0801 0.696621 9.59626C0.931628 9.09613 1.2813 8.65807 1.51597 8.15861C1.57708 8.02855 1.57702 7.97025 1.51597 7.84037C1.28117 7.34095 0.931635 6.9036 0.696621 6.40373C0.469213 5.91992 0.469367 5.42562 0.696621 4.94183C0.948441 4.40587 1.27868 3.85598 1.63013 3.38092C1.93164 2.97349 2.34201 2.74095 2.84653 2.6919C3.44353 2.63397 4.04599 2.71649 4.64284 2.65856C4.77734 2.64549 4.82701 2.61774 4.90753 2.50904C5.24905 2.04792 5.47913 1.51362 5.82084 1.05219C6.12182 0.645806 6.53291 0.413119 7.03623 0.364178C7.66002 0.303556 8.33816 0.303369 8.96387 0.364178C9.46719 0.413119 9.87828 0.645806 10.1793 1.05219C10.521 1.51365 10.7513 2.04828 11.0926 2.50904C11.1731 2.61774 11.2228 2.64549 11.3573 2.65856C11.9541 2.71649 12.5566 2.63397 13.1536 2.6919C13.6581 2.74095 14.0685 2.97349 14.37 3.38092C14.7214 3.85598 15.0517 4.40587 15.3035 4.94183C15.5307 5.42562 15.5309 5.91992 15.3035 6.40373Z\" fill=\"currentColor\" /> <path d=\"M9.13764 7.99999C9.13764 7.3715 8.62855 6.8624 8.00005 6.8624C7.37155 6.8624 6.86246 7.3715 6.86246 7.99999C6.86246 8.62849 7.37155 9.13759 8.00005 9.13759C8.62855 9.13759 9.13764 8.62849 9.13764 7.99999ZM10.4834 7.99999C10.4834 9.37126 9.37132 10.4833 8.00005 10.4833C6.62878 10.4833 5.51674 9.37126 5.51674 7.99999C5.51674 6.62873 6.62878 5.51669 8.00005 5.51669C9.37132 5.51669 10.4834 6.62873 10.4834 7.99999Z\" fill=\"currentColor\" />" },
  NewChatIcon: { viewBox: "0 0 16 16", html: "<path d=\"M8 0.599609C3.91309 0.599609 0.599609 3.91309 0.599609 8C0.599609 9.13376 0.855461 10.2098 1.3125 11.1719L1.5918 11.7588L2.76562 11.2012L2.48633 10.6143C2.11034 9.82278 1.90039 8.93675 1.90039 8C1.90039 4.63106 4.63106 1.90039 8 1.90039C11.3689 1.90039 14.0996 4.63106 14.0996 8C14.0996 11.3689 11.3689 14.0996 8 14.0996C7.31041 14.0996 6.80528 14.0514 6.35742 13.9277C5.91623 13.8059 5.49768 13.6021 4.99707 13.2529C4.26492 12.7422 3.21611 12.5616 2.35156 13.1074L2.33789 13.1162L2.32422 13.126L1.58789 13.6436L2.01953 14.9297L3.0459 14.207C3.36351 14.0065 3.83838 14.0294 4.25293 14.3184C4.84547 14.7317 5.39743 15.011 6.01172 15.1807C6.61947 15.3485 7.25549 15.4004 8 15.4004C12.0869 15.4004 15.4004 12.0869 15.4004 8C15.4004 3.91309 12.0869 0.599609 8 0.599609ZM7.34473 4.93945V7.34961H4.93945V8.65039H7.34473V11.0605H8.64551V8.65039H11.0605V7.34961H8.64551V4.93945H7.34473Z\" fill=\"currentColor\" />" },
  IconChevronRightOutline14: { viewBox: "0 0 14 14", html: "<path d=\"M5.5 2.15137L5.92383 2.57617L8.65137 5.30273C8.90706 5.55843 9.13382 5.78438 9.29785 5.98828C9.46883 6.20088 9.61756 6.44405 9.66602 6.75C9.69222 6.91565 9.69222 7.08435 9.66602 7.25C9.61756 7.55595 9.46883 7.79912 9.29785 8.01172C9.13382 8.21561 8.90706 8.44157 8.65137 8.69727L5.92383 11.4238L5.5 11.8486L4.65137 11L5.07617 10.5762L7.80273 7.84863C8.07732 7.57405 8.24849 7.40124 8.3623 7.25977C8.46904 7.12709 8.47813 7.07728 8.48047 7.0625C8.48703 7.02105 8.48703 6.97895 8.48047 6.9375C8.47813 6.92272 8.46904 6.87291 8.3623 6.74023C8.24848 6.59876 8.07732 6.42595 7.80273 6.15137L5.07617 3.42383L4.65137 3L5.5 2.15137Z\" fill=\"currentColor\" />" },
  IconChevronDownOutline14: { viewBox: "0 0 14 14", html: "<path d=\"M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z\" fill=\"currentColor\" />" },
  IconCloseOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M14.1168 13.197L13.197 14.1167L1.8833 2.80303L2.80309 1.88324L14.1168 13.197Z\" fill=\"currentColor\" /> <path d=\"M13.197 1.88326L14.1168 2.80305L2.80309 14.1168L1.8833 13.197L13.197 1.88326Z\" fill=\"currentColor\" />" },
  IconEllipsisOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M4.55146 8.00001C4.55146 8.63513 4.03659 9.15001 3.40146 9.15001C2.76634 9.15001 2.25146 8.63513 2.25146 8.00001C2.25146 7.36488 2.76634 6.85001 3.40146 6.85001C4.03659 6.85001 4.55146 7.36488 4.55146 8.00001Z\" fill=\"currentColor\" /> <path d=\"M9.1476 8.00001C9.1476 8.63513 8.63273 9.15001 7.9976 9.15001C7.36248 9.15001 6.8476 8.63513 6.8476 8.00001C6.8476 7.36488 7.36248 6.85001 7.9976 6.85001C8.63273 6.85001 9.1476 7.36488 9.1476 8.00001Z\" fill=\"currentColor\" /> <path d=\"M13.7486 8.00001C13.7486 8.63513 13.2338 9.15001 12.5986 9.15001C11.9635 9.15001 11.4486 8.63513 11.4486 8.00001C11.4486 7.36488 11.9635 6.85001 12.5986 6.85001C13.2338 6.85001 13.7486 7.36488 13.7486 8.00001Z\" fill=\"currentColor\" />" },
  IconCheckOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M15.0498 3.92579L8.49512 12.3818C8.25774 12.6881 8.04517 12.9645 7.84668 13.1689C7.63957 13.3823 7.38732 13.5841 7.04492 13.6719C6.86373 13.7183 6.6757 13.7346 6.48926 13.7197C6.13666 13.6915 5.8528 13.5355 5.6123 13.3604C5.38201 13.1926 5.12573 12.9567 4.83984 12.6953L1.03125 9.21289L1.96875 8.1875L5.77734 11.6699C6.08684 11.9529 6.27773 12.1249 6.43066 12.2363C6.50183 12.2882 6.54699 12.3135 6.57324 12.3252C6.58525 12.3305 6.59269 12.3322 6.5957 12.333C6.59802 12.3336 6.59961 12.334 6.59961 12.334C6.63317 12.3367 6.66758 12.3335 6.7002 12.3252C6.7002 12.3252 6.70211 12.3251 6.7041 12.3242C6.70698 12.3229 6.71348 12.319 6.72461 12.3115C6.74849 12.2956 6.78843 12.2642 6.84961 12.2012C6.98138 12.0654 7.13957 11.8628 7.39648 11.5313L13.9502 3.07422L15.0498 3.92579Z\" fill=\"currentColor\" />" },
  IconLightOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M11.3496 8C11.3496 6.14985 9.85015 4.65039 8 4.65039C6.14985 4.65039 4.65039 6.14985 4.65039 8C4.65039 9.85015 6.14985 11.3496 8 11.3496C9.85015 11.3496 11.3496 9.85015 11.3496 8ZM12.6504 8C12.6504 10.5681 10.5681 12.6504 8 12.6504C5.43188 12.6504 3.34961 10.5681 3.34961 8C3.34961 5.43188 5.43188 3.34961 8 3.34961C10.5681 3.34961 12.6504 5.43188 12.6504 8Z\" fill=\"currentColor\" /> <path d=\"M8.65039 0.5V2.5H7.34961V0.5H8.65039Z\" fill=\"currentColor\" /> <path d=\"M8.65039 13.5V15.5H7.34961V13.5H8.65039Z\" fill=\"currentColor\" /> <path d=\"M3.15808 2.24035L4.57229 3.65456L3.6525 4.57435L2.23829 3.16014L3.15808 2.24035Z\" fill=\"currentColor\" /> <path d=\"M12.3505 11.4327L13.7647 12.8469L12.8449 13.7667L11.4307 12.3525L12.3505 11.4327Z\" fill=\"currentColor\" /> <path d=\"M2.24537 12.8469L3.65958 11.4327L4.57937 12.3525L3.16516 13.7667L2.24537 12.8469Z\" fill=\"currentColor\" /> <path d=\"M11.4377 3.65455L12.852 2.24033L13.7718 3.16012L12.3575 4.57434L11.4377 3.65455Z\" fill=\"currentColor\" /> <path d=\"M0.5 7.35461H2.5V8.6554H0.5L0.5 7.35461Z\" fill=\"currentColor\" /> <path d=\"M13.5 7.35461H15.5V8.6554H13.5V7.35461Z\" fill=\"currentColor\" />" },
  IconDarkOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M13.2764 9.52324C12.5607 9.97754 11.7177 10.242 10.7812 10.242C8.11386 10.2419 5.95042 8.07997 5.9502 5.41289C5.9502 4.48128 6.21453 3.61071 6.67188 2.87285C4.30332 3.4658 2.54992 5.60845 2.5498 8.16093C2.5498 11.1712 4.99103 13.6102 8 13.6102C10.5383 13.6102 12.6709 11.8724 13.2764 9.52324ZM7.05078 5.41289C7.051 7.47224 8.72116 9.1423 10.7812 9.14238C11.9248 9.14238 12.887 8.63397 13.5781 7.8084C13.7266 7.63106 13.9701 7.56547 14.1875 7.64433C14.4049 7.72329 14.5497 7.9297 14.5498 8.16093C14.5498 11.7766 11.6161 14.7098 8 14.7098C4.38402 14.7098 1.4502 11.7792 1.4502 8.16093C1.45033 4.54322 4.3812 1.61015 8 1.61015C8.23027 1.61015 8.43585 1.75352 8.51562 1.96953C8.59536 2.18554 8.53241 2.42829 8.35742 2.57793C7.55573 3.26311 7.05078 4.27876 7.05078 5.41289Z\" fill=\"currentColor\" />" },
  IconFollowsystemOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M12.4827 13.9839V15.2741H3.33758V13.9839H12.4827Z\" fill=\"currentColor\" /> <path d=\"M13.8586 6.9289C13.8586 5.878 13.8584 5.14055 13.7976 4.57328C13.7381 4.01805 13.6272 3.7012 13.4572 3.46376C13.3198 3.27189 13.1511 3.10413 12.9592 2.96679C12.7217 2.79691 12.4049 2.68587 11.8497 2.62637C11.2824 2.5656 10.545 2.56438 9.49404 2.56438H6.50486C5.45396 2.56438 4.71651 2.56558 4.14923 2.62637C3.59403 2.6859 3.27715 2.79683 3.03972 2.96679C2.84797 3.10407 2.68003 3.27201 2.54274 3.46376C2.37279 3.70119 2.26186 4.01807 2.20232 4.57328C2.14154 5.14055 2.14033 5.878 2.14033 6.9289C2.14033 7.97984 2.14156 8.71721 2.20232 9.28452C2.26183 9.83981 2.37285 10.1566 2.54274 10.394C2.68009 10.5859 2.84784 10.7547 3.03972 10.8921C3.27715 11.062 3.59401 11.1729 4.14923 11.2325C4.71651 11.2933 5.45396 11.2934 6.50486 11.2934H9.49404C10.5449 11.2934 11.2824 11.2932 11.8497 11.2325C12.4048 11.173 12.7217 11.0619 12.9592 10.8921C13.1511 10.7547 13.3198 10.5859 13.4572 10.394C13.627 10.1566 13.7381 9.83971 13.7976 9.28452C13.8584 8.71722 13.8586 7.97982 13.8586 6.9289ZM15.1498 6.9289C15.1498 7.95152 15.1504 8.77008 15.0805 9.42216C15.0094 10.0861 14.8595 10.6536 14.5068 11.1463C14.2871 11.4532 14.0184 11.722 13.7115 11.9417C13.2188 12.2944 12.6512 12.4442 11.9873 12.5154C11.3352 12.5852 10.5166 12.5847 9.49404 12.5847H6.50486C5.48257 12.5847 4.6646 12.5852 4.01265 12.5154C3.34871 12.4442 2.78118 12.2944 2.28848 11.9417C1.98155 11.722 1.71285 11.4532 1.49312 11.1463C1.14044 10.6536 0.989539 10.0861 0.918395 9.42216C0.848541 8.77009 0.850101 7.95148 0.850101 6.9289C0.8501 5.90665 0.848582 5.08862 0.918395 4.43669C0.989539 3.77275 1.14044 3.20522 1.49312 2.71252C1.71285 2.40559 1.98155 2.13689 2.28848 1.91716C2.78118 1.56449 3.34871 1.41358 4.01265 1.34244C4.66458 1.27262 5.48261 1.27414 6.50486 1.27414H9.49404C10.5166 1.27414 11.3352 1.27259 11.9873 1.34244C12.6512 1.41358 13.2188 1.56449 13.7115 1.91716C14.0184 2.13689 14.2871 2.40559 14.5068 2.71252C14.8595 3.20522 15.0094 3.77275 15.0805 4.43669C15.1503 5.08864 15.1498 5.90661 15.1498 6.9289Z\" fill=\"currentColor\" />" },
  IconSearchOutline16: { viewBox: "0 0 16 16", html: "<path d=\"M11.748 6.7028C11.748 3.90104 9.47653 1.62976 6.6748 1.62956C3.87291 1.62956 1.60156 3.90091 1.60156 6.7028C1.60176 9.50453 3.87304 11.776 6.6748 11.776C9.47641 11.7759 11.7479 9.50441 11.748 6.7028ZM13.0479 6.7028C13.0477 10.2224 10.1944 13.0757 6.6748 13.0759C3.15507 13.0759 0.300977 10.2225 0.300781 6.7028C0.300781 3.18294 3.15494 0.328781 6.6748 0.328781C10.1945 0.328977 13.0479 3.18307 13.0479 6.7028Z\" fill=\"currentColor\" /> <path d=\"M15.6991 14.7513L14.7792 15.6712L11.3974 12.2894L12.3173 11.3694L15.6991 14.7513Z\" fill=\"currentColor\" />" },
  IconMenuOutline20: { viewBox: "0 0 20 20", html: "<path d=\"M17.2027 4.90034V6.43655H2.79724V4.90034H17.2027Z\" fill=\"currentColor\" /> <path d=\"M10.9603 13.0634V14.5996H2.79724V13.0634H10.9603Z\" fill=\"currentColor\" />" },
};

/**
 * Render one ported icon.
 * @param props - `name` (upstream key), `size` (square edge, default 16), and
 *   optional `className`, `style`, and accessible label.
 */
function DuiIcon(props) {
  const settings = props === undefined || props === null ? {} : props;
  const name = settings.name;
  const art = DUI_ICON_ART[name] ?? (typeof name === 'string' ? DUI_ICON_ART[`Icon${name}`] : undefined);
  if (art === undefined) return null;
  const size = typeof settings.size === 'number' ? settings.size : 16;
  const label = typeof settings.label === 'string' ? settings.label : undefined;
  return h('svg', {
    width: size,
    height: size,
    viewBox: art.viewBox,
    fill: 'none',
    className: settings.className,
    style: settings.style,
    'aria-hidden': label === undefined ? true : undefined,
    role: label === undefined ? undefined : 'img',
    'aria-label': label,
    focusable: 'false',
    dangerouslySetInnerHTML: { __html: art.html },
  });
}

/** The demo's collapsed-rail hint: two 16px glyphs in one 40px pill. */
function DuiSpinner(props) {
  const size = props !== undefined && typeof props.size === 'number' ? props.size : 16;
  return h('span', {
    className: 'dsui-spinner',
    style: { width: size, height: size },
    'aria-hidden': true,
  });
}

    // ---- src/store.js ----
/**
 * Page-level view state shared between the sidebar shell and the settings
 * surfaces.
 *
 * Slot components never receive `ctx`, and the surfaces are rendered in
 * different seats (the sidebar column, `shell.overlay`), so the few pieces of
 * state they share live in this tiny observable. It is module state of the
 * single client factory: one instance per page, dropped with the plugin.
 */

/** One minimal externally-subscribable value. */
function duiCreateStore(initial) {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set(next) {
      if (Object.is(value, next)) return;
      value = next;
      for (const listener of [...listeners]) {
        try {
          listener();
        } catch (error) {
          duiWarn('store listener failed', error);
        }
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * Host-settings hand-off.
 *
 * The sidebar's Settings entry opens the shipped Settings window; entries that
 * light up one of its pages pass that page's navigation label so the hand-off can
 * select it after the window mounts.
 */
const duiHostSettingsRequests = duiCreateStore({ seq: 0, section: '' });

/** Ask the sidebar to open the host Settings window, optionally on one section. */
function duiRequestHostSettings(section = '') {
  const current = duiHostSettingsRequests.get();
  duiHostSettingsRequests.set({ seq: current.seq + 1, section });
}

/** React hook over the hand-off request. */
function duiUseHostSettingsRequests() {
  return useSyncExternalStore(
    (onChange) => duiHostSettingsRequests.subscribe(onChange),
    () => duiHostSettingsRequests.get(),
    () => ({ seq: 0, section: '' }),
  );
}

/**
 * Cached registry snapshot for the settings section.
 *
 * Panels are read on demand from the live slot registry (so a plugin that
 * registers after this one still appears); the section's inject face hands the
 * reader in.
 */
let duiPanelReader = () => [];

/** Install the panel reader (called once from apply). */
function duiSetPanelReader(reader) {
  duiPanelReader = typeof reader === 'function' ? reader : () => [];
}

/** Read the current panel list. */
function duiReadPanels() {
  try {
    const rows = duiPanelReader();
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    duiWarn('panel registry unavailable', error);
    return [];
  }
}

/**
 * Sidebar-search hand-off counter.
 *
 * The collapsed desktop layout keeps its search control in the frame's leading
 * seat while the sidebar shell is unmounted; pressing it bumps this counter so
 * the shell opens its inline search as soon as it is back on screen.
 */
const duiSidebarSearchRequests = duiCreateStore(0);

/** Ask the sidebar to open its inline search (used by the collapsed controls). */
function duiRequestSidebarSearch() {
  duiSidebarSearchRequests.set(duiSidebarSearchRequests.get() + 1);
}

/** React hook over the search hand-off counter. */
function duiUseSidebarSearchRequests() {
  return useSyncExternalStore(
    (onChange) => duiSidebarSearchRequests.subscribe(onChange),
    () => duiSidebarSearchRequests.get(),
    () => 0,
  );
}

/** One pending confirmation dialog: the question, its labels, and its resolver. */
let duiConfirmRequest = null;

/** Subscribers for the confirmation surface. */
const duiConfirmListeners = new Set();

/** Notify the confirmation surface. */
function duiNotifyConfirm() {
  for (const listener of [...duiConfirmListeners]) {
    try {
      listener();
    } catch (error) {
      duiWarn('confirm listener failed', error);
    }
  }
}

/**
 * Ask the user to confirm one destructive action.
 * @param options - title, body, confirm label, and the danger tone.
 * @returns true when confirmed; false when cancelled or replaced.
 */
function duiAskConfirm(options) {
  return new Promise((resolve) => {
    const previous = duiConfirmRequest;
    duiConfirmRequest = {
      id: (previous === null ? 0 : previous.id) + 1,
      title: options.title,
      body: options.body === undefined ? '' : options.body,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      danger: options.danger === true,
      resolve,
    };
    if (previous !== null) previous.resolve(false);
    duiNotifyConfirm();
  });
}

/** Settle the open confirmation (true = confirmed). */
function duiSettleConfirm(confirmed) {
  const request = duiConfirmRequest;
  if (request === null) return;
  duiConfirmRequest = null;
  request.resolve(confirmed);
  duiNotifyConfirm();
}

/** React hook over the pending confirmation. */
function duiUseConfirm() {
  const [, force] = useState(0);
  useEffect(() => {
    const listener = () => force((value) => value + 1);
    duiConfirmListeners.add(listener);
    return () => {
      duiConfirmListeners.delete(listener);
    };
  }, []);
  return duiConfirmRequest;
}

/** Transient notices: `{ id, text, tone }`. */
const duiToasts = duiCreateStore([]);

/** Show one transient notice; it retires itself. */
function duiToast(text, tone = 'info') {
  const id = Date.now() + Math.random();
  duiToasts.set([...duiToasts.get(), { id, text, tone }]);
  setTimeout(() => {
    duiToasts.set(duiToasts.get().filter((row) => row.id !== id));
  }, 3200);
}

/** React hook over the live notices. */
function duiUseToasts() {
  return useSyncExternalStore(
    (onChange) => duiToasts.subscribe(onChange),
    () => duiToasts.get(),
    () => [],
  );
}

    // ---- src/sidebar.js ----
/**
 * The `sidebar` seat: a faithful port of chat-demo's sider.
 *
 * Unlike a restyle of the shipped browser, this column is drawn from the Host's
 * own Session and Workspace snapshots: the rows, their time groups, the
 * pin/archive/rename/delete actions, and the active state all come from the
 * Client services. The shipped `sidebar.workspaces` browser is still DECLARED
 * (so its registrations keep activating) but no longer rendered — every action
 * it offered is re-implemented here against the same services:
 *
 *   open      ctx.uiWorkspace.openSession
 *   rename    ctx.sessions.using(id, …, reference.binding.session.rename)
 *   pin       ctx.uiWorkspace.pinSession / unpinSession
 *   archive   ctx.uiWorkspace.archiveSession / unarchiveSession
 *   delete    the session-delete route, when that bundle is installed
 *
 * The shipped `sidebar.settings` seat stays mounted (hidden) so the sheet can
 * hand off to the host Settings dialog.
 */

/** Darwin desktop hides the collapsed column and moves its controls beside the traffic lights. */
function duiIsDarwinDesktop() {
  if (!duiHasDom()) return false;
  return document.documentElement.getAttribute('data-platform') === 'darwin';
}

/**
 * Whether the window chrome is the Windows caption row.
 *
 * Windows desktop renders a custom caption (`data-windows-titlebar`) and, like
 * macOS, keeps no icon rail when the column is closed — the frame's leading seat
 * is the only way back. Both platforms therefore need the full control set.
 */
function duiIsWindowsDesktop() {
  if (!duiHasDom()) return false;
  const root = document.documentElement;
  return root.getAttribute('data-platform') === 'win32' || root.hasAttribute('data-windows-titlebar');
}

/** A stable no-op selector hook, so hooks are never called conditionally. */
const DUI_NO_HOOK = () => undefined;

/** One day in milliseconds. */
const DUI_DAY = 86_400_000;

/** Local midnight for one timestamp (chat-demo `startOfDay`). */
function duiStartOfDay(time) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Locale-aware month label for the oldest group (chat-demo `monthKey`). */
function duiMonthLabel(time) {
  const locale = duiHasDom() ? document.documentElement.lang || undefined : undefined;
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' }).format(new Date(time));
  } catch {
    return String(new Date(time).getFullYear());
  }
}

/**
 * Group sessions by age exactly as chat-demo's `groupSessions` does:
 * today, yesterday, last 7 days, last 30 days, then one group per month.
 * @param rows - sessions sorted from newest to oldest.
 * @param now - current time in milliseconds.
 * @param labels - the four relative group labels.
 * @returns ordered groups of `{ key, label, rows }`.
 */
function duiGroupSessions(rows, now, labels) {
  const groups = [];
  let lastKey;
  for (const row of rows) {
    const diff = Math.floor((now - duiStartOfDay(row.updatedAt || now)) / DUI_DAY);
    let key;
    let label;
    if (diff <= 0) {
      key = 'today';
      label = labels.today;
    } else if (diff <= 1) {
      key = 'yesterday';
      label = labels.yesterday;
    } else if (diff < 7) {
      key = 'week';
      label = labels.week;
    } else if (diff < 30) {
      key = 'month';
      label = labels.month;
    } else {
      key = `m:${duiMonthLabel(row.updatedAt || now)}`;
      label = duiMonthLabel(row.updatedAt || now);
    }
    const last = groups.length === 0 ? undefined : groups[groups.length - 1];
    if (last !== undefined && key === lastKey) last.rows.push(row);
    else groups.push({ key, label, rows: [row] });
    lastKey = key;
  }
  return groups;
}

/**
 * The owner-supplied viewport scroller capability for `sidebar.workspaces`.
 * Stable identity: an occupant may call the hook on any render.
 */
const DUI_SECTION_SCROLLER = Object.freeze({
  bindScrollerRef(element) {
    duiSectionScrollerElement = element === undefined ? null : element;
  },
});

/** Element currently bound as the workspaces scroller (`null` before the first bind). */
let duiSectionScrollerElement = null;

/** Per-render capability object handed to `renderSlot('sidebar.workspaces', …)`. */
const DUI_SECTION_HOOK_CONTEXT = Object.freeze({
  useSectionScroller: () => DUI_SECTION_SCROLLER,
});

/** Resolve a slot label option that may be a string or a lazy callback. */
function duiResolveLabel(label) {
  if (typeof label === 'string' && label !== '') return label;
  if (typeof label === 'function') {
    const value = duiGuard('slot label', () => label());
    if (typeof value === 'string' && value !== '') return value;
  }
  return undefined;
}

/** Click the shipped Settings trigger sitting in the hidden `sidebar.settings` seat. */
function duiClickHostSettings(container) {
  if (container === null || container === undefined) return false;
  const trigger = container.querySelector('button, [role="button"]');
  if (trigger === null) return false;
  try {
    trigger.click();
    return true;
  } catch (error) {
    duiWarn('host settings trigger failed', error);
    return false;
  }
}

/** Whether a session row is the conversation open in the main view. */
function duiIsCurrentSession(row) {
  if (row === undefined || row === null) return false;
  const retained = row.retainedBy;
  if (retained === undefined || retained === null) return false;
  return (retained.mainView ?? 0) > 0;
}

/**
 * Visible title of one session row.
 *
 * A newly created Session has no title yet and its `displayTitle` falls back to
 * the Workspace basename, which reads in the sidebar as a duplicate of the
 * project rather than as a fresh chat. Blank rows therefore render the demo's
 * own New-chat wording until the Host projects a title from the first prompt.
 */
function duiSessionTitle(row, t) {
  if (row !== null && row !== undefined && row.blank === true) return t('sidebar.newChatTitle');
  const title = row === null || row === undefined ? undefined : row.displayTitle;
  if (typeof title === 'string' && title.trim() !== '') return title;
  return t('sidebar.untitled');
}

/** One row of the demo's group heading. */
function DuiGroupHeader(props) {
  return h('div', { className: 'dsui-group-header', role: 'presentation' }, props.label);
}

/**
 * One session row: title, active fill, and the demo's hover actions
 * (rename pencil + overflow menu). Double-clicking the title also renames.
 */
function DuiSessionRow(props) {
  const { row, active, pinned, t, onOpen, onRename, onMenu, onTogglePin } = props;
  const title = duiSessionTitle(row, t);
  return h('div', {
    className: duiCls('dsui-item', active && 'dsui-item--active'),
    role: 'treeitem',
    'aria-selected': active,
    tabIndex: 0,
    'data-session-row': row.id,
    onClick: () => {
      onOpen(row.id);
    },
    onDoubleClick: () => {
      onRename(row, title);
    },
    onKeyDown: (event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen(row.id);
      } else if (event.key === 'F2') {
        event.preventDefault();
        onRename(row, title);
      }
    },
  },
  h('span', { className: 'dsui-item-title', title }, title),
  h('div', { className: 'dsui-item-actions' },
    h('button', {
      type: 'button',
      className: duiCls('dsui-item-action', pinned && 'dsui-item-action--on'),
      'aria-label': pinned ? t('sidebar.unpin') : t('sidebar.pin'),
      'data-dsui-tip': pinned ? t('sidebar.unpin') : t('sidebar.pin'),
      onClick: (event) => {
        event.stopPropagation();
        onTogglePin(row);
      },
    }, h(DuiPrimIcon, { name: pinned ? 'IconPinFillRegular' : 'IconPinOutlineRegular', size: 14 })),
    h('button', {
      type: 'button',
      className: 'dsui-item-action',
      'aria-label': t('sidebar.rename'),
      'data-dsui-tip': t('sidebar.rename'),
      onClick: (event) => {
        event.stopPropagation();
        onRename(row, title);
      },
    }, h(DuiIcon, { name: 'IconEditOutline16', size: 14 })),
    h('button', {
      type: 'button',
      className: 'dsui-item-action',
      'aria-label': t('sidebar.more'),
      'aria-haspopup': 'menu',
      onClick: (event) => {
        event.stopPropagation();
        onMenu(row, event.currentTarget);
      },
    }, h(DuiIcon, { name: 'IconEllipsisOutline16', size: 14 }))));
}

/** Inline rename field for one row (chat-demo `.renameInput`). */
function DuiRenameField(props) {
  const { value, t, onChange, onCommit, onCancel } = props;
  const commitRef = useRef(false);
  return h('input', {
    className: 'dsui-rename-input',
    value,
    autoFocus: true,
    'aria-label': t('sidebar.renameLabel'),
    onChange: (event) => {
      onChange(event.target.value);
    },
    onFocus: (event) => {
      event.target.select();
    },
    onBlur: () => {
      if (!commitRef.current) onCommit();
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
        event.preventDefault();
        commitRef.current = true;
        onCommit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        commitRef.current = true;
        onCancel();
      }
    },
  });
}

/** One row of the overflow menu. */
function DuiMenuItem(props) {
  return h('button', {
    type: 'button',
    role: 'menuitem',
    className: duiCls('dsui-menu-item', props.danger && 'dsui-menu-item--danger'),
    onClick: props.onSelect,
  }, props.icon === undefined ? null : h('span', { className: 'dsui-menu-icon' }, props.icon), h('span', null, props.label));
}

/**
 * Sidebar shell: the chat-demo column drawn from Host snapshots.
 * @param props - owner geometry, the standard scope hooks, the injected session
 *   actions, and the locale seat.
 */
function DuiSidebar(props) {
  const settings = props === undefined || props === null ? {} : props;
  const collapsed = duiBool(settings.collapsed, false);
  const drawer = duiBool(settings.drawer, false);
  const wide = !collapsed;
  const t = typeof settings.t === 'function' ? settings.t : (key) => key;
  const renderSlot = typeof settings.renderSlot === 'function' ? settings.renderSlot : () => null;
  const toggleSidebar = typeof settings.toggleSidebar === 'function' ? settings.toggleSidebar : () => {};
  const startSession = typeof settings.startSession === 'function' ? settings.startSession : undefined;
  const useSessions = typeof settings.useSessions === 'function' ? settings.useSessions : DUI_NO_HOOK;
  const useWorkspaces = typeof settings.useWorkspaces === 'function' ? settings.useWorkspaces : DUI_NO_HOOK;
  const darwin = useMemo(() => duiIsDarwinDesktop(), []);
  const windows = useMemo(() => duiIsWindowsDesktop(), []);
  const hostSettingsRef = useRef(null);
  const hostSettings = duiUseHostSettingsRequests();
  const lastHostSettings = useRef({ seq: 0, section: '' });
  const searchRequests = duiUseSidebarSearchRequests();
  const lastSearchRequest = useRef(0);

  const sessionState = useSessions((state) => state);
  const workspaceState = useWorkspaces((state) => state);

  // The demo keeps "today" honest across midnight and after the window regains
  // focus; the same clock drives the group labels.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let timer;
    const refresh = () => {
      clearTimeout(timer);
      const time = Date.now();
      setNow(time);
      const midnight = new Date(time).setHours(24, 0, 0, 0);
      timer = setTimeout(refresh, midnight - time);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [renaming, setRenaming] = useState(null);
  const [menu, setMenu] = useState(null);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const searchRef = useRef(null);

  const byId = sessionState === undefined || sessionState === null || sessionState.byId === undefined
    ? {}
    : sessionState.byId;
  const archivedIds = new Set(workspaceState === undefined || workspaceState === null || workspaceState.archivedSessionIds === undefined
    ? []
    : workspaceState.archivedSessionIds);
  const pinnedIds = workspaceState === undefined || workspaceState === null || workspaceState.pinnedSessionIds === undefined
    ? []
    : workspaceState.pinnedSessionIds;

  // Root conversations only (subagent children belong to their parent's tree),
  // newest first, with the one blank New Session row the host keeps selected.
  const rows = useMemo(() => {
    const list = [];
    for (const id of Object.keys(byId)) {
      const row = byId[id];
      if (row === null || row === undefined) continue;
      if (row.parentId !== undefined && row.parentId !== null) continue;
      if (row.blank === true && !duiIsCurrentSession(row)) continue;
      list.push(row);
    }
    list.sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));
    return list;
  }, [byId]);

  const currentId = useMemo(() => {
    for (const row of rows) {
      if (duiIsCurrentSession(row)) return row.id;
    }
    return undefined;
  }, [rows]);

  const matches = useCallback((row) => {
    if (query === '') return true;
    return duiSessionTitle(row, t).toLowerCase().includes(query.toLowerCase());
  }, [query, t]);

  const pinnedRows = useMemo(() => {
    const out = [];
    for (const id of pinnedIds) {
      const row = byId[id];
      if (row === undefined || archivedIds.has(id) || !matches(row)) continue;
      out.push(row);
    }
    return out;
  }, [pinnedIds, byId, archivedIds, matches]);

  const liveRows = useMemo(() => rows.filter((row) => !archivedIds.has(row.id)
    && !pinnedRows.some((pinned) => pinned.id === row.id)
    && matches(row)), [rows, archivedIds, pinnedRows, matches]);

  const archivedRows = useMemo(() => (archivedOpen
    ? rows.filter((row) => archivedIds.has(row.id) && matches(row))
    : []), [archivedOpen, rows, archivedIds, matches]);

  const groups = useMemo(() => duiGroupSessions(liveRows, now, {
    today: t('sidebar.groups.today'),
    yesterday: t('sidebar.groups.yesterday'),
    week: t('sidebar.groups.week'),
    month: t('sidebar.groups.month'),
  }), [liveRows, now, t]);

  // A drawer is a modal dialog for keyboards and assistive technology.
  useEffect(() => {
    if (!drawer || collapsed) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      toggleSidebar();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [drawer, collapsed, toggleSidebar]);

  useEffect(() => {
    if (searchOpen) duiFocus(searchRef.current);
  }, [searchOpen]);

  // The collapsed desktop controls ask for search while this shell is off
  // screen; open the inline field as soon as the column is back.
  useEffect(() => {
    if (searchRequests === lastSearchRequest.current) return;
    lastSearchRequest.current = searchRequests;
    if (searchRequests === 0) return;
    if (!wide) return;
    setSearchOpen(true);
  }, [searchRequests, wide]);

  // The settings hand-off is a counter plus an optional section label; the
  // shipped trigger only exists inside this entry's hidden seat.
  useEffect(() => {
    if (hostSettings.seq === lastHostSettings.current.seq) return;
    lastHostSettings.current = hostSettings;
    if (hostSettings.seq === 0) return;
    duiOpenHostSettings(hostSettingsRef.current, hostSettings.section);
  }, [hostSettings]);

  // The Windows caption's native Application/Edit entries start after these
  // controls; publish a wider start while the pill is on screen.
  useEffect(() => {
    if (!windows) return undefined;
    const root = document.documentElement;
    if (!collapsed) return undefined;
    const previous = root.style.getPropertyValue('--dsh-windows-menu-start');
    root.style.setProperty('--dsh-windows-menu-start', '168px');
    return () => {
      if (previous === '') root.style.removeProperty('--dsh-windows-menu-start');
      else root.style.setProperty('--dsh-windows-menu-start', previous);
    };
  }, [windows, collapsed]);

  // One outside-press closes the row menu; the menu itself stops propagation.
  useEffect(() => {
    if (menu === null) return undefined;
    const onPointerDown = () => {
      setMenu(null);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setMenu(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('blur', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('blur', onPointerDown);
    };
  }, [menu]);

  const openSession = (id) => {
    if (typeof settings.openSession === 'function') duiGuard('open session', () => settings.openSession(id));
    if (drawer && !collapsed) toggleSidebar();
  };

  // Every fresh Session belongs to the one fixed workspace the Host publishes,
  // so the sidebar no longer guesses a workspace: the action resolves it itself.
  const creatingRef = useRef(false);
  const openNewSession = useCallback(() => {
    if (creatingRef.current) return;
    if (drawer && !collapsed) toggleSidebar();
    const create = typeof settings.createSession === 'function' ? settings.createSession : undefined;
    if (create !== undefined) {
      creatingRef.current = true;
      const settled = duiGuard('new session', () => create());
      if (settled !== null && typeof settled === 'object' && typeof settled.then === 'function') {
        settled.then(undefined, () => {}).then(() => { creatingRef.current = false; });
      } else {
        creatingRef.current = false;
      }
      return;
    }
    if (startSession !== undefined) duiGuard('new session', () => startSession());
  }, [settings.createSession, startSession, drawer, collapsed, toggleSidebar]);

  const openSettings = () => {
    duiRequestHostSettings();
  };
  const openPanels = () => {
    duiRequestHostSettings(t('settingsTitle'));
  };

  const startRename = (row, title) => {
    setMenu(null);
    setRenaming({ id: row.id, draft: title });
  };

  const commitRename = () => {
    const pending = renaming;
    if (pending === null) return;
    const draft = pending.draft.trim();
    setRenaming(null);
    if (draft === '' || typeof settings.renameSession !== 'function') return;
    duiGuard('rename session', () => settings.renameSession(pending.id, draft));
  };

  const openMenu = (row, anchor) => {
    const rect = anchor === undefined || anchor === null ? null : anchor.getBoundingClientRect();
    setMenu({
      row,
      x: rect === null ? 40 : Math.min(rect.left, (window.innerWidth || 0) - 200),
      y: rect === null ? 120 : rect.bottom + 4,
    });
  };

  const runMenuAction = (action) => {
    setMenu(null);
    if (typeof action === 'function') duiGuard('session action', action);
  };

  const archiveRow = (row) => {
    if (typeof settings.archiveSession !== 'function') return;
    if (row.running === true) {
      void duiAskConfirm({
        title: t('sidebar.confirm.archiveRunning.title'),
        body: t('sidebar.confirm.archiveRunning.body'),
        confirmLabel: t('sidebar.confirm.stopAndArchive'),
        cancelLabel: t('common.cancel'),
      }).then((confirmed) => {
        if (!confirmed) return;
        duiGuard('archive session', () => settings.archiveSession(row.id, true));
      });
      return;
    }
    duiGuard('archive session', () => settings.archiveSession(row.id, false));
  };

  const deleteRow = (row) => {
    if (typeof settings.deleteSession !== 'function') return;
    void duiAskConfirm({
      title: t('sidebar.confirm.delete.title'),
      body: t('sidebar.confirm.delete.body'),
      confirmLabel: t('sidebar.confirm.delete.action'),
      cancelLabel: t('common.cancel'),
      danger: true,
    }).then((confirmed) => {
      if (!confirmed) return;
      duiGuard('delete session', () => settings.deleteSession(row.id));
    });
  };

  const rowNode = (row) => (renaming !== null && renaming.id === row.id
    ? h(DuiRenameField, {
      key: row.id,
      value: renaming.draft,
      t,
      onChange: (draft) => {
        setRenaming({ id: row.id, draft });
      },
      onCommit: commitRename,
      onCancel: () => {
        setRenaming(null);
      },
    })
    : h(DuiSessionRow, {
      key: row.id,
      row,
      active: row.id === currentId,
      pinned: pinnedIds.includes(row.id),
      t,
      onOpen: openSession,
      onRename: startRename,
      onMenu: openMenu,
      onTogglePin: (target) => {
        const isPinned = pinnedIds.includes(target.id);
        duiGuard('toggle pin', () => (isPinned ? settings.unpinSession : settings.pinSession)(target.id));
      },
    }));

  const section = (key, label, list) => (list.length === 0 ? null : h('div', { key, className: 'dsui-section' },
    h(DuiGroupHeader, { label }),
    list.map(rowNode)));

  const archivedSection = archivedIds.size === 0 ? null : h('div', { key: 'archived', className: 'dsui-section' },
    h('button', {
      type: 'button',
      className: 'dsui-group-toggle',
      'aria-expanded': archivedOpen,
      onClick: () => {
        setArchivedOpen((open) => !open);
      },
    },
    h('span', null, t('sidebar.groups.archived')),
    h('span', { className: 'dsui-group-count' }, String(archivedIds.size)),
    h(DuiIcon, { name: 'IconChevronRightOutline14', size: 14, className: duiCls('dsui-group-chevron', archivedOpen && 'dsui-group-chevron--open') })),
    archivedRows.map(rowNode));

  // Brand artwork is the shipped one: the official mark and wordmark occupy
  // these seats, and the primitive fish is the fallback when nothing does.
  const brandMark = renderSlot('sidebar.brand.mark', { size: 24 }, {
    fallback: h(DuiFishLogo, { size: 24 }),
  });
  const brandName = renderSlot('sidebar.brand.name', {}, {
    fallback: h('span', { className: 'dsui-brand-wordmark' }, t('brand.fallback')),
  });

  const collapseButton = h('button', {
    type: 'button',
    'data-dsui-first': drawer ? '' : undefined,
    'data-dsui-tip': t('sidebar.collapse'),
    className: 'dsui-icon-button dsui-collapse',
    'aria-label': t('sidebar.collapse'),
    onClick: () => {
      toggleSidebar();
    },
  }, h(DuiIcon, { name: 'IconPanelLeftOutline16' }));

  const searchButton = h('button', {
    type: 'button',
    'data-dsui-tip': t('sidebar.search'),
    className: duiCls('dsui-icon-button dsui-search-toggle', searchOpen && 'dsui-search-toggle--on'),
    'aria-label': t('sidebar.search'),
    'aria-expanded': searchOpen,
    onClick: () => {
      setSearchOpen((open) => !open);
      if (searchOpen) setQuery('');
    },
  }, h(DuiIcon, { name: 'IconSearchOutline16' }));

  const topStrip = darwin
    ? h('div', { className: 'dsui-top-strip', 'data-window-drag': '' }, searchButton, collapseButton)
    : null;

  const newChatButton = h('button', {
    type: 'button',
    className: 'dsui-new-chat',
    'aria-label': t('sidebar.newSessionLabel'),
    onClick: openNewSession,
  },
  h('span', { className: 'dsui-new-chat-icon' }, h(DuiIcon, { name: 'NewChatIcon' })),
  h('span', { className: 'dsui-new-chat-label' }, t('sidebar.newSession')));

  // The shipped New-session row is a HOC seat: plug-ins that add an action beside
  // New session (DeepSeek chat import, for one) wrap this content, and must be
  // given it or their trigger never appears.
  const newChatRow = h('div', { className: 'dsui-new-chat-row' },
    renderSlot('sidebar.session.action', { wide: !collapsed }, { children: newChatButton }));

  // The shipped Settings seat and footer actions stay mounted while the column
  // is a rail or hidden: the seat owns the Settings dialog state, and the
  // sheet's hand-off needs its trigger.
  const hiddenHosts = h('div', { className: 'dsui-host-seats', 'aria-hidden': true },
    h('div', { ref: hostSettingsRef, className: 'dsui-host-settings' },
      renderSlot('sidebar.settings', { wide: false })));

  if (darwin && collapsed) return hiddenHosts;

  const menuNode = menu === null ? null : h('div', {
    className: 'dsui-menu',
    role: 'menu',
    'aria-label': t('sidebar.more'),
    style: { top: `${menu.y}px`, left: `${menu.x}px` },
    onPointerDown: (event) => {
      event.stopPropagation();
    },
  },
  h(DuiMenuItem, {
    label: t('sidebar.rename'),
    icon: h(DuiIcon, { name: 'IconEditOutline16', size: 14 }),
    onSelect: () => {
      startRename(menu.row, duiSessionTitle(menu.row, t));
    },
  }),
  h(DuiMenuItem, {
    label: pinnedIds.includes(menu.row.id) ? t('sidebar.unpin') : t('sidebar.pin'),
    icon: h(DuiPrimIcon, {
      name: pinnedIds.includes(menu.row.id) ? 'IconPinFillRegular' : 'IconPinOutlineRegular',
      size: 14,
    }),
    onSelect: () => {
      const id = menu.row.id;
      const pinned = pinnedIds.includes(id);
      runMenuAction(() => (pinned ? settings.unpinSession : settings.pinSession)(id));
    },
  }),
  h(DuiMenuItem, {
    label: archivedIds.has(menu.row.id) ? t('sidebar.unarchive') : t('sidebar.archive'),
    icon: h(DuiPrimIcon, {
      name: archivedIds.has(menu.row.id) ? 'IconArchiveOffOutlineRegular' : 'IconArchiveOutlineRegular',
      size: 14,
    }),
    onSelect: () => {
      const row = menu.row;
      if (archivedIds.has(row.id)) runMenuAction(() => settings.unarchiveSession(row.id));
      else archiveRow(row);
    },
  }),
  h(DuiMenuItem, {
    label: t('sidebar.delete'),
    danger: true,
    icon: h(DuiIcon, { name: 'IconTrashOutline16', size: 14 }),
    onSelect: () => {
      deleteRow(menu.row);
    },
  }));

  const expanded = h('div', {
    className: duiCls('dsui-sider', drawer && 'dsui-sider--drawer'),
    role: drawer ? 'dialog' : undefined,
    'aria-modal': drawer ? true : undefined,
    'aria-label': drawer ? t('sidebar.railLabel') : undefined,
  },
  topStrip,
  h('div', { className: 'dsui-sider-top', 'data-window-drag': '' },
    h('span', { className: 'dsui-brand' },
      h('span', { className: 'dsui-brand-mark' }, brandMark),
      h('span', { className: 'dsui-brand-name' }, brandName)),
    darwin
      ? null
      : h('div', { className: 'dsui-sider-top-actions' }, searchButton, collapseButton)),
  newChatRow,
  searchOpen ? h('div', { className: 'dsui-search-row', role: 'search' },
    h('input', {
      ref: searchRef,
      className: 'dsui-search-input',
      type: 'search',
      value: query,
      placeholder: t('sidebar.searchPlaceholder'),
      'aria-label': t('sidebar.search'),
      autoComplete: 'off',
      onChange: (event) => {
        setQuery(event.target.value);
      },
      onKeyDown: (event) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        setQuery('');
        setSearchOpen(false);
      },
    })) : null,
  h('div', { className: 'dsui-sider-list' },
    h('div', { className: 'dsui-sider-scroll', role: 'tree', 'aria-label': t('sidebar.sessions') },
      pinnedRows.length === 0 ? null : section('pinned', t('sidebar.groups.pinned'), pinnedRows),
      groups.map((group) => section(group.key, group.label, group.rows)),
      archivedSection,
      rows.length === 0 ? h('p', { className: 'dsui-empty' }, t('sidebar.empty')) : null)),
  h('div', { className: 'dsui-sider-bottom' },
    h('div', { className: 'dsui-footer-actions' }, renderSlot('sidebar.footer.action', { wide: true })),
    h('div', { className: 'dsui-bottom-row' },
      h('button', {
        type: 'button',
        className: 'dsui-settings-row',
        'aria-haspopup': 'dialog',
        onClick: openSettings,
      },
      h('span', { className: 'dsui-settings-icon' }, h(DuiIcon, { name: 'SettingsOutline16' })),
      h('span', { className: 'dsui-settings-label' }, t('sidebar.settings'))),
      h('button', {
        type: 'button',
        className: 'dsui-icon-button dsui-panels-button',
        'aria-label': t('sidebar.panels'),
        'data-dsui-tip': t('sidebar.panels'),
        onClick: openPanels,
      }, h(DuiIcon, { name: 'IconMenuOutline20', size: 16 })))));

  const railButton = (key, icon, label, onClick) => h('button', {
    key,
    type: 'button',
    className: 'dsui-rail-button',
    'data-dsui-tip': label,
    'aria-label': label,
    onClick,
  }, icon);

  // The rail exposes the same HOC seat as the wide row, so an importer action
  // stays reachable in the collapsed column too (the occupant draws its narrow
  // icon variant when `wide` is false).
  // The Windows caption hosts the collapsed navigation: the frame keeps the
  // column at zero width there, exactly like the shipped sidebar, whose toggle
  // and New Session sit fixed in the caption row. Render the same control set
  // (fish + panel/search/new pill) so the three controls never disappear.
  const captionControls = windows && collapsed ? h('div', { className: 'dsui-caption-controls' },
    h('span', { className: 'dsui-leading-brand', 'aria-hidden': true }, h(DuiFishLogo, { size: 24 })),
    h('div', { className: 'dsui-leading-pill' },
      h('button', {
        type: 'button',
        className: 'dsui-leading-button',
        'aria-label': t('leading.openSidebar'),
        'data-dsui-tip': t('leading.openSidebar'),
        onClick: () => {
          toggleSidebar();
        },
      }, h(DuiIcon, { name: 'IconPanelLeftOutline16', size: 16 })),
      h('button', {
        type: 'button',
        className: 'dsui-leading-button',
        'aria-label': t('leading.search'),
        'data-dsui-tip': t('leading.search'),
        onClick: () => {
          setSearchOpen(true);
          toggleSidebar();
        },
      }, h(DuiIcon, { name: 'IconSearchOutline16', size: 16 })),
      h('button', {
        type: 'button',
        className: 'dsui-leading-button',
        'aria-label': t('leading.newSession'),
        'data-dsui-tip': t('leading.newSession'),
        onClick: openNewSession,
      }, h(DuiIcon, { name: 'NewChatIcon', size: 16 })))) : null;

  const railNewItem = renderSlot('sidebar.session.action', { wide: false }, {
    children: railButton('new', h(DuiIcon, { name: 'NewChatIcon', size: 16 }), t('sidebar.newSessionLabel'), openNewSession),
  });

  const rail = h('div', { className: 'dsui-rail', role: 'navigation', 'aria-label': t('sidebar.railLabel') },
    railButton('brand', h(DuiWhaleMark, { size: 24 }), t('sidebar.expand'), () => {
      toggleSidebar();
    }),
    railNewItem,
    h('div', { className: 'dsui-rail-spacer' }),
    railButton('panels', h(DuiIcon, { name: 'IconMenuOutline20', size: 16 }), t('sidebar.panels'), openPanels),
    railButton('settings', h(DuiIcon, { name: 'SettingsOutline16', size: 16 }), t('sidebar.settings'), openSettings),
    renderSlot('sidebar.toggle.badge', {}));

  return h(Fragment, null, hiddenHosts, captionControls === null ? (wide ? expanded : rail) : captionControls, menuNode);
}

/**
 * The frame's `shell.leading` seat: what the app shows beside the traffic lights
 * once the column is collapsed.
 *
 * The shape is the official one: the DeepSeek fish, then a single pill that holds
 * the expand control, session search, and New chat. The pill is sized to the
 * frame's window-chrome band and this plugin republishes
 * `--dsh-frame-leading-clearance` for that width (see sidebar.css), so the
 * conversation title starts after the seat instead of under it.
 *
 * In a browser drawer (no darwin chrome) the seat keeps one compact opener, the
 * footprint that clearance expects; search and New chat live in the drawer.
 */
function DuiShellLeading(props) {
  const settings = props === undefined || props === null ? {} : props;
  const t = typeof settings.t === 'function' ? settings.t : (key) => key;
  const toggleSidebar = typeof settings.toggleSidebar === 'function' ? settings.toggleSidebar : () => {};
  const startSession = typeof settings.startSession === 'function' ? settings.startSession : undefined;
  const createSession = typeof settings.createSession === 'function' ? settings.createSession : undefined;
  const darwin = useMemo(() => duiIsDarwinDesktop(), []);
  const windows = useMemo(() => duiIsWindowsDesktop(), []);

  const newChat = () => {
    if (createSession !== undefined) {
      duiGuard('new session', () => createSession());
      return;
    }
    if (startSession !== undefined) duiGuard('new session', () => startSession());
  };

  const pillButton = (key, children, label, onClick, className) => h('button', {
    key,
    type: 'button',
    className: duiCls('dsui-leading-button', className),
    'aria-label': label,
    'data-dsui-tip': label,
    onClick,
  }, children);

  const opener = pillButton('expand', h(DuiIcon, { name: 'IconPanelLeftOutline16', size: 16 }),
    t('leading.openSidebar'), () => { toggleSidebar(); });

  // Plain web (no desktop caption) keeps one compact opener: the drawer already
  // carries search and New chat.
  if (!darwin && !windows) return h('div', { className: 'dsui-leading', 'data-window-drag': '' }, opener);

  return h('div', { className: 'dsui-leading', 'data-window-drag': '' },
    h('span', { className: 'dsui-leading-brand', 'aria-hidden': true }, h(DuiFishLogo, { size: 24 })),
    h('div', { className: 'dsui-leading-pill' },
      opener,
      pillButton('search', h(DuiIcon, { name: 'IconSearchOutline16', size: 16 }), t('leading.search'), () => {
        duiRequestSidebarSearch();
        toggleSidebar();
      }),
      pillButton('new', h(DuiIcon, { name: 'NewChatIcon', size: 16 }), t('leading.newSession'), newChat)));
}

/** Render one glyph from the host primitive set when that icon exists. */
function DuiPrimIcon(props) {
  const Icon = duiPrimitives[props.name];
  if (Icon === undefined || Icon === null) return null;
  return h(Icon, { size: props.size === undefined ? 14 : props.size });
}

/** The shipped DeepSeek fish mark, used wherever the official seats are empty. */
function DuiFishLogo(props) {
  const FishLogo = duiPrimitives.FishLogo;
  const size = props !== undefined && typeof props.size === 'number' ? props.size : 24;
  if (FishLogo === undefined || FishLogo === null) return h(DuiWhaleMark, { size });
  return h(FishLogo, { size });
}

/** The demo brand mark: a whale silhouette, drawn as one path so it scales cleanly. */
function DuiWhaleMark(props) {
  const size = props !== undefined && typeof props.size === 'number' ? props.size : 24;
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true,
    focusable: 'false',
    className: 'dsui-whale',
  }, h('path', {
    d: 'M3.1 13.6c0-3.9 3.2-7 7.1-7 2.5 0 4.5 1.2 5.8 3 .5-.6 1.3-1 2.2-1 1.5 0 2.7 1.2 2.7 2.7 0 .5-.1.9-.3 1.3l1.9 1.1-2.6.9c-.8 2.9-3.4 5-6.5 5H8.9c-3.2 0-5.8-2.6-5.8-5.8v-.2Z',
    fill: 'currentColor',
  }), h('circle', { cx: '16.4', cy: '10.9', r: '0.85', fill: 'var(--dsw-specific-sidebar-fill, #ffffff)' }));
}

    // ---- src/sheet.js ----
/**
 * The plugin's settings surface.
 *
 * The shipped Settings window is reused wholesale — it owns every original page
 * (account and wallet, general, models, plugins, subagents, …) and the Platform
 * overlay behind Usage / Top-up. This plugin adds one section to that window and
 * skins the window itself (see sheet.css), so there is exactly one settings
 * surface with the original behaviour intact.
 *
 * The same overlay entry also hosts the confirmation dialog and transient
 * notices the sidebar's session actions raise.
 */

/** One card group of rows inside this section. */
function DuiGroup(props) {
  return h('section', { className: 'dsui-group' },
    props.title === undefined ? null : h('h4', { className: 'dsui-group-title' }, props.title),
    h('div', { className: 'dsui-group-card' }, props.children));
}

/** One label/control row. */
function DuiSetRow(props) {
  return h('div', { className: duiCls('dsui-row', props.stretch === true && 'dsui-row--stretch') },
    h('div', { className: 'dsui-row-label' }, props.label),
    h('div', { className: 'dsui-row-control' }, props.children));
}

/** One clickable row. */
function DuiLinkRow(props) {
  return h('button', {
    type: 'button',
    className: 'dsui-link-row',
    onClick: props.onClick,
  },
  props.leading === undefined ? null : h('span', { className: 'dsui-link-icon', 'aria-hidden': true }, props.leading),
  h('span', { className: 'dsui-link-copy' },
    h('span', { className: 'dsui-link-label' }, props.label),
    props.hint === undefined ? null : h('span', { className: 'dsui-link-hint' }, props.hint)),
  h('span', { className: 'dsui-row-chevron', 'aria-hidden': true },
    h(DuiPrimIcon, { name: 'IconChevronRightOutlineRegular', size: 14 })));
}

/**
 * This plugin's section inside the shipped Settings window.
 *
 * Registered into `settings.section`, so it appears in the window's own
 * navigation beside the original pages instead of replacing them.
 * @param props - the injected theme/locale/panel/shortcut readers plus the
 *   section's locale seat and the shell's `close` callback.
 */
function DuiSettingsSection(props) {
  const settings = props === undefined || props === null ? {} : props;
  const t = typeof settings.t === 'function' ? settings.t : (key) => key;
  const close = typeof settings.close === 'function' ? settings.close : () => {};
  const selectPanel = typeof settings.selectPanel === 'function' ? settings.selectPanel : () => {};
  const setTheme = typeof settings.setTheme === 'function' ? settings.setTheme : () => {};
  const getThemePreference = typeof settings.getThemePreference === 'function' ? settings.getThemePreference : () => 'system';
  const getLocales = typeof settings.getLocales === 'function' ? settings.getLocales : () => ({ active: '', locales: [] });
  const setLocale = typeof settings.setLocale === 'function' ? settings.setLocale : () => {};
  const [theme, setThemeState] = useState('system');
  const [locale, setLocaleState] = useState({ active: '', locales: [] });
  const [panels, setPanels] = useState([]);
  const [shortcuts, setShortcuts] = useState([]);

  useEffect(() => {
    setThemeState(duiGuard('theme preference', getThemePreference) || 'system');
    setLocaleState(duiGuard('locale state', getLocales) ?? { active: '', locales: [] });
    setPanels(duiReadPanels());
    setShortcuts(duiGuard('shortcuts', typeof settings.getShortcuts === 'function' ? settings.getShortcuts : () => []) ?? []);
  }, [getThemePreference, getLocales, settings.getShortcuts]);

  const pickTheme = (next) => {
    setThemeState(next);
    duiGuard('set theme', () => setTheme(next));
  };

  const themeCard = (id, label, icon) => h('button', {
    key: id,
    type: 'button',
    role: 'radio',
    'aria-checked': theme === id,
    className: duiCls('dsui-theme-card', theme === id && 'dsui-theme-card--active'),
    onClick: () => {
      pickTheme(id);
    },
  },
  h('span', { className: 'dsui-theme-card-icon', 'aria-hidden': true }, h(DuiIcon, { name: icon, size: 20 })),
  h('span', { className: 'dsui-theme-card-label' }, label),
  theme === id
    ? h('span', { className: 'dsui-theme-card-check', 'aria-hidden': true }, h(DuiPrimIcon, { name: 'IconCheckOutlineRegular', size: 12 }))
    : null);

  const openPanel = (id) => {
    duiGuard('select panel', () => selectPanel(id));
    close();
  };

  return h(Fragment, null,
    h('p', { className: 'dsui-section-lede' }, t('sheet.sectionLede')),
    h(DuiGroup, { title: t('sheet.themeLabel') },
      h(DuiSetRow, { label: t('sheet.themeLabel'), stretch: true },
        h('div', { className: 'dsui-theme-cards', role: 'radiogroup', 'aria-label': t('sheet.themeLabel') },
          themeCard('light', t('sheet.themeLight'), 'LightOutline16'),
          themeCard('dark', t('sheet.themeDark'), 'DarkOutline16'),
          themeCard('system', t('sheet.themeSystem'), 'FollowsystemOutline16')))),
    h(DuiGroup, null,
      h(DuiSetRow, { label: t('sheet.languageLabel') },
        locale.locales.length === 0
          ? h('span', { className: 'dsui-row-value' }, t('sheet.themeSystem'))
          : h('select', {
            className: 'dsui-select',
            value: locale.active,
            'aria-label': t('sheet.languageLabel'),
            onChange: (event) => {
              const next = event.target.value;
              setLocaleState({ ...locale, active: next });
              duiGuard('set locale', () => setLocale(next));
            },
          }, locale.locales.map((row) => h('option', { key: row.id, value: row.id }, row.label)))),
      h(DuiSetRow, { label: t('sheet.about.version') },
        h('span', { className: 'dsui-row-value' }, `DeepSeek UI v${typeof settings.version === 'string' ? settings.version : '0.2.0'}`))),
    panels.length === 0 ? null : h(DuiGroup, { title: t('sheet.panelsTitle') },
      panels.map((panel) => h('button', {
        key: panel.id,
        type: 'button',
        className: 'dsui-link-row',
        onClick: () => {
          openPanel(panel.id);
        },
      },
      h('span', { className: 'dsui-link-icon', 'aria-hidden': true },
        typeof panel.icon === 'function'
          ? h(panel.icon, { size: 18, active: false })
          : h(DuiPrimIcon, { name: 'IconLayersOutlineRegular', size: 18 })),
      h('span', { className: 'dsui-link-copy' }, h('span', { className: 'dsui-link-label' }, panel.label)),
      h('span', { className: 'dsui-row-chevron', 'aria-hidden': true },
        h(DuiPrimIcon, { name: 'IconChevronRightOutlineRegular', size: 14 }))))),
    shortcuts.length === 0 ? null : h(DuiGroup, { title: t('sheet.shortcutsTitle') },
      shortcuts.map((row) => h('div', { key: row.id, className: 'dsui-key-row' },
        h('span', { className: 'dsui-key-label' }, row.label),
        h('span', { className: 'dsui-keys' }, typeof duiPrimitives.ShortcutKeys === 'function'
          ? h(duiPrimitives.ShortcutKeys, { keys: row.keys })
          : row.keys.join('+'))))));
}

/**
 * One-time tip shown when a conversation runs one of the two official presets:
 * the closest match to the official app is the Flash model with low thinking
 * effort. The dialog keeps two opt-outs (today / forever) that persist in the
 * browser and suppress the reminder for later conversations and launches.
 * @param props - standard overlay props (`t`, `useSessions`).
 */
function DuiPresetTip(props) {
  const settings = props === undefined || props === null ? {} : props;
  const t = typeof settings.t === 'function' ? settings.t : (key) => key;
  const useSessions = typeof settings.useSessions === 'function' ? settings.useSessions : DUI_NO_SESSIONS_HOOK;
  const sessions = useSessions((state) => state);
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState(false);
  const [never, setNever] = useState(false);
  const shownKey = useRef('');
  const confirmRef = useRef(null);
  const [, setReady] = useState(0);

  useEffect(() => duiSubscribeRecommendedPresets(() => {
    setReady((value) => value + 1);
  }), []);

  useEffect(() => {
    if (sessions === null || sessions === undefined) return;
    const rows = sessions.byId === undefined || sessions.byId === null ? [] : Object.values(sessions.byId);
    const current = rows.find((row) => row !== null && row !== undefined
      && row.retainedBy !== undefined && (row.retainedBy.mainView ?? 0) > 0);
    if (current === undefined) return;
    const preset = current.projectionValues === undefined ? undefined : current.projectionValues.agentPreset;
    if (typeof preset !== 'string' || !duiRecommendedPresets.includes(preset)) return;
    const key = `${current.id}:${preset}`;
    if (shownKey.current === key) return;
    shownKey.current = key;
    if (duiPresetTipSuppressed()) return;
    setToday(false);
    setNever(false);
    setOpen(true);
  }, [sessions]);

  const close = () => {
    duiRememberPresetTip({ today, never });
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    duiFocus(confirmRef.current);
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      duiRememberPresetTip({ today, never });
      setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, today, never]);

  if (!open) return null;
  const option = (checked, label, onChange) => h('label', { className: 'dsui-tip-option' },
    h('input', {
      type: 'checkbox',
      checked,
      onChange: () => {
        onChange(!checked);
      },
    }),
    h('span', { className: 'dsui-tip-option-label' }, label));
  return h('div', { className: 'dsui-confirm-layer' },
    h('div', {
      className: 'dsui-confirm-backdrop',
      onClick: () => {
        close();
      },
    }),
    h('div', {
      className: 'dsui-confirm dsui-confirm--tip',
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': 'dsui-tip-title',
    },
    h('h3', { id: 'dsui-tip-title', className: 'dsui-confirm-title' }, t('presetTip.title')),
    h('p', { className: 'dsui-confirm-body' }, t('presetTip.body')),
    h('div', { className: 'dsui-tip-options' },
      option(today, t('presetTip.today'), setToday),
      option(never, t('presetTip.never'), setNever)),
    h('div', { className: 'dsui-confirm-actions' },
      h('button', {
        ref: confirmRef,
        type: 'button',
        className: 'dsui-confirm-button dsui-confirm-button--primary',
        onClick: () => {
          close();
        },
      }, t('presetTip.confirm')))));
}

/** Stand-in for the standard sessions hook when the overlay does not pass one. */
const DUI_NO_SESSIONS_HOOK = () => ({});

/**
 * Feedback surfaces: one confirmation dialog over the module-level request store
 * and the transient notices the session actions raise. They float above the
 * shipped Settings window too.
 */
function DuiFeedback(props) {
  const settings = props === undefined || props === null ? {} : props;
  const t = typeof settings.t === 'function' ? settings.t : (key) => key;
  const confirm = duiUseConfirm();
  const toasts = duiUseToasts();
  const confirmNode = confirm === null ? null : h(DuiConfirmDialog, { request: confirm, t });
  const toastNode = toasts.length === 0 ? null : h('div', { className: 'dsui-toasts', role: 'status', 'aria-live': 'polite' },
    toasts.map((toast) => h('div', { key: toast.id, className: duiCls('dsui-toast', toast.tone === 'error' && 'dsui-toast--error') }, toast.text)));
  if (confirmNode === null && toastNode === null) return null;
  return h(Fragment, null, confirmNode, toastNode);
}

/** One confirmation dialog over the module-level request store. */
function DuiConfirmDialog(props) {
  const request = props.request;
  const t = props.t;
  const confirmRef = useRef(null);
  useEffect(() => {
    duiFocus(confirmRef.current);
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      duiSettleConfirm(false);
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [request.id]);
  return h('div', { className: 'dsui-confirm-layer' },
    h('div', {
      className: 'dsui-confirm-backdrop',
      onClick: () => {
        duiSettleConfirm(false);
      },
    }),
    h('div', {
      className: 'dsui-confirm',
      role: 'alertdialog',
      'aria-modal': true,
      'aria-label': request.title,
    },
    h('h3', { className: 'dsui-confirm-title' }, request.title),
    request.body === '' ? null : h('p', { className: 'dsui-confirm-body' }, request.body),
    h('div', { className: 'dsui-confirm-actions' },
      h('button', {
        type: 'button',
        className: 'dsui-confirm-button',
        onClick: () => {
          duiSettleConfirm(false);
        },
      }, request.cancelLabel === undefined ? t('common.cancel') : request.cancelLabel),
      h('button', {
        ref: confirmRef,
        type: 'button',
        className: duiCls('dsui-confirm-button', request.danger ? 'dsui-confirm-button--danger' : 'dsui-confirm-button--primary'),
        onClick: () => {
          duiSettleConfirm(true);
        },
      }, request.confirmLabel))));
}

    // ---- src/client.js ----
/**
 * dsh-deepseek-ui client half: the plugin body (`apply`) and its Cordis `inject` list.
 *
 * Boot order matters: `dsh.client.inject` in package.json makes this module run
 * after ui-layout, ui-conversation, ui-workspace, ui-session, ui-settings, and
 * ui-theme, so every service and declaration this file touches already exists.
 *
 * Everything here is installed through `ctx.effect`, so disabling or
 * uninstalling the bundle removes the styles, the root attribute, the locale
 * dictionaries, and every registration with it.
 */

/** Locale namespace owned by this plugin. */
const DUI_NS = 'deepseekUi';

/** The plugin's own version, inlined by the build from package.json. */
const DUI_VERSION = DUI_VERSION_CONST;

/** Services this plugin needs before it may activate. */
const DUI_INJECT = ['slots', 'layout', 'locale', 'theme', 'uiWorkspace'];

/** The style element this plugin owns. */
const DUI_STYLE_ID = 'dsh-deepseek-ui-style';

/** Root attribute every skin selector is scoped under. */
const DUI_ROOT_ATTRIBUTE = 'data-dsui';

/**
 * Slot-level capability every `sidebar.workspaces` occupant needs: the shell
 * hands out the viewport scroller hook through the declaration. The shipped
 * shell declares exactly this face, and the shipped browser calls
 * `useSectionScroller()` unconditionally — without it the occupant throws on
 * its first render and abdicates.
 */
const DUI_SECTION_INJECT = Object.freeze({
  hooks: {
    sectionScroller: (_standard, hookContext) => {
      if (hookContext === undefined || typeof hookContext.useSectionScroller !== 'function') {
        throw new Error('the sidebar did not pass a section scroller hook context');
      }
      return hookContext.useSectionScroller;
    },
  },
});

/** Children re-declared by this plugin's `sidebar` entry (the shipped shell declared them). */
const DUI_SIDEBAR_CHILDREN = Object.freeze({
  'sidebar.brand.mark': { kind: 'single', scope: 'root' },
  'sidebar.brand.name': { kind: 'single', scope: 'root' },
  'sidebar.toggle.badge': { kind: 'single', scope: 'root' },
  'sidebar.panellist': { kind: 'list', scope: 'root' },
  'sidebar.panellist.actions': { kind: 'list', scope: 'root' },
  'sidebar.workspaces': { kind: 'single', scope: 'root', inject: DUI_SECTION_INJECT },
  'sidebar.settings': { kind: 'single', scope: 'root' },
  'sidebar.footer.action': { kind: 'list', scope: 'root' },
  'sidebar.session.action': { kind: 'hoc', scope: 'root' },
});

/** Flatten a nested locale file into the dotted-key dictionary the locale service stores. */
function duiFlattenLocale(source, prefix = '', out = {}) {
  if (source === null || typeof source !== 'object') return out;
  for (const key of Object.keys(source)) {
    const value = source[key];
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      duiFlattenLocale(value, path, out);
    } else if (typeof value === 'string') {
      out[path] = value;
    }
  }
  return out;
}

/** Build the dictionary map passed to `ctx.locale.register`. */
function duiLocaleDictionaries() {
  const out = {};
  for (const id of Object.keys(DUI_LOCALES)) {
    out[id] = duiFlattenLocale(DUI_LOCALES[id]);
  }
  return out;
}

/** Resolve the client services this plugin drives, tolerating a missing one. */
function duiServices(ctx) {
  const layout = duiGuard('layout service', () => ctx.get('layout'));
  const theme = duiGuard('theme service', () => ctx.get('theme'));
  const uiWorkspace = duiGuard('uiWorkspace service', () => ctx.get('uiWorkspace'));
  return {
    toggleSidebar() {
      if (layout !== undefined && layout !== null && typeof layout.toggleSidebar === 'function') layout.toggleSidebar();
    },
    selectPanel(panelId) {
      if (layout !== undefined && layout !== null && typeof layout.selectPanel === 'function') {
        duiGuard(`select panel "${panelId}"`, () => layout.selectPanel(panelId));
      }
    },
    startSession(workspaceId) {
      if (uiWorkspace !== undefined && uiWorkspace !== null && typeof uiWorkspace.startSession === 'function') {
        duiGuard('start session', () => uiWorkspace.startSession(workspaceId));
      }
    },
    getThemePreference() {
      if (theme === undefined || theme === null) return 'system';
      const snapshot = duiGuard('theme snapshot', () => theme.getTheme());
      return snapshot !== undefined && snapshot !== null && typeof snapshot.preference === 'string'
        ? snapshot.preference
        : 'system';
    },
    setLocale(localeId) {
      const locale = duiGuard('locale service', () => ctx.get('locale'));
      if (locale !== undefined && locale !== null && typeof locale.setLocale === 'function') {
        duiGuard(`set locale "${localeId}"`, () => locale.setLocale(localeId));
      }
    },
    setTheme(themeId) {
      if (theme !== undefined && theme !== null && typeof theme.setTheme === 'function') {
        duiGuard(`set theme "${themeId}"`, () => theme.setTheme(themeId));
      }
    },
  };
}

/**
 * Resolve where a new Session belongs: the current Session's Workspace, else the
 * most recently used one. Read straight from the Client models so callers that
 * have no Workspace snapshot (the collapsed window-chrome controls) can create a
 * conversation too.
 */
function duiResolveWorkspaceId(ctx) {
  const sessions = duiGuard('sessions service', () => ctx.get('sessions'));
  const workspaces = duiGuard('workspaces service', () => ctx.get('workspaces'));
  const list = sessions === undefined || sessions === null || sessions.list === undefined
    ? undefined
    : duiGuard('session list', () => sessions.list.getSnapshot());
  const workspaceList = workspaces === undefined || workspaces === null || workspaces.list === undefined
    ? undefined
    : duiGuard('workspace list', () => workspaces.list.getSnapshot());
  const items = workspaceList === undefined || !Array.isArray(workspaceList.items) ? [] : workspaceList.items;
  let currentId;
  if (list !== undefined && list !== null && list.byId !== undefined) {
    for (const id of Object.keys(list.byId)) {
      const row = list.byId[id];
      if (row !== undefined && row !== null && (row.retainedBy?.mainView ?? 0) > 0) {
        currentId = id;
        break;
      }
    }
  }
  const own = currentId === undefined
    ? undefined
    : items.find((item) => Array.isArray(item.sessionIds) && item.sessionIds.includes(currentId));
  const fallback = items.find((item) => Array.isArray(item.sessionIds) && item.sessionIds.length > 0) ?? items[0];
  return (own ?? fallback)?.workspaceId;
}

/** Readable text for a rejected action (Remote failures carry `message`). */
function duiErrorText(error) {
  if (error === null || error === undefined) return 'unknown error';
  if (typeof error.message === 'string' && error.message !== '') return error.message;
  return String(error);
}

/** Route the Host half publishes the fixed workspace on. */
const DUI_WORKSPACE_ROUTE = '/api/dsh-deepseek-ui/workspace';

/** The fixed workspace, read once per page; null when the Host half is absent. */
let duiWorkspaceInfo = null;

/** Preset ids the interface recommends (resolved by the Host roster). */
let duiRecommendedPresets = [];

/** Components waiting for the recommended-preset ids to resolve. */
const duiPresetListeners = new Set();

/**
 * Subscribe to the recommended-preset ids resolving.
 * @param listener - called once the ids are available.
 * @returns unsubscribe.
 */
function duiSubscribeRecommendedPresets(listener) {
  duiPresetListeners.add(listener);
  if (duiRecommendedPresets.length > 0) listener();
  return () => {
    duiPresetListeners.delete(listener);
  };
}
let duiWorkspaceRequest = null;

/**
 * Read the Host-published fixed workspace (cached for the page's lifetime).
 * @returns the resolved `{ path, source }`, or null when unavailable.
 */
function duiFixedWorkspace() {
  if (duiWorkspaceRequest === null) {
    duiWorkspaceRequest = fetch(DUI_WORKSPACE_ROUTE, { headers: { accept: 'application/json' } })
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => {
        duiWorkspaceInfo = value !== null && typeof value === 'object'
          && typeof value.path === 'string' && value.path !== '' ? value : null;
        duiRecommendedPresets = duiWorkspaceInfo !== null && Array.isArray(value.recommendedPresets)
          ? value.recommendedPresets.filter((id) => typeof id === 'string' && id !== '')
          : [];
        for (const listener of duiPresetListeners) {
          try {
            listener();
          } catch (error) {
            /* a listener's failure must not break the shared request */
          }
        }
        return duiWorkspaceInfo;
      })
      .catch(() => null);
  }
  return duiWorkspaceRequest;
}

/**
 * Register the fixed folder as a Workspace (Host-side idempotent) and return it.
 * @param ctx - Client context carrying the `workspaces` service.
 * @param path - the fixed workspace folder.
 * @returns the Workspace id, or undefined when registration is unavailable.
 */
async function duiFixedWorkspaceId(ctx, path) {
  const workspaces = duiGuard('workspaces service', () => ctx.get('workspaces'));
  if (workspaces === undefined || workspaces === null || typeof workspaces.create !== 'function') return undefined;
  try {
    const view = await workspaces.create({ path });
    return view !== null && typeof view === 'object' && typeof view.workspaceId === 'string'
      ? view.workspaceId
      : undefined;
  } catch (error) {
    duiWarn('fixed workspace registration failed', error);
    return undefined;
  }
}

/**
 * The session actions the demo sidebar drives, bound to the Host's own Client
 * services. Every call is contained: a refusal becomes a notice, never a
 * rejected promise inside a slot component.
 */
function duiSessionActions(ctx) {
  const sessions = duiGuard('sessions service', () => ctx.get('sessions'));
  const uiWorkspace = duiGuard('uiWorkspace service', () => ctx.get('uiWorkspace'));
  const settle = (label, work) => {
    try {
      const result = work();
      if (result !== null && typeof result === 'object' && typeof result.then === 'function') {
        return result.then(undefined, (error) => {
          duiWarn(label, error);
          duiToast(duiErrorText(error), 'error');
        });
      }
      return result;
    } catch (error) {
      duiWarn(label, error);
      duiToast(duiErrorText(error), 'error');
      return undefined;
    }
  };
  const requireWorkspace = () => {
    if (uiWorkspace === undefined || uiWorkspace === null) throw new Error('the workspace service is unavailable');
    return uiWorkspace;
  };
  /**
   * Create a fresh conversation, open it, and return its id.
   *
   * Every new conversation lives in the Host-published fixed folder and runs the
   * bundled DeepSeek-official preset; the caller's workspace hint still wins.
   * @param workspaceId - optional explicit Workspace (legacy callers only).
   * @returns the created session id.
   */
  const createNewConversation = async (workspaceId) => {
    if (sessions === undefined || sessions === null || typeof sessions.create !== 'function') {
      throw new Error('the session service cannot create sessions');
    }
    const fixed = workspaceId === undefined ? await duiFixedWorkspace() : null;
    if (fixed !== null) {
      const target = await duiFixedWorkspaceId(ctx, fixed.path);
      const base = target === undefined ? { cwd: fixed.path } : { workspaceId: target };
      const options = typeof fixed.agentPreset === 'string' && fixed.agentPreset !== ''
        ? { ...base, agentPreset: fixed.agentPreset }
        : base;
      const sessionId = await sessions.create(options);
      requireWorkspace().openSession(sessionId);
      return sessionId;
    }
    const target = workspaceId === undefined ? duiResolveWorkspaceId(ctx) : workspaceId;
    const sessionId = await sessions.create(target === undefined ? {} : { workspaceId: target });
    requireWorkspace().openSession(sessionId);
    return sessionId;
  };

  return {
    openSession(sessionId) {
      settle('open session', () => requireWorkspace().openSession(sessionId));
    },
    startSession(workspaceId) {
      settle('start session', () => requireWorkspace().startSession(workspaceId));
    },
    /**
     * Create a genuinely new conversation and open it.
     *
     * The shipped New Session path reuses a reusable blank Session in the
     * Workspace, so a second press can leave the sidebar looking unchanged.
     * `sessions.create` without a `sessionId` always creates a fresh Session.
     */
    createSession(workspaceId) {
      return settle('create session', () => createNewConversation(workspaceId));
    },
    renameSession(sessionId, title) {
      return settle('rename session', () => {
        if (sessions === undefined || sessions === null) throw new Error('the session service is unavailable');
        const result = sessions.using(sessionId, { source: 'workspaceOperation' },
          (reference) => reference.binding.session.rename(title));
        return result.then((outcome) => {
          if (outcome.ok !== true) throw new Error(outcome.error.message);
        });
      });
    },
    pinSession(sessionId) {
      return settle('pin session', () => requireWorkspace().pinSession(sessionId));
    },
    unpinSession(sessionId) {
      return settle('unpin session', () => requireWorkspace().unpinSession(sessionId));
    },
    archiveSession(sessionId, stopActivity) {
      return settle('archive session', () => requireWorkspace().archiveSession(
        sessionId,
        stopActivity === true ? { stopActivity: true } : {},
      ));
    },
    unarchiveSession(sessionId) {
      return settle('unarchive session', () => requireWorkspace().unarchiveSession(sessionId));
    },
    deleteSession(sessionId) {
      return settle('delete session', async () => {
        const request = async (path) => {
          const response = await fetch(path, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          let payload = null;
          try {
            payload = await response.json();
          } catch {
            payload = null;
          }
          return { response, payload };
        };
        // The plugin's own Host half carries the cascade; the optional
        // session-delete bundle is only a fallback for an older build.
        let outcome = await request('/api/dsh-deepseek-ui/session-delete');
        if (outcome.response.status === 404 && outcome.payload === null) {
          outcome = await request('/api/session-delete.delete');
        }
        if (outcome.response.ok) {
          // The deleted conversation leaves an empty view; start the next one.
          await createNewConversation();
          return;
        }
        const code = outcome.payload === null ? undefined : outcome.payload.error;
        const message = outcome.payload === null ? undefined : outcome.payload.message;
        if (outcome.response.status === 404 && outcome.payload === null) {
          throw new Error('删除功能不可用：请更新 DeepSeek UI 插件');
        }
        throw new Error(code === 'session/delete-active'
          ? '会话仍在运行，先停止它再删除'
          : (typeof message === 'string' && message !== '' ? message : `delete failed (${outcome.response.status})`));
      });
    },
  };
}

/**
 * Read the selectable UI languages from the locale service.
 *
 * Read-only list plus the active id; switching goes through `setLocale`, the
 * same preference the shipped Language row writes.
 */
function duiLocaleState(ctx) {
  const locale = duiGuard('locale service', () => ctx.get('locale'));
  if (locale === undefined || locale === null || typeof locale.getLocale !== 'function') {
    return { active: '', locales: [] };
  }
  const snapshot = duiGuard('locale snapshot', () => locale.getLocale());
  if (snapshot === undefined || snapshot === null) return { active: '', locales: [] };
  const names = { zh: '简体中文', en: 'English', ja: '日本語', es: 'Español', fr: 'Français', de: 'Deutsch', ru: 'Русский', pt: 'Português' };
  const locales = Array.isArray(snapshot.locales)
    ? snapshot.locales.map((row) => ({
      id: String(row.id),
      label: typeof row.displayName === 'string' && row.displayName !== ''
        ? row.displayName
        : (names[String(row.id)] ?? String(row.id)),
    }))
    : [];
  return { active: typeof snapshot.active === 'string' ? snapshot.active : '', locales };
}

/**
 * Read the live shortcut catalog for the settings window.
 *
 * Read-only: the plugin lists what the host's shortcut registry already binds,
 * and sends users to the host dialog for editing.
 */
function duiShortcutRows(ctx) {
  const shortcuts = duiGuard('shortcuts service', () => ctx.get('shortcuts'));
  if (shortcuts === undefined || shortcuts === null || shortcuts.catalog === undefined) return [];
  const rows = duiGuard('shortcut catalog', () => shortcuts.catalog.getSnapshot());
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row) => Array.isArray(row.keys) && row.keys.length > 0)
    .map((row) => ({ id: String(row.id), label: typeof row.label === 'string' ? row.label : String(row.id), keys: row.keys }))
    .sort((left, right) => left.label.localeCompare(right.label))
    .slice(0, 16);
}

/**
 * Read the registered global panels from the live slot registry.
 *
 * `sidebar.panellist` is the only shipped list that carries a panel's id, label,
 * order, and icon component, so the sheet is built from it rather than from a
 * hard-coded six-entry table: a plugin that registers a panel after boot shows
 * up on the next open.
 */
function duiPanelRows(ctx) {
  const rows = [];
  const entries = duiSlotEntries(ctx, 'sidebar.panellist');
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const options = entry === null || entry === undefined || entry.options === undefined ? {} : entry.options;
    const id = options.id;
    if (typeof id !== 'string' || id === '') continue;
    const label = duiResolveLabel(options.label);
    rows.push({
      id,
      label: label === undefined ? id : label,
      order: typeof options.order === 'number' ? options.order : 0,
      index,
      icon: entry.component,
    });
  }
  rows.sort((left, right) => (left.order - right.order) || (left.index - right.index));
  return rows;
}

/** The app's generation caveat, rendered under the composer card. */
function DuiCaveat(props) {
  const settings = props === undefined || props === null ? {} : props;
  const t = typeof settings.t === 'function' ? settings.t : (key) => key;
  return h('p', { className: 'dsui-caveat' }, t('composerCaveat'));
}

/** Install the plugin: styles, root attribute, locale, and every seat. */
function DUIApply(ctx) {
  const services = duiServices(ctx);

  // 1. Styles first: they must land before the frame's first paint so the
  //    column never flashes the shipped sidebar shape.
  const disposeStyle = duiGuard('style injection', () =>
    ctx.effect(() => duiInjectStyle(DUI_STYLE_ID, DUI_CSS), 'dsh-deepseek-ui: styles'));
  if (disposeStyle === undefined) duiWarn('style injection', new Error('ctx.effect is missing'));

  // 2. Root attribute: every skin selector is scoped under it, so disabling the
  //    plugin restores the shipped CSS without a trace.
  duiGuard('root attribute', () => ctx.effect(() => {
    const root = document.documentElement;
    root.setAttribute(DUI_ROOT_ATTRIBUTE, '');
    return () => {
      root.removeAttribute(DUI_ROOT_ATTRIBUTE);
    };
  }, 'dsh-deepseek-ui: root attribute'));

  // 3. Dictionaries: visible copy for the shell and the sheet.
  duiGuard('locale registration', () => ctx.effect(() => {
    const locale = ctx.locale === undefined ? ctx.get('locale') : ctx.locale;
    if (locale === undefined || locale === null || typeof locale.register !== 'function') {
      throw new Error('the locale service is unavailable');
    }
    return locale.register(DUI_NS, duiLocaleDictionaries());
  }, 'dsh-deepseek-ui: dictionaries'));

  // 4. Panel registry reader for the sheet (live read, cached per open).
  duiSetPanelReader(() => duiPanelRows(ctx));

  // 5. The sidebar shell. `ctx.slots.inject` waits for the frame's declaration,
  //    so this works whichever order the bundles activate in. The shell draws
  //    the session list itself, so it receives the session action surface.
  const sessionActions = duiSessionActions(ctx);
  duiMountSlot(ctx, 'sidebar', () => duiRegister(ctx, {
    name: 'sidebar',
    locale: DUI_NS,
    children: DUI_SIDEBAR_CHILDREN,
    inject: () => ({
      ...sessionActions,
      toggleSidebar: () => services.toggleSidebar(),
      selectPanel: (panelId) => services.selectPanel(panelId),
    }),
  }, DuiSidebar));

  // 5b. No workspace chooser: every new conversation runs in the Host's fixed
  //     folder, so the blank-session picker is shadowed by an empty seat.
  duiMountSlot(ctx, 'conversation.hero.workspace', () => duiRegister(ctx, {
    name: 'conversation.hero.workspace',
  }, () => null));

  // 6. Window-chrome / drawer controls: the shipped shell owned the reopen
  //    controls, and the frame renders this seat only while the column is hidden.
  duiMountSlot(ctx, 'shell.leading', () => duiRegister(ctx, {
    name: 'shell.leading',
    locale: DUI_NS,
    inject: () => ({
      toggleSidebar: () => services.toggleSidebar(),
      startSession: (workspaceId) => services.startSession(workspaceId),
      createSession: (workspaceId) => sessionActions.createSession(workspaceId),
    }),
  }, DuiShellLeading));

  // 6b. Composer markers: the shipped tool row has no stable per-control hook,
  //     so the primary control and model chip are tagged for the demo skin.
  duiGuard('composer markers', () => ctx.effect(() => duiWatchComposer(), 'dsh-deepseek-ui: composer markers'));

  // 6b-2. Recommended presets lead the mode picker, with their 推荐 badge.
  duiGuard('preset menu decoration', () => ctx.effect(() => duiWatchMenus(), 'dsh-deepseek-ui: preset menu decoration'));

  // 6c. The generation caveat under the composer, as the app shows it.
  duiMountSlot(ctx, 'conversation.composer.dock', () => duiRegister(ctx, {
    name: 'conversation.composer.dock',
    id: 'deepseek-ui-caveat',
    order: 90,
    locale: DUI_NS,
  }, DuiCaveat));

  // 7. This plugin's own page inside the shipped Settings window, and the
  //    feedback surfaces that float above every column.
  const bind = duiGuard('locale bind', () => ctx.locale.bind(DUI_NS));
  const t = typeof bind === 'function' ? bind : (key) => key;
  duiMountSlot(ctx, 'settings.section.icon', () => duiRegister(ctx, {
    name: 'settings.section.icon',
    id: 'deepseek-ui',
    order: -20,
  }, () => h(DuiFishLogo, { size: 16 })));
  duiMountSlot(ctx, 'settings.section', () => duiRegister(ctx, {
    name: 'settings.section',
    id: 'deepseek-ui',
    order: -20,
    locale: DUI_NS,
    label: () => t('settingsTitle'),
    inject: () => ({
      selectPanel: (panelId) => services.selectPanel(panelId),
      getPanels: () => duiPanelRows(ctx),
      getShortcuts: () => duiShortcutRows(ctx),
      getLocales: () => duiLocaleState(ctx),
      setLocale: (id) => services.setLocale(id),
      getThemePreference: () => services.getThemePreference(),
      setTheme: (themeId) => services.setTheme(themeId),
      version: DUI_VERSION,
    }),
  }, DuiSettingsSection));
  duiMountSlot(ctx, 'shell.overlay', () => duiRegister(ctx, {
    name: 'shell.overlay',
    id: 'deepseek-ui-feedback',
    order: 100,
    locale: DUI_NS,
  }, DuiFeedback));

  // The preset recommendation tip rides above the feedback surface.
  duiMountSlot(ctx, 'shell.overlay', () => duiRegister(ctx, {
    name: 'shell.overlay',
    id: 'deepseek-ui-preset-tip',
    order: 110,
    locale: DUI_NS,
  }, DuiPresetTip));

  // Undo transcript re-anchor jumps while a turn streams.
  ctx.effect(() => duiWatchScrollGuard(), 'dsh-deepseek-ui: scroll guard');

  // 8. The fixed workspace: read it once, label the (now static) hero chip with
  //    it, and tell the user when the Documents folder was not usable.
  duiGuard('fixed workspace labels', () => {
    void duiFixedWorkspace().then((info) => {
      if (info === null) return;
      const label = t('workspace.fixedLabel');
      const title = info.path.split(/[\\/]/).filter((part) => part !== '').pop() ?? '';
      duiSetWorkspaceChip({ label, hint: `${label} · ${info.path}`, title });
      if (info.source === 'profile') duiToast(`${t('workspace.profileFallback')} ${info.path}`, 'error');
    });
  });
}

    return { inject: DUI_INJECT, apply: DUIApply };
  },
});
