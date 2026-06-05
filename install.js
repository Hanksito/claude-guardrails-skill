'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { buildCommands } = require('./lib/deps');

// Installs the skill-only dependencies that are not available as marketplace plugins
// (find-skills, skill-judge). The plugins — claude-guardrails-skill, superpowers,
// planning-with-files, caveman — are installed from the marketplace via /plugin install,
// and this plugin's SessionStart hook auto-registers through hooks/hooks.json. So this
// script no longer touches ~/.claude/settings.json.
function main(argv) {
  const dryRun = argv.includes('--dry-run');
  const deps = JSON.parse(fs.readFileSync(path.join(__dirname, 'deps.json'), 'utf8'));
  const cmds = buildCommands(deps);

  for (const args of cmds) {
    const printable = 'npx ' + args.join(' ');
    if (dryRun) {
      process.stdout.write(printable + '\n');
      continue;
    }
    process.stdout.write('Installing: ' + printable + '\n');
    const res = spawnSync('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });
    if (res.status !== 0) {
      process.stderr.write('Failed: ' + printable + '\n');
      process.exitCode = 1;
      return;
    }
  }

  if (dryRun) {
    process.stdout.write('\nThe plugins (claude-guardrails-skill, superpowers, planning-with-files, caveman)\n');
    process.stdout.write('install from the marketplace — see INSTALL.md.\n');
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main };
