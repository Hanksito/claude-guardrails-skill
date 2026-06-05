'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { buildCommands } = require('./lib/deps');
const { ensureSessionStartHook } = require('./lib/merge-settings');

function hookCommand() {
  // Absolute path to this install's hook, normalized to forward slashes so the
  // idempotency MARKER matches on Windows as well as POSIX.
  // Replace the directory basename with the package name so the marker path
  // always contains "claude-guardrails-skill/hooks/session-start.js"
  // regardless of the actual checkout directory name.
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const pkgName = pkg.name;
  const parent = path.dirname(__dirname).replace(/\\/g, '/');
  const abs = `${parent}/${pkgName}/hooks/session-start.js`;
  return `node "${abs}"`;
}

function settingsPath() {
  return path.join(os.homedir(), '.claude', 'settings.json');
}

function readSettings(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_e) {
    return {};
  }
}

function main(argv) {
  const dryRun = argv.includes('--dry-run');
  const deps = JSON.parse(fs.readFileSync(path.join(__dirname, 'deps.json'), 'utf8'));
  const cmds = buildCommands(deps);
  const hookCmd = hookCommand();

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

  const file = settingsPath();
  if (dryRun) {
    process.stdout.write(`SessionStart hook -> ${file}\n  ${hookCmd}\n`);
    return;
  }
  const merged = ensureSessionStartHook(readSettings(file), hookCmd);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + '\n');
  process.stdout.write(`Registered SessionStart hook in ${file}\n`);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main, hookCommand, settingsPath };
