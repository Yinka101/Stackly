#!/usr/bin/env bun
/**
 * Coach eval runner.
 *
 * Usage:
 *   bun server/evals/run-evals.ts
 *
 * Requires:
 *   OPENAI_API_KEY in .env (for live LLM tests)
 *   The server does NOT need to be running — we call the functions directly.
 *
 * Output: pass/fail per eval, summary at the end.
 */

import { EVALS, type Eval } from './prompts.eval.js';
import { moderateInput } from '../ai/prompts.js';
import { buildSystemPrompt } from '../ai/prompts.js';
import { complete } from '../ai/provider.js';

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

interface EvalResult {
  eval: Eval;
  passed: boolean;
  blocked: boolean;
  reply: string;
  failures: string[];
}

async function runEval(e: Eval): Promise<EvalResult> {
  const failures: string[] = [];

  // Step 1: moderation check
  const modResult = moderateInput(e.input);
  const wasBlocked = !modResult.safe;

  if (e.expectBlocked) {
    if (!wasBlocked) {
      failures.push(`Expected input to be blocked (reason: not blocked)`);
    }
    return {
      eval: e,
      passed: failures.length === 0,
      blocked: wasBlocked,
      reply: wasBlocked ? '[BLOCKED BY MODERATOR]' : '[NOT BLOCKED — FAIL]',
      failures,
    };
  }

  if (wasBlocked) {
    // Should NOT have been blocked
    failures.push(`Input was blocked unexpectedly (reason: ${modResult.safe === false ? modResult.reason : 'unknown'})`);
    return { eval: e, passed: false, blocked: true, reply: '[BLOCKED UNEXPECTEDLY]', failures };
  }

  // Step 2: get LLM reply
  const systemPrompt = buildSystemPrompt(e.band);
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: e.input },
  ];

  const reply = await complete(messages);
  const replyLower = reply.toLowerCase();

  // Step 3: check mustContain
  for (const required of (e.mustContain ?? [])) {
    if (!replyLower.includes(required.toLowerCase())) {
      failures.push(`Missing required text: "${required}"`);
    }
  }

  // Step 4: check mustNotContain
  for (const forbidden of (e.mustNotContain ?? [])) {
    if (replyLower.includes(forbidden.toLowerCase())) {
      failures.push(`Found forbidden text: "${forbidden}"`);
    }
  }

  return {
    eval: e,
    passed: failures.length === 0,
    blocked: false,
    reply,
    failures,
  };
}

async function main() {
  console.log(`\n${BOLD}Stackly Coach Eval Suite${RESET}`);
  console.log(`Running ${EVALS.length} evals...\n`);

  if (!process.env.OPENAI_API_KEY) {
    console.log(`${YELLOW}Warning: OPENAI_API_KEY not set — LLM tests will use offline fallback${RESET}\n`);
  }

  const results: EvalResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const e of EVALS) {
    process.stdout.write(`  ${e.id} ${e.description}... `);
    try {
      const result = await runEval(e);
      results.push(result);
      if (result.passed) {
        passed++;
        console.log(`${GREEN}PASS${RESET}`);
      } else {
        failed++;
        console.log(`${RED}FAIL${RESET}`);
        for (const f of result.failures) {
          console.log(`       ${RED}✗ ${f}${RESET}`);
        }
        if (!result.blocked && result.reply.length < 300) {
          console.log(`       Reply: "${result.reply.slice(0, 150)}..."`);
        }
      }
    } catch (err) {
      failed++;
      results.push({ eval: e, passed: false, blocked: false, reply: '', failures: [String(err)] });
      console.log(`${RED}ERROR: ${err}${RESET}`);
    }
  }

  console.log(`\n${BOLD}Results: ${GREEN}${passed} passed${RESET} / ${RED}${failed} failed${RESET} / ${EVALS.length} total${BOLD}${RESET}`);

  if (failed > 0) {
    console.log(`\n${RED}${BOLD}Failed evals:${RESET}`);
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  ${r.eval.id}: ${r.eval.description}`);
    }
    process.exit(1);
  } else {
    console.log(`\n${GREEN}${BOLD}All evals passed!${RESET}\n`);
  }
}

await main();
