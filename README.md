<div align="center">

<img src="assets/banner.svg" alt="claude-guardrails-skill — Remember · Stay on track · No bluffing" width="100%">

# 🛡️ claude-guardrails-skill

### Stop your AI coding agent from forgetting, drifting, and bluffing.

*Guardrails for Claude Code that make the agent remember what matters, hold the thread on long tasks, and never present unverified facts as settled — set up in one command, then out of your way.*

![npm](https://img.shields.io/npm/v/claude-guardrails-skill)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%E2%89%A518-blue)
![Runtime deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen)
![Platform](https://img.shields.io/badge/platform-win%20%7C%20macOS%20%7C%20linux-lightgrey)
![Tests](https://img.shields.io/badge/tests-29%20passing-success)

</div>

---

## Why this exists

Long Claude Code sessions fail in three quiet, repeatable ways:

| 🧠 It **forgets** | 🧵 It **loses the thread** | 🎭 It **bluffs** |
|---|---|---|
| Durable facts about you and the project — decisions, conventions, constraints — evaporate the moment the session ends. | As context fills up and gets compacted, the original goal slips and the work drifts off-target. | It states a version number, an API signature, a CLI flag, or a price *from memory* — confidently, and often wrong. |

None of these are model "stupidity." They're missing **process**: nowhere durable to write what matters, no plan to anchor a long task, no rule that says *verify before you assert*. This plugin adds that process — and gets out of the way once it has.

---

## What this plugin does

Installed into Claude Code, it puts a set of guardrails around every session:

- **Memory discipline.** The agent learns *what* is worth remembering, *where* it belongs, and to treat anything it recalls as possibly stale until re-checked — so durable facts survive between sessions instead of being relearned every time.
- **Fact verification.** Before asserting a version, API, flag, or price *from memory*, the agent verifies it in the current session or flags the uncertainty out loud. No more confident, wrong answers about external details.
- **A session-start reminder.** A short, automatic nudge at the beginning of every session keeps the guardrails *active*, not merely *available* — without turning each reply into ceremony.

Alongside its own guardrails, the one-command setup also pulls in a small set of **recommended dependencies for memory, planning, and response style**, so you get a coherent working system rather than a single isolated trick.

---

## Core concepts

### Three memory layers that never mix

Most agent confusion comes from one question: *where does this belong?* The pack draws a hard line between three kinds of memory and keeps them from bleeding into each other.

```
┌──────────────────────────────────────────────────────────────┐
│  LONG-TERM    facts for future sessions    user · project ·   │
│  (durable)                                  feedback          │
├──────────────────────────────────────────────────────────────┤
│  WORKING      state of the current task     plan · progress · │
│  (this task)                                findings          │
├──────────────────────────────────────────────────────────────┤
│  BLUEPRINT    the plan before any code      file map ·        │
│  (pre-code)                                 TDD steps         │
└──────────────────────────────────────────────────────────────┘
```

The rule the agent follows:

- Useful in a **future** session → **long-term memory**
- State, progress, or a finding of the **current** task → **working memory**
- A plan written **before** touching code → **blueprint**

### Verify before you assert

For any external detail that changes over time — versions, APIs, flags, prices — the agent's default flips from *"recall and state"* to **"verify, then state."** If it can't verify in the current session, it says so instead of guessing. Confidence is reserved for things that have actually been checked.

---

## How it works under the hood

The plugin is intentionally thin. At its core is a **SessionStart hook** that injects a short reminder when each session begins — telling the agent how to use the memory layers, to verify sensitive facts before asserting them, and to keep responses concise and focused on what matters.

- **Self-registering.** The hook is declared by the plugin and wired up by Claude Code's plugin loader. Installing the plugin registers it; uninstalling removes it. No settings files to hand-edit.
- **Zero runtime dependencies.** Pure Node.js built-ins — nothing to audit, nothing to keep updated.
- **Cross-platform.** Works the same on Windows, macOS, and Linux.

---

## Quickstart

**Requires** [Claude Code](https://claude.com/claude-code) (`claude` on your `PATH`) and [Node.js](https://nodejs.org) ≥ 18.

One command sets up everything — the guardrails plus the recommended dependencies:

```bash
npx claude-guardrails-skill
```

Prefer to install it as a package? This also runs the full setup:

```bash
npm install -g claude-guardrails-skill
```

…or from a clone:

```bash
git clone https://github.com/Hanksito/claude-guardrails-skill
cd claude-guardrails-skill
node install.js
```

Then **restart Claude Code** so the new plugin and its session-start reminder load.

**Preview first — change nothing:**

```bash
node install.js --dry-run
```

---

## What changes in your sessions

Once it's loaded, here's what you'll notice day to day:

- **Every session opens with a quiet reminder** of how to handle memory and verification — so the guardrails are live from the first message.
- **The agent writes and reads its long-term memory deliberately.** Architecture decisions, project conventions, and your preferences stick around instead of being re-derived each time.
- **Long tasks keep their state on disk.** Progress and findings for the current task survive context compaction and `/clear`, so the goal doesn't drift.
- **Code-heavy work starts with a plan.** Before a large change, the agent lays out a blueprint — file map and steps — instead of improvising into a corner.
- **External details get checked, not invented.** Versions, APIs, flags, and prices are verified in-session or explicitly flagged as uncertain.

Where it pays off most:

- **Long-running projects** where you need the agent to remember key architecture decisions across days.
- **Large refactors** that genuinely need a plan before the first edit.
- **API and CLI work** where a made-up flag or version quietly costs you an hour.

---

## Development & testing

No dependencies to install — the project uses only Node.js built-ins, so contributing is friction-free. Run the suite with the built-in test runner:

```bash
node --test
```

```text
ℹ tests 29
ℹ pass 29
ℹ fail 0
```

Preview the installer's behavior without side effects:

```bash
node install.js --dry-run
```

---

## Uninstall

1. Remove the plugin from Claude Code's plugin manager (`/plugin`). The session-start reminder is part of the plugin, so it goes away with it — no settings cleanup needed.
2. Optionally remove any of the recommended dependency skills you no longer want.

---

## License

[MIT](LICENSE) © [Martin Barja Balseiro](https://github.com/Hanksito)

<div align="center">

**Built to make agentic coding sessions remember, stay on track, and tell the truth.**

</div>
