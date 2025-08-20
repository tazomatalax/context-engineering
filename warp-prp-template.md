# Warp-Optimized PRP Template

## Purpose
Template optimized for Warp Agent Mode to implement features with terminal-first approach and real-time validation.

## Core Principles
1. **Terminal-First Context**: All context accessible through terminal commands
2. **Agent Mode Integration**: Natural language instructions for Warp AI
3. **Real-time Validation**: Continuous feedback through command execution
4. **Progressive Implementation**: Build, test, iterate approach

---

## Goal
[What needs to be built - specific terminal commands and file changes]

## Why
- [Business value and user impact]
- [Integration with existing CLI workflows]
- [Problems this solves for terminal users]

## Warp Agent Instructions

### Primary Command
```
"Implement [feature description] following these requirements:
1. Read the complete context from this PRP file
2. Follow existing project patterns in [relevant directories]
3. Run validation loops with ./validate.sh until passing
4. Create implementation notes for PR submission"
```

### Context Files to Attach
- [ ] This PRP file
- [ ] Relevant example files: [list specific files]
- [ ] Test files: [list test patterns to follow]
- [ ] Configuration: [.env, config files, etc.]

## Success Criteria
- [ ] [Specific measurable outcomes - testable in terminal]
- [ ] [Command-line verification steps]
- [ ] [Integration test commands]

## Terminal Validation Commands

### Level 1: Quick Syntax Check
```bash
# Run these first - auto-fix what's possible
npm run lint:fix    # or appropriate linting command
npm run type-check  # or mypy, cargo check, etc.
```

### Level 2: Validation Script
```bash
# CRITICAL: Must pass before completion
./validate.sh
# Expected: Exit code 0 with all checks passing
```

### Level 3: Manual Verification
```bash
# Test the actual functionality
[specific commands to verify the feature works]
```

## Implementation Blueprint

### File Structure Changes
```bash
# Files to modify
MODIFY: src/[existing-file.py]
CREATE: src/[new-file.py]
UPDATE: tests/[test-file.py]
```

### Command-by-Command Implementation
```yaml
Step 1: Setup
  commands:
    - "Create initial file structure"
    - "./validate.sh"  # Baseline check

Step 2: Core Implementation  
  commands:
    - "Implement main functionality"
    - "npm run test [specific-test]"
    - "./validate.sh"

Step 3: Integration
  commands:
    - "Wire up with existing system"
    - "npm run test:integration"
    - "./validate.sh"
```

## Warp Agent Workflow

### Phase 1: Context Loading
1. **Agent reads this PRP completely**
2. **Agent examines attached example files**
3. **Agent confirms understanding of requirements**

### Phase 2: Implementation
1. **Agent creates implementation plan**
2. **Agent implements step-by-step with validation**
3. **Agent runs ./validate.sh after each major step**

### Phase 3: Completion
1. **Agent verifies all success criteria met**
2. **Agent creates implementation notes section**
3. **Agent confirms ./validate.sh passes with exit code 0**

## 🛠️ Implementation Notes
[This section will be populated by Warp Agent during implementation]
[Format: timestamp | task | status | files changed | validation result | notes]

---

## Anti-Patterns for Warp Agent Mode

- ❌ Don't implement without running validation loops
- ❌ Don't skip the ./validate.sh requirement
- ❌ Don't create files without following project patterns  
- ❌ Don't complete without updating implementation notes
- ❌ Don't assume - ask for clarification if context is unclear

## Success Checklist for Warp Agent

- [ ] All acceptance criteria demonstrably work via terminal commands
- [ ] ./validate.sh passes with exit code 0
- [ ] Implementation follows existing project patterns
- [ ] Implementation notes section populated with timestamps
- [ ] All manual verification commands work as expected
