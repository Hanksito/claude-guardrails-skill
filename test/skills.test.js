'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

function frontmatter(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, `missing frontmatter in ${file}`);
  return m[1];
}

const root = path.join(__dirname, '..', 'skills');

test('memory-discipline has name + description frontmatter', () => {
  const fm = frontmatter(path.join(root, 'memory-discipline', 'SKILL.md'));
  assert.match(fm, /^name:\s*memory-discipline\s*$/m);
  assert.match(fm, /^description:\s*\S/m);
});

test('memory-discipline names the three memory layers', () => {
  const body = fs.readFileSync(path.join(root, 'memory-discipline', 'SKILL.md'), 'utf8');
  assert.match(body, /planning-with-files/);
  assert.match(body, /MEMORY\.md/);
  assert.match(body, /verify-facts/);
});
