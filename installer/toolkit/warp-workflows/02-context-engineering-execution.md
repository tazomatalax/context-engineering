# Context Engineering - Phase 2: Execution

## ⚡ Execute PRP Implementation

### Description
Implement a feature using the PRP file with systematic validation loops in Warp Agent Mode.

### Warp Agent Command
```
Implement the feature described in PRPs/active/[PRP_FILENAME] following our Context Engineering execution methodology:

MANDATORY EXECUTION SEQUENCE:

Phase 1 - Context Loading:
1. Read the complete PRP file and confirm understanding
2. Examine all attached context files for patterns to follow
3. Verify prerequisites (.env, validate.sh executable)

Phase 2 - Implementation Planning:
4. Create step-by-step implementation plan
5. Identify similar code patterns in the codebase
6. Break work into testable chunks

Phase 3 - Progressive Implementation:
7. Implement each step with validation loops
8. Run ./validate.sh after each major component
9. Fix any issues before proceeding to next step
10. Update PRP Implementation Notes section with progress

Phase 4 - Final Validation:
11. Ensure all acceptance criteria are met
12. Run ./validate.sh and confirm exit code 0
13. Test all manual verification commands

CRITICAL REQUIREMENTS:
- Must run ./validate.sh successfully before completion
- Must update Implementation Notes section in PRP file
- Must follow existing project patterns
- Must test each component before marking complete

The task is NOT complete until ./validate.sh passes with exit code 0.
```

### Context Files to Attach
- The specific PRP file for the task
- Similar example files showing patterns to follow  
- Test files demonstrating testing patterns
- Configuration files (.env, etc.)
- Any referenced documentation files

### Parameters
- `PRP_FILENAME`: The specific PRP file to implement (e.g., `123-add-dark-mode.md`)

---

## 🔧 Run Validation Script

### Description
Execute the project validation script to check code quality, tests, and build status.

### Command
```bash
./validate.sh
```

### Warp Agent Command
```
Run the project validation script and fix any issues:

1. Execute ./validate.sh
2. If it fails, analyze the specific error messages
3. Fix the identified issues
4. Re-run ./validate.sh
5. Repeat until exit code is 0
6. Confirm all checks pass

The validation script auto-detects project type and runs appropriate linting, testing, and build commands.
```

### Expected Behavior
- Auto-detects project type (Node.js, Python, Go, Rust, etc.)
- Runs appropriate linting and formatting checks
- Executes test suites
- Performs build verification
- Returns exit code 0 on success

---

## 🧪 Manual Feature Testing

### Description
Perform manual testing of implemented features as specified in the PRP file.

### Warp Agent Command
```
Perform manual testing of the implemented feature:

1. Review the "Manual Verification" section in the PRP file
2. Execute each specified test command
3. Verify expected outputs match actual results
4. Test edge cases and error scenarios
5. Confirm user-facing functionality works as intended
6. Document any issues found

Follow the specific manual testing commands listed in PRPs/active/[PRP_FILENAME]
```

### Context Files to Attach
- The PRP file with manual verification steps

---

## 🔄 Quick Validation Loop

### Description
Fast syntax and type checking before running full validation.

### Command
```bash
# For Node.js projects
npm run lint:fix && npm run type-check

# For Python projects  
ruff check . --fix && mypy .

# For Go projects
go fmt ./... && go vet ./...

# For Rust projects
cargo fmt && cargo clippy
```

### Warp Agent Command
```
Run quick validation checks and auto-fix issues:

1. Detect project type from files present
2. Run appropriate quick checks:
   - Node.js: npm run lint:fix && npm run type-check  
   - Python: ruff check . --fix && mypy .
   - Go: go fmt ./... && go vet ./...
   - Rust: cargo fmt && cargo clippy
3. Report any remaining issues that need manual fixing
4. Confirm syntax and typing are clean before proceeding

This is a faster check to run before the full ./validate.sh script.
```
