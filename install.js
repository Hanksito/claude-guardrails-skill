#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { buildCommands } = require('./lib/deps');

// One command installs everything:
//   1. plugins (via the `claude` CLI) — from this repo's meta-marketplace, in order
//   2. skill-only dependencies (via `npx skills add`)
// The claude-guardrails-skill plugin self-registers its SessionStart hook (hooks/hooks.json),
// so nothing here touches ~/.claude/settings.json.
//
// Entry points:
//   npx claude-guardrails-skill        -> main([])            (hard: failures exit non-zero)
//   node install.js                    -> main([])
//   npm i claude-guardrails-skill      -> main(['--postinstall'])  (soft: never fails `npm i`)
// The `--postinstall` path is wired from package.json's "postinstall" script.

const MARKETPLACE = 'https://github.com/Hanksito/claude-guardrails-skill';
const MARKETPLACE_NAME = 'claude-guardrails-skill';

// Install order: method base first, then working memory, comms, then our own guardrails.
const PLUGINS = ['superpowers', 'planning-with-files', 'caveman', 'claude-guardrails-skill'];

// Short-lived marker so the npx double-fire (postinstall + bin run, seconds apart) installs once.
const MARKER_FILE = process.env.CGS_MARKER_FILE
  || path.join(os.tmpdir(), 'claude-guardrails-skill.lastrun');
const DEDUP_WINDOW_MS = 30000;

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

// A dev checkout ships test/ and skills/ that the npm tarball never includes. Their presence
// means we're running from source, where the automatic postinstall must NOT install the stack.
function isDevCheckout() {
  return fs.existsSync(path.join(__dirname, 'test'))
    || fs.existsSync(path.join(__dirname, 'skills'));
}

function recentlyRan() {
  try {
    const t = Number(fs.readFileSync(MARKER_FILE, 'utf8'));
    return Number.isFinite(t) && (Date.now() - t) < DEDUP_WINDOW_MS;
  } catch {
    return false;
  }
}

function markRan() {
  try {
    fs.writeFileSync(MARKER_FILE, String(Date.now()));
  } catch {
    /* best effort — dedup is an optimization, not correctness */
  }
}

function main(argv) {
  const dryRun = argv.includes('--dry-run');
  const postinstall = argv.includes('--postinstall');
  const force = argv.includes('--force');
  // postinstall runs automatically on `npm i`; it must never break the install.
  const soft = postinstall;

  // Running from a source checkout: the auto-postinstall stays out of the way.
  // (An explicit `node install.js` from a clone still installs — that's the documented flow.)
  if (postinstall && isDevCheckout()) {
    process.stdout.write(
      'claude-guardrails-skill: source checkout detected — skipping auto-install.\n' +
      'Run `node install.js` to install the stack yourself.\n');
    return;
  }

  // Collapse the npx double-fire (and accidental rapid re-runs). --force overrides.
  if (!dryRun && !force && recentlyRan()) {
    process.stdout.write(
      'claude-guardrails-skill: already set up moments ago — nothing to do (use --force to re-run).\n');
    return;
  }

  let ok = true;
  const fail = (msg) => {
    process.stderr.write(msg + '\n');
    ok = false;
    if (!soft) process.exitCode = 1;
  };

  // 1. plugins via the claude CLI
  if (run('claude', ['plugin', 'marketplace', 'add', MARKETPLACE], dryRun) !== 0 && !dryRun) {
    fail('Failed to add the marketplace. Is the `claude` CLI installed and on PATH?');
  }
  if (ok) {
    for (const plugin of PLUGINS) {
      if (run('claude', ['plugin', 'install', `${plugin}@${MARKETPLACE_NAME}`], dryRun) !== 0 && !dryRun) {
        fail(`Failed to install plugin: ${plugin}`);
        break;
      }
    }
  }

  // 2. skill-only dependencies via npx
  if (ok) {
    const deps = JSON.parse(fs.readFileSync(path.join(__dirname, 'deps.json'), 'utf8'));
    for (const args of buildCommands(deps)) {
      if (run('npx', args, dryRun) !== 0 && !dryRun) {
        fail('Failed: npx ' + args.join(' '));
        break;
      }
    }
  }

  if (dryRun) {
    process.stdout.write('\n(dry run — no changes made)\n');
    return;
  }

  if (ok) {
    markRan();
    process.stdout.write('\nDone. Restart Claude Code so the new plugins and hook load.\n');
  } else if (soft) {
    // npm i must succeed even if the stack didn't install — tell the user how to finish.
    process.stdout.write(
      '\nclaude-guardrails-skill: setup is incomplete (see errors above).\n' +
      'Once the `claude` CLI is on PATH, finish with: npx claude-guardrails-skill\n');
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main, PLUGINS, MARKETPLACE_NAME, isDevCheckout, recentlyRan, markRan, MARKER_FILE };
