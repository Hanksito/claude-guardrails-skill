'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const INSTALL = path.join(__dirname, '..', 'install.js');

function run(args) {
  return spawnSync(process.execPath, [INSTALL, ...args], { encoding: 'utf8' });
}

test('--dry-run adds the marketplace and installs the four plugins', () => {
  const res = run(['--dry-run']);
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /claude plugin marketplace add https:\/\/github\.com\/Hanksito\/claude-guardrails-skill/);
  assert.match(res.stdout, /claude plugin install superpowers@claude-guardrails-skill/);
  assert.match(res.stdout, /claude plugin install planning-with-files@claude-guardrails-skill/);
  assert.match(res.stdout, /claude plugin install caveman@claude-guardrails-skill/);
  assert.match(res.stdout, /claude plugin install claude-guardrails-skill@claude-guardrails-skill/);
});

test('--dry-run then installs the two skill-only deps via npx', () => {
  const res = run(['--dry-run']);
  assert.match(res.stdout, /npx skills add .*skills --skill find-skills/);
  assert.match(res.stdout, /npx skills add .*agent-toolkit --skill skill-judge/);
});

test('superpowers is installed before the skill-only deps (order)', () => {
  const out = run(['--dry-run']).stdout;
  assert.ok(out.indexOf('superpowers@') < out.indexOf('find-skills'), 'superpowers should come first');
});

test('--dry-run makes no changes (no settings.json, marks itself a dry run)', () => {
  const res = run(['--dry-run']);
  assert.doesNotMatch(res.stdout, /settings\.json/);
  assert.match(res.stdout, /dry run/i);
});
