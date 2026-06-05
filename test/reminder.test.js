'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { buildReminder } = require('../lib/reminder');

test('reminder mentions all three guardrails', () => {
  const r = buildReminder();
  assert.match(r, /MEMORY LAYERS/);
  assert.match(r, /VERIFY FACTS/);
  assert.match(r, /CAVEMAN lite is ON/);
});

test('reminder stays brief (runs every session)', () => {
  assert.ok(buildReminder().length < 800);
});

test('hook script prints the reminder to stdout', () => {
  const res = spawnSync(process.execPath, [path.join(__dirname, '..', 'hooks', 'session-start.js')], { encoding: 'utf8' });
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /claude-guardrails/);
});

test('hook script ignores the extra marker-token argv and still prints', () => {
  const res = spawnSync(process.execPath, [path.join(__dirname, '..', 'hooks', 'session-start.js'), 'claude-guardrails-sessionstart'], { encoding: 'utf8' });
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /claude-guardrails/);
});
