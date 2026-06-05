#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { buildCommands } = require('./lib/deps');

// One command installs everything:
//   1. plugins (via the `claude` CLI) — from this repo's meta-marketplace, in order
//   2. skill-only dependencies (via `npx skills add`)
// The claude-guardrails-skill plugin self-registers its SessionStart hook (hooks/hooks.json),
// so nothing here touches ~/.claude/settings.json.

const MARKETPLACE = 'https://github.com/Hanksito/claude-guardrails-skill';
const MARKETPLACE_NAME = 'claude-guardrails-skill';

// Install order: method base first, then working memory, comms, then our own guardrails.
const PLUGINS = ['superpowers', 'planning-with-files', 'caveman', 'claude-guardrails-skill'];

function run(cmd, args, dryRun) {
  const printable = [cmd, ...args].join(' ');
  if (dryRun) {
    process.stdout.write(printable + '\n');
    return 0;
  }
  process.stdout.write('-> ' + printable + '\n');
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  return typeof res.status === 'number' ? res.status : 1;
}

function main(argv) {
  const dryRun = argv.includes('--dry-run');

  // 1. plugins via the claude CLI
  if (run('claude', ['plugin', 'marketplace', 'add', MARKETPLACE], dryRun) !== 0 && !dryRun) {
    process.stderr.write('Failed to add the marketplace. Is the `claude` CLI installed and on PATH?\n');
    process.exitCode = 1;
    return;
  }
  for (const plugin of PLUGINS) {
    if (run('claude', ['plugin', 'install', `${plugin}@${MARKETPLACE_NAME}`], dryRun) !== 0 && !dryRun) {
      process.stderr.write(`Failed to install plugin: ${plugin}\n`);
      process.exitCode = 1;
      return;
    }
  }

  // 2. skill-only dependencies via npx
  const deps = JSON.parse(fs.readFileSync(path.join(__dirname, 'deps.json'), 'utf8'));
  for (const args of buildCommands(deps)) {
    if (run('npx', args, dryRun) !== 0 && !dryRun) {
      process.stderr.write('Failed: npx ' + args.join(' ') + '\n');
      process.exitCode = 1;
      return;
    }
  }

  process.stdout.write(dryRun
    ? '\n(dry run — no changes made)\n'
    : '\nDone. Restart Claude Code so the new plugins and hook load.\n');
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main, PLUGINS, MARKETPLACE_NAME };
