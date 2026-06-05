'use strict';

// Stable, path-independent marker token embedded in our hook command (as an inert
// extra argv). Lets us recognize our own SessionStart hook regardless of where the
// plugin is installed, so re-running the installer never duplicates the hook.
const MARKER = 'claude-guardrails-sessionstart';

// Pure: return a NEW settings object containing exactly one claude-guardrails
// SessionStart hook. The input is never mutated; existing hooks and other top-level
// keys are preserved. Recognizes our hook in both grouped and flat formats.
function ensureSessionStartHook(settings, command) {
  const base = settings && typeof settings === 'object' ? settings : {};
  const prevHooks = base.hooks && typeof base.hooks === 'object' ? base.hooks : {};
  const existing = Array.isArray(prevHooks.SessionStart) ? prevHooks.SessionStart : [];

  const hasMarker = existing.some((entry) => {
    if (entry && typeof entry.command === 'string' && entry.command.includes(MARKER)) {
      return true; // flat format: { type, command }
    }
    return entry && Array.isArray(entry.hooks) &&
      entry.hooks.some((h) => typeof h.command === 'string' && h.command.includes(MARKER));
  });

  const SessionStart = hasMarker
    ? existing.slice()
    : existing.concat([{ hooks: [{ type: 'command', command }] }]);

  return { ...base, hooks: { ...prevHooks, SessionStart } };
}

module.exports = { ensureSessionStartHook, MARKER };
