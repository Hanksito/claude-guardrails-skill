# Installing claude-guardrails-skill

Everything installs from **one marketplace** — including `superpowers`, so you don't add its
marketplace separately.

## 1. Add the marketplace (once)

```text
/plugin marketplace add https://github.com/Hanksito/claude-guardrails-skill
```

## 2. Install the plugins from it

```text
/plugin install claude-guardrails-skill
/plugin install superpowers
/plugin install planning-with-files
/plugin install caveman
```

- `claude-guardrails-skill` ships the `memory-discipline` and `verify-facts` skills **and its
  own `SessionStart` reminder hook, which registers automatically** on install — nothing to wire
  up, no `settings.json` editing.
- `superpowers`, `planning-with-files`, and `caveman` are re-listed in this marketplace and pulled
  straight from their source repos (by reference — nothing is vendored).

## 3. Add the two skill-only tools

`find-skills` and `skill-judge` are distributed as bare skills (not plugins), so they install with
the `skills` CLI. From the installed plugin directory:

```bash
node install.js
```

Preview without changing anything:

```bash
node install.js --dry-run
```

This runs:

```text
npx skills add https://github.com/vercel-labs/skills --skill find-skills
npx skills add https://github.com/softaworks/agent-toolkit --skill skill-judge
```

## Uninstall

Remove the plugins via `/plugin`, then (optionally) the two skills you no longer want. Because the
reminder hook is declared inside the plugin, uninstalling the plugin removes the hook too — no
manual `settings.json` cleanup needed.
