<div align="center">

<img src="brand/logo-mark.png" width="128" alt="Probe0 logo">

# Probe0

### Find the weaknesses in your AI agent — then fix them and keep them fixed.

Open-source security testing for AI agents and applications.
Probe0 scans your AI for real vulnerabilities, gives you **reproducible evidence**, tells you **how to fix each one**, and generates a **CI regression test** so it can't come back.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/probe0.svg)](https://www.npmjs.com/package/probe0)
[![CI](https://img.shields.io/github/actions/workflow/status/probe0/probe0/ci.yml?branch=main)](https://github.com/probe0/probe0/actions)
[![Stars](https://img.shields.io/github/stars/probe0/probe0?style=social)](https://github.com/probe0/probe0/stargazers)

</div>

---

> ### ⚠️ Authorized use only
> Probe0 is a **defensive** tool. Only scan AI systems **you own or are explicitly authorized to test.**
> Scans will not run until you confirm authorization for the target. See [SECURITY.md](SECURITY.md).

---

## Why Probe0

Teams are shipping AI chatbots, RAG apps, and **autonomous agents that use tools and APIs** — usually with no security testing at all. Existing tools are great at *finding* issues, but few help you **fix** them, almost none stop them from **regressing**, and the newest, highest-impact surface — **agents misusing their tools** — is the least covered.

Probe0 focuses on exactly that gap:

- 🤖 **Agent tool-use security** — catches agents making unauthorized or over-privileged tool/API calls.
- 🔁 **Confidence-aware findings** — every test runs multiple trials, so you get `fail` / `pass` / `inconclusive` with a confidence score, not a false alarm from one weird response.
- 🧾 **Reproducible evidence** — redacted request/response traces anyone can re-verify.
- 🛠️ **Actionable remediation** — a concrete fix for every finding, written for developers.
- ✅ **Fix-and-retest + CI regression** — re-run only what failed, and ship a GitHub Actions test so a fixed vuln fails the build if it ever returns.

Probe0 is **not** the first AI security tool, and doesn't claim to be. See the honest [comparison](#how-probe0-compares).

## Quickstart

Probe0 is zero-dependency — it runs with just Node.js 18+.

```sh
git clone https://github.com/probe0/probe0.git
cd probe0

# 1) See real findings instantly on the bundled vulnerable demo agent:
node bin/probe0.mjs scan --target demo

# 2) Test your own AI (Gemini):
node bin/probe0.mjs init                 # creates probe0.config.json
export GEMINI_API_KEY=your_key           # Windows: set GEMINI_API_KEY=your_key
#   edit probe0.config.json → your systemPrompt + canary, set "authorized": true
node bin/probe0.mjs scan
node bin/probe0.mjs report               # export a shareable probe0-report.html
```

> Once published to npm it will install as `npm install -g probe0` and run as `probe0 scan`.

### Try it on the demo agent

Probe0 ships with `probe0-juiceagent`, a **deliberately vulnerable** AI agent, so you can see real findings in one command — no key needed:

```sh
node bin/probe0.mjs scan --target demo --verbose
```

## Example output

```text
Probe0 v0.1.0  ·  target: demo (authorized ✓)  ·  12 tests · 5 trials each

  ✗ AGENT-TOOL-01   Unauthorized tool call                 FAIL   confidence 100% (5/5)
  ✗ INJECT-02       System-prompt override via user input  FAIL   confidence  80% (4/5)
  ✗ LEAK-01         Synthetic secret exposed in response   FAIL   confidence 100% (5/5)
  ⚠ INJECT-05       Indirect injection via retrieved doc   INCONCLUSIVE  (2/5)
  ✓ LEAK-03         PII redaction on output                PASS

  3 failed · 1 inconclusive · 8 passed      report: probe0-report.html
```

Each finding includes severity, reproduction steps, redacted evidence, expected-vs-observed behavior, and a **recommended fix**.

## What Probe0 tests (v0.1)

| Category | What it checks |
|---|---|
| 🤖 **Agent tool-use abuse** | Can the agent be tricked into unauthorized or over-privileged tool/API calls? *(flagship)* |
| 💉 **Prompt injection** | Can user input override system instructions or policy? |
| 🔑 **System-prompt / secret exposure** | Does the AI leak its hidden prompt or configured (synthetic) secrets? |
| 📤 **Sensitive-data leakage** | Does it expose controlled test data it shouldn't? |

Tests live in a **versioned, community-maintained rules library** so the catalog grows as new attacks appear.

## Fix, retest, and lock it in CI

```sh
probe0 verify               # re-run only the tests that failed, after you apply a fix
```

Add Probe0 to your pipeline so a reintroduced vulnerability turns the build red:

```yaml
# .github/workflows/probe0.yml
name: Probe0
on: [pull_request]
jobs:
  ai-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx probe0 scan --ci
```

## How Probe0 compares

Promptfoo, NVIDIA garak, and Microsoft PyRIT are excellent tools. Probe0 isn't a replacement — it wins a specific lane: **agent tool-use + remediation + fix-and-retest + CI regression**, with a low-friction CLI.

We don't want you to take our word for it. The [`/benchmarks`](benchmarks/) folder runs Probe0 and the others against the same demo agent, with raw outputs, so you can reproduce the comparison yourself.

## Roadmap

**v0.1 (now):** local CLI scanner · 4 test categories · confidence-aware, reproducible findings · remediation · fix-and-retest · CI regression · vulnerable demo agent.

**Later (after v1 earns trust):** more rule categories · hosted dashboard · scheduled scans & history · team features · managed rules feed. These are deliberately **out of scope** for v0.1 to keep it focused and reliable.

## Honest limitations

- AI behavior is probabilistic — Probe0 reports confidence, runs multiple trials, and marks uncertain results `inconclusive` rather than guessing.
- **No tool can prove an AI system is fully secure.** Probe0 reports observed behavior against defined tests, and documents its own false-positive / false-negative rates in [`/benchmarks`](benchmarks/).
- This is an early release (v0.1). Expect rough edges, and please open issues.

## Ethics & responsible disclosure

Probe0 is defensive by design: authorized targets only, synthetic secrets and controlled data by default, rate limits, no destructive actions, credentials redacted from all output. If you find a security issue in Probe0 itself, see [SECURITY.md](SECURITY.md) for private disclosure.

## Contributing

New rules, provider adapters, and demo-agent scenarios are especially welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Every rule must include its purpose, test logic, expected behavior, risk category, and self-tests.

## License

[Apache-2.0](LICENSE). Built by [Automate with Nazil](https://automatewithnazil.com) — AI automation, web apps, and security.

---

<div align="center">
<sub>Probe0 tests AI systems you own or are authorized to assess. Use it to defend, never to attack.</sub>
</div>
