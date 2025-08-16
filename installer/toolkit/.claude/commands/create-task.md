# Create Comprehensive Task

Transform a brief description into a structured, implementable GitHub issue.

## Command: `/create-task <brief-description>`

## IMPLEMENTATION PROCESS

### STEP 1: ANALYZE USER INPUT
Parse the user's description and categorize:

```
INPUT TYPE DETECTION:
├── Feature Request → Use Feature Template
├── Bug Fix → Use Bug Template  
├── Refactor/Improvement → Use Enhancement Template
└── Research/Investigation → Use Research Template
```

### STEP 2: EXPAND WITH STRUCTURED TEMPLATE

Create file: `temp/task-draft-{YYYYMMDD-HHMMSS}.md`

**Use this EXACT template structure:**

```markdown
# 🚀 {CATEGORY}: {EXPANDED_TITLE}

## 🎯 Objective

{2-3 sentences expanding the user's brief description into a clear problem statement}

## ✅ Acceptance Criteria

{EXACTLY 3-7 specific, testable criteria using this format:}
- [ ] {Specific action/result that can be verified}
- [ ] {Include error handling scenarios}
- [ ] {Include success scenarios}
- [ ] {Include edge cases if applicable}

## 🔍 Implementation Approach

### Files Likely Needing Changes:
{List 2-4 specific files based on project structure}

### Patterns to Follow:
{Reference 1-2 existing code patterns from the codebase}

### Dependencies Required:
{List any new packages/libraries needed, or "None" if using existing}

## 🧪 Testing Requirements

- [ ] Unit tests for core functionality
- [ ] Integration tests for API endpoints (if applicable)  
- [ ] Manual testing scenarios
- [ ] Edge case validation

## ⚡ Complexity Assessment

**Estimated Complexity:** {Simple|Medium|Complex|Very Complex}

**Reasoning:** {1 sentence explaining why this complexity level}

**Estimated Implementation Time:** {1-2 hours|Half day|1-2 days|3+ days}

## 🚨 Potential Gotchas

{List 2-3 specific technical challenges or edge cases commonly missed}

## 📚 References

{Links to relevant documentation, existing similar features, or external resources}

---

## 🔄 Next Steps

1. **Review & Edit:** Modify this file to add details or corrections
2. **Post to GitHub:** `node scripts/post-issue.cjs temp/task-draft-{timestamp}.md`
3. **Start Implementation:** `/start-task --issue=<returned-issue-number>`
```

### STEP 3: CONTENT GENERATION RULES

**For Acceptance Criteria (CRITICAL):**
```
GOOD CRITERIA:
✅ "Login form displays validation error when email field is empty"
✅ "Dashboard loads within 2 seconds with sample data"
✅ "API returns 400 error for invalid user ID format"

BAD CRITERIA:
❌ "Login works properly"
❌ "Dashboard is fast"
❌ "API handles errors"
```

**For Implementation Approach:**
1. **Files Analysis:** Look at project structure and suggest specific files
2. **Pattern Analysis:** Search codebase for similar features and reference them
3. **Dependency Analysis:** Check package.json/requirements.txt for existing tools

**For Complexity Assessment Decision Tree:**
```
COMPLEXITY DETERMINATION:
├── Simple (1-2 hours)
│   ├── Single file changes
│   ├── No new dependencies
│   └── Clear existing patterns
├── Medium (Half day)
│   ├── 2-4 file changes
│   ├── Minor new functionality
│   └── Some research needed
├── Complex (1-2 days)
│   ├── Multiple components
│   ├── New integrations
│   └── Testing complexity
└── Very Complex (3+ days)
    ├── System architecture changes
    ├── Multiple new dependencies
    └── Significant research required
```

### STEP 4: QUALITY VALIDATION

Before saving the file, verify:
- [ ] All acceptance criteria are specific and testable
- [ ] Implementation approach references actual project files
- [ ] Complexity assessment has clear reasoning
- [ ] At least 2 potential gotchas identified
- [ ] File name uses correct timestamp format

### STEP 5: USER GUIDANCE

After creating the file, provide EXACTLY this instruction:

```
✅ Task draft created: temp/task-draft-{timestamp}.md

🔄 Next steps:
1. Review and edit the file to add any missing details
2. Post to GitHub:

! node scripts/post-issue.cjs temp/task-draft-{timestamp}.md  

3. Start implementation: /start-task --issue=<number>

📝 The draft includes specific acceptance criteria and implementation guidance for optimal AI execution.
```

## EXAMPLES BY CATEGORY

**Feature Request Input:** "Add dark mode toggle"
**Generated Title:** "🚀 Feature: Add Dark Mode Toggle to Application Settings"

**Bug Fix Input:** "Login button not working"  
**Generated Title:** "🐛 Bug Fix: Login Button Click Handler Not Responding"

**Enhancement Input:** "Improve dashboard loading speed"
**Generated Title:** "⚡ Enhancement: Optimize Dashboard Loading Performance"
