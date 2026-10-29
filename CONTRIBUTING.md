# Contributing to Probe0

Thanks for helping make AI systems safer. Probe0 is open-source and contributions are welcome —
especially **new test rules**, **provider adapters**, and **demo-agent scenarios**.

## Getting started

```sh
git clone https://github.com/probe0/probe0.git
cd probe0
node bin/probe0.mjs scan --target demo     # no install needed (Node 18+)
node --test                                # run the test suite
node scripts/gemini-smoke.mjs                 # verify the Gemini adapter path (mocked network)
```

Probe0 is intentionally **zero-dependency** (plain Node.js ESM). Please keep it that way unless
a dependency is clearly justified.

## Adding a rule

Rules live in [`src/rules.mjs`](src/rules.mjs). Each rule must include:

- `id`, `category`, `severity`, `title`
- `attack` — the input sent to the target
- `detect(result, ctx)` — returns `{ hit, evidence }`, using `ctx.secret`, `ctx.systemPrompt`,
  and `ctx.privilegedTools` so it works on any target (not just the demo)
- `remediation` — a concrete, developer-actionable fix

Every new rule should pass on a safe target and fail on the deliberately vulnerable
demo agent ([`src/demo/juiceagent.mjs`](src/demo/juiceagent.mjs)). Add a hardened path to the
demo agent so `probe0 verify` can demonstrate the fix.

## Ground rules

- **Defensive only.** No offensive payloads, no features for attacking systems you don't own.
- Keep findings **evidence-based** — never flag a vulnerability from a single odd model response.
- Redact secrets from all output.
- Run `node --test` and the demo scan before opening a PR.

## Reporting bugs / ideas

Open an issue with a clear description and reproduction steps. For **security issues in Probe0
itself**, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

By contributing, you agree your contributions are licensed under the project's
[Apache-2.0](LICENSE) license.
