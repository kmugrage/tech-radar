# Claude Development Guidelines

This document provides mandatory guidelines for AI-assisted development on the Tech Radar project.

## Security Requirements

### Mandatory Security Checks
- **ALL new features MUST undergo security review before implementation**
- Run `./security-check.sh` after implementing any new feature
- Address all security findings before considering a feature complete
- Never commit code with known security vulnerabilities
- Review all user inputs for potential injection attacks (SQL, XSS, command injection)
- Validate and sanitize all data at system boundaries
- Follow OWASP Top 10 security guidelines

### Security Review Checklist
Before marking any feature as complete:
- [ ] Input validation implemented for all user-provided data
- [ ] Authentication and authorization properly enforced
- [ ] Sensitive data properly protected (encryption, secure storage)
- [ ] Security scanning tools run successfully
- [ ] No hardcoded secrets or credentials
- [ ] Dependencies scanned for vulnerabilities
- [ ] Error messages don't leak sensitive information

## Testing Requirements

### Complete Test Coverage Mandatory
- **ALL code changes MUST include comprehensive tests**
- **NO feature is considered complete without tests**
- Minimum coverage expectations:
  - Unit tests for all business logic
  - Integration tests for API endpoints
  - Component tests for UI elements
  - End-to-end tests for critical user flows

### Test Standards
- Tests must be clear, maintainable, and deterministic
- Use descriptive test names that explain what is being tested
- Follow Arrange-Act-Assert (AAA) pattern
- Mock external dependencies appropriately
- Tests should run quickly and reliably
- Include both positive and negative test cases
- Test edge cases and error conditions

### Test Execution
- Run full test suite before committing: `npm test`
- All tests must pass before code review
- CI/CD pipeline must show green builds
- Fix flaky tests immediately - don't ignore them

## Code Quality Standards

### Coding Best Practices
- **Follow existing code patterns and conventions in the project**
- Write self-documenting code with clear variable and function names
- Keep functions small and focused (single responsibility principle)
- Avoid code duplication (DRY principle)
- Use TypeScript types effectively - no `any` types without justification
- Handle errors explicitly - no silent failures
- Add comments only for complex logic that isn't self-evident

### Code Organization
- Maintain clear separation of concerns
- Follow the existing project structure
- Keep related code together
- Use proper module boundaries
- Avoid circular dependencies

### Performance Considerations
- Consider performance implications of all code changes
- Avoid N+1 queries and unnecessary database calls
- Optimize expensive operations
- Use appropriate caching strategies
- Profile code when performance issues are suspected

### Accessibility
- Ensure UI components are accessible (ARIA labels, keyboard navigation)
- Test with screen readers when applicable
- Follow WCAG guidelines

## Development Workflow

### Before Implementation
1. Understand the full scope of the change
2. Review existing code and patterns
3. Plan the implementation approach
4. Identify security implications
5. Plan test strategy

### During Implementation
1. Write tests first or alongside code (TDD/BDD approach preferred)
2. Follow security best practices
3. Adhere to code quality standards
4. Keep commits atomic and well-described
5. Run tests frequently during development

### Before Committing
1. Run full test suite: `npm test`
2. Run security checks: `./security-check.sh`
3. Run linter: `npm run lint`
4. Build successfully: `npm run build`
5. Review your own code changes
6. Ensure commit message is descriptive

### Definition of Done
A feature is ONLY complete when:
- ✅ All functionality implemented and working
- ✅ Comprehensive tests written and passing
- ✅ Security review completed with no issues
- ✅ Code quality standards met
- ✅ Documentation updated (if needed)
- ✅ All CI/CD checks passing
- ✅ Code reviewed (if applicable)

## Project-Specific Context

### Tech Radar Philosophy
- Maintain the 120 blip limit - this is a core design principle
- Focus over volume - curated, meaningful content
- Simple, maintainable codebase
- User privacy and security are paramount

### Technology Stack
- Next.js with TypeScript
- SQLite database with Drizzle ORM
- React components with shadcn/ui
- Tailwind CSS for styling

## Non-Negotiable Rules

1. **Security is not optional** - No exceptions
2. **Tests are mandatory** - No untested code in production
3. **Code quality matters** - Clean, maintainable code always
4. **Follow the existing patterns** - Consistency across the codebase
5. **Fix it right the first time** - Don't create technical debt

---

*These guidelines ensure that the Tech Radar project maintains high standards for security, reliability, and maintainability. All contributors, human and AI, must follow these standards.*
