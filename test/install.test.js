'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const INSTALL = path.join(__dirname, '..', 'install.js');

function run(args) {
  return spawnSync(process.execPath, [INSTALL, ...args], { encoding: 'utf8' });
}

test('--dry-run prints every dependency command and the hook command', () => {
  const res = run(['--dry-run']);
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /npx skills add .*planning-with-files --skill planning-with-files/);
  assert.match(res.stdout, /npx skills add .*caveman --skill caveman/);
  assert.match(res.stdout, /npx skills add .*skills --skill find-skills/);
  assert.match(res.stdout, /npx skills add .*agent-toolkit --skill skill-judge/);
  assert.match(res.stdout, /SessionStart hook ->/);
  assert.match(res.stdout, /session-start\.js/);
});

test('--dry-run hook command uses forward slashes and carries the idempotency marker', () => {
  const res = run(['--dry-run']);
  assert.match(res.stdout, /hooks\/session-start\.js/);          // forward-slash path
  assert.doesNotMatch(res.stdout, /hooks\\session-start\.js/);   // never backslashes
  assert.match(res.stdout, /claude-guardrails-sessionstart/);    // path-independent marker token
});
