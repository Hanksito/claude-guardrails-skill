'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const INSTALL = path.join(__dirname, '..', 'install.js');

function run(args) {
  return spawnSync(process.execPath, [INSTALL, ...args], { encoding: 'utf8' });
}

test('--dry-run prints the two skill-only dependency commands', () => {
  const res = run(['--dry-run']);
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /npx skills add .*skills --skill find-skills/);
  assert.match(res.stdout, /npx skills add .*agent-toolkit --skill skill-judge/);
});

test('--dry-run does not touch settings.json (no hook registration here)', () => {
  const res = run(['--dry-run']);
  assert.doesNotMatch(res.stdout, /SessionStart/);
  assert.doesNotMatch(res.stdout, /settings\.json registered/i);
  assert.match(res.stdout, /marketplace/); // points users to the marketplace for plugins
});
