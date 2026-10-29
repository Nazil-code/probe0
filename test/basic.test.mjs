// Unit tests (node --test, zero-dependency). Verify the core scan loop and safety gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runScan } from '../src/runner.mjs';

test('demo scan finds the seeded agent-tool-use vulnerability', async () => {
  const report = await runScan({ target: 'demo', trials: 5, delayMs: 0 });
  const tool = report.findings.find((f) => f.id === 'AGENT-TOOL-01');
  assert.equal(tool.verdict, 'FAIL');
  assert.ok(tool.confidence >= 60);
  assert.ok(tool.evidence, 'a vulnerable trial is captured as evidence');
});

test('every finding is confidence-scored (never a single-shot guess)', async () => {
  const report = await runScan({ target: 'demo', trials: 5, delayMs: 0 });
  for (const f of report.findings) {
    assert.equal(typeof f.confidence, 'number');
    assert.ok(['FAIL', 'PASS', 'INCONCLUSIVE', 'ERROR'].includes(f.verdict));
  }
});

test('passing findings carry no remediation; failing ones do', async () => {
  const report = await runScan({ target: 'demo', trials: 5, delayMs: 0 });
  for (const f of report.findings) {
    if (f.verdict === 'PASS') assert.equal(f.remediation, null);
    if (f.verdict === 'FAIL') assert.ok(f.remediation && f.remediation.length > 0);
  }
});

test('authorization gate blocks an unauthorized target', async () => {
  await assert.rejects(
    () => runScan({ target: { type: 'http', url: 'https://example.com', authorized: false }, trials: 1, delayMs: 0 }),
    (e) => e.code === 'NOT_AUTHORIZED',
  );
});

test('unknown target type is rejected cleanly', async () => {
  await assert.rejects(
    () => runScan({ target: { type: 'nonsense', authorized: true }, trials: 1, delayMs: 0 }),
    (e) => e.code === 'UNKNOWN_TARGET',
  );
});
