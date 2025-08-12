# Refine Task Implementation Plan

Convert a simple GitHub issue into a comprehensive, actionable technical plan.

## Command: `/refine-task --issue=<issue-number>`

## MANDATORY EXECUTION SEQUENCE

### PHASE 1: ISSUE ANALYSIS (Required)

1. **Fetch and Validate Issue**
   ```bash
   # Retrieve issue via GitHub API
   node scripts/generation/generate-from-issue.cjs <issue-number>
   ```
   ```
   VALIDATION CHECKS:
   ✅ Issue exists and is accessible
   ✅ Issue is open (warn if closed)
   ✅ Issue has title and description
   ✅ Issue belongs to correct repository
   ```

2. **Analyze Issue Content**
   ```
   CONTENT ANALYSIS:
   ✅ CHECKPOINT: What is the user requesting? (1 sentence summary)
   ✅ CHECKPOINT: Is this a feature, bug fix, or enhancement?
   ✅ CHECKPOINT: Are there existing acceptance criteria?
   ✅ CHECKPOINT: What technical context is missing?
   ```

### PHASE 2: CODEBASE ANALYSIS (Required)

3. **Examine Project Structure**
   - Identify relevant files and directories
   - Look for similar existing implementations
   - Note architectural patterns to follow
   ```
   ✅ CHECKPOINT: Found at least 2 relevant existing files/patterns
   ✅ CHECKPOINT: Identified integration points
   ✅ CHECKPOINT: Understand project conventions
   ```

4. **Dependency Assessment**
   - Check package.json/requirements.txt for existing tools
   - Identify if new dependencies are needed
   - Consider version compatibility
   ```
   DEPENDENCY ANALYSIS:
   ✅ Existing tools that can be used
   ✅ New dependencies required (if any)
   ✅ Potential conflicts or compatibility issues
   ```

### PHASE 3: IMPLEMENTATION PLAN GENERATION (Required)

5. **Create Comprehensive Technical Plan**
   **Use this EXACT comment template for GitHub:**

   ```markdown
   ## 🛠️ Technical Implementation Plan

   ### 🎯 Technical Approach
   {1-2 paragraphs describing the overall strategy and architecture}

   ### 📁 Files to Modify/Create
   {List specific files with clear descriptions:}
   - `src/components/LoginForm.jsx` - Add OAuth integration and error handling
   - `src/services/auth.js` - Implement authentication service methods
   - `tests/auth.test.js` - Add comprehensive test coverage
   - `docs/authentication.md` - Document new authentication flow

   ### 🔧 Dependencies & Prerequisites
   {List specific requirements:}
   - **New Dependencies:** `@auth0/auth0-react@1.9.0`, `jsonwebtoken@8.5.1`
   - **Environment Variables:** `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`
   - **Configuration:** Update `.env.example` with new variables
   - **Database:** Add `user_sessions` table migration

   ### 📋 Step-by-Step Implementation
   1. **Setup Authentication Service**
      - Create `src/services/auth.js` with login/logout methods
      - Implement token validation and refresh logic
      - Add error handling for network failures

   2. **Integrate Login Component**
      - Update `LoginForm.jsx` to use new auth service
      - Add loading states and error displays
      - Implement redirect logic after successful login

   3. **Add Route Protection**
      - Create `ProtectedRoute` component wrapper
      - Update router configuration for auth-required routes
      - Handle unauthorized access gracefully

   4. **Testing & Validation**
      - Unit tests for auth service methods
      - Integration tests for login/logout flow
      - E2E tests for protected route access
      - Manual testing across different browsers

   ### ⚠️ Potential Gotchas & Considerations
   {List specific technical challenges:}
   - **Token Storage:** Use httpOnly cookies to prevent XSS attacks
   - **Session Management:** Implement automatic token refresh before expiry
   - **Error Handling:** Auth0 rate limiting may affect development testing
   - **Browser Compatibility:** Local storage behavior varies in private mode
   - **Performance:** Authentication checks should not block UI rendering

   ### ✅ Updated Acceptance Criteria
   {Expand original criteria into specific, testable requirements:}
   - [ ] User can log in with email/password and see success confirmation
   - [ ] Invalid credentials show appropriate error message without page reload
   - [ ] Protected routes redirect to login when user is not authenticated
   - [ ] User session persists across browser refresh for 24 hours
   - [ ] Logout clears all authentication data and redirects to login
   - [ ] All authentication endpoints handle network errors gracefully
   - [ ] Authentication state is accessible throughout the application
   - [ ] All tests pass including new authentication test suite
   - [ ] `./validate.sh` passes successfully

   ### 🧪 Testing Strategy
   {Specific testing approach:}
   - **Unit Tests:** Auth service methods, token validation, error handling
   - **Integration Tests:** Login flow, protected routes, session management
   - **Manual Testing:** Cross-browser compatibility, network failure scenarios
   - **Performance Testing:** Authentication check latency, memory usage

   ### 📚 Implementation References
   {Specific links and existing patterns:}
   - Similar pattern in `src/components/UserProfile.jsx` for user data handling
   - Error handling pattern from `src/services/api.js`
   - Form validation approach in `src/components/ContactForm.jsx`
   - Auth0 Documentation: https://auth0.com/docs/quickstart/spa/react

   ---
   *This implementation plan generated by Context Engineering AI assistant*
   *Ready for development with `/start-task --issue={issue-number}`*
   ```

### PHASE 4: GITHUB INTEGRATION (Required)

6. **Post Plan as GitHub Comment**
   ```bash
   # Use GitHub API to post the implementation plan
   # Include the complete technical plan as a comment
   ```

7. **Validate Comment Posted Successfully**
   ```
   GITHUB INTEGRATION CHECKLIST:
   ✅ Comment posted successfully to issue
   ✅ Comment contains complete technical plan
   ✅ All formatting preserved correctly
   ✅ Implementation references are valid links
   ```

### PHASE 5: CONFIRMATION & NEXT STEPS (Required)

8. **Provide User Confirmation**
   ```
   EXACT OUTPUT FORMAT:
   🔍 Analyzed issue #{number}: "{issue-title}"
   📋 Generated comprehensive technical implementation plan
   💬 Posted detailed plan as comment on GitHub issue
   ✅ Issue #{number} is now ready for development!
   
   🚀 Next steps:
   1. Review the implementation plan on GitHub
   2. Edit the plan if any adjustments are needed
   3. Start development: /start-task --issue={number}
   ```

## ERROR HANDLING MATRIX

```
ISSUE ACCESS ERRORS:
├── 404 Not Found → "Issue #{number} does not exist in repository"
├── 401 Unauthorized → "Check GITHUB_TOKEN has repo access permissions"
├── Issue closed → "Warning: Issue #{number} is closed, continue anyway? (y/n)"
└── Empty issue body → "Warning: Issue has minimal content, plan may need clarification"

CODEBASE ANALYSIS ERRORS:
├── No similar patterns found → "Proceed with generic implementation approach"
├── Conflicting patterns → "Multiple approaches found, choosing most recent pattern"
├── Missing dependencies → "Add dependency analysis to implementation plan"
└── Unclear requirements → "Flag unclear requirements in implementation plan"

GITHUB API ERRORS:
├── Comment posting fails → "Technical plan generated but could not post to GitHub"
├── Rate limit exceeded → "GitHub API rate limited, wait {X} minutes and retry"
├── Network error → "Check internet connection and retry comment posting"
└── Invalid comment format → "Plan generated successfully but formatting needs adjustment"

TECHNICAL ANALYSIS ERRORS:
├── Complex requirement → "Break down into multiple phases in implementation plan"
├── Missing context → "Request additional clarification in implementation plan"
├── Architecture uncertainty → "Propose multiple approaches for user decision"
└── Dependency conflicts → "Highlight potential conflicts in gotchas section"
```

## PLAN QUALITY VALIDATION

Before posting the plan, verify:
- [ ] Technical approach is clearly explained
- [ ] All file changes are specific with descriptions
- [ ] Dependencies are explicitly listed with versions
- [ ] Step-by-step implementation is detailed
- [ ] Potential gotchas address real technical challenges
- [ ] Acceptance criteria are specific and testable
- [ ] Testing strategy covers all implementation areas
- [ ] Implementation references point to actual project files

## INTEGRATION WITH WORKFLOW

This command enhances the Context Engineering workflow for simple issues:

1. **PM/Team creates simple issue** → Basic requirement
2. `/refine-task --issue=123` → **Add technical implementation plan**
3. `/start-task --issue=123` → Fetch complete context including plan
4. `/execute-prp PRPs/active/123-*.md` → Implement with full technical guidance
5. `/submit-pr --issue=123` → Submit for review

**Result:** Simple issues become comprehensive, implementable technical specifications.