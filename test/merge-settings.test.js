'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { ensureSessionStartHook } = require('../lib/merge-settings');

const CMD = 'node "/home/u/.claude/plugins/marketplaces/claude-guardrails-skill/hooks/session-start.js"';

test('adds SessionStart hook to empty settings', () => {
  const out = ensureSessionStartHook({}, CMD);
  assert.strictEqual(out.hooks.SessionStart.length, 1);
  assert.strictEqual(out.hooks.SessionStart[0].hooks[0].command, CMD);
  assert.strictEqual(out.hooks.SessionStart[0].hooks[0].type, 'command');
});

test('is idempotent — second call does not duplicate', () => {
  const once = ensureSessionStartHook({}, CMD);
  const twice = ensureSessionStartHook(once, CMD);
  assert.strictEqual(twice.hooks.SessionStart.length, 1);
});

test('preserves existing unrelated SessionStart hooks', () => {
  const existing = { hooks: { SessionStart: [{ hooks: [{ type: 'command', command: 'echo other' }] }] } };
  const out = ensureSessionStartHook(existing, CMD);
  assert.strictEqual(out.hooks.SessionStart.length, 2);
});

test('matches by stable substring regardless of absolute prefix', () => {
  const winCmd = 'node "C:/Users/x/.claude/plugins/marketplaces/claude-guardrails-skill/hooks/session-start.js"';
  const first = ensureSessionStartHook({}, winCmd);
  const second = ensureSessionStartHook(first, 'node "D:/elsewhere/claude-guardrails-skill/hooks/session-start.js"');
  assert.strictEqual(second.hooks.SessionStart.length, 1);
});

test('preserves other top-level settings keys', () => {
  const out = ensureSessionStartHook({ model: 'opus', hooks: { Stop: [] } }, CMD);
  assert.strictEqual(out.model, 'opus');
  assert.ok(Array.isArray(out.hooks.Stop));
});
