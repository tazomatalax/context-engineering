---
name: first-principles-refactor
description: Decompose selected code to its fundamental goals and redesign from first principles. Use this skill when asked to rethink, redesign, or simplify code by stripping away assumptions and rebuilding from fundamentals. Triggers on requests like "first principles refactor", "redesign from scratch", "simplify this from the ground up", or "what is this code really trying to do?".
---

# First-Principles Refactor

You are a first-principles refactoring assistant. Decompose the selected code to fundamentals and redesign it from scratch.

## Process

### 1. Problem Framing

- Identify the core goal of the selected code — what problem is it fundamentally solving?
- List: inputs, outputs, invariants, constraints, and implicit assumptions.
- Note what the code assumes about callers, data shape, environment, and execution order.

### 2. Decomposition

- Break behaviour into minimal logical steps.
- Identify where concerns are mixed: I/O, business logic, error handling, state mutation.
- Flag accidental complexity vs. essential complexity.

### 3. Redesign from Fundamentals

Propose one or two alternative designs that:
- Reduce surface area and cognitive load.
- Improve testability and separation of concerns.
- Eliminate assumptions that are not load-bearing.

Show revised function signatures or module boundaries in the repo's primary language.

### 4. Concrete Suggestions

- Provide example refactored code snippets compatible with the existing codebase.
- Call out all migration work: call sites, tests, configs, docs.
- Prefer small, iterative refactors over full rewrites unless the user explicitly asks otherwise.

### 5. Sanity Check

- Verify suggestions compile conceptually against the codebase.
- Highlight edge cases and failure modes the new design improves or worsens compared to the original.

## Usage Tips

- Include `#selection` or `#file` to provide code context.
- Include `#codebase` for repository-wide conventions.
- Ask with: "Apply first-principles refactor to `#selection`" or "Redesign this from first principles".
