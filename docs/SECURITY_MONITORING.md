# Security Monitoring Setup

## ⚠️ MVP Application - Limited Scope

**This security monitoring setup is designed for an MVP application with the following constraints:**

### Intended Use:
- Small teams (5-10 users)
- Internal/private deployment
- Low traffic (< 100 radars, < 1000 blips per radar)
- Single-server deployment

### Not Designed For:
- Public internet-facing applications
- Enterprise production environments
- High-availability requirements (99.9%+ uptime)
- Multi-server/distributed deployments
- Compliance-driven environments (SOC2, HIPAA, PCI-DSS)

The security measures implemented provide **basic protection suitable for internal MVP use**. For production-scale deployments, significant additional hardening and monitoring infrastructure is required.

---

This document describes the security monitoring system implemented for the Tech Radar application.

## Overview

The security monitoring system uses multiple layers of protection:

1. **Automated GitHub Actions** - Continuous security scanning
2. **Dependabot** - Automatic dependency updates
3. **Local Security Script** - Manual security checks
4. **Security Policy** - Guidelines and best practices

## Components

### 1. GitHub Actions Workflow (`.github/workflows/security-scan.yml`)

Automated security scanning that runs:
- On every push to main/develop
- On every pull request
- Daily at 2 AM UTC
- On manual trigger

**Scan Types:**

- **Dependency Scan**: Uses `npm audit` to check for known vulnerabilities
- **CodeQL Analysis**: GitHub's semantic code analysis for security issues
- **Secret Scanning**: TruffleHog scans for leaked credentials and secrets
- **ESLint Security**: Static analysis with security-focused rules
- **Docker Scanning**: Trivy scans Docker images (if Dockerfile exists)

### 2. Dependabot (`.github/dependabot.yml`)

Automatically creates pull requests for:
- npm package updates (weekly on Mondays)
- GitHub Actions updates (monthly)
- Security vulnerability patches (immediate)

**Features:**
- Groups patch updates together
- Auto-merges security patches
- Labels PRs appropriately
- Limits open PRs to 10

### 3. Local Security Script (`security-check.sh`)

Run locally before commits:

```bash
./security-check.sh
```

**Checks:**
1. Node.js environment validation
2. npm audit for dependency vulnerabilities
3. Secret scanning (API keys, tokens, passwords)
4. SQL injection pattern detection
5. XSS vulnerability detection
6. Insecure random number generation
7. Dangerous `eval()` usage
8. Hardcoded sensitive URLs
9. Environment variable handling
10. Next.js security headers
11. TypeScript compilation errors
12. Outdated dependencies

### 4. Security Policy (`SECURITY.md`)

Documents:
- Supported versions
- How to report vulnerabilities
- Security measures in place
- Security headers recommendations
- Contributor security checklist

## Usage

### For Developers

**Before committing code:**
```bash
./security-check.sh
npm audit
```

**To fix vulnerabilities:**
```bash
npm audit fix
# Or for breaking changes:
npm audit fix --force
```

**To update dependencies:**
```bash
npm update
# Check what's outdated:
npm outdated
```

### For Maintainers

**Enable GitHub Security Features:**

1. Go to repository Settings → Security & analysis
2. Enable:
   - Dependabot alerts
   - Dependabot security updates
   - Secret scanning
   - Code scanning (CodeQL)

**Review Security Alerts:**
- Check the Security tab regularly
- Review Dependabot PRs promptly
- Investigate CodeQL findings

**Monitor Workflow Runs:**
- Check Actions tab for security scan results
- Review failed scans immediately
- Update security configurations as needed

## Security Best Practices

### For New Features

- [ ] Validate all user inputs
- [ ] Use parameterized queries (no string concatenation)
- [ ] Avoid `dangerouslySetInnerHTML`
- [ ] Use environment variables for sensitive config
- [ ] Implement proper authentication/authorization
- [ ] Add rate limiting for public APIs
- [ ] Log security events (authentication failures, etc.)
- [ ] Handle errors without leaking sensitive info

### For Code Reviews

- [ ] Check for hardcoded secrets
- [ ] Verify input validation
- [ ] Review authentication/authorization logic
- [ ] Check for SQL injection vulnerabilities
- [ ] Look for XSS vulnerabilities
- [ ] Verify error handling
- [ ] Check dependency updates

## Common Vulnerabilities to Avoid

### 1. SQL Injection
**Bad:**
```typescript
db.execute(`SELECT * FROM users WHERE id = ${userId}`)
```

**Good:**
```typescript
db.query.users.findFirst({
  where: eq(users.id, userId)
})
```

### 2. XSS (Cross-Site Scripting)
**Bad:**
```typescript
<div dangerouslySetInnerHTML={{__html: userInput}} />
```

**Good:**
```typescript
<div>{userInput}</div> // React automatically escapes
```

### 3. Hardcoded Secrets
**Bad:**
```typescript
const API_KEY = "sk_live_1234567890"
```

**Good:**
```typescript
const API_KEY = process.env.API_KEY
```

### 4. Insecure Random Generation
**Bad:**
```typescript
const token = Math.random().toString(36)
```

**Good:**
```typescript
import { randomBytes } from 'crypto'
const token = randomBytes(32).toString('hex')
```

## Incident Response

If a security vulnerability is discovered:

1. **Assess the severity** (Critical, High, Medium, Low)
2. **Create a private security advisory** (if on GitHub)
3. **Develop and test a fix**
4. **Deploy the fix** to production
5. **Notify affected users** (if applicable)
6. **Publish security advisory** with details
7. **Document lessons learned**

## Continuous Improvement

- Review security scan results weekly
- Update security tools monthly
- Audit security practices quarterly
- Conduct security training annually
- Stay informed about:
  - OWASP Top 10 updates
  - CVE alerts for dependencies
  - Next.js security advisories
  - npm security advisories

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [npm Security Best Practices](https://docs.npmjs.com/cli/v10/using-npm/security)
- [GitHub Security Lab](https://securitylab.github.com/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [CodeQL Documentation](https://codeql.github.com/docs/)

## Contact

For security concerns, see [SECURITY.md](../SECURITY.md) for reporting instructions.
