# Staged Battle Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a staged, accessible arcade battle animation from the countdown through the final result.

**Architecture:** Keep orchestration in `src/scripts/battle.ts` and the presentation in `src/pages/index.astro`. Start both contribution requests concurrently with a 3-2-1-FIGHT countdown, then reveal animated grids, category stats and cumulative five-point health bars before celebrating the outcome.

**Tech Stack:** Astro, TypeScript, CSS animations, Node.js built-in test runner.

**Spec:** User request in chat (staged battle sequence).

## Global Constraints

- Preserve the existing Astro, TypeScript, and modular client-script structure.
- Fetch both users in parallel; the countdown runs while requests are in flight.
- Reveal stat categories in the order Total Contributions, Longest Streak, Current Streak, Peak Day, Consistency, with 400 ms between rows.
- Animate contribution grids from the earliest week to the latest week.
- Respect `prefers-reduced-motion` and retain clear API error handling.
- Add no dependencies.

## Review Focus

- A failed or slow fetch must not leave the countdown running or the submit button disabled.
- A tie must produce a clear draw ending rather than incorrectly declaring a winner.
- A repeated battle must not leave stale grid, meter, or particle animation state.
- Reduced-motion users must receive the full result without forced delays or motion.
- Heatmap cells must stay in chronological week order while revealing.

---

### Task 1: Countdown, contribution reveal, and battle meters

**Files:**
- Modify: `src/scripts/battle.ts`
- Modify: `src/pages/index.astro`
- Test: `tests/battle.test.mjs`

**Interfaces:**
- Keep the API response shape and `fetchBattle` behavior unchanged.
- Add a testable countdown helper and grid/category reveal helpers in `battle.ts`; use an injectable wait callback only where needed for deterministic tests.
- Add accessible countdown/clash markup and two progress meters to the battle results HUD.

- [x] **Step 1: Write failing tests** for countdown order, 52-column left-to-right grid staggering, ordered category reveal with 400 ms waits, and cumulative meter progress.
- [x] **Step 2: Run** `node --test tests/battle.test.mjs`; confirm failures are caused by missing stage helpers.
- [x] **Step 3: Implement** countdown and reveal helpers; launch both fetches and countdown concurrently; update each meter by its accumulated category points as each row is revealed.
- [x] **Step 4: Add HUD markup and CSS** for the clash countdown, player-colored arcade meters, column reveal, and row-by-row stat reveal; make countdown and reveal delays immediate under reduced motion.
- [x] **Step 5: Run** `node --test tests/battle.test.mjs tests/scoring.test.mjs tests/contributions.test.mjs` and `npm run build`.

### Task 2: Final result celebration and resilience

**Files:**
- Modify: `src/scripts/battle.ts`
- Modify: `src/pages/index.astro`
- Test: `tests/battle.test.mjs`

**Interfaces:**
- Reuse the battle winner and score produced by the existing `scoreBattle` flow.
- The final animation helper receives the winner outcome and a particle container, and applies/removes page-level animation classes.

- [x] **Step 1: Write a failing test** for winner/draw celebration state and particle cleanup/replacement between consecutive battles.
- [x] **Step 2: Run** `node --test tests/battle.test.mjs`; confirm it fails on the missing celebration behavior.
- [x] **Step 3: Implement** the K.O./VICTORY!/DRAW banner entrance, subtle screen shake, and generated celebratory particles; clear previous animation state before each battle and on fetch errors.
- [x] **Step 4: Run** the complete test suite, `npm run build`, `git diff --check`, and verify live page and API responses for both preset pairs plus the requested nonexistent user.
