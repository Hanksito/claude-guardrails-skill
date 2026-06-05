'use strict';

// Stable marker used for idempotency — present in every install's hook command.
const MARKER = 'claude-guardrails-skill/hooks/session-start.js';

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
