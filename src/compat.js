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
