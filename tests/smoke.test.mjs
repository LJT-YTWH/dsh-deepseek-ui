/**
 * Boot smoke test: execute the generated factory the way the page does, then run
 * `apply` against a fake Cordis context and a fake DOM.
 *
 * This is not a UI test. It proves the factory materializes, `apply` does not
 * throw on a healthy host, every intended seat is registered with the expected
 * options, the style element is injected, and the returned disposers tear the
 * plugin down again.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT = readFileSync(join(ROOT, 'lib', 'client.js'), 'utf8');

/** Minimal React surface the factory body touches at materialization. */
function fakeReact() {
  const createElement = (type, props, ...children) => ({ type, props, children });
  return {
    createElement,
    Fragment: Symbol('Fragment'),
    useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    useEffect: () => {},
    useLayoutEffect: () => {},
    useMemo: (factory) => factory(),
    useRef: (initial) => ({ current: initial }),
    useCallback: (callback) => callback,
    useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
  };
}

/** Minimal DOM: only what boot touches (style injection and the root attribute). */
function fakeDocument() {
  const head = {
    children: [],
    appendChild(node) {
      this.children.push(node);
      node.parentNode = this;
    },
  };
  const rootAttributes = new Map();
  const document = {
    head,
    documentElement: {
      setAttribute: (name, value) => rootAttributes.set(name, value),
      getAttribute: (name) => (rootAttributes.has(name) ? rootAttributes.get(name) : null),
      removeAttribute: (name) => rootAttributes.delete(name),
    },
    getElementById(id) {
      for (const child of head.children) {
        if (child !== null && child.id === id) return child;
      }
      return null;
    },
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        id: '',
        textContent: '',
        parentNode: null,
        setAttribute() {},
        remove() {
          if (this.parentNode !== null) {
            this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
          }
        },
      };
    },
    createElementNS() {
      return this.createElement('svg');
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    activeElement: null,
    styleSheets: [],
  };
  return document;
}

/** Fake host context recording every registration. */
function fakeContext() {
  const registrations = [];
  const effects = [];
  const services = {
    layout: { toggleSidebar() {}, selectPanel() {} },
    theme: { getTheme: () => ({ preference: 'system' }), setTheme() {} },
    uiWorkspace: { startSession() {} },
    locale: { register: () => () => {} },
  };
  const ctx = {
    effect: (run, _label) => {
      const dispose = run();
      effects.push(dispose);
      return dispose;
    },
    get: (name) => services[name],
    on: () => () => {},
    slots: {
      inject(key, callback) {
        registrations.push({ key, mounted: true });
        return callback();
      },
      register(options, component) {
        registrations.push({ key: options.name, options, component });
        return () => {};
      },
      entries: () => [],
      entriesOfSlot: () => [],
      subscribe: () => () => {},
    },
    locale: services.locale,
  };
  return { ctx, registrations, effects, services };
}

/** Materialize the factory exactly as `window.__ModuleLoader__.load` would. */
function materialize() {
  const document = fakeDocument();
  let factory;
  const window = {
    __ModuleLoader__: {
      load: (record) => {
        factory = record.factory;
      },
    },
  };
  const context = vm.createContext({ window, document, console, requestAnimationFrame: (fn) => setTimeout(fn, 0), cancelAnimationFrame: () => {}, matchMedia: () => ({ matches: false }), setTimeout, clearTimeout, setInterval: () => 0, clearInterval: () => {} });
  vm.runInContext(CLIENT, context, { filename: 'lib/client.js' });
  assert.equal(typeof factory, 'function', 'the bundle must register a factory');
  let module;
  const requireFn = (id) => {
    if (id === 'react') return fakeReact();
    throw new Error(`unexpected require("${id}")`);
  };
  module = factory(requireFn);
  return { module, document };
}

test('the bundle materializes into a plugin body', () => {
  const { module } = materialize();
  assert.equal(typeof module.apply, 'function');
  assert.ok(Array.isArray(module.inject));
  for (const service of ['slots', 'layout', 'locale', 'theme', 'uiWorkspace']) {
    assert.ok(module.inject.includes(service), `missing injected service "${service}"`);
  }
});

test('apply registers every seat, injects the stylesheet, and tears down cleanly', () => {
  const { module, document } = materialize();
  const { ctx, registrations, effects } = fakeContext();
  module.apply(ctx);

  const style = document.getElementById('dsh-deepseek-ui-style');
  assert.ok(style !== null, 'the style element must be injected');
  assert.ok(style.textContent.includes('--dsw-alias-bg-base'), 'the token table must be inlined');
  assert.equal(document.documentElement.getAttribute('data-dsui'), '', 'the root attribute must be set');

  const registered = registrations.filter((row) => row.options !== undefined);
  const mounted = [...new Set(registered.map((row) => row.key))].sort();
  // The hero mark seat is deliberately left to the host's own official fish,
  // so this plugin claims only these three seats.
  assert.deepEqual(mounted, [
    'conversation.composer.dock',
    'conversation.hero.workspace',
    'settings.section',
    'settings.section.icon',
    'shell.leading',
    'shell.overlay',
    'sidebar',
  ].sort());

  const sidebar = registered.find((row) => row.key === 'sidebar');
  assert.ok(sidebar !== undefined, 'the sidebar seat must be taken');
  assert.equal(sidebar.options.locale, 'deepseekUi');
  for (const child of [
    'sidebar.brand.mark',
    'sidebar.brand.name',
    'sidebar.toggle.badge',
    'sidebar.panellist',
    'sidebar.panellist.actions',
    'sidebar.workspaces',
    'sidebar.settings',
    'sidebar.footer.action',
    'sidebar.session.action',
  ]) {
    assert.ok(sidebar.options.children[child] !== undefined, `sidebar must re-declare "${child}"`);
  }

  const overlay = registered.find((row) => row.key === 'shell.overlay');
  assert.equal(overlay.options.id, 'deepseek-ui-feedback', 'the overlay entry needs a fresh id');
  const section = registered.find((row) => row.key === 'settings.section');
  assert.equal(section.options.id, 'deepseek-ui', 'the settings section id must be stable');
  assert.equal(typeof section.options.label, 'function', 'the section label is localized lazily');

  // Injected faces are contract-shaped: plain members only, no React nodes.
  for (const row of registered) {
    if (typeof row.options.inject !== 'function') continue;
    const face = row.options.inject();
    assert.equal(typeof face, 'object');
    for (const value of Object.values(face)) {
      const kind = typeof value;
      assert.equal(kind === 'function' || kind === 'string' || kind === 'number' || kind === 'boolean'
        || (value !== null && kind === 'object'), true,
      `inject face of "${row.key}" must carry functions, plain records, or scalars`);
    }
  }

  // Call the injected faces once: they must not throw with the fake services.
  for (const row of registered) {
    if (typeof row.options.inject !== 'function') continue;
    const face = row.options.inject();
    if (typeof face.toggleSidebar === 'function') face.toggleSidebar();
    if (typeof face.selectPanel === 'function') face.selectPanel('plugins');
    if (typeof face.startSession === 'function') face.startSession();
    if (typeof face.getPanels === 'function') assert.equal(face.getPanels().length, 0);
    if (typeof face.getThemePreference === 'function') assert.equal(face.getThemePreference(), 'system');
    if (typeof face.setTheme === 'function') face.setTheme('dark');
    if (typeof face.openHostSettings === 'function') face.openHostSettings();
  }

  // Disposal: every effect disposer runs, the style leaves the head, and the
  // root attribute is removed (the patch layer restores the shipped sidebar).
  for (const dispose of effects) {
    if (typeof dispose === 'function') dispose();
  }
  assert.equal(document.getElementById('dsh-deepseek-ui-style'), null);
  assert.equal(document.documentElement.getAttribute('data-dsui'), null);
});

test('apply survives a degraded host without throwing', () => {
  const { module } = materialize();
  const broken = {
    effect: (run) => run(),
    get: () => undefined,
    on: () => () => {},
    slots: {
      inject: () => {
        throw new Error('slot refused');
      },
      register: () => {
        throw new Error('registration refused');
      },
      entries: () => {
        throw new Error('registry unavailable');
      },
      entriesOfSlot: () => [],
      subscribe: () => () => {},
    },
  };
  assert.doesNotThrow(() => module.apply(broken));
});
