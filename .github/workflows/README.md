# GitHub Actions CI/CD Workflows

This directory contains automated workflows that run on every push and pull request to ensure code quality, security, and functionality.

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)
**Triggers**: Push to `main` or `develop`, Pull Requests

**Jobs**:
1. **Code Quality Checks** (~2 min)
   - ESLint linting
   - TypeScript type checking

2. **Unit & Integration Tests** (~2 min)
   - Run all 162 unit tests
   - Generate coverage reports
   - Upload coverage artifacts

3. **Security Scanning** (~3 min)
   - Run security-check.sh script
   - npm audit for dependency vulnerabilities
   - TruffleHog secret scanning
   - Dependabot configuration check

4. **Build Application** (~3 min)
   - Next.js production build
   - Upload build artifacts

5. **E2E Tests** (~5 min)
   - Playwright end-to-end tests
   - Upload test reports on failure

6. **Summary**
   - Aggregate all job results
   - Fail workflow if any job fails

**Total Duration**: ~10-15 minutes

### 2. Pull Request Checks (`pr-checks.yml`)
**Triggers**: PR opened, synchronized, or reopened

**Features**:
- Fast validation (runs tests, security, and build)
- Checks for console.log statements
- Posts comment with results to PR
- Generates test coverage report

### 3. Simple Test Runner (`test.yml`)
**Triggers**: Push to `main` or `develop`, Pull Requests

**Jobs**:
- Quick test run (lint + tests + security + build)
- Separate E2E test job
- Upload test artifacts on failure

**Use Case**: Faster feedback for quick iterations

## Status Badges

Add these to your README.md to show build status:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/tech-radar/actions/workflows/ci.yml/badge.svg)
![Tests](https://github.com/YOUR_USERNAME/tech-radar/actions/workflows/test.yml/badge.svg)
```

## Configuration

### Required Secrets
No secrets required for basic operation. All tests run with the repository code.

### Optional Secrets
If you want to add deployment or notifications:
- `SLACK_WEBHOOK_URL` - For Slack notifications
- `CODECOV_TOKEN` - For Codecov integration
- `VERCEL_TOKEN` - For Vercel deployment

## Branch Protection Rules

### Recommended Settings for `main` branch

1. **Require pull request reviews**
   - At least 1 approval required

2. **Require status checks to pass**
   - Required checks:
     - Code Quality Checks
     - Unit & Integration Tests
     - Security Scanning
     - Build Application

3. **Require branches to be up to date**
   - Enabled

4. **Require linear history**
   - Enabled (optional, but recommended)

### Setup Instructions

Go to: `Settings → Branches → Add branch protection rule`

1. Branch name pattern: `main`
2. Enable: "Require a pull request before merging"
3. Enable: "Require status checks to pass before merging"
4. Select required checks from the list
5. Enable: "Require branches to be up to date before merging"
6. Save changes

## Workflow Optimization

### Caching
All workflows use npm cache to speed up dependency installation:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

### Concurrency Control
The CI workflow cancels previous runs on the same branch:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Parallel Execution
Jobs run in parallel when possible:
- Quality checks, tests, and security run simultaneously
- E2E tests only run after build completes

## Debugging Failed Workflows

### View Logs
1. Go to "Actions" tab in GitHub
2. Click on the failed workflow run
3. Click on the failed job
4. Expand the failed step to see detailed logs

### Download Artifacts
Failed E2E tests upload Playwright reports:
1. Go to the workflow run
2. Scroll to "Artifacts" section
3. Download `playwright-report`
4. Open `index.html` to view the report

### Re-run Failed Jobs
1. Go to the workflow run
2. Click "Re-run jobs"
3. Select "Re-run failed jobs"

## Local Testing

Test your changes before pushing:

```bash
# Run what CI runs
npm run lint                    # Linting
npx tsc --noEmit               # Type checking
npm test                        # Unit tests
./security-check.sh            # Security checks
npm run build                   # Build
npm run test:e2e               # E2E tests (optional)
```

Or use the watch mode for development:

```bash
npm run test:watch             # Auto-run tests on change
```

## Artifacts

### Coverage Reports
- **Location**: Uploaded as `coverage-report` artifact
- **Retention**: 30 days
- **Contents**: HTML coverage report, JSON data

### Build Output
- **Location**: Uploaded as `build-output` artifact
- **Retention**: 7 days
- **Contents**: `.next/` directory

### Playwright Reports
- **Location**: Uploaded as `playwright-report` artifact (on failure)
- **Retention**: 30 days
- **Contents**: HTML test report with screenshots and traces

## Performance

### Typical Run Times
- **Checkout**: 5s
- **Setup Node + Cache**: 10s
- **Install dependencies**: 30s (with cache)
- **Lint**: 5s
- **Type check**: 10s
- **Unit tests**: 2s
- **Security scan**: 30s
- **Build**: 60s
- **E2E tests**: 120s

**Total**: ~5-10 minutes for full pipeline

### Optimization Tips
1. Use `npm ci` instead of `npm install` (faster, more reliable)
2. Cache dependencies with `cache: 'npm'`
3. Run jobs in parallel
4. Use `continue-on-error` for non-critical steps
5. Set appropriate timeouts

## Troubleshooting

### Tests Pass Locally But Fail in CI
- Check Node.js version (CI uses 20)
- Check for environment-specific issues
- Look for timing issues in tests
- Check for hardcoded file paths

### E2E Tests Failing
- Tests may be timing-sensitive
- CI environment is headless
- Check Playwright configuration
- Review screenshots in artifacts

### Build Failures
- Check for missing environment variables
- Verify all dependencies are in package.json
- Check TypeScript errors
- Look for memory issues (increase timeout)

### Security Check Failures
- Review the security-check.sh output
- Check for hardcoded secrets
- Review Dependabot alerts
- Run locally: `./security-check.sh`

## Maintenance

### Updating Actions
Keep GitHub Actions up to date:

```yaml
# Recommended versions (as of 2026-02)
actions/checkout@v4
actions/setup-node@v4
actions/upload-artifact@v4
actions/github-script@v7
```

### Updating Node.js Version
Change in all workflow files:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # Update this
```

## Integration with Other Services

### Codecov (Optional)
Add to unit-tests job:

```yaml
- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    flags: unittests
```

### Slack Notifications (Optional)
Add to end of ci.yml:

```yaml
- name: Slack notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Best Practices

1. **Keep workflows fast** - Aim for <10 minutes total
2. **Use caching** - Speed up dependency installation
3. **Fail fast** - Run quick checks first
4. **Upload artifacts** - Save reports for debugging
5. **Use concurrency** - Cancel old runs
6. **Set timeouts** - Prevent hanging jobs
7. **Monitor costs** - GitHub provides 2000 free minutes/month
8. **Keep updated** - Update actions regularly

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Vitest CI Documentation](https://vitest.dev/guide/ci.html)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)

---

**Last Updated**: 2026-02-04
**Maintained By**: Development Team
