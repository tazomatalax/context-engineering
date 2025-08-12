# Validate Execution Quality

Perform AI-powered logical review of implemented code against original requirements.

## Command: `/validate-execution <path-to-prp-file>`

## MANDATORY EXECUTION SEQUENCE

### PHASE 1: CONTEXT LOADING (Required)

1. **Read Original PRP File**
   ```
   PRP ANALYSIS CHECKLIST:
   ✅ CHECKPOINT: Original objective clearly understood
   ✅ CHECKPOINT: All acceptance criteria identified
   ✅ CHECKPOINT: Technical requirements documented
   ✅ CHECKPOINT: Expected implementation approach noted
   ```

2. **Analyze Git Changes**
   ```bash
   # Examine all code changes
   git diff --name-only HEAD~1
   git diff --stat HEAD~1
   git diff HEAD~1
   ```
   ```
   CHANGE ANALYSIS:
   ✅ All modified files identified
   ✅ Addition/deletion counts noted
   ✅ Code changes properly captured
   ```

### PHASE 2: REQUIREMENTS VERIFICATION (Required)

3. **Map Implementation to Acceptance Criteria**
   For each acceptance criteria from PRP:
   ```
   CRITERIA VERIFICATION:
   ✅ Criterion 1: [PASS/FAIL/PARTIAL] - Evidence: {specific code/feature}
   ✅ Criterion 2: [PASS/FAIL/PARTIAL] - Evidence: {specific code/feature}
   ✅ Criterion 3: [PASS/FAIL/PARTIAL] - Evidence: {specific code/feature}
   
   RATING DEFINITIONS:
   - PASS: Fully implemented and testable
   - PARTIAL: Implemented but missing edge cases/error handling  
   - FAIL: Not implemented or incorrect implementation
   ```

4. **Technical Requirements Assessment**
   ```
   TECHNICAL COMPLIANCE:
   ✅ Architecture follows specified approach
   ✅ File structure matches planned organization
   ✅ Dependencies correctly implemented
   ✅ Integration points working as expected
   ```

### PHASE 3: CODE QUALITY ANALYSIS (Required)

5. **Logical Flaw Detection**
   Systematically check for common issues:
   ```
   LOGIC REVIEW AREAS:
   ├── Input Validation: Are all user inputs properly validated?
   ├── Error Handling: Are exceptions caught and handled appropriately?
   ├── Edge Cases: Are boundary conditions and edge cases addressed?
   ├── Security: Are there potential security vulnerabilities?
   ├── Performance: Are there obvious performance bottlenecks?
   ├── Resource Management: Are resources properly allocated/cleaned up?
   └── Race Conditions: Are there potential concurrency issues?
   ```

6. **Integration Analysis**
   ```
   INTEGRATION ASSESSMENT:
   ✅ API contracts respected
   ✅ Database schema changes properly handled
   ✅ External dependencies correctly integrated
   ✅ Backward compatibility maintained
   ✅ Configuration properly updated
   ```

### PHASE 4: COMPREHENSIVE REVIEW REPORT (Required)

7. **Generate Detailed Review Report**
   **Use this EXACT template:**

   ```markdown
   # 🔍 Code Review Report

   **PRP File:** {prp-file-path}
   **Review Date:** {current-date}
   **Git Changes:** {file-count} files modified

   ## ✅ Requirements Fulfillment

   ### Acceptance Criteria Status
   {For each acceptance criteria:}
   - **[✓/⚠️/❌] Criterion 1:** {description}
     - **Status:** {PASS/PARTIAL/FAIL}
     - **Evidence:** {specific code location or feature}
     - **Notes:** {any additional context}

   ### Technical Requirements Status
   - **[✓/⚠️/❌] Architecture:** {compliance status}
   - **[✓/⚠️/❌] File Structure:** {organization assessment}
   - **[✓/⚠️/❌] Dependencies:** {dependency implementation}
   - **[✓/⚠️/❌] Integration:** {integration point assessment}

   ## 🚨 Critical Issues Found

   {If any critical issues:}
   ### Issue 1: {Title} (Severity: Critical)
   - **Location:** `{file-path}:{line-number}`
   - **Problem:** {detailed description of the issue}
   - **Impact:** {potential consequences}
   - **Recommended Fix:** {specific solution}

   ## ⚠️ Warnings & Concerns

   {If any moderate issues:}
   ### Warning 1: {Title} (Severity: Medium)
   - **Location:** `{file-path}:{line-number}`
   - **Concern:** {description of potential issue}
   - **Recommendation:** {suggested improvement}

   ## 💡 Code Quality Observations

   ### Positive Aspects
   - {List well-implemented features}
   - {Good patterns followed}
   - {Proper error handling examples}

   ### Areas for Improvement
   - {Performance optimization opportunities}
   - {Code organization suggestions}
   - {Documentation enhancement needs}

   ## 🧪 Testing Assessment

   ### Test Coverage Analysis
   - **Unit Tests:** {coverage assessment}
   - **Integration Tests:** {integration test evaluation}
   - **Edge Case Testing:** {edge case coverage}
   - **Error Scenario Testing:** {error handling test coverage}

   ### Recommended Additional Tests
   - {Specific test cases to add}
   - {Edge cases to verify}
   - {Error scenarios to test}

   ## 🔒 Security Review

   ### Security Considerations Checked
   - **Input Validation:** {validation implementation status}
   - **Authentication/Authorization:** {auth implementation review}
   - **Data Sanitization:** {sanitization assessment}
   - **Error Information Disclosure:** {error message security}

   ### Security Recommendations
   - {Specific security improvements}
   - {Vulnerability mitigation suggestions}

   ## 📋 Action Items

   ### Must Fix (Before Submission)
   - [ ] {Critical issue 1}
   - [ ] {Critical issue 2}

   ### Should Fix (Important)
   - [ ] {Warning 1}
   - [ ] {Warning 2}

   ### Could Fix (Enhancement)
   - [ ] {Improvement suggestion 1}
   - [ ] {Improvement suggestion 2}

   ## 🎯 Overall Assessment

   **Implementation Quality:** {Excellent/Good/Fair/Poor}
   **Requirements Compliance:** {X}% of acceptance criteria fully met
   **Ready for Submission:** {Yes/No - needs fixes first}

   ### Summary
   {2-3 sentences summarizing the overall implementation quality and readiness}

   ### Next Steps
   1. {Specific next action}
   2. {Follow-up recommendation}
   3. {Final validation step}

   ---
   *Generated by Context Engineering AI Code Review Assistant*
   ```

### PHASE 5: ACTIONABLE RECOMMENDATIONS (Required)

8. **Prioritize Issues by Severity**
   ```
   ISSUE PRIORITIZATION:
   ├── Critical (Must Fix): Issues that break functionality or security
   ├── Important (Should Fix): Issues affecting reliability or maintainability  
   ├── Enhancement (Could Fix): Improvements for performance or code quality
   └── Informational (FYI): Observations for future consideration
   ```

9. **Provide Implementation Guidance**
   For each identified issue, provide:
   - Specific file and line number references
   - Concrete code examples of fixes
   - Explanation of why the fix is necessary
   - Potential side effects to consider

### PHASE 6: COMPLETION & NEXT STEPS (Required)

10. **Final Assessment & Recommendations**
    ```
    EXACT OUTPUT FORMAT:
    🔍 Code review completed for: {prp-file-name}
    
    📊 Summary:
    - Requirements met: {X}/{total} acceptance criteria
    - Critical issues: {count}
    - Warnings: {count}
    - Overall quality: {rating}
    
    🚨 Action required:
    {If critical issues: "Fix {count} critical issues before submission"}
    {If no critical issues: "Code quality review complete, ready for submission"}
    
    📝 Detailed report available for review
    🔧 Next: Address identified issues and re-run ./validate.sh
    ```

## ERROR HANDLING MATRIX

```
PRP FILE ERRORS:
├── File not found → "PRP file {path} does not exist"
├── Invalid format → "PRP file format is invalid or corrupted"
├── Missing requirements → "No acceptance criteria found in PRP file"
└── Unclear objectives → "PRP file lacks clear implementation objectives"

GIT ANALYSIS ERRORS:
├── No git changes → "No code changes detected for review"
├── Git repository error → "Not in a valid git repository"
├── Diff generation fails → "Unable to generate code diff for analysis"
└── Too many changes → "Change set too large for comprehensive review"

ANALYSIS ERRORS:
├── Code complexity → "Code too complex for automated analysis, manual review recommended"
├── Missing context → "Insufficient context to evaluate implementation"
├── Language not supported → "Code language not supported for detailed analysis"
└── External dependencies → "Cannot analyze external dependency implementations"
```

## REVIEW QUALITY STANDARDS

The review must include:
- [ ] Specific file and line number references for issues
- [ ] Concrete examples of problems found
- [ ] Actionable fix recommendations
- [ ] Assessment of each acceptance criteria
- [ ] Overall implementation quality rating
- [ ] Clear next steps for improvement

## INTEGRATION WITH WORKFLOW

This optional quality gate fits into the Context Engineering workflow:

1. `/execute-prp PRPs/active/123-*.md` → Implement feature
2. `./validate.sh` → Basic validation passes
3. `/validate-execution PRPs/active/123-*.md` → **AI quality review**
4. Fix any critical issues identified
5. `/submit-pr --issue=123` → Submit for human review

**Result:** Higher-quality implementations with fewer issues reaching code review.