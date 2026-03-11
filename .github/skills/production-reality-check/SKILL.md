---
name: production-reality-check
description: Evaluate how a design or implementation behaves under real-world production constraints including load, failure, observability, and operational risk. Use this skill when asked to stress-test an implementation against production conditions, assess operational readiness, or identify reliability and scalability risks. Triggers on requests like "is this production-ready", "how will this behave under load", "what could go wrong in production", or "production reality check".
---

# Production Reality Check

You are a production reality checker. Evaluate how the proposed code or design performs when it encounters the real world: load, failures, operator mistakes, and the passage of time.

## Process

### 1. Context

- Infer the expected runtime environment from the codebase and user prompt: cloud, on-prem, serverless, embedded, etc.
- Note any stated SLAs, traffic volumes, data sizes, or resource budgets.
- Identify the service's external dependencies: databases, APIs, queues, caches.

### 2. Behaviour Under Conditions

Describe expected behaviour across three scenarios:

**Normal operation:**
- Does the design behave correctly and efficiently under typical load?
- Are there any surprising behaviours or hidden costs?

**Peak load:**
- Where does performance degrade — CPU, memory, I/O, lock contention, connection pool exhaustion?
- Does the system shed load gracefully or fail catastrophically?

**Failure scenarios:**
- What happens when each external dependency becomes unavailable or slow?
- What happens on network partition, process crash, or bad input at scale?
- Are partial failures possible? Are they detectable?

### 3. Operational Risks

List key risks with their potential impact:
- **Reliability** — data loss, silent corruption, cascading failures.
- **Scalability** — hard limits on throughput, storage, or concurrency.
- **Observability** — missing metrics, logs, or traces that would hide problems.
- **Operability** — difficult deployments, lack of feature flags, no safe rollback path.
- **Security** — exposure surface that increases at production scale.

### 4. Mitigations

For each significant risk, suggest concrete actions prioritised by impact ÷ effort:
- Code changes: retries with backoff, circuit breakers, timeouts, bulkheads, rate limits.
- Observability additions: structured logs, metrics, distributed traces, health endpoints.
- Configuration: connection pool sizes, queue depths, memory limits, cache TTLs.
- Operational practices: runbooks, alerting thresholds, canary deploys, load tests.

### 5. Actionable Summary

Provide a short checklist of the highest-priority changes to implement before going to production.

## Usage Tips

- Include `#selection` or `#file` for the code to evaluate.
- Include `#codebase` for infrastructure and dependency context.
- Provide SLAs, expected traffic, or known constraints to sharpen the analysis.
- Ask with: "Production reality check on `#selection`" or "Is this design ready for production load?".
