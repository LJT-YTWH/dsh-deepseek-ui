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
