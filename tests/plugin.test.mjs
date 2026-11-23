/**
 * Contract tests for the dsh-deepseek-ui bundle.
 *
 * These are static checks over the packaged sources and the generated client
 * factory: they catch the failure modes a UI plugin cannot recover from at
 * runtime (a missing export, a malformed factory, an unscoped stylesheet, a
 * patch that does not own the sidebar). They deliberately do not boot a browser.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// The built Host half: its pure helpers are the only part a test can call
// without booting a Host context.
const { workspaceCandidates, workspacePromptText, legacyWorkspacePath, userHome, ensureBundledPresets, BUNDLED_PRESETS, isSessionId } = await import('../lib/index.js');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const clientSource = readFileSync(join(ROOT, 'lib', 'client.js'), 'utf8');

/** Read a package-relative file. */
const read = (relative) => readFileSync(join(ROOT, relative), 'utf8');

/** Strip CSS comments so structural checks see only rules. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

test('manifest declares the bundle patch, the client half, and display metadata', () => {
  assert.equal(pkg.type, 'module');
  assert.deepEqual(pkg.dsh.bundle.patch, ['./cordis.patch.yml']);
  assert.equal(pkg.dsh.client.platform, 'web');
  assert.equal(pkg.dsh.client.immediately, true);
  assert.ok(Array.isArray(pkg.dsh.client.inject) && pkg.dsh.client.inject.length > 0,
    'the client must run after the shell packages it extends');
  for (const subpath of ['.', './client', './package.json', './cordis.patch.yml', './locale/*.json', './icon']) {
    assert.ok(pkg.exports[subpath] !== undefined, `missing export "${subpath}"`);
  }
  assert.equal(pkg.icon, './icon.svg');
  for (const entry of ['lib', 'src', 'scripts', 'locale', 'cordis.patch.yml', 'icon.svg']) {
    assert.ok(pkg.files.includes(entry), `files[] must ship "${entry}"`);
  }
  assert.ok(pkg.files.some((entry) => entry === 'docs' || entry.startsWith('docs/')),
    'files[] must ship the documentation');
  assert.equal(pkg.files.some((entry) => entry.endsWith('.png') || entry.includes('preview')), false,
    'screenshots are never shipped');
});

test('the patch disables the shipped sidebar and inserts this package', () => {
  const patch = read('cordis.patch.yml');
  assert.match(patch, /- id: ui-sidebar\n\s+disabled: true/, 'ui-sidebar must be disabled first');
  const insertIndex = patch.indexOf('- insert:');
  assert.ok(insertIndex > 0, 'the patch must insert this bundle');
  const tail = patch.slice(insertIndex);
  assert.match(tail, new RegExp(`name: '?${pkg.name}'?`), 'the inserted row must name this package');
});

test('the locale files carry complete display metadata and shell copy', () => {
  for (const id of ['en', 'zh']) {
    const dict = JSON.parse(read(`locale/${id}.json`));
    assert.equal(typeof dict.meta.title, 'string');
    assert.equal(dict.meta.title.length > 0, true);
    assert.equal(dict.meta.description.length > 20, true);
    assert.equal(dict.meta.detail, 'docs/DETAIL.md');
    assert.equal(typeof dict.sidebar.newSession, 'string');
    assert.equal(typeof dict.sidebar.settings, 'string');
    assert.equal(typeof dict.sheet.title, 'string');
    assert.equal(typeof dict.sheet.openHostSettings, 'string');
  }
});

test('the detail document and icon exist and are within limits', () => {
  const detail = read('docs/DETAIL.md');
  assert.ok(detail.length > 500, 'the detail document must say what the plugin does');
  assert.ok(detail.length <= 1024 * 1024, 'detail document must stay under the 1 MiB limit');
  assert.ok(existsSync(join(ROOT, 'icon.svg')));
  assert.ok(statSync(join(ROOT, 'icon.svg')).size <= 256 * 1024);
  const icon = read('icon.svg');
  assert.match(icon, /<svg[\s\S]*<\/svg>/);
  assert.match(icon, /viewBox="0 0 64 64"/);
});

test('the generated client is one lazy CommonJS factory with an apply body', () => {
  assert.match(clientSource, /window\.__ModuleLoader__\.load\(/);
  const idMatch = clientSource.match(/id: "([^"]+)"/);
  assert.equal(idMatch === null ? undefined : idMatch[1], pkg.name,
    'the lazy factory id must equal the package name');
  assert.match(clientSource, /factory\(require\)/);
  assert.match(clientSource, /return \{ inject: DUI_INJECT, apply: DUIApply \}/);
  assert.doesNotThrow(() => new vm.Script(clientSource, { filename: 'lib/client.js' }));
});

test('the client declaration order matches the generated factory id', () => {
  const declared = JSON.parse(read('package.json'));
  assert.equal(declared.name, 'dsh-deepseek-ui');
  assert.match(clientSource, /id: "dsh-deepseek-ui"/);
});

test('source modules are plain snippets in factory order with client.js last', () => {
  const build = read('scripts/build.mjs');
  const modulesBlock = build.slice(build.indexOf('const MODULES = ['), build.indexOf('];', build.indexOf('const MODULES = [')));
  const modules = [...modulesBlock.matchAll(/'([^']+\.js)'/g)].map((match) => match[1]);
  assert.ok(modules.length >= 5);
  assert.equal(modules[modules.length - 1], 'client.js');
  for (const name of modules) {
    const code = read(`src/${name}`);
    assert.doesNotMatch(code, /^\s*(import|export)\s/m, `src/${name} must not use module syntax`);
    assert.doesNotMatch(code, /<\/script/, `src/${name} must not contain a literal </script`);
  }
});

test('every stylesheet is scoped under the plugin root attribute', () => {
  const stylesheets = ['theme.css', 'base.css', 'sidebar.css', 'sheet.css', 'chat.css', 'composer.css', 'hero.css'];
  for (const name of stylesheets) {
    const css = stripComments(read(`src/${name}`));
    assert.doesNotMatch(css, /@import/, `src/${name} must not use @import`);
    assert.doesNotMatch(css, /&/, `src/${name} must not use CSS nesting`);
    assert.doesNotMatch(css, /\.[A-Za-z][A-Za-z0-9]*_[a-z0-9]{5,}_\d+/, `src/${name} must not hard-code hashed host classes`);
    assert.equal(balance(css), 0, `src/${name} braces must balance`);
    for (const selector of topLevelSelectors(css)) {
      if (selector.startsWith('@') || selector === 'from' || selector === 'to' || /^\d+%$/.test(selector)) continue;
      assert.match(selector, /^html\[data-dsui\]/, `selector "${selector}" in src/${name} is not scoped`);
    }
  }
});

/** Brace balance of a stylesheet. */
function balance(css) {
  let depth = 0;
  for (const char of css) {
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
  }
  return depth;
}

/** Selector preambles of rules, including ones nested in at-rules. */
function topLevelSelectors(css) {
  const out = [];
  const re = /(^|})([^{}]+)\{/g;
  for (const match of css.matchAll(re)) {
    const selector = match[2].trim().replace(/\s+/g, ' ');
    if (selector !== '') out.push(selector);
  }
  return out;
}

test('the token stylesheet re-declares both palettes', () => {
  const theme = read('src/theme.css');
  assert.match(theme, /html\[data-dsui\] body \{/, 'light palette block missing');
  assert.match(theme, /html\[data-dsui\] body\[data-ds-dark-theme\] \{/, 'dark palette block missing');
  for (const token of ['--dsw-alias-bg-base', '--dsw-alias-label-primary', '--dsw-specific-sidebar-fill', '--dsw-alias-brand-primary']) {
    const count = theme.split(token).length - 1;
    assert.ok(count >= 2, `token ${token} must be set for both palettes`);
  }
});

test('every localized string the client asks for exists in both dictionaries', () => {
  const sources = ['compat.js', 'sidebar.js', 'sheet.js', 'hero.js', 'client.js']
    .map((name) => read(`src/${name}`))
    .join('\n');
  const requested = new Set();
  for (const match of sources.matchAll(/\bt\('([A-Za-z0-9_.]+)'\)/g)) requested.add(match[1]);
  assert.ok(requested.size > 8, 'the client should localize its visible copy');
  const flatten = (source, prefix = '') => {
    const out = {};
    for (const key of Object.keys(source)) {
      const value = source[key];
      const path = prefix === '' ? key : `${prefix}.${key}`;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(out, flatten(value, path));
      } else if (typeof value === 'string') {
        out[path] = value;
      }
    }
    return out;
  };
  for (const id of ['en', 'zh']) {
    const dictionary = flatten(JSON.parse(read(`locale/${id}.json`)));
    for (const key of requested) {
      assert.equal(typeof dictionary[key], 'string', `locale/${id}.json is missing "${key}"`);
    }
  }
});


test('the patch trims permission presets to read-only and full access', () => {
  const patch = read('cordis.patch.yml');
  assert.match(patch, /- id: permission\n\s+name: '@deepseek-ai\/dsh-permission-presets'/, 'the permission row must be overridden');
  assert.match(patch, /\n\s+read-only:/, 'read-only must stay available');
  assert.match(patch, /\n\s+danger-full-access:/, 'full access must stay available');
  assert.doesNotMatch(patch, /workspace-write:\n\s+sandbox/, 'workspace-write must not be a preset');
  assert.match(patch, /defaultPreset: read-only/, 'new sessions must start read-only');
});


test('the workspace lives in the user Documents folder, never in the install tree', () => {
  const candidates = workspaceCandidates(undefined, '/opt/DeepSeek Harness/deepseek', { HOME: '/home/me', DSH_HOME: '/home/me/.dsh' });
  assert.deepEqual(candidates, [
    { path: '/home/me/Documents/DeepSeekHarnessWorkspace', source: 'documents' },
    { path: '/home/me/.dsh/workspace', source: 'profile' },
  ]);
  assert.equal(candidates.some((row) => row.path.startsWith('/opt/DeepSeek Harness')), false,
    'an application update must not be able to replace the workspace');
  assert.deepEqual(workspaceCandidates({ workspaceDir: '/data/ws' }, '/opt/x', {}), [
    { path: '/data/ws', source: 'config' },
  ]);
  assert.equal(userHome({ USERPROFILE: 'C:/Users/me' }), 'C:/Users/me', 'Windows uses USERPROFILE');
  assert.equal(legacyWorkspacePath('/opt/app/deepseek'), '/opt/app/DeepSeekHarnessWorkspace');
});

test('the fixed-workspace prompt section states the whole situation in English', () => {
  const text = workspacePromptText('/home/me/Documents/DeepSeekHarnessWorkspace', 'documents');
  assert.match(text, /Fixed workspace/);
  assert.match(text, /\/home\/me\/Documents\/DeepSeekHarnessWorkspace/);
  assert.match(text, /outside the DeepSeek Harness installation/);
  assert.match(text, /application update cannot replace it/);
  assert.match(text, /Do not ask the user to choose or switch a workspace/);
  assert.match(text, /explicit consent/);
  assert.match(text, /ask the user where they want files created or where they expect to find and view them/);
  assert.doesNotMatch(text, /[\u4e00-\u9fff]/, 'the injected prompt is English only');
  assert.match(workspacePromptText('/x', 'profile'), /configuration directory \(DSH_HOME\)/);
});

test('the prompt lets the model guide file locations without moving the deployment', () => {
  const text = workspacePromptText('/ws', 'profile');
  assert.match(text, /user-guided/);
  assert.match(text, /configuration directory \(DSH_HOME\)/);
  assert.match(text, /that operation only/);
});


test('the bundled presets are the two DeepSeek-official compositions', () => {
  assert.deepEqual(BUNDLED_PRESETS.map((row) => row.id), ['mode-mc2kfu', 'mode-m5ni1w']);
  assert.deepEqual(BUNDLED_PRESETS.map((row) => row.name), ['官网-纯聊天', '官网-可干活']);
  for (const preset of BUNDLED_PRESETS) {
    assert.equal(typeof preset.plugins, 'object');
    assert.ok(Array.isArray(preset.plugins) && preset.plugins.length > 0, 'a preset needs its composition');
  }
});

test('a registry that already declares the presets is left alone', async () => {
  const rows = [
    { id: 'standard', name: 'Standard' },
    { id: 'mode-mc2kfu', name: '官网-纯聊天', isDefault: true },
    { id: 'mode-m5ni1w', name: '官网-可干活' },
  ];
  const registered = [];
  const ctx = { get: () => ({ list: async () => rows, register: async (definition) => { registered.push(definition); } }) };
  const resolved = await ensureBundledPresets(ctx);
  assert.equal(resolved.presetId, 'mode-mc2kfu');
  assert.deepEqual(resolved.recommended, ['mode-mc2kfu', 'mode-m5ni1w']);
  assert.deepEqual(registered, [], 'existing presets must not be registered twice');
});

test('a bare registry receives both presets and the chat preset stays preferred', async () => {
  const rows = [{ id: 'standard', name: 'Standard' }];
  const registered = [];
  const ctx = {
    get: () => ({
      list: async () => rows,
      register: async (definition) => {
        registered.push(definition.id);
        rows.push({ id: definition.id, name: definition.name });
        return async () => {};
      },
    }),
  };
  const resolved = await ensureBundledPresets(ctx);
  assert.deepEqual(registered, ['mode-mc2kfu', 'mode-m5ni1w']);
  assert.equal(resolved.presetId, 'mode-mc2kfu');
  assert.deepEqual(resolved.recommended, ['mode-mc2kfu', 'mode-m5ni1w']);
});

test('a preset present under its display name blocks the bundled copy', async () => {
  const rows = [{ id: 'custom-chat', name: '官网-纯聊天' }];
  const registered = [];
  const ctx = { get: () => ({ list: async () => rows, register: async (definition) => { registered.push(definition.id); rows.push({ id: definition.id, name: definition.name }); } }) };
  const resolved = await ensureBundledPresets(ctx);
  // The bundled 官网-纯聊天 copy is skipped; the other one is still added.
  assert.deepEqual(registered, ['mode-m5ni1w']);
  assert.equal(resolved.presetId, 'custom-chat');
  assert.deepEqual(resolved.recommended, ['custom-chat', 'mode-m5ni1w']);
});


test('the mode picker only badges the official presets, it never reorders rows', () => {
  const compat = read('src/compat.js');
  assert.match(compat, /推荐/);
  assert.match(compat, /dsui-recommend/);
  assert.doesNotMatch(compat, /menu\.prepend|insertBefore\(/, 'row order must stay the host roster order');
});

test('the recommended tag is a brand-tinted chip, not a solid pill', () => {
  const css = read('src/base.css');
  assert.match(css, /\.dsui-recommend\s*\{/);
  assert.match(css, /color-mix\(in srgb, var\(--dsw-alias-brand-primary\)/);
  assert.match(css, /border-radius: 4px/);
  assert.match(css, /height: 14px/, 'the tag stays a compact inline chip');
  assert.doesNotMatch(css, /\.dsui-recommend\s*\{[^}]*background: var\(--dsw-alias-brand-primary\);/);
});


test('Windows desktop keeps the full leading control set and its clearance', () => {
  const sidebar = read('src/sidebar.js');
  assert.match(sidebar, /duiIsWindowsDesktop/);
  assert.match(sidebar, /data-windows-titlebar/);
  assert.match(sidebar, /if \(!darwin && !windows\)/, 'the single-opener fallback is web-only');
  const css = read('src/sidebar.css');
  assert.match(css, /data-platform='win32'/, 'windows collapsed chrome needs its own clearance selector');
  assert.match(css, /--dsh-frame-leading-clearance: 148px/, 'the Windows leading pill publishes its width');
  assert.match(css, /data-windows-titlebar/);
});


test('session delete ships with the plugin instead of an optional bundle', () => {
  const host = read('index.js');
  assert.match(host, /const DELETE_PATH = '\/api\/dsh-deepseek-ui\/session-delete'/, 'the plugin publishes its own delete route');
  assert.match(host, /class SessionDelete/, 'the cascade is implemented in the Host half');
  assert.match(host, /deletedSessionIds/, 'the route answers with the deleted lineage');
  assert.match(host, /releaseLive|closeWriteHandle/, 'live sessions and their write handles are released before the log is removed');
  const client = read('src/client.js');
  assert.match(client, /\/api\/dsh-deepseek-ui\/session-delete/, 'the sidebar deletes through the plugin route');
  assert.match(client, /\/api\/session-delete\.delete/, 'an older build keeps the cascade fallback');
});

test('the delete route validates session ids', () => {
  assert.equal(isSessionId('session-abc'), true);
  assert.equal(isSessionId(''), false);
  assert.equal(isSessionId(null), false);
  assert.equal(isSessionId('x'.repeat(513)), false);
});

test('Windows keeps the collapsed navigation fixed in the caption row', () => {
  const sidebar = read('src/sidebar.js');
  assert.match(sidebar, /dsui-caption-controls/);
  assert.match(sidebar, /--dsh-windows-menu-start/, 'native caption menus must start after the pill');
  const css = read('src/sidebar.css');
  assert.match(css, /data-windows-titlebar[\s\S]{0,200}dsui-caption-controls[\s\S]{0,200}position: fixed/);
  assert.match(css, /-webkit-app-region: no-drag/, 'caption controls stay clickable inside the drag strip');
});


test('deleting a conversation starts the next one', () => {
  const client = read('src/client.js');
  assert.match(client, /await createNewConversation\(\)/, 'a successful delete opens a fresh conversation');
  assert.match(client, /const createNewConversation = async/, 'creation is shared between New chat and delete');
});

test('the official presets raise a tip with persistent opt-outs', () => {
  const compat = read('src/compat.js');
  assert.match(compat, /dsui-preset-tip-never/);
  assert.match(compat, /dsui-preset-tip-day/);
  assert.match(compat, /duiPresetTipSuppressed/);
  assert.match(compat, /duiRememberPresetTip/);
  const sheet = read('src/sheet.js');
  assert.match(sheet, /presetTip\.today/, '"today" opt-out row exists');
  assert.match(sheet, /presetTip\.never/, '"never" opt-out row exists');
  assert.match(sheet, /type: 'checkbox'/);
  const client = read('src/client.js');
  assert.match(client, /deepseek-ui-preset-tip/, 'the tip is registered in shell.overlay');
});

test('a scroll guard keeps the streaming turn pinned without fighting gestures', () => {
  const compat = read('src/compat.js');
  assert.match(compat, /\[data-conversation-scroll\]/, 'the guard targets the conversation scroller');
  assert.match(compat, /markUser/, 'reader gestures suspend the guard');
  assert.match(compat, /scroller\.clientHeight \* 0\.5/, 'only large jumps are corrected');
  const client = read('src/client.js');
  assert.match(client, /duiWatchScrollGuard\(\)/, 'the guard is installed as an effect');
});


test('the preset tip names the Flash model without a concrete version', () => {
  for (const file of ['locale/zh.json', 'locale/en.json']) {
    const body = JSON.parse(read(file)).presetTip.body;
    assert.match(body, /Flash/);
    assert.doesNotMatch(body, /V\d|DeepSeek[- ]?V|版本/, 'the tip must not name a model version');
  }
});
