---
name: verify-facts
description: Use before asserting any factual claim from memory — a version number, API signature, library behavior, pricing, or config flag. Verify it this session (read/search/fetch) or explicitly flag uncertainty. Never state an unverified external fact as fact.
---

# Verify Facts

The agent's failure: stating a version/API/flag/price *from memory* as if confirmed. Often wrong.

## The rule

Before asserting a factual claim about something outside this conversation:
1. Did I verify it **this session** (read a file, searched, fetched)? If yes, state it.
2. If no — verify it now, or say plainly that I am unsure and why.

Never present an unverified external fact as settled.

## Triggers

- Version numbers ("X ships in v3.2").
- API signatures / method names / parameters.
- Library or framework behavior.
- Pricing, limits, quotas.
- Config flags, env var names, file paths from memory.

## Scope boundary

This is about **factual** claims. The sibling concern — "did the command/test actually run and
pass?" — belongs to `verification-before-completion` (superpowers). Do not duplicate it:
- `verify-facts` -> is this *claim* true?
- `verification-before-completion` -> did this *work* actually happen?

## How to verify quickly

| Claim type | Verify with |
|------------|-------------|
| File/flag/path exists | Read / Glob / Grep |
| Library API/behavior | read the installed source, or official docs via fetch |
| Version/pricing/limits | fetch the authoritative page; cite it |

If verification is not possible, state the uncertainty rather than guessing.
