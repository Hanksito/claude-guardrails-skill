<div align="center">

# 🛡️ claude-guardrails-skill

### Stop your AI agent from forgetting, drifting, and bluffing.

*Guardrails that make Claude remember what matters, keep the thread on long tasks, and never make facts up — installed in one command, then out of your way.*

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%E2%89%A518-blue)
![Runtime deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen)
![Platform](https://img.shields.io/badge/platform-win%20%7C%20macOS%20%7C%20linux-lightgrey)
![Tests](https://img.shields.io/badge/tests-25%20passing-success)

</div>

---

## Why this exists

Three failure modes quietly wreck agentic coding sessions:

| 🧠 It **forgets** | 🧵 It **loses the thread** | 🎭 It **bluffs** |
|---|---|---|
| Durable facts about you and the project evaporate between sessions. | On long tasks the context fills up, gets compacted, and the goal drifts. | It states a version, an API signature, or a flag *from memory* — and is often wrong. |

`claude-guardrails-skill` is a small, opinionated **Claude plugin** that installs a coordinated set of skills and a session-start reminder to shut all three down — without turning every reply into ceremony.

---

## What you get

**Two purpose-built skills (shipped in this repo):**

- 🧠 **`memory-discipline`** — disciplines Claude's native long-term memory. Knows *what* is worth remembering, *where* it goes, and treats recalled memories as possibly-stale until re-checked. Keeps the three memory layers from bleeding into each other.
- 🎭 **`verify-facts`** — before asserting any version / API / flag / price *from memory*, verify it this session or flag the uncertainty. Never present an unverified external fact as settled. (Complements — does not duplicate — superpowers' `verification-before-completion`.)

**A session-start reminder hook** — a short, idempotent nudge injected at the start of every session so the guardrails are *active*, not just *available*.

**Four coordinated dependencies, installed for you:**

| Skill | Role |
|-------|------|
| [`planning-with-files`](https://github.com/OthmanAdi/planning-with-files) | Live working memory on disk — survives context compaction & `/clear`. |
| [`caveman`](https://github.com/JuliusBrussee/caveman) | Terse, low-token communication style (**lite**, always on). |
| [`find-skills`](https://github.com/vercel-labs/skills) | Discover new skills across the ecosystem. |
| [`skill-judge`](https://github.com/softaworks/agent-toolkit) | Evaluate skills *before* you install them. |

> **Prerequisite:** [`superpowers`](https://github.com/obra/superpowers) provides the method base (TDD, debugging, `writing-plans`, `verification-before-completion`). Install it from its own marketplace first.

---

## The core idea: three memory layers that never mix

The biggest source of agent confusion is *where to write what*. This pack draws a hard line:

```
┌───────────────────────────────────────────────────────────────────┐
│  LONG-TERM      cross-session facts        ~/.claude/.../memory/    │  ← memory-discipline
│  (durable)      user · project · feedback  + MEMORY.md              │
├───────────────────────────────────────────────────────────────────┤
│  WORKING        current-task state         task_plan.md             │  ← planning-with-files
│  (this task)    progress · findings        findings.md · progress.md│
├───────────────────────────────────────────────────────────────────┤
│  BLUEPRINT      pre-code plan              docs/.../plan.md          │  ← writing-plans
│  (before code)  TDD steps · file map                                │
└───────────────────────────────────────────────────────────────────┘
```

**The rule the agent follows:**
- Useful in a *future* session → **long-term memory**
- State / progress / finding of the *current* task → **working memory**
- A pre-coding implementation plan → **blueprint**

---

## Quick start

### 1. Install the prerequisite (once)

Install [`superpowers`](https://github.com/obra/superpowers) from its marketplace if you don't have it.

### 2. Add the plugin

```text
/plugin marketplace add https://github.com/Hanksito/claude-guardrails-skill
/plugin install claude-guardrails-skill
```

### 3. Run the installer

From the installed plugin directory (the plugin manager prints the path):

```bash
node install.js
```

This will:
- install the four dependency skills via `npx skills add`, and
- register the **SessionStart** reminder hook in `~/.claude/settings.json`.

**Preview first — change nothing:**

```bash
node install.js --dry-run
```

```text
Note: superpowers is a prerequisite and is NOT installed by this script — install it from its own marketplace (see INSTALL.md).
npx skills add https://github.com/OthmanAdi/planning-with-files --skill planning-with-files
npx skills add https://github.com/JuliusBrussee/caveman --skill caveman
npx skills add https://github.com/vercel-labs/skills --skill find-skills
npx skills add https://github.com/softaworks/agent-toolkit --skill skill-judge
SessionStart hook -> /home/you/.claude/settings.json
  node "/.../claude-guardrails-skill/hooks/session-start.js" claude-guardrails-sessionstart
```

> ♻️ **Safe to re-run.** The installer is idempotent — running it again never duplicates the hook (it matches a stable marker token, not a fragile path).

---

## How it works under the hood

```
                    ┌──────────────────────┐
   session starts ─▶│  SessionStart hook   │─▶ injects a 3-line reminder:
                    │  session-start.js    │   memory layers · verify-facts · caveman
                    └──────────────────────┘
                              ▲
                              │ registered by (idempotent)
                    ┌──────────────────────┐
                    │      install.js      │─▶ npx skills add ×4  (dependencies)
                    │  (Node, no deps)     │─▶ merge SessionStart hook → settings.json
                    └──────────────────────┘
```

- **Zero hardcoded paths.** The hook path is resolved at install time from the real install location, so the same repo works on any machine.
- **Cross-platform, zero runtime dependencies.** Pure Node built-ins — runs the same on Windows, macOS, and Linux.
- **Idempotency by marker token.** The hook command carries an inert `claude-guardrails-sessionstart` argv token; re-installs recognize it regardless of where the plugin lives.

---

## Communication style

`caveman` runs at **lite** intensity, always on: it drops filler, hedging, and pleasantries while keeping full grammar and every technical detail. It steps aside automatically for security warnings, irreversible-action confirmations, and anything ambiguous.

Turn it off any time:

```text
normal mode      # or: stop caveman
```

---

## Project layout

```
claude-guardrails-skill/
├── .claude-plugin/
│   ├── plugin.json            # plugin manifest
│   └── marketplace.json       # marketplace entry
├── skills/
│   ├── memory-discipline/SKILL.md
│   └── verify-facts/SKILL.md
├── hooks/
│   └── session-start.js       # prints the guardrail reminder
├── lib/
│   ├── deps.js                # buildCommands() — dependency → npx argv
│   ├── merge-settings.js      # ensureSessionStartHook() — pure, idempotent
│   └── reminder.js            # buildReminder() — the reminder text
├── test/                      # node:test suites (25 tests)
├── deps.json                  # the four external dependencies
├── install.js                 # the installer CLI
├── INSTALL.md
└── README.md
```

---

## Development

No dependencies to install. Run the suite with the built-in test runner:

```bash
node --test
```

```text
ℹ tests 25
ℹ pass 25
ℹ fail 0
```

Preview the installer behavior without side effects:

```bash
node install.js --dry-run
```

---

## Uninstall

1. Remove the plugin via your plugin manager (`/plugin`).
2. Delete the `SessionStart` entry whose command contains `claude-guardrails-sessionstart` from `~/.claude/settings.json`.
3. Optionally remove the dependency skills you no longer want (`planning-with-files`, `caveman`, `find-skills`, `skill-judge`).

---

## License

[MIT](LICENSE) © [Martin Barja Balseiro](https://github.com/Hanksito)

<div align="center">

**Built to make agentic sessions remember, stay on track, and tell the truth.**

</div>
