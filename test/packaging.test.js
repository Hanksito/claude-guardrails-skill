'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('install.js starts with a node shebang (runnable as an npm bin)', () => {
  const src = fs.readFileSync(path.join(root, 'install.js'), 'utf8');
  assert.ok(src.startsWith('#!/usr/bin/env node'), 'install.js must start with the node shebang');
});

test('package.json exposes the claude-guardrails-skill bin -> install.js', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.strictEqual(pkg.bin['claude-guardrails-skill'], 'install.js');
});

test('package.json ships the installer runtime files', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  for (const needed of ['install.js', 'lib/', 'deps.json']) {
    assert.ok(pkg.files.includes(needed), `package.json files must include ${needed}`);
  }
});
