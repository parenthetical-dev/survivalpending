import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('signup with onboarding flow', async ({ page }) => {
    await page.goto('/signup');
    
    // Wait for username to be loaded
    await page.waitForSelector('input#username', { state: 'visible' });
    
    // Verify username format
    await expect(page.locator('input#username')).toHaveValue(/^[a-z]+_[a-z]+_\d{4}$/);
    
    // Set password
    await page.locator('input#password').fill('TestPassword123!');
    
    // Set confirm password
    await page.locator('input#confirmPassword').fill('TestPassword123!');
    
    // Handle Turnstile (in test mode it auto-passes)
    // Wait for Turnstile iframe or bypass in test mode
    await page.waitForSelector('[data-turnstile-ready="true"]', { timeout: 5000 }).catch(() => {});
    
    // Submit
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding');
    
    // Onboarding Step 1: Welcome
    await expect(page.getByText(/welcome to survival pending/i)).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 2: Download credentials
    await expect(page.getByText(/save your credentials/i)).toBeVisible();
    
    // Mock download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download credentials/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/survivalpending-credentials.*\.txt/);
    
    // Confirm download
    await page.getByRole('checkbox', { name: /i have saved/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 3: Safety info
    await expect(page.getByText(/safety first/i)).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 4: Demographics (optional)
    await expect(page.getByText(/tell us about yourself/i)).toBeVisible();
    
    // Skip demographics
    await page.getByRole('button', { name: /skip/i }).click();
    
    // Step 5: Complete
    await expect(page.getByText(/you're all set/i)).toBeVisible();
    await page.getByRole('button', { name: /start sharing/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('login flow', async ({ page }) => {
    await page.goto('/login');
    
    // Enter credentials
    await page.locator('input#username').fill('test_user_1234');
    await page.locator('input#password').fill('TestPassword123!');
    
    // Wait for Turnstile iframe or bypass in test mode
    await page.waitForSelector('[data-turnstile-ready="true"]', { timeout: 5000 }).catch(() => {});
    
    // Submit
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid credentials
    await page.locator('input#username').fill('invalid_user');
    await page.locator('input#password').fill('wrongpassword');
    
    // Wait for Turnstile iframe or bypass in test mode
    await page.waitForSelector('[data-turnstile-ready="true"]', { timeout: 5000 }).catch(() => {});
    
    // Submit
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error
    await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  });
});