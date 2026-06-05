'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { ensureSessionStartHook } = require('../lib/merge-settings');

const CMD = 'node "/home/u/.claude/plugins/marketplaces/claude-guardrails-skill/hooks/session-start.js" claude-guardrails-sessionstart';

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

test('matches by stable token regardless of the executable path', () => {
  const first = ensureSessionStartHook({}, 'node "C:/Users/x/skill-agent/hooks/session-start.js" claude-guardrails-sessionstart');
  const second = ensureSessionStartHook(first, 'node "D:/totally/different/place.js" claude-guardrails-sessionstart');
  assert.strictEqual(second.hooks.SessionStart.length, 1);
});

test('preserves other top-level settings keys', () => {
  const out = ensureSessionStartHook({ model: 'opus', hooks: { Stop: [] } }, CMD);
  assert.strictEqual(out.model, 'opus');
  assert.ok(Array.isArray(out.hooks.Stop));
});

test('does not mutate the input settings (pure)', () => {
  const input = { model: 'opus' };
  const out = ensureSessionStartHook(input, CMD);
  assert.notStrictEqual(out, input);
  assert.strictEqual(input.hooks, undefined);
});

test('dedupes against a flat-format hook carrying the marker', () => {
  const flat = { hooks: { SessionStart: [{ type: 'command', command: 'node "/x.js" claude-guardrails-sessionstart' }] } };
  const out = ensureSessionStartHook(flat, CMD);
  assert.strictEqual(out.hooks.SessionStart.length, 1);
});
