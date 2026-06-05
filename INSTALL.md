# Installing claude-guardrails-skill

## 1. Prerequisite: superpowers
This pack assumes the `superpowers` plugin is installed (it provides the method base,
including `verification-before-completion` and `writing-plans`). Install it from its own
marketplace first if you do not already have it.

## 2. Add this plugin
```
/plugin marketplace add https://github.com/Hanksito/claude-guardrails-skill
/plugin install claude-guardrails-skill
```

## 3. Run the installer
From the installed plugin directory (path printed by the plugin manager), run:
```
node install.js
```
This installs the external dependency skills (planning-with-files, caveman, find-skills,
skill-judge) via `npx skills add`, and registers a `SessionStart` reminder hook in
`~/.claude/settings.json`. The installer is idempotent — re-running it does not duplicate the hook.

Preview without changing anything:
```
node install.js --dry-run
```
