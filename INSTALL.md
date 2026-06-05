# Installing claude-guardrails-skill

**One command installs everything** — superpowers, planning-with-files, caveman, the two skills,
and this plugin (with its self-registering reminder hook).

## Requirements

- [Claude Code](https://claude.com/claude-code) (the `claude` CLI must be on your PATH).
- [Node.js](https://nodejs.org) ≥ 18 (provides `node` and `npx`).

## Install

The fastest way — no clone needed:

```bash
npx claude-guardrails-skill
```

Or from a clone:

```bash
git clone https://github.com/Hanksito/claude-guardrails-skill
cd claude-guardrails-skill
node install.js
```

Either way, the installer:

1. Adds this repo's marketplace and installs the plugins **in order** via the `claude` CLI —
   `superpowers` → `planning-with-files` → `caveman` → `claude-guardrails-skill`.
2. Installs the two skill-only dependencies via `npx skills add` — `find-skills`, `skill-judge`.

Then **restart Claude Code** so the new plugins and the SessionStart hook load.

### Preview first (no changes)

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

> 🪶 **Nothing is vendored.** The plugins are *re-listed* in this marketplace and pulled from
> their own repos. You get one install command without copying anyone's code.

## Manual alternative

Prefer to do it by hand (or only want some pieces)? Add the marketplace once and install what you
want:

```text
/plugin marketplace add https://github.com/Hanksito/claude-guardrails-skill
/plugin install claude-guardrails-skill
/plugin install superpowers
/plugin install planning-with-files
/plugin install caveman
```

Then `node install.js` (it will skip already-installed plugins) or run the two `npx skills add`
lines above yourself.

## Uninstall

Remove the plugins with `claude plugin uninstall <name>` (or `/plugin`). The reminder hook lives
inside the plugin, so it goes away automatically — no `settings.json` cleanup. Optionally remove
the `find-skills` and `skill-judge` skills.
