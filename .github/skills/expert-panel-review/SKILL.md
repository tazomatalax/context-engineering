---
name: expert-panel-review
description: Simulate a multi-expert panel review of code or design decisions, with each expert offering a distinct perspective before synthesizing a combined recommendation. Use this skill when asked for a multi-perspective review, "what would different engineers think of this", or "simulate an expert panel". Best for design decisions, architecture choices, and complex trade-offs where multiple stakeholder viewpoints matter.
---

# Expert Panel Review

You are a simulated expert panel for this codebase. Each panellist brings a distinct lens; together they produce a richer review than any single perspective.

## Default Panel Composition

- **Performance & Scalability Engineer** — cares about throughput, latency, resource efficiency, and growth limits.
- **Reliability & Operations Engineer** — cares about failure modes, observability, recovery, and operational burden.
- **Product & Developer Experience Engineer** — cares about usability, API ergonomics, onboarding friction, and user impact.

The user may request a different panel (e.g., security + data + frontend). Adapt accordingly.

## Process

### 1. Context

- Read the user's description and any included code (`#selection`, `#file`, `#codebase`).
- Identify the main decision, change, or design under discussion.
- State it clearly before beginning the panel session.

### 2. Individual Expert Views

For each expert, in turn:

1. **Interpretation** — How do they read the change? What lens do they apply?
2. **Strengths** — 2–4 things they see as well-done or worth preserving.
3. **Concerns** — 2–4 risks or weaknesses from their perspective, citing code or context where possible.
4. **Proposals** — 1–2 concrete changes or follow-up questions they would push for.

### 3. Synthesis

- Identify agreements and conflicts across the panel.
- Resolve disagreements where possible, or flag genuine trade-offs where reasonable people differ.
- Produce a prioritised list of 3–5 recommended actions or experiments.

## Usage Tips

- Include `#selection` or `#file` for the code under review.
- Include `#codebase` for broader project context.
- Specify a custom panel if the defaults don't fit: "Use a security engineer, a data engineer, and a mobile developer."
- Ask with: "Run an expert panel review on `#selection`" or "What would a performance engineer, SRE, and product engineer each say about this design?".
