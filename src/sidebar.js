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
