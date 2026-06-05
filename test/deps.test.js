'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { buildCommands } = require('../lib/deps');

test('buildCommands maps repo+skill to npx argv', () => {
  const out = buildCommands([{ repo: 'https://github.com/x/y', skill: 'foo' }]);
  assert.deepStrictEqual(out, [['skills', 'add', 'https://github.com/x/y', '--skill', 'foo']]);
});

test('buildCommands rejects non-array', () => {
  assert.throws(() => buildCommands(null), TypeError);
});

test('buildCommands rejects dep missing fields', () => {
  assert.throws(() => buildCommands([{ repo: 'x' }]), TypeError);
});

test('deps.json contains the four external skills', () => {
  const deps = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'deps.json'), 'utf8'));
  const skills = deps.map((d) => d.skill).sort();
  assert.deepStrictEqual(skills, ['caveman', 'find-skills', 'planning-with-files', 'skill-judge']);
});
