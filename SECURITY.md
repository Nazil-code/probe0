# Security Policy

Probe0 is a **defensive** security tool. It is designed to be run only against AI systems
you own or are explicitly authorized to assess.

## Reporting a vulnerability in Probe0 itself

If you find a security issue **in Probe0** (for example, a way it could be misused, leak data,
or behave unsafely), please report it privately. **Do not open a public issue.**

- Email: **security@automatewithnazil.com**
- Please include: a description, steps to reproduce, affected version, and impact.
- We aim to acknowledge within 72 hours and to agree a disclosure timeline with you.

We support coordinated, responsible disclosure and will credit reporters who wish to be named.

## Responsible use

- Only scan systems you own or have **written authorization** to test.
- Probe0 uses synthetic secrets and controlled test data by default, applies rate limits,
  and performs no destructive actions.
- Probe0 reports observed behavior against defined tests. **No tool can prove an AI system is
  fully secure** — treat results as evidence to act on, not a guarantee.

## Supported versions

Probe0 is pre-1.0. Security fixes are applied to the latest release only.
