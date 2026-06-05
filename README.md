<div align="center">

<img src="assets/banner.svg" alt="claude-guardrails-skill — Remember · Stay on track · No bluffing" width="100%">

# 🛡️ claude-guardrails-skill

### Stop your AI agent from forgetting, drifting, and bluffing.

*Guardrails that make Claude remember what matters, keep the thread on long tasks, and never make facts up — installed in one command, then out of your way.*

![npm](https://img.shields.io/npm/v/claude-guardrails-skill)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%E2%89%A518-blue)
![Runtime deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen)
![Platform](https://img.shields.io/badge/platform-win%20%7C%20macOS%20%7C%20linux-lightgrey)
![Tests](https://img.shields.io/badge/tests-23%20passing-success)

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

| Skill / Plugin | Role | How |
|----------------|------|-----|
| [`superpowers`](https://github.com/obra/superpowers) | Method base: TDD, debugging, planning, code review, `verification-before-completion`. | plugin |
| [`planning-with-files`](https://github.com/OthmanAdi/planning-with-files) | Live working memory on disk — survives context compaction & `/clear`. | plugin |
| [`caveman`](https://github.com/JuliusBrussee/caveman) | Terse, low-token communication style (**lite**, always on). | plugin |
| [`find-skills`](https://github.com/vercel-labs/skills) | Discover new skills across the ecosystem. | skill |
| [`skill-judge`](https://github.com/softaworks/agent-toolkit) | Evaluate skills *before* you install them. | skill |

> **One command, everything.** `node install.js` installs all of the above (plugins via the `claude` CLI, skills via `npx`) — `superpowers` included, no separate marketplace to track.

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

**One command installs everything** — superpowers, planning-with-files, caveman, the two skills, and this plugin (hook included).

**Requires** [Claude Code](https://claude.com/claude-code) (`claude` on PATH) and [Node.js](https://nodejs.org) ≥ 18.

```bash
npx claude-guardrails-skill
```

…or from a clone:

```bash
git clone https://github.com/Hanksito/claude-guardrails-skill
cd claude-guardrails-skill
node install.js
```

Then **restart Claude Code** so the new plugins and the reminder hook load.

**Preview first — change nothing:**

```bash
node install.js --dry-run
```

```text
claude plugin marketplace add https://github.com/Hanksito/claude-guardrails-skill
claude plugin install superpowers@claude-guardrails-skill
claude plugin install planning-with-files@claude-guardrails-skill
claude plugin install caveman@claude-guardrails-skill
claude plugin install claude-guardrails-skill@claude-guardrails-skill
npx skills add https://github.com/vercel-labs/skills --skill find-skills
npx skills add https://github.com/softaworks/agent-toolkit --skill skill-judge
```

Installing `claude-guardrails-skill` brings the two skills **and self-registers its SessionStart reminder hook** — no `settings.json` editing. Prefer to install by hand? See [INSTALL.md](INSTALL.md).

> 🪶 **Nothing is vendored.** `superpowers`, `planning-with-files`, and `caveman` are *re-listed* in this marketplace and pulled from their own repos — one install command, no copied code.

---

## How it works under the hood

```
   /plugin install claude-guardrails-skill
                    │
                    ├─▶ skills/   memory-discipline · verify-facts
                    │
                    └─▶ hooks/hooks.json  ──auto-registers──▶  SessionStart hook
                                                               (node hooks/session-start.js)
                                                                       │
                                              session starts ─────────▶│
                                                                       ▼
                                                  injects a 3-line reminder:
                                                  memory layers · verify-facts · caveman
```

- **Self-registering hook.** The reminder is declared in `hooks/hooks.json` and wired up by the plugin loader via `${CLAUDE_PLUGIN_ROOT}` — no `settings.json` mutation, and it's removed automatically on uninstall.
- **Nothing vendored.** Dependency plugins are re-listed in the marketplace and fetched from their own repos.
- **Cross-platform, zero runtime dependencies.** Pure Node built-ins — Windows, macOS, and Linux alike.

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
│   └── marketplace.json       # meta-marketplace: this plugin + superpowers + pwf + caveman
├── skills/
│   ├── memory-discipline/SKILL.md
│   └── verify-facts/SKILL.md
├── hooks/
│   ├── hooks.json             # declares the self-registering SessionStart hook
│   └── session-start.js       # prints the guardrail reminder
├── lib/
│   ├── deps.js                # buildCommands() — dependency → npx argv
│   └── reminder.js            # buildReminder() — the reminder text
├── test/                      # node:test suites (20 tests)
├── deps.json                  # the two skill-only dependencies
├── install.js                 # one command: installs all plugins (claude CLI) + skills (npx)
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
ℹ tests 23
ℹ pass 23
ℹ fail 0
```

Preview the installer behavior without side effects:

```bash
node install.js --dry-run
```

---

## Uninstall

1. Remove the plugins via your plugin manager (`/plugin`). The SessionStart hook is part of the
   plugin, so it goes away automatically — no `settings.json` cleanup needed.
2. Optionally remove the two skills you no longer want (`find-skills`, `skill-judge`).

---

## License

[MIT](LICENSE) © [Martin Barja Balseiro](https://github.com/Hanksito)

<div align="center">

**Built to make agentic sessions remember, stay on track, and tell the truth.**

</div>
