# Tech Radar Test Suite

This directory contains comprehensive automated tests for the Tech Radar application, covering unit tests, integration tests, and end-to-end tests.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with UI (interactive test explorer)
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI (for debugging)
npm run test:e2e:ui
```

## Directory Structure

```
test/
├── setup.ts                    # Test environment configuration
├── helpers/                    # Test utilities and helpers
│   └── db-test-helper.ts      # Database test utilities
├── unit/                       # Unit tests
│   ├── csv-parser.test.ts     # CSV parsing logic
│   ├── radar-math.test.ts     # SVG geometry calculations
│   ├── rate-limit.test.ts     # Rate limiting logic
│   ├── sample-csv-api.test.ts # CSV generation logic
│   └── validations.test.ts    # Zod schema validation
├── integration/                # Integration tests
│   └── database.test.ts       # Database operations
└── e2e/                        # End-to-end tests
    └── landing-page.spec.ts   # User flows

## Test Categories

### Unit Tests

Unit tests focus on testing individual functions and modules in isolation.

**Location**: `test/unit/`

**Examples**:
- Input validation schemas
- Math calculations for radar visualization
- CSV parsing and generation
- Rate limiting logic

**Run unit tests only**:
```bash
npm test -- test/unit/
```

### Integration Tests

Integration tests verify that different parts of the system work together correctly.

**Location**: `test/integration/`

**Examples**:
- Database CRUD operations
- Foreign key relationships
- Cascade deletions
- Transaction handling

**Run integration tests only**:
```bash
npm test -- test/integration/
```

### End-to-End Tests

E2E tests simulate real user interactions and verify complete workflows.

**Location**: `test/e2e/`

**Examples**:
- User registration and login
- Radar creation workflow
- Blip management
- CSV import

**Run E2E tests**:
```bash
npm run test:e2e
```

**Run E2E tests for specific browser**:
```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/myModule';

describe('myFunction', () => {
  it('handles valid input correctly', () => {
    const result = myFunction('valid input');
    expect(result).toBe('expected output');
  });

  it('throws error for invalid input', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, cleanupTestDb } from '../helpers/db-test-helper';

describe('Database Operations', () => {
  let testDb;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    cleanupTestDb(testDb.sqlite);
  });

  it('creates a record', async () => {
    // Arrange
    const data = { name: 'Test' };

    // Act
    const result = await testDb.db.insert(table).values(data);

    // Assert
    expect(result).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can register', async ({ page }) => {
  await page.goto('/register');

  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

## Test Helpers

### Database Test Helper

Located in `test/helpers/db-test-helper.ts`, provides utilities for testing with an in-memory database:

```typescript
import {
  createTestDb,
  createTestUser,
  createTestRadar,
  createTestBlip,
  cleanupTestDb,
} from '../helpers/db-test-helper';

// Create test database
const testDb = createTestDb();

// Create test user
const { userId, password } = await createTestUser(testDb.db, {
  email: 'test@example.com',
});

// Create test radar
const { radarId, quadrantIds, ringIds } = await createTestRadar(
  testDb.db,
  userId
);

// Clean up
cleanupTestDb(testDb.sqlite);
```

## Test Coverage

View coverage report after running:
```bash
npm run test:coverage
```

Coverage reports are generated in:
- Text format (in terminal)
- HTML format (`coverage/index.html`)
- JSON format (`coverage/coverage-final.json`)

**Coverage Goals** (as defined in claude.md):
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

## Debugging Tests

### Debugging Unit/Integration Tests

**Using VS Code**:
1. Set breakpoints in your test file
2. Run "Debug Test at Cursor" or "Debug All Tests"

**Using Vitest UI**:
```bash
npm run test:ui
```
Opens an interactive browser interface for exploring and debugging tests.

### Debugging E2E Tests

**Using Playwright UI**:
```bash
npm run test:e2e:ui
```
Opens Playwright's interactive test runner with time-travel debugging.

**Run tests in headed mode**:
```bash
npm run test:e2e -- --headed
```

**Run tests in debug mode**:
```bash
npm run test:e2e -- --debug
```

## Continuous Integration

Tests are designed to run in CI/CD pipelines. Ensure these commands pass before merging:

```bash
# 1. Run all tests
npm test

# 2. Check test coverage meets thresholds
npm run test:coverage

# 3. Run security checks
./security-check.sh

# 4. Run linter
npm run lint

# 5. Build the project
npm run build
```

## Best Practices

### General
- Write descriptive test names that explain what is being tested
- Use AAA pattern: Arrange, Act, Assert
- Test one thing per test
- Keep tests fast and focused
- Avoid test interdependence

### Unit Tests
- Mock external dependencies
- Test edge cases and error conditions
- Use test data factories for consistency

### Integration Tests
- Clean up test data after each test
- Use transactions when possible
- Test foreign key relationships
- Verify cascade operations

### E2E Tests
- Test critical user journeys
- Use page object pattern for reusability
- Handle async operations correctly
- Test on multiple browsers/viewports

### Security Tests
- Validate all inputs
- Test authentication and authorization
- Verify rate limiting
- Check for injection vulnerabilities
- Ensure error messages don't leak sensitive info

## Common Issues

### Tests timing out
- Increase timeout in test configuration
- Check for unresolved promises
- Verify async/await usage

### Tests failing intermittently
- Check for race conditions
- Ensure proper cleanup between tests
- Avoid relying on external services

### E2E tests failing
- Ensure dev server is running
- Check for correct selectors
- Verify viewport and browser settings

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Test Coverage Report](../TEST_COVERAGE.md)

## Contributing

When adding new features:
1. Write tests first (TDD approach preferred)
2. Ensure all tests pass: `npm test`
3. Verify coverage meets thresholds: `npm run test:coverage`
4. Run security checks: `./security-check.sh`
5. Document any new test utilities or patterns

---

For detailed test coverage information, see [TEST_COVERAGE.md](../TEST_COVERAGE.md)
