'use strict';

// Pure: the text injected at session start. Keep short — fires every session.
function buildReminder() {
  return [
    '[claude-guardrails] Active guardrails this session:',
    '1. MEMORY LAYERS — durable cross-session facts -> native memory (memory-discipline);',
    '   current-task state -> task_plan.md/findings.md/progress.md (planning-with-files);',
    '   pre-code blueprint -> writing-plans. Do not mix layers.',
    '2. VERIFY FACTS — never assert a version/API/flag/price from memory unverified;',
    '   verify this session or flag uncertainty (verify-facts).',
    '3. CAVEMAN lite is ON — terse, drop filler, keep grammar. "normal mode" to disable.',
  ].join('\n');
}

module.exports = { buildReminder };
