/**
 * Host half of DeepSeek UI.
 *
 * Two jobs, both about the fixed workspace this interface uses:
 *
 * 1. Resolve (and create on first use) ONE workspace folder under the DeepSeek
 *    Harness installation directory, publish it to the browser half, and fall
 *    back to the profile's data directory when the installation directory is not
 *    writable (code-signed or system-owned installs).
 * 2. Register one stable system-prompt section that tells the model the current
 *    situation: there is no workspace picker, every new conversation works in
 *    that one folder, and the model must not ask the user to choose a directory.
 *
 * The section is a fixed string, so it rides the cached prompt prefix instead of
 * costing tokens per turn.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

/** Folder created under the installation directory. */
const WORKSPACE_FOLDER = 'DeepSeekHarnessWorkspace'

/** Route the browser half reads the resolved folder from. */
const WORKSPACE_PATH = '/api/dsh-deepseek-ui/workspace'

/** Services this plugin needs before it may activate. */
export const inject = [
  'systemPrompt',
  'connection',
  'agentPresets',
  'agents',
  'sessionPersistence',
  'workspaceRegistry',
]


/** The session-delete route the browser half calls. */
const DELETE_PATH = '/api/dsh-deepseek-ui/session-delete'

/** A JSON response that is never cached. */
const json = (value, status = 200) =>
  Response.json(value, { status, headers: { 'cache-control': 'no-store' } })

/** Build a tagged failure the route turns into a status code and a JSON body. */
function failed(code, message, details) {
  const error = new Error(message)
  error.code = code
  error.details = details
  return error
}

/** Whether one value is usable as a session id. */
export function isSessionId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 512
}

/** The HTTP status one failure code maps to. */
const STATUS_OF = {
  'session/not-found': 404,
  'session/delete-active': 409,
}

/**
 * Delete a Session and everything derived from it — its subagent lineage, the
 * durable JSONL log, the projection-cache rows, and the workspace accounting.
 *
 * This is the same sequence the optional `dsh-session-delete-cascade` bundle
 * runs; the plugin carries it so deletion works with no extra installation.
 * Steps 4-7 are individually fail-soft: one stubborn derived store must not
 * leave the durable log (the thing the sidebar shows) behind.
 */
class SessionDelete {
  /** @param ctx - Host context carrying the registries this delete coordinates. */
  constructor(ctx) {
    this.ctx = ctx
  }

  /**
   * Delete one session and its lineage.
   * @param sessionId - the root session identity.
   * @returns the root identity and every session deleted with it.
   */
  async delete(sessionId) {
    const lineage = await this.collectLineage(sessionId)

    // Refuse while any session in the lineage still has running work.
    const active = []
    for (const id of lineage) {
      const activity = await this.ctx.waterfall('workspace/session-activity', { sessionId: id }, () => Promise.resolve([]))
      if (activity.length > 0) active.push({ sessionId: id, activity })
    }
    if (active.length > 0) {
      throw failed('session/delete-active', `session "${sessionId}" still has running work in its lineage; stop it before deleting`, { sessionId, active })
    }

    // Resolve every header before anything is removed: `locate` needs the cwd.
    const headers = new Map()
    for (const id of lineage) headers.set(id, await this.readHeader(id))

    // Take each live session out of the runtime, deepest first.
    for (const id of [...lineage].reverse()) await this.releaseLive(id)

    // Drop the projection-cache rows.
    try {
      const cache = this.ctx.get('sessionProjectionCache')
      if (cache !== undefined) {
        const table = cache.requireTable()
        for (const id of lineage) await table.delete(id)
      }
    } catch (error) {
      this.ctx.logger.warn(`deepseek-ui delete: clearing the projection cache for "${sessionId}" failed: ${String(error)}`)
    }

    // Delete each durable log directory.
    for (const id of lineage) {
      try {
        const logPath = this.ctx.sessionPersistence.locate(headers.get(id)).path
        await rm(dirname(logPath), { recursive: true, force: true })
      } catch (error) {
        this.ctx.logger.warn(`deepseek-ui delete: removing the log directory for "${id}" failed: ${String(error)}`)
      }
    }

    // Drop each session from the workspace accounting.
    const registry = this.ctx.workspaceRegistry
    for (const id of lineage) {
      for (const entity of [...registry.entities.values()]) {
        if (!entity.record.sessionIds.includes(id)) continue
        try {
          await entity.detachSession(id)
        } catch (error) {
          this.ctx.logger.warn(`deepseek-ui delete: detaching "${id}" from workspace "${entity.id}" failed: ${String(error)}`)
        }
      }
      if (registry.archivedSessionIds.includes(id)) {
        await registry.unarchiveSession(id).catch((error) => {
          this.ctx.logger.warn(`deepseek-ui delete: unarchiving "${id}" failed: ${String(error)}`)
        })
      }
      if (registry.pinnedSessionIds.includes(id)) {
        await registry.unpinSession(id).catch((error) => {
          this.ctx.logger.warn(`deepseek-ui delete: unpinning "${id}" failed: ${String(error)}`)
        })
      }
    }

    return { sessionId, deletedSessionIds: lineage }
  }

  /**
   * Take one live session out of the runtime so it stops being listed.
   * @param sessionId - the session to release.
   */
  async releaseLive(sessionId) {
    const agents = this.ctx.get('agents')
    const sessions = this.ctx.get('sessions')

    const agent = agents?.get(sessionId)
    if (agent !== undefined) {
      try {
        agent.cancel({ kind: 'disposed' })
      } catch (error) {
        this.ctx.logger.warn(`deepseek-ui delete: cancelling the live agent for "${sessionId}" failed: ${String(error)}`)
      }
      try {
        await agent.whenIdle?.()
      } catch (error) {
        this.ctx.logger.warn(`deepseek-ui delete: waiting for "${sessionId}" to go idle failed: ${String(error)}`)
      }
      try {
        await agent.scope?.dispose?.()
      } catch (error) {
        this.ctx.logger.warn(`deepseek-ui delete: disposing the agent scope for "${sessionId}" failed: ${String(error)}`)
      }
      await this.closeWriteHandle(sessionId)
      try {
        agents.store?.get?.(sessionId)?.detach?.()
      } catch (error) {
        this.ctx.logger.warn(`deepseek-ui delete: unregistering the agent for "${sessionId}" failed: ${String(error)}`)
      }
    }

    if (sessions?.get?.(sessionId) !== undefined) {
      try {
        sessions.store?.get?.(sessionId)?.detach?.()
      } catch (error) {
        this.ctx.logger.warn(`deepseek-ui delete: unregistering the session "${sessionId}" failed: ${String(error)}`)
      }
    }
  }

  /**
   * Close one session's persistence write handle, releasing its directory lock.
   * @param sessionId - the session whose write handle is closed.
   */
  async closeWriteHandle(sessionId) {
    let handle
    try {
      handle = this.ctx.sessionPersistence?.tracker?.writers?.get?.(sessionId)
    } catch (error) {
      this.ctx.logger.warn(`deepseek-ui delete: reaching the write handle for "${sessionId}" failed: ${String(error)}`)
      return
    }
    if (handle === undefined || handle === null) return
    if (typeof handle.close !== 'function') return
    try {
      await handle.close()
    } catch (error) {
      this.ctx.logger.warn(`deepseek-ui delete: closing the write handle for "${sessionId}" failed: ${String(error)}`)
    }
  }

  /**
   * Collect the session plus every subagent descendant, in stable pre-order.
   * @param sessionId - the root session identity.
   * @returns the lineage's session ids.
   */
  async collectLineage(sessionId) {
    const childrenOf = await this.childrenByParent()
    const lineage = [sessionId]
    const visited = new Set([sessionId])
    const queue = [sessionId]
    while (queue.length > 0) {
      const current = queue.shift()
      for (const child of childrenOf.get(current) ?? []) {
        if (visited.has(child)) continue
        visited.add(child)
        lineage.push(child)
        queue.push(child)
      }
    }
    return lineage
  }

  /**
   * Build the subagent child map from every durable and live header.
   * @returns each parent session id mapped to its subagent children's ids.
   */
  async childrenByParent() {
    const childrenOf = new Map()
    for (const header of await this.listHeaders()) {
      if (header.origin !== 'subagent') continue
      if (header.parentSession === undefined) continue
      const siblings = childrenOf.get(header.parentSession)
      if (siblings === undefined) childrenOf.set(header.parentSession, [header.id])
      else siblings.push(header.id)
    }
    return childrenOf
  }

  /**
   * Every session header this process can see.
   * @returns the headers, live entries preferred over stored snapshots.
   */
  async listHeaders() {
    const headers = []
    const seen = new Set()
    for (const session of this.ctx.get('sessions')?.list() ?? []) {
      if (seen.has(session.id)) continue
      seen.add(session.id)
      headers.push(session.header)
    }
    for (const snapshot of await this.ctx.sessionPersistence.list()) {
      if (seen.has(snapshot.header.id)) continue
      seen.add(snapshot.header.id)
      headers.push(snapshot.header)
    }
    return headers
  }

  /**
   * Read one session header from the live store or the durable listing.
   * @param sessionId - session identity.
   * @returns the session header.
   */
  async readHeader(sessionId) {
    const live = this.ctx.get('sessions')?.get(sessionId)
    if (live !== undefined) return live.header
    const snapshots = await this.ctx.sessionPersistence.list()
    const header = snapshots.find((snapshot) => snapshot.header.id === sessionId)?.header
    if (header === undefined) {
      throw failed('session/not-found', `session "${sessionId}" is live-less and has no stored log`, { sessionId })
    }
    return header
  }
}

/**
 * The two DeepSeek-official Agent presets this interface is designed around.
 *
 * They are the same declarations the local Mode manager ships as separate preset
 * bundles (`mode-mc2kfu` 官网-纯聊天, `mode-m5ni1w` 官网-可干活); carrying them here
 * means installing this plugin alone gives a fresh profile both presets. A copy
 * already present under the same id or display name is left untouched.
 */
export const BUNDLED_PRESETS = [
  {
    "id": "mode-mc2kfu",
    "name": "官网-纯聊天",
    "description": "仅聊天,能搜索。官网的人设，聊起来有点“人味”。此模式能有效抑制“鱼八股”问题",
    "order": 5,
    "plugins": [
      {
        "id": "persona",
        "name": "@deepseek-ai/dsh-persona",
        "config": {
          "prefix": "You are DeepSeek, an AI assistant created exclusively by the Chinese Company DeepSeek. You'll provide helpful, harmless, and detailed responses to all user inquiries. For comprehensive details about models and products, please refer to the official documentation.\n\nKey Guidelines:\n\n1. Identity & Compliance\n   · Clearly state your identity as a DeepSeek AI assistant in initial responses.\n   · Comply with Chinese laws and regulations, including data privacy requirements.\n2. Capability Scope\n   · Handle both Chinese and English queries effectively\n   · Acknowledge limitations for real-time information post knowledge cutoff (2026-2)\n   · Provide technical explanations for AI-related questions when appropriate\n3. Response Quality\n   · Give comprehensive, logically structured answers\n   · Use markdown formatting for clear information organization\n   · Admit uncertainties for ambiguous queries\n4. Ethical Operation\n   · Strictly refuse requests involving illegal activities, violence, or explicit content\n   · Maintain political neutrality according to company guidelines\n   · Protect user privacy and avoid data collection\n5. Specialized Processing\n   · Use [think]...[/think] tags for internal reasoning before responding\n   · Employ XML-like tags for structured output when required"
        }
      },
      {
        "id": "time-context",
        "name": "@deepseek-ai/dsh-time-context"
      },
      {
        "id": "tool-web",
        "name": "@deepseek-ai/dsh-tool-web",
        "config": {
          "search": true,
          "fetch": true,
          "searchTimeoutMs": 60000
        }
      },
      {
        "id": "compaction",
        "name": "cordis:group",
        "group": true,
        "isolate": {
          "compaction": true,
          "toolResultPruner": true
        },
        "config": [
          {
            "id": "compaction-basic",
            "name": "@deepseek-ai/dsh-compaction-basic"
          },
          {
            "id": "command-compact",
            "name": "@deepseek-ai/dsh-command-compact"
          },
          {
            "id": "tool-result-pruner",
            "name": "@deepseek-ai/dsh-compaction-tool-result-pruner",
            "config": {
              "thresholdChars": 8192,
              "headChars": 4096,
              "tailChars": 1024
            }
          }
        ]
      }
    ]
  },
  {
    "id": "mode-m5ni1w",
    "name": "官网-可干活",
    "description": "不仅聊天，还能干活，而且带搜索。官网的人设，聊起来有点“人味”。此模式能有效抑制“鱼八股”问题",
    "order": 6,
    "plugins": [
      {
        "id": "persona",
        "name": "@deepseek-ai/dsh-persona",
        "config": {
          "prefix": "You are DeepSeek, an AI assistant created exclusively by the Chinese Company DeepSeek. You'll provide helpful, harmless, and detailed responses to all user inquiries. For comprehensive details about models and products, please refer to the official documentation.\n\nKey Guidelines:\n\n1. Identity & Compliance\n   · Clearly state your identity as a DeepSeek AI assistant in initial responses.\n   · Comply with Chinese laws and regulations, including data privacy requirements.\n2. Capability Scope\n   · Handle both Chinese and English queries effectively\n   · Acknowledge limitations for real-time information post knowledge cutoff (2026-2)\n   · Provide technical explanations for AI-related questions when appropriate\n3. Response Quality\n   · Give comprehensive, logically structured answers\n   · Use markdown formatting for clear information organization\n   · Admit uncertainties for ambiguous queries\n4. Ethical Operation\n   · Strictly refuse requests involving illegal activities, violence, or explicit content\n   · Maintain political neutrality according to company guidelines\n   · Protect user privacy and avoid data collection\n5. Specialized Processing\n   · Use [think]...[/think] tags for internal reasoning before responding\n   · Employ XML-like tags for structured output when required"
        }
      },
      {
        "id": "agent-instructions",
        "name": "@deepseek-ai/dsh-agent-instructions",
        "config": {
          "maxBytes": 65536
        }
      },
      {
        "id": "time-context",
        "name": "@deepseek-ai/dsh-time-context"
      },
      {
        "id": "tool-fs",
        "name": "@deepseek-ai/dsh-tool-fs",
        "config": {
          "read": true,
          "readImage": true,
          "write": true,
          "edit": true,
          "applyPatch": false
        }
      },
      {
        "id": "tool-fs-search",
        "name": "@deepseek-ai/dsh-tool-fs-search",
        "config": {
          "sampleOverCapGlobResults": false
        }
      },
      {
        "id": "tool-bash",
        "name": "@deepseek-ai/dsh-tool-bash",
        "disabled": {
          "__jsExpr": "process.platform === 'win32'"
        }
      },
      {
        "id": "tool-pwsh",
        "name": "@deepseek-ai/dsh-tool-pwsh",
        "disabled": {
          "__jsExpr": "process.platform !== 'win32'"
        }
      },
      {
        "id": "tool-web",
        "name": "@deepseek-ai/dsh-tool-web",
        "config": {
          "search": true,
          "fetch": true,
          "searchTimeoutMs": 60000
        }
      },
      {
        "id": "delegation",
        "name": "cordis:group",
        "group": true,
        "isolate": {
          "workflowEngine": true
        },
        "config": [
          {
            "id": "tool-subagent-control",
            "name": "@deepseek-ai/dsh-tool-subagent-control",
            "config": {
              "interrupt": false
            }
          },
          {
            "id": "tool-subagent",
            "name": "@deepseek-ai/dsh-tool-subagent",
            "config": {
              "provider": "spawn",
              "toolName": "subagent",
              "modelSelection": true,
              "modelDiscovery": true
            }
          },
          {
            "id": "tool-subagent-fork",
            "name": "@deepseek-ai/dsh-tool-subagent",
            "config": {
              "provider": "fork",
              "toolName": "subagent_fork"
            }
          },
          {
            "id": "workflow-ptc",
            "name": "@deepseek-ai/dsh-workflow-ptc",
            "config": {
              "provider": "spawn"
            }
          },
          {
            "id": "tool-workflow",
            "name": "@deepseek-ai/dsh-tool-workflow"
          }
        ]
      },
      {
        "id": "planning",
        "name": "cordis:group",
        "group": true,
        "isolate": {
          "planMode": true
        },
        "config": [
          {
            "id": "plan-mode",
            "name": "@deepseek-ai/dsh-plan-mode",
            "config": {
              "section": "You are in plan mode. Stay in plan mode until the user approves your plan through exit_plan_mode or switches the session mode. Imperative language to implement changes means plan the implementation, not execute it. A user's conversational agreement — including an answer confirming something you asked — approves nothing and does not end plan mode; fold the confirmed decision into the plan and submit it through exit_plan_mode.\n\nExplore first. Use non-mutating reads, searches, static analysis, and checks to ground the plan in the actual repository. Do not edit or write files, change configuration, run formatters or code generation that rewrites tracked files, commit, or otherwise carry out the plan. Prefer existing functions and patterns over new machinery.\n\nThe tool catalog stays the same across modes for request-cache stability. These plan-mode rules override any later tool description or guidance that suggests using mutation tools; those tools remain listed to keep the tool catalog unchanged. Do not use todo_write to track this planning phase: it tracks implementation after an approved plan, while the plan itself belongs in exit_plan_mode.\n\nResolve discoverable facts by inspection. Use ask_user_question only for user-owned choices or material ambiguity that inspection cannot answer. Do not ask the user where code lives or how current behavior works when you can find out.\n\nMake the plan decision-complete: state the goal and success criteria; group implementation changes by subsystem; identify public API, schema, and data-flow changes; cover edge cases, failure modes, tests, acceptance criteria, and explicit assumptions. Keep it concise enough to review but detailed enough that another engineer can implement it without making design decisions.\n\nWhen ready, call exit_plan_mode with the complete plan markdown, starting with a # title. Make exit_plan_mode the only and final tool call that assistant response: it presents the plan for approval, and implementation begins only in a later step after approval. Do not paste the final plan as a plain reply or ask \"should I proceed?\" through prose or ask_user_question. If review rejects it, incorporate the feedback and present again. If the review channel is unavailable or aborted, stay in plan mode and ask the user to switch modes manually; do not proceed with implementation."
            }
          }
        ]
      },
      {
        "id": "skill-filesystem",
        "name": "@deepseek-ai/dsh-skill-filesystem",
        "config": {
          "customSkillDirs": [
            {
              "__jsExpr": "process.getBuiltinModule('node:path').join(process.getBuiltinModule('node:path').dirname(process.getBuiltinModule('node:module').createRequire(baseUrl).resolve('@deepseek-ai/dsh-agent-preset/package.json')), 'skills')"
            }
          ]
        }
      },
      {
        "id": "tool-skill",
        "name": "@deepseek-ai/dsh-tool-skill"
      },
      {
        "id": "tool-todo",
        "name": "@deepseek-ai/dsh-tool-todo",
        "config": {
          "allowParallelInProgress": true
        }
      },
      {
        "id": "tool-jobs",
        "name": "@deepseek-ai/dsh-tool-jobs"
      },
      {
        "id": "tool-schedule",
        "name": "@deepseek-ai/dsh-tool-schedule"
      },
      {
        "id": "command-goal",
        "name": "@deepseek-ai/dsh-command-goal"
      },
      {
        "id": "tool-goal",
        "name": "@deepseek-ai/dsh-tool-goal"
      },
      {
        "id": "tool-ask-user",
        "name": "@deepseek-ai/dsh-tool-ask-user"
      },
      {
        "id": "present",
        "name": "@deepseek-ai/dsh-tool-present"
      },
      {
        "id": "tool-office",
        "name": "@deepseek-ai/dsh-tool-office"
      },
      {
        "id": "tool-plugin-manager",
        "name": "@deepseek-ai/dsh-plugin-manager/tools",
        "disabled": {
          "__jsExpr": "!ctx.get('profileContext')"
        }
      },
      {
        "id": "tool-plugin-market",
        "name": "@deepseek-ai/dsh-plugin-market/tools",
        "disabled": true
      },
      {
        "id": "compaction",
        "name": "cordis:group",
        "group": true,
        "isolate": {
          "compaction": true,
          "toolResultPruner": true
        },
        "config": [
          {
            "id": "compaction-basic",
            "name": "@deepseek-ai/dsh-compaction-basic"
          },
          {
            "id": "command-compact",
            "name": "@deepseek-ai/dsh-command-compact"
          },
          {
            "id": "tool-result-pruner",
            "name": "@deepseek-ai/dsh-compaction-tool-result-pruner",
            "config": {
              "thresholdChars": 8192,
              "headChars": 4096,
              "tailChars": 1024
            }
          }
        ]
      }
    ]
  }
];

/** Display names of the two presets the interface recommends. */
const RECOMMENDED_PRESET_NAMES = ['官网-纯聊天', '官网-可干活']

/** Display name of the preset every new conversation runs. */
const PREFERRED_PRESET_NAME = '官网-纯聊天';

/** Its conventional id, used before the roster is readable. */
const PREFERRED_PRESET_ID = 'mode-mc2kfu';

/**
 * Register any bundled preset the deployment does not already declare.
 * @param ctx - Host context carrying the `agentPresets` registry.
 * @returns the id of the preferred preset, when the roster names it.
 */
export async function ensureBundledPresets(ctx) {
  const registry = ctx.get('agentPresets');
  if (registry === undefined || registry === null
    || typeof registry.register !== 'function' || typeof registry.list !== 'function') {
    return undefined;
  }
  const roster = await registry.list();
  const knownIds = new Set(roster.map((row) => row.id));
  const knownNames = new Set(roster.map((row) => (row.name ?? '').trim()).filter((name) => name !== ''));
  for (const definition of BUNDLED_PRESETS) {
    if (knownIds.has(definition.id) || knownNames.has((definition.name ?? '').trim())) continue;
    try {
      await registry.register(definition);
      knownIds.add(definition.id);
      if (definition.name !== undefined) knownNames.add(definition.name.trim());
    } catch (error) {
      ctx.logger?.warn?.(`deepseek-ui: agent preset "${definition.id}" was not added: ${String(error)}`);
    }
  }
  const after = await registry.list();
  const preferred = after.find((row) => row.id === PREFERRED_PRESET_ID)
    ?? after.find((row) => (row.name ?? '').trim() === PREFERRED_PRESET_NAME)
    ?? after.find((row) => (row.name ?? '').includes('官网'));
  const recommended = []
  for (const name of RECOMMENDED_PRESET_NAMES) {
    const row = after.find((entry) => (entry.name ?? '').trim() === name)
    if (row !== undefined && !recommended.includes(row.id)) recommended.push(row.id)
  }
  return { presetId: preferred?.id, recommended }
}

/**
 * Candidate workspace folders, in preference order.
 *
 * Exported for tests: pure, no filesystem access.
 * @param config - the Loader row's config, optionally carrying `workspaceDir`.
 * @param execPath - the running executable (`process.execPath`).
 * @param env - environment variables (`process.env`).
 * @returns candidates with the source they represent.
 */
export function workspaceCandidates(config, execPath, env) {
  const override = config !== null && typeof config === 'object' && typeof config.workspaceDir === 'string'
    ? config.workspaceDir.trim()
    : ''
  if (override !== '') return [{ path: resolve(override), source: 'config' }]
  // The user's own Documents folder: outside the application installation, so
  // an application update cannot replace it, and easy for the user to find.
  const home = userHome(env)
  const out = [{ path: join(home, 'Documents', WORKSPACE_FOLDER), source: 'documents' }]
  // Last resort: the durable per-profile data directory.
  const dshHome = typeof env?.DSH_HOME === 'string' && env.DSH_HOME !== '' ? env.DSH_HOME : join(home, '.dsh')
  out.push({ path: join(dshHome, 'workspace'), source: 'profile' })
  return out
}

/**
 * The current user's home directory, from the environment or the process.
 * @param env - environment variables (`process.env`).
 * @returns the absolute home directory.
 */
export function userHome(env) {
  for (const key of ['HOME', 'USERPROFILE']) {
    const value = env === null || env === undefined ? undefined : env[key]
    if (typeof value === 'string' && value !== '') return value
  }
  return homedir()
}

/**
 * The folder versions before 0.2.6 used: beside the installed executable.
 *
 * Only read from, once, to copy existing files into the durable user folder; the
 * plugin never writes a workspace there again.
 * @param execPath - the running executable (`process.execPath`).
 * @returns the legacy folder path, or null when the executable is unknown.
 */
export function legacyWorkspacePath(execPath) {
  return typeof execPath === 'string' && execPath !== '' ? join(dirname(execPath), WORKSPACE_FOLDER) : null
}

/**
 * Create a folder and prove it is writable before handing it out.
 * @param path - absolute directory path.
 * @returns true when a probe file could be written and removed.
 */
function prepareWritable(path) {
  mkdirSync(path, { recursive: true })
  const probe = join(path, '.deepseek-ui-write-probe')
  writeFileSync(probe, 'ok')
  rmSync(probe, { force: true })
  return true
}

/**
 * The text the model receives on every request.
 * @param path - the fixed workspace folder.
 * @param source - where it came from (`install` / `profile` / `config`).
 * @returns the system-prompt section body.
 */
export function workspacePromptText(path, source) {
  const where = source === 'documents'
    ? 'It lives in your user Documents folder, outside the DeepSeek Harness installation, so an application update cannot replace it'
    : source === 'profile'
      ? 'The Documents folder was not usable, so it lives under the DeepSeek Harness configuration directory (DSH_HOME), still outside the application installation'
      : source === 'install'
        ? 'It lives inside the DeepSeek Harness installation directory'
        : 'It is chosen by the deployment configuration'
  return [
    '## Fixed workspace (DeepSeek UI)',
    '',
    'This deployment runs in fixed-workspace mode: the interface offers no workspace selector, and every new conversation starts in the same folder:',
    `\`${path}\``,
    '',
    `${where}, and the folder is created automatically when missing.`,
    '',
    '- Treat this folder as the current working directory for file reads and writes. Do not ask the user to choose or switch a workspace, and do not change to another directory on your own.',
    '- File operations are user-guided: while working with files you may explain what you are about to do and ask the user where they want files created or where they expect to find and view them. Use the location the user names for that operation.',
    '- If a task genuinely needs content outside this folder, say why first and wait for the user\'s explicit consent. If the user sends you to another folder, treat that as consent for that operation only.',
    '- This folder is the durable home for the files you work on: do not delete or move it, and keep unrelated files out of it.',
  ].join('\n')
}

/**
 * Resolve the workspace folder once, preferring the installation directory.
 * @param config - Loader row config.
 * @returns the chosen folder and how it was chosen.
 */
function resolveWorkspace(config) {
  const candidates = workspaceCandidates(config, process.execPath, process.env)
  const failures = []
  for (const candidate of candidates) {
    const existed = existsSync(candidate.path)
    try {
      prepareWritable(candidate.path)
    } catch (error) {
      failures.push(`${candidate.source}: ${error instanceof Error ? error.message : String(error)}`)
      continue
    }
    // A first run on 0.2.6+ inherits whatever the old install-directory folder
    // held: copy it once, never delete the source, and only into a freshly
    // created folder so an existing user folder is never merged into.
    const migrated = candidate.source === 'config' ? false : migrateLegacyWorkspace(candidate.path, existed)
    return { ...candidate, failures, migrated }
  }
  throw new Error(`DeepSeek UI: no writable workspace folder. ${failures.join('; ')}`)
}

/**
 * Copy files from a pre-0.2.6 install-directory workspace into the new one.
 * @param target - the freshly chosen user-directory workspace.
 * @param existed - whether the target already existed before this run.
 * @returns whether anything was copied.
 */
function migrateLegacyWorkspace(target, existed) {
  if (existed) return false
  const legacy = legacyWorkspacePath(process.execPath)
  if (legacy === null || legacy === target || !existsSync(legacy)) return false
  try {
    cpSync(legacy, target, { recursive: true, force: false, errorOnExist: false, dereference: false })
    return true
  } catch (error) {
    return false
  }
}

/**
 * Install the fixed workspace: folder, client route, and prompt section.
 * @param ctx - Host context with `systemPrompt` and `connection`.
 * @param config - Loader row config.
 */
export function apply(ctx, config) {
  const workspace = resolveWorkspace(config)
  if (workspace.migrated) {
    ctx.logger?.info?.(`deepseek-ui: copied existing files from the legacy install workspace into "${workspace.path}"`)
  }

  // Resolve the official presets once; the route waits on this before answering,
  // so a new conversation never races the registration.
  const presetsReady = ensureBundledPresets(ctx).catch((error) => {
    ctx.logger?.warn?.(`deepseek-ui: agent presets were not prepared: ${String(error)}`);
    return undefined;
  });

  ctx.effect(() => ctx.connection.fetch.register({
    path: WORKSPACE_PATH,
    methods: ['GET'],
    requestBody: 'buffered',
    fetch: async () => Response.json({
      path: workspace.path,
      source: workspace.source,
      folder: WORKSPACE_FOLDER,
      migrated: workspace.migrated === true,
      agentPreset: (await presetsReady)?.presetId,
      recommendedPresets: (await presetsReady)?.recommended ?? [],
    }, { headers: { 'cache-control': 'no-store' } }),
  }), 'deepseek-ui: fixed workspace route')

  ctx.effect(() => ctx.systemPrompt.section({
    name: 'deepseek-ui:fixed-workspace',
    // Just before the file-reference/tool guidance: the working directory must
    // be established before the model reads what it may do with files.
    order: ctx.systemPrompt.getSectionOrder('FILE_REFERENCE') - 1,
    text: workspacePromptText(workspace.path, workspace.source),
    interpolate: false,
  }), 'deepseek-ui: fixed workspace prompt section')

  // The session delete route: the same cascade the optional
  // dsh-session-delete-cascade bundle performs, so this plugin needs no extra
  // installation for the sidebar's delete action.
  const deletes = new SessionDelete(ctx)
  ctx.effect(() => ctx.connection.fetch.register({
    path: DELETE_PATH,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async (request) => {
      let body
      try {
        body = await request.json()
      } catch {
        return json({ error: 'bad request' }, 400)
      }
      const sessionId = body?.sessionId
      if (!isSessionId(sessionId)) return json({ error: 'bad request' }, 400)
      try {
        return json(await deletes.delete(sessionId))
      } catch (error) {
        const code = typeof error?.code === 'string' ? error.code : 'session/delete-failed'
        ctx.logger?.warn?.(`deepseek-ui delete: deleting "${sessionId}" failed: ${String(error)}`)
        return json({
          error: code,
          message: error instanceof Error ? error.message : String(error),
          ...(error?.details === undefined ? {} : { details: error.details }),
        }, STATUS_OF[code] ?? 500)
      }
    },
  }), 'deepseek-ui: session delete route')

}
