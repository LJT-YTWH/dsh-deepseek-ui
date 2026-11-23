#!/usr/bin/env node
/**
 * Build the single-factory client half and copy the Host half into lib/.
 *
 * The Client module system loads one lazy CommonJS factory per package: the
 * bundle registers `{ id, factory(require) }` and the factory body runs once at
 * materialization. There is no bundler in this repository on purpose — the
 * plugin's own sources are plain JavaScript modules concatenated in a fixed
 * order, and every stylesheet becomes a string constant so the factory can
 * inject it in one `<style>` element.
 *
 * Conventions enforced here:
 *   - `src/client.js` last; it defines `apply` and the Cordis `inject` list.
 *   - every other `src/*.js` is a plain script snippet (no import/export);
 *     they share the factory scope and may only use the `dui`-prefixed API.
 *   - `src/*.css` files are inlined in the order listed in STYLESHEETS.
 *   - `locale/*.json` are inlined so `apply` can register dictionaries.
 *
 * Usage: node scripts/build.mjs [--check]
 *   --check  verify the generated output parses and that src is unchanged.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN_ID = 'dsh-deepseek-ui';

/** Module order; `client.js` must stay last because it returns the plugin body. */
const MODULES = [
  'compat.js',
  'icons.js',
  'store.js',
  'sidebar.js',
  'sheet.js',
  'client.js',
];

/** Stylesheet order; later files win on equal specificity. */
const STYLESHEETS = [
  'theme.css',
  'base.css',
  'sidebar.css',
  'sheet.css',
  'chat.css',
  'composer.css',
];

/** Locale dictionaries registered under the plugin's namespace. */
const LOCALES = ['en', 'zh'];

const CHECK = process.argv.includes('--check');

/** Read a file relative to the package root. */
function read(relative) {
  return readFileSync(join(ROOT, relative), 'utf8');
}

/** A JavaScript string literal that survives every quote and line break. */
function literal(value) {
  return JSON.stringify(value);
}

/** Reject a source module that uses module syntax; the factory is one script body. */
function assertPlainSnippet(name, code) {
  if (/^\s*(import|export)\s/m.test(code)) {
    throw new Error(`src/${name}: the factory is a single script body; use no import/export here`);
  }
  if (code.includes('</script')) {
    throw new Error(`src/${name}: a literal </script would break the page`);
  }
}

/** Assemble the client factory body. */
function buildClient() {
  const parts = [];
  parts.push('window.__ModuleLoader__.load({');
  parts.push(`  id: ${literal(PLUGIN_ID)},`);
  parts.push('  factory(require) {');
  parts.push("    'use strict';");
  parts.push('    const React = require(\'react\');');
  parts.push('    const h = React.createElement;');
  parts.push('    const Fragment = React.Fragment;');
  parts.push('    const {');
  parts.push('      useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback, useSyncExternalStore,');
  parts.push('    } = React;');
  parts.push('    const duiPrimitives = (() => {');
  parts.push('      try { return require(\'@deepseek-ai/dsh-client-ui-primitives\'); } catch (error) {');
  parts.push('        console.warn(\'[dsh-deepseek-ui] UI primitives unavailable\', error);');
  parts.push('        return {};');
  parts.push('      }');
  parts.push('    })();');

  const css = STYLESHEETS.map((name) => {
    const text = read(`src/${name}`);
    if (text.includes('</style')) throw new Error(`src/${name}: a literal </style would break the page`);
    return `      /* ${name} */\n${literal(text)},`;
  });
  parts.push('    const DUI_CSS = [');
  parts.push(...css);
  parts.push('    ].join(\'\\n\');');

  const locales = {};
  for (const id of LOCALES) {
    locales[id] = JSON.parse(read(`locale/${id}.json`));
  }
  const manifest = JSON.parse(read('package.json'));
  parts.push(`    const DUI_VERSION_CONST = ${literal(typeof manifest.version === 'string' ? manifest.version : '0.0.0')};`);
  parts.push(`    const DUI_LOCALES = ${JSON.stringify(locales)};`);
  parts.push('');
  parts.push('    const duiDictionaries = {};');
  parts.push('    for (const id of Object.keys(DUI_LOCALES)) {');
  parts.push('      duiDictionaries[id] = DUI_LOCALES[id];');
  parts.push('    }');
  parts.push('');

  for (const name of MODULES) {
    const code = read(`src/${name}`);
    assertPlainSnippet(name, code);
    parts.push(`    // ---- src/${name} ----`);
    parts.push(code.trimEnd());
    parts.push('');
  }

  parts.push('    return { inject: DUI_INJECT, apply: DUIApply };');
  parts.push('  },');
  parts.push('});');
  parts.push('');
  return parts.join('\n');
}

/** Parse-only validation of the generated factory (no DOM is touched at build time). */
function validateClient(code) {
  try {
    new vm.Script(code, { filename: 'lib/client.js' });
  } catch (error) {
    throw new Error(`lib/client.js does not parse: ${error.message}`);
  }
}

const client = buildClient();
validateClient(client);

const libDir = join(ROOT, 'lib');
mkdirSync(libDir, { recursive: true });

const hostHalf = read('index.js');
const clientPath = join(libDir, 'client.js');
const hostPath = join(libDir, 'index.js');
const previousClient = existsSync(clientPath) ? readFileSync(clientPath, 'utf8') : '';
const previousHost = existsSync(hostPath) ? readFileSync(hostPath, 'utf8') : '';

if (CHECK) {
  const drift = previousClient !== client || previousHost !== hostHalf;
  if (drift) {
    console.error('[dsh-deepseek-ui] lib/ is out of date with src/; run npm run build');
    process.exit(1);
  }
  console.log('[dsh-deepseek-ui] lib/ is up to date');
  process.exit(0);
}

writeFileSync(clientPath, client);
writeFileSync(hostPath, hostHalf);
console.log(`[dsh-deepseek-ui] lib/client.js ${client.length} bytes, ${MODULES.length} modules, ${STYLESHEETS.length} stylesheets`);
