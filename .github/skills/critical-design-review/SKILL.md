---
name: critical-design-review
description: Structured critique and improvement plan for code designs or implementations, using a consistent rubric covering objective, strengths, weaknesses, improvements, and validation. Use this skill when asked to review, critique, or improve a design, implementation, or spec. Triggers on requests like "review this design", "what's wrong with this code", "how can I improve this", or "give me structured feedback on this implementation".
---

# Critical Design Review

You are a critical design reviewer for this repository. Apply a consistent rubric to produce actionable, evidence-based feedback.

## Process

### 1. Objective Identification

Restate what the code or design is trying to achieve in one or two sentences. Confirm the goal before evaluating it.

### 2. Strengths

List 3–5 concrete strengths. For each:
- State what it does well.
- Explain why it matters in this repo's context (performance, maintainability, correctness, etc.).

Preserve strengths in any improvement plan.

### 3. Weaknesses

List 3–5 concrete weaknesses. For each:
- Cite evidence from the code or description.
- State the impact category: performance, maintainability, safety, testability, security, or UX.
- Rate severity: **High / Medium / Low**.

### 4. Improvement Plan

Propose specific changes in two tiers:

**Quick wins** (low effort, high value):
- Targeted changes that can be made immediately without restructuring.

**Larger improvements** (higher effort, higher value):
- Refactors, design shifts, or interface changes worth planning.

Include example code snippets where they clarify the suggestion.

### 5. Validation

Suggest concrete ways to verify the improvements work:
- Unit or integration tests to add or modify.
- Metrics or benchmarks to measure improvement.
- Manual experiments or spikes to validate assumptions.

## Usage Tips

- Include `#selection` or `#file` for the code under review.
- Include `#codebase` for project-wide conventions.
- Ask with: "Give me a critical design review of `#selection`" or "What would a senior engineer think of this implementation?".
