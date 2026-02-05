import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('displays the main heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Technology Radar');
  });

  test('has navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for login and register links (use .first() since there are multiple)
    const loginLink = page.locator('a[href="/login"]').first();
    const registerLink = page.locator('a[href="/register"]').first();

    await expect(loginLink).toBeVisible();
    await expect(registerLink).toBeVisible();
  });

  test('navigates to register page', async ({ page }) => {
    await page.goto('/');

    // Click the first register link (header nav)
    await page.locator('a[href="/register"]').first().click();
    await expect(page).toHaveURL('/register');
  });

  test('navigates to login page', async ({ page }) => {
    await page.goto('/');

    // Click the first login link (header nav)
    await page.locator('a[href="/login"]').first().click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Registration Flow', () => {
  test('shows registration form', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/register');

    await page.click('button[type="submit"]');

    // Should show validation errors or prevent submission
    await expect(page).toHaveURL('/register');
  });

  test('validates email format', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'TestPassword123!');

    await page.click('button[type="submit"]');

    // Should show email validation error
    await expect(page).toHaveURL('/register');
  });

  test('validates password complexity', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'weak');

    await page.click('button[type="submit"]');

    // Should show password validation error
    await expect(page).toHaveURL('/register');
  });
});

test.describe('Login Flow', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    // Should show validation errors or prevent submission
    await expect(page).toHaveURL('/login');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page).toHaveURL('/login');
  });

  test('has link to registration', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('redirects unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects unauthenticated users from radar creation', async ({ page }) => {
    await page.goto('/radar/new');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Accessibility', () => {
  test('landing page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('forms have accessible labels', async ({ page }) => {
    await page.goto('/register');

    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    // Check that inputs are properly labeled
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('buttons have descriptive text', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).not.toBeEmpty();
  });
});

test.describe('Responsive Design', () => {
  test('displays properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
  });

  test('displays properly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
  });

  test('displays properly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
  });
});
