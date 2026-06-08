'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('INSTALL.md documents superpowers prerequisite and install.js', () => {
  const t = fs.readFileSync(path.join(root, 'INSTALL.md'), 'utf8');
  assert.match(t, /superpowers/);
  assert.match(t, /node install\.js/);
});

test('README explains the guardrails: three memory layers, verification, and install', () => {
  const t = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  // The three memory layers, described by concept (not internal skill names).
  assert.match(t, /long-term/i);
  assert.match(t, /working/i);
  assert.match(t, /blueprint/i);
  // The verify-before-asserting guardrail.
  assert.match(t, /verif/i);
  // The one-command install must stay documented and exact.
  assert.match(t, /npx claude-guardrails-skill/);
});

test('README does not expose dependency skill/plugin names', () => {
  const t = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  // Keep the public README behavior-focused — no name-dropping the bundled deps.
  for (const name of ['superpowers', 'planning-with-files', 'caveman', 'find-skills', 'skill-judge']) {
    assert.doesNotMatch(t, new RegExp(name, 'i'), `README should not name "${name}"`);
  }
});
