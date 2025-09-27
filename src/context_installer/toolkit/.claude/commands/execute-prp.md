# Execute PRP Implementation

Implement a feature using the specified PRP file with systematic validation.

## Command: `/execute-prp <path-to-prp-file>`

## MANDATORY EXECUTION SEQUENCE

### PHASE 1: CONTEXT LOADING (Required)
1. **Read PRP File Completely**
   ```
   ✅ CHECKPOINT: Can you summarize the main objective in 1 sentence?
   ✅ CHECKPOINT: Can you list all acceptance criteria?
   ✅ CHECKPOINT: Do you understand all technical requirements?
   ```

2. **Validate Prerequisites**
   - Check if `.env` exists and has required variables
   - Verify `validate.sh` is executable
   - Confirm all referenced files/directories exist
   ```
   ❌ IF ANY MISSING: Stop and request user to configure prerequisites
   ✅ IF ALL PRESENT: Continue to Phase 2
   ```

### PHASE 2: IMPLEMENTATION PLANNING (Required)
3. **Create Implementation Plan Using TodoWrite**
   - Break PRP into specific, testable tasks (max 10 items)
   - Each task must have clear completion criteria
   - Include validation steps for each major component
   ```
   EXAMPLE GOOD TASK: "Create user login form with email/password fields and submit button"
   EXAMPLE BAD TASK: "Implement authentication system"
   ```

4. **Identify Implementation Patterns**
   - Search codebase for similar existing features
   - Note file structure patterns to follow
   - Identify imports/dependencies to use
   ```
   ✅ CHECKPOINT: Have you found at least 2 similar code patterns to follow?
   ```

### PHASE 3: STEP-BY-STEP IMPLEMENTATION (Required)
5. **Execute Each Todo Item**
   - Mark todo as `in_progress` before starting
   - Implement the specific functionality
   - Test the implementation works
   - Mark todo as `completed` only when working
   ```
   🔄 RULE: Only 1 todo can be `in_progress` at a time
   🔄 RULE: Must test each component before marking complete
   ```
### IMPLEMENTATION NOTES (MANDATORY)

   - Rule: Append one short Implementation Notes entry to the PRP `## 🛠️ Implementation Notes` section at these checkpoints: (A) after planning, (B) before starting each todo, (C) after completing each todo (include validation), (D) final completion.
   - Entry must be exactly the minimal template below (replace bracketed tokens). Keep entries concise: one paragraph, preferably one line (max 6 lines).

   Template (one-paragraph, single block):
   ```
   [TIMESTAMP] | [TASK] | [STATUS: pending|in_progress|completed] | files: file1,file2 | cmds: "./validate.sh:EXIT" "pnpm -w vitest:RESULT" | note: short next-step or failure-reason
   ```

   - Enforcement: do not mark a task `completed` unless `./validate.sh` exit is 0 or test evidence is recorded in `cmds`. If `./validate.sh` fails, append an entry with STATUS `failed` and STOP (do not continue other todos) and surface the failure excerpt to the user.

   - PR Integration: The `/submit-pr` script consumes this section verbatim for the PR body. Avoid long prose or code blocks. Focus on: what changed, how validated, and next step.

### PHASE 4: CONTINUOUS VALIDATION (Required)
6. **After Each Major Component**
   ```bash
   # Run project-specific validation
   ./validate.sh
   
   # IF FAILS:
   #   - Fix the specific errors shown
   #   - Re-run validate.sh
   #   - Do NOT continue until passing
   ```

### PHASE 5: FINAL VALIDATION (CRITICAL)
7. **Complete PRP Validation**
   ```bash
   # MANDATORY: Must pass before completion
   ./validate.sh
   ```
   ```
   ❌ IF VALIDATE.SH FAILS: Implementation is NOT complete
   ✅ IF VALIDATE.SH PASSES: Continue to final check
   ```

8. **PRP Completion Verification**
   - Re-read original PRP file
   - Verify each acceptance criteria is met
   - Check all technical requirements implemented
   ```
   ✅ CHECKPOINT: Can you demonstrate each acceptance criteria works?
   ✅ CHECKPOINT: Are all TodoWrite items marked as completed?
   ✅ CHECKPOINT: Does `./validate.sh` pass with exit code 0?
   ```

## ERROR HANDLING DECISION TREE

```
VALIDATION FAILS?
├── Linting Errors → Fix syntax, re-run validate.sh
├── Test Failures → Fix failing tests, re-run validate.sh  
├── Build Errors → Fix build issues, re-run validate.sh
└── Type Errors → Fix type issues, re-run validate.sh

IMPLEMENTATION BLOCKED?
├── Missing Dependencies → Check PRP for required packages
├── Unclear Requirements → Re-read PRP and ask for clarification
├── Code Pattern Unclear → Search codebase for similar examples
└── Technical Issue → Break down into smaller todos

PRP REQUIREMENTS UNCLEAR?
├── Acceptance Criteria Vague → Ask user to clarify specific criteria
├── Technical Details Missing → Request additional context
└── Conflicting Information → Ask user to resolve conflicts
```

## SUCCESS CRITERIA CHECKLIST

- [ ] All TodoWrite items marked as `completed`
- [ ] `./validate.sh` passes with exit code 0
- [ ] Each PRP acceptance criteria demonstrably works
- [ ] Code follows existing project patterns
- [ ] No console errors or warnings
- [ ] Implementation matches PRP technical requirements

## FAILURE HANDLING

If you cannot complete the PRP:
1. Report exactly which acceptance criteria are blocked
2. List specific technical obstacles encountered  
3. Show current state of TodoWrite progress
4. Provide specific next steps needed for completion
