# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] — 2026-06-05

Publishable to npm for a no-clone install.

### Added
- **`npx claude-guardrails-skill`** — the installer is now an npm `bin`. `install.js` carries a
  `#!/usr/bin/env node` shebang and `package.json` declares `bin`, `files`, `engines`, and repo
  metadata, so the whole stack installs with one command without cloning.
- `prepublishOnly` runs the test suite before any `npm publish`.
- Packaging guard tests (`test/packaging.test.js`).

## [0.3.0] — 2026-06-05

True one-command install.

### Changed
- **`install.js` now installs everything.** Using the `claude` CLI (verified to support
  `claude plugin marketplace add` and `claude plugin install`), the installer adds this repo's
  marketplace and installs the plugins **in order** — `superpowers` → `planning-with-files` →
  `caveman` → `claude-guardrails-skill` — then installs `find-skills` and `skill-judge` via
  `npx skills add`. A single `node install.js` sets up the whole stack; `superpowers` no longer
  needs a manual step.
- Docs updated to the `git clone … && node install.js` flow, with a manual `/plugin` alternative.

### Notes
- Requires the `claude` CLI on PATH (always true for Claude Code users) and Node ≥ 18.
- Still nothing vendored; plugins are pulled from their own repos via the meta-marketplace.

## [0.2.0] — 2026-06-05

Re-architected installation around a single marketplace. **Breaking** install-flow change.

### Changed
- **Meta-marketplace.** `.claude-plugin/marketplace.json` now re-lists `superpowers`,
  `planning-with-files`, and `caveman` (pulled from their own repos, by reference — nothing
  vendored). One `/plugin marketplace add` exposes everything; `superpowers` no longer needs its
  own marketplace added separately.
- **Self-registering hook.** The SessionStart reminder is now declared in `hooks/hooks.json` and
  wired up by the plugin loader via `${CLAUDE_PLUGIN_ROOT}`. Installing the plugin registers it;
  uninstalling removes it. No `settings.json` mutation.
- **Slim installer.** `install.js` now installs only the two skill-only dependencies
  (`find-skills`, `skill-judge`) via `npx skills add`.

### Removed
- `lib/merge-settings.js` and its tests — the manual `settings.json` merge and the
  `claude-guardrails-sessionstart` marker token are obsolete now that the hook self-registers.

## [0.1.0] — 2026-06-05

First release.

### Added
- **`memory-discipline` skill** — disciplines Claude's native long-term memory and keeps the
  three memory layers (long-term · working · blueprint) from mixing.
- **`verify-facts` skill** — never assert a version / API / flag / price from memory unverified;
  complements (does not duplicate) superpowers' `verification-before-completion`.
- **SessionStart reminder hook** (`hooks/session-start.js`) — a short, idempotent reminder of the
  guardrails injected at the start of every session.
- **Installer** (`install.js`) — installs the four coordinated dependency skills
  (`planning-with-files`, `caveman`, `find-skills`, `skill-judge`) via `npx skills add`, and
  registers the SessionStart hook in `~/.claude/settings.json`. Supports `--dry-run`.
- **Pure, idempotent settings merge** (`lib/merge-settings.js`) — re-running the installer never
  duplicates the hook; recognizes the hook by a path-independent marker token
  (`claude-guardrails-sessionstart`).
- Plugin manifests (`.claude-plugin/plugin.json`, `marketplace.json`), `deps.json`, `INSTALL.md`,
  a professional `README.md` with SVG banner, and an MIT `LICENSE`.

### Notes
- Cross-platform (Windows / macOS / Linux), zero runtime dependencies — pure Node built-ins.
- No hardcoded machine paths; the hook path resolves at install time.
- `superpowers` is a prerequisite and is installed separately (not by `install.js`).
- 25/25 tests passing (`node --test`).

[0.4.0]: https://github.com/Hanksito/claude-guardrails-skill/releases/tag/v0.4.0
[0.3.0]: https://github.com/Hanksito/claude-guardrails-skill/releases/tag/v0.3.0
[0.2.0]: https://github.com/Hanksito/claude-guardrails-skill/releases/tag/v0.2.0
[0.1.0]: https://github.com/Hanksito/claude-guardrails-skill/releases/tag/v0.1.0
