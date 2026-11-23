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
