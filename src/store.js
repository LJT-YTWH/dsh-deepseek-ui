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
