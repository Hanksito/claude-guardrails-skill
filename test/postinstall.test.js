'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Point the dedup marker at a throwaway file before requiring the installer.
const MARKER = path.join(os.tmpdir(), 'cgs-test-marker-' + process.pid);
process.env.CGS_MARKER_FILE = MARKER;
const inst = require('../install.js');

const INSTALL = path.join(__dirname, '..', 'install.js');
function run(args, env) {
  return spawnSync(process.execPath, [INSTALL, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

test('isDevCheckout() is true when running from the source repo', () => {
  assert.strictEqual(inst.isDevCheckout(), true);
});

test('markRan() then recentlyRan() is true; a stale marker reads false', () => {
  try { fs.unlinkSync(MARKER); } catch { /* ignore */ }
  assert.strictEqual(inst.recentlyRan(), false, 'no marker yet');
  inst.markRan();
  assert.strictEqual(inst.recentlyRan(), true, 'just marked');
  fs.writeFileSync(MARKER, String(Date.now() - 60000)); // older than the 30s window
  assert.strictEqual(inst.recentlyRan(), false, 'stale marker ignored');
  try { fs.unlinkSync(MARKER); } catch { /* ignore */ }
});

test('--postinstall in a source checkout skips the install (npm i stays a no-op here)', () => {
  const res = run(['--postinstall', '--dry-run']);
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /skipping auto-install/i);
  assert.doesNotMatch(res.stdout, /marketplace add/);
});

test('--postinstall from a published-style layout (no test/ or skills/) proceeds', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cgs-pub-'));
  fs.copyFileSync(INSTALL, path.join(dir, 'install.js'));
  fs.copyFileSync(path.join(__dirname, '..', 'deps.json'), path.join(dir, 'deps.json'));
  fs.cpSync(path.join(__dirname, '..', 'lib'), path.join(dir, 'lib'), { recursive: true });

  const res = spawnSync(process.execPath, [path.join(dir, 'install.js'), '--postinstall', '--dry-run'], {
    encoding: 'utf8',
    env: { ...process.env, CGS_MARKER_FILE: path.join(dir, 'marker') },
  });
  fs.rmSync(dir, { recursive: true, force: true });

  assert.strictEqual(res.status, 0);
  assert.doesNotMatch(res.stdout, /skipping auto-install/i);
  assert.match(res.stdout, /claude plugin marketplace add/);
});

test('postinstall never fails the install: a missing claude CLI exits 0 (soft mode)', () => {
  // Published-style layout so the dev-checkout guard does not short-circuit first.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cgs-soft-'));
  fs.copyFileSync(INSTALL, path.join(dir, 'install.js'));
  fs.copyFileSync(path.join(__dirname, '..', 'deps.json'), path.join(dir, 'deps.json'));
  fs.cpSync(path.join(__dirname, '..', 'lib'), path.join(dir, 'lib'), { recursive: true });

  // Empty PATH so `claude` cannot be found -> the marketplace step fails.
  const res = spawnSync(process.execPath, [path.join(dir, 'install.js'), '--postinstall'], {
    encoding: 'utf8',
    env: { ...process.env, PATH: dir, Path: dir, CGS_MARKER_FILE: path.join(dir, 'marker') },
  });
  fs.rmSync(dir, { recursive: true, force: true });

  assert.strictEqual(res.status, 0, 'postinstall must not fail npm i');
  assert.match(res.stdout, /setup is incomplete/i);
});
