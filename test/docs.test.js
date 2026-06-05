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

test('README lists the two vendored skills', () => {
  const t = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.match(t, /memory-discipline/);
  assert.match(t, /verify-facts/);
});
