# claude-guardrails-skill — Design Spec

**Date:** 2026-06-05
**Status:** Approved (design) — pending spec review → implementation plan
**Owner:** Martin Barja Balseiro — barjabalseiro@gmail.com — github.com/Hanksito

---

## 1. Goal

A **distributable Claude plugin** (installable on any device with Claude, via git) that
fixes the agent's three core failure modes — long-term memory, context loss, and inventing
facts — and pins down how the agent works and communicates. It **reuses mature existing
skills** as dependencies and only builds what is genuinely missing.

### Non-goals
- Not a rewrite of superpowers or planning-with-files. We depend on them, not replace them.
- No hardcoded machine/user paths. Must work on a fresh device for anyone.
- Does not vendor third-party code (licensing/maintenance) — externals install by reference.

---

## 2. Final inventory

| Piece | Origin | Role | How it enters |
|-------|--------|------|---------------|
| superpowers | external | method base (TDD, debugging, verification-before-completion, writing-plans, code-review) | dependency (reference) |
| planning-with-files | external | live working memory + context recovery | dependency (reference) |
| caveman (`caveman` skill only) | external | communication style | dependency (reference) |
| find-skills | external | discover skills | dependency (reference) |
| skill-judge | external | evaluate skills before installing | dependency (reference) |
| **memory-discipline** | **new (ours)** | discipline the native long-term memory | vendored |
| **verify-facts** | **new (ours)** | never assert facts/versions/APIs from memory unverified | vendored |
| **session-start hook** | **new (ours)** | orchestrator: reminds the rules at session start | vendored |

Net new work: **2 skills + 1 hook**. Everything else is reuse.

> Explicitly excluded: caveman's `caveman-compress` skill (it compresses memory files and
> would collide with the long-term memory layer). Only the communication `caveman` skill ships.

---

## 3. The three memory layers (must stay crisp)

The biggest risk is the agent getting confused about **where to write what**. Hard rule:

| Layer | Lives in | Governed by | For |
|-------|----------|-------------|-----|
| **Long-term** (cross-session) | `~/.claude/projects/.../memory/` + `MEMORY.md` | memory-discipline (new) | durable facts: user, project, feedback, references |
| **Working** (current task) | `task_plan.md` / `findings.md` / `progress.md` in project | planning-with-files | current multi-step task state; survives compaction |
| **Blueprint** (pre-code) | `docs/.../plan.md` | writing-plans (superpowers) | TDD implementation plan before coding |

**"Where do I write X?" decision rule:**
- Durable fact useful in future sessions → long-term memory
- State/progress/finding of the current task → planning-with-files
- A pre-coding implementation plan → writing-plans

`writing-plans` and `planning-with-files` do **not** compete: writing-plans authors the
static blueprint (before), planning-with-files is the live working memory + recovery (during).

---

## 4. New skills

### 4.1 `memory-discipline`
- **When to write:** durable facts — user identity/preferences, feedback (with the *why*),
  project constraints not derivable from code, reference pointers (URLs, dashboards, tickets).
- **What NOT to write:** transient task state (that is planning-with-files), anything
  derivable from code/git/CLAUDE.md.
- **Recall hygiene:** treat recalled memories as possibly **stale**. Before acting on a
  memory that names a file/function/flag, verify it still exists (ties into verify-facts).
- **Portability:** use the native memory location the harness provides. **Zero hardcoded paths.**
- **Index discipline:** one fact per file with frontmatter; one-line pointer in `MEMORY.md`;
  update existing files instead of duplicating; delete memories proven wrong.

### 4.2 `verify-facts`
- **Triggers before asserting:** a version number, API signature, library behavior, pricing,
  or config flag stated "from memory".
- **Rule:** if not verified this session (read/search/fetch), either verify it or explicitly
  flag uncertainty. Never assert it as fact.
- **Complements, does not duplicate** `verification-before-completion` (which covers the other
  angle: "did the command/test actually run?"). verify-facts is about factual claims, not
  completion claims.

---

## 5. Enforcement (hooks)

- **planning-with-files** already ships: `UserPromptSubmit`, `PreToolUse`, `PostToolUse`,
  `Stop`, `PreCompact` — this provides the context-layer enforcement and compaction recovery.
- **Our `session-start` hook** adds, once per session, a short reminder of:
  1. The three memory layers + the "where do I write what" rule
  2. Caveman lite is ON
  3. The verify-facts rule
- Hooks from different plugins **coexist** (settings.json merges by event). No conflict.

---

## 6. Communication style

- Caveman **lite, always active**. Only the `caveman` skill ships (not caveman-compress).
- Caveman's own guardrails (Auto-Clarity: security warnings, irreversible-action confirmations,
  ambiguity, user asks to clarify) already respect the verify-facts intent by design.
- Off switch remains the caveman default: "normal mode" / "stop caveman".

---

## 7. Repository architecture

```
claude-guardrails-skill/        (git repo)
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── skills/
│   ├── memory-discipline/SKILL.md
│   └── verify-facts/SKILL.md
├── hooks/
│   └── session-start.js          (portable, node — works Win/Mac/Linux)
├── deps.json                     (external skills to install)
├── install.js                    (node, cross-platform)
├── settings-fragment.json        (the SessionStart hook to merge)
├── INSTALL.md
└── README.md
```

### Install flow (one command, any OS)
1. `npx skills add https://github.com/<user>/claude-guardrails-skill` → brings our 2 skills.
2. `install.js` (node):
   - installs the 5 external dependencies via `npx skills add ...` (from `deps.json`)
   - merges the `SessionStart` hook into `~/.claude/settings.json` (idempotent)
   - optionally copies planning-with-files' `loop.md` template

### Packaging strategy
- **External deps** (superpowers, planning-with-files, caveman, find-skills, skill-judge):
  **by reference** — `install.js` pulls them from their repos. Clean licensing, always current.
- **Our skills** (memory-discipline, verify-facts): **vendored** in this repo.

---

## 8. Cross-platform constraints

- Author's environment: Windows 10 + PowerShell; working dir under `.gemini/antigravity/`.
- `install.js` and `session-start.js` are **node-based** so they run on Windows/macOS/Linux.
- No `curl | bash` auto-installers. Dependencies install via the documented `npx skills add`.
- `settings.json` merge must be idempotent (re-running install does not duplicate hooks).

---

## 9. Open items for the implementation plan

- Exact wording/format of the `session-start` reminder (keep it short — it runs every session).
- `deps.json` schema and how `install.js` consumes it.
- Idempotent JSON-merge logic for `settings.json`.
- Verifying each external `npx skills add` command/URL is current at build time
  (apply verify-facts to ourselves).
- Whether to also register a `marketplace.json` entry so the pack is installable via
  `/plugin marketplace add`.
```

