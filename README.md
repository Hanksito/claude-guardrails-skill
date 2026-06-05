<div align="center">

<img src="assets/banner.svg" alt="claude-guardrails-skill — Remember · Stay on track · No bluffing" width="100%">

# 🛡️ claude-guardrails-skill

### Stop your AI agent from forgetting, drifting, and bluffing.

*Guardrails that make Claude remember what matters, keep the thread on long tasks, and never make facts up — installed in one command, then out of your way.*

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%E2%89%A518-blue)
![Runtime deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen)
![Platform](https://img.shields.io/badge/platform-win%20%7C%20macOS%20%7C%20linux-lightgrey)
![Tests](https://img.shields.io/badge/tests-18%20passing-success)

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

| Skill / Plugin | Role | Installs via |
|----------------|------|--------------|
| [`superpowers`](https://github.com/obra/superpowers) | Method base: TDD, debugging, planning, code review, `verification-before-completion`. | marketplace |
| [`planning-with-files`](https://github.com/OthmanAdi/planning-with-files) | Live working memory on disk — survives context compaction & `/clear`. | marketplace |
| [`caveman`](https://github.com/JuliusBrussee/caveman) | Terse, low-token communication style (**lite**, always on). | marketplace |
| [`find-skills`](https://github.com/vercel-labs/skills) | Discover new skills across the ecosystem. | `install.js` |
| [`skill-judge`](https://github.com/softaworks/agent-toolkit) | Evaluate skills *before* you install them. | `install.js` |

> **One install surface.** `superpowers` and the other plugins are re-listed in this repo's marketplace, so a single `/plugin marketplace add` gives you everything — no separate marketplaces to track.

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

Everything installs from **one marketplace** — including `superpowers`, so you never add its marketplace separately.

### 1. Add the marketplace (once)

```text
/plugin marketplace add https://github.com/Hanksito/claude-guardrails-skill
```

### 2. Install the plugins from it

```text
/plugin install claude-guardrails-skill
/plugin install superpowers
/plugin install planning-with-files
/plugin install caveman
```

Installing `claude-guardrails-skill` brings the two skills **and self-registers its SessionStart reminder hook** — no `settings.json` editing, nothing to wire up.

### 3. Add the two skill-only tools

`find-skills` and `skill-judge` ship as bare skills (not plugins), so they install with the `skills` CLI. From the plugin directory:

```bash
node install.js          # or: node install.js --dry-run
```

```text
npx skills add https://github.com/vercel-labs/skills --skill find-skills
npx skills add https://github.com/softaworks/agent-toolkit --skill skill-judge
```

> 🪶 **Nothing is vendored.** `superpowers`, `planning-with-files`, and `caveman` are *re-listed* in this marketplace and pulled from their own repos — you get one install surface without copying anyone's code.

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
├── test/                      # node:test suites (18 tests)
├── deps.json                  # the two skill-only dependencies
├── install.js                 # installs find-skills + skill-judge
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
ℹ tests 18
ℹ pass 18
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
