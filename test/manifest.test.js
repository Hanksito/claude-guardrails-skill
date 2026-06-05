'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('plugin.json valid with required fields', () => {
  const p = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
  assert.strictEqual(p.name, 'claude-guardrails-skill');
  assert.strictEqual(typeof p.version, 'string');
  assert.strictEqual(typeof p.description, 'string');
});

test('marketplace.json lists the plugin with source ./', () => {
  const m = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));
  assert.ok(Array.isArray(m.plugins) && m.plugins.length >= 1);
  assert.strictEqual(m.plugins[0].source, './');
  assert.strictEqual(m.plugins[0].name, 'claude-guardrails-skill');
});
