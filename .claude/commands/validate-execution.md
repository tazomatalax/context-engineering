# Validate Execution Command  

Optional AI-powered logical review of implemented code against the plan.

## Usage
`/validate-execution <path-to-prp-file>`

## Instructions for AI

When the user runs this command:

1. **Read the original PRP file** to understand requirements
2. **Review the current codebase changes** (use git diff to see what was modified)
3. **Check for logical flaws**:
   - Does implementation match requirements?
   - Are edge cases handled?
   - Are there potential bugs or issues?
   - Is error handling appropriate?
4. **Provide detailed feedback** on any issues found
5. **Suggest fixes** for any problems discovered

This is a quality gate that catches issues that linting and syntax checks would miss - focusing on logic and requirement adherence.

## Implementation Details

### Step 1: Read the PRP File
- Read the specified PRP file completely
- Extract the original requirements and acceptance criteria
- Understand the expected behavior and technical constraints

### Step 2: Analyze Code Changes
- Run `git diff` to see what files have been modified
- Review the changes in context of the requirements
- Look at both the old and new code to understand the changes

### Step 3: Logical Review Process
Perform a comprehensive logical review:

**Requirements Adherence:**
- Does the code fulfill each acceptance criterion?
- Are all specified features implemented?
- Does the implementation match the described approach?

**Code Quality:**
- Are edge cases properly handled?
- Is error handling comprehensive and appropriate?
- Are security considerations addressed?
- Is the code maintainable and well-structured?

**Integration Concerns:**
- Does the code integrate properly with existing systems?
- Are dependencies handled correctly?
- Will this code work in the actual deployment environment?

**Potential Issues:**
- Look for common logical flaws and gotchas
- Check for race conditions, memory leaks, or performance issues
- Verify proper input validation and sanitization
- Ensure proper resource cleanup

### Step 4: Generate Detailed Feedback
Create a comprehensive review report:

```markdown
## 🔍 Code Review Report

### ✅ Requirements Fulfilled
- [✓] Requirement 1 - Implementation details
- [✓] Requirement 2 - Implementation details
- [⚠️] Requirement 3 - Partial implementation, see notes

### 🚨 Critical Issues Found
1. **Issue Title** (Severity: High/Medium/Low)
   - Description of the problem
   - Potential impact
   - Suggested fix

### ⚠️ Warnings & Concerns
1. **Concern Title**
   - Description
   - Recommendation

### 💡 Suggestions for Improvement
1. **Performance Optimization**
   - Current approach analysis
   - Suggested improvement

### 🧪 Testing Recommendations
- Additional test cases needed
- Edge cases to verify
- Integration tests to add

### 📋 Next Steps
- [ ] Fix critical issue 1
- [ ] Address warning 2  
- [ ] Add recommended tests
- [ ] Run validation: `./validate.sh`
```

### Step 5: Summary and Next Steps
- Summarize the overall quality of the implementation
- Highlight the most critical issues to address
- Provide clear actionable next steps
- Indicate whether the code is ready for submission or needs more work

## When to Use This Command

This command is particularly valuable for:
- Complex implementations with multiple components
- Code that handles sensitive data or security concerns
- Features that integrate with multiple systems
- When you want an extra quality check before submission

## Example Usage

```
User: /validate-execution PRPs/active/42-user-authentication-system.md
AI: 🔍 Reading requirements from PRP file...
    📄 Original issue: Add OAuth-based user authentication
    🔍 Analyzing git diff to see implementation changes...
    📊 Found changes in 8 files across authentication module
    
    🚨 Found 2 critical issues:
    1. Missing input validation on login endpoint
    2. OAuth tokens not properly encrypted in storage
    
    ⚠️  3 warnings identified:
    1. Error messages may leak sensitive information
    2. No rate limiting on authentication attempts  
    3. Session timeout not configurable
    
    📋 Generated detailed review report with actionable fixes
    🔧 Please address critical issues before proceeding
```

This command acts as an experienced code reviewer, catching logical issues that automated tools might miss.