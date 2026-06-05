'use strict';

// Stable, path-independent marker token embedded in our hook command (as an inert
// extra argv). Lets us recognize our own SessionStart hook regardless of where the
// plugin is installed, so re-running the installer never duplicates the hook.
const MARKER = 'claude-guardrails-sessionstart';

// Pure: return a new settings object guaranteed to contain exactly one
// claude-guardrails SessionStart hook. Existing hooks/keys are preserved.
function ensureSessionStartHook(settings, command) {
  const next = settings && typeof settings === 'object' ? settings : {};
  next.hooks = next.hooks || {};
  next.hooks.SessionStart = next.hooks.SessionStart || [];

  const already = next.hooks.SessionStart.some((group) =>
    Array.isArray(group.hooks) &&
    group.hooks.some((h) => typeof h.command === 'string' && h.command.includes(MARKER))
  );

  if (!already) {
    next.hooks.SessionStart.push({ hooks: [{ type: 'command', command }] });
  }
  return next;
}

module.exports = { ensureSessionStartHook, MARKER };
