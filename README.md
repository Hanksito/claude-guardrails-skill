# claude-guardrails-skill

A guardrail pack for Claude that fixes three recurring failures and pins down working style.

## What it adds
- **memory-discipline** (vendored) — disciplines the native long-term memory; keeps the three
  memory layers from mixing.
- **verify-facts** (vendored) — never assert a version/API/flag/price from memory unverified.
- **SessionStart reminder** — a short hook reminding the agent of the guardrails each session.

## What it coordinates (installed as dependencies)
- planning-with-files — live working memory + context recovery.
- caveman (lite, on) — terse communication style.
- find-skills + skill-judge — discover and evaluate new skills.
- superpowers — prerequisite method base.

See [INSTALL.md](INSTALL.md).
