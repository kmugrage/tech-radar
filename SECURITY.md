# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

### What to Include

When reporting a vulnerability, please include:

- Type of issue (e.g., SQL injection, XSS, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Measures

This project implements the following security measures:

### Automated Security Scanning

1. **GitHub Actions Workflow** - Runs on every push and pull request:
   - npm audit for dependency vulnerabilities
   - CodeQL for code security analysis
   - Secret scanning with TruffleHog
   - ESLint with security rules
   - Docker image scanning with Trivy

2. **Dependabot** - Automatically checks for outdated dependencies and security vulnerabilities

3. **Local Security Script** - Run `./security-check.sh` for manual security checks

### Authentication & Authorization

- NextAuth v5 for secure authentication
- Session-based authentication
- OAuth support (GitHub)
- Secure password hashing with bcrypt

### Data Protection

- SQLite database with parameterized queries
- Input validation using Zod schemas
- XSS protection through React's automatic escaping
- CSRF protection via NextAuth

### API Security

- Server-side validation for all API endpoints
- Rate limiting (recommended to add)
- Secure session management
- HTTP-only cookies

### Best Practices

- TypeScript for type safety
- No `eval()` or `dangerouslySetInnerHTML` usage
- Environment variables for sensitive configuration
- `.env` files excluded from version control
- Regular dependency updates

## Security Headers

Recommended security headers to add to `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]
```

## Running Security Checks

### Local Development

Run the security check script:
```bash
./security-check.sh
```

### CI/CD Pipeline

Security scans run automatically on:
- Every push to main/develop branches
- Every pull request
- Daily at 2 AM UTC (scheduled scan)
- Manual workflow dispatch

### Manual Checks

Check for dependency vulnerabilities:
```bash
npm audit
npm audit fix
```

Update dependencies:
```bash
npm outdated
npm update
```

## Security Checklist for Contributors

Before submitting a pull request, ensure:

- [ ] No secrets or API keys are committed
- [ ] Dependencies are up to date
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] No SQL injection vulnerabilities (use parameterized queries)
- [ ] No XSS vulnerabilities (avoid `dangerouslySetInnerHTML`)
- [ ] Input validation is implemented
- [ ] Authentication/authorization checks are in place
- [ ] Error messages don't leak sensitive information
- [ ] TypeScript strict mode passes

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
