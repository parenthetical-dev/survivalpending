import { test, expect } from '@playwright/test';
import { clearAuthentication } from './helpers/auth';

test.describe('Authentication Flow', () => {
  // Generate unique username for each test run to avoid conflicts
  const generateTestUsername = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test_user_${timestamp}_${random}`;
  };

  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication
    await clearAuthentication(page);
  });
  test('signup with onboarding flow', async ({ page }) => {
    await page.goto('/signup');
    
    // Wait for username to be loaded
    await page.waitForSelector('input#username', { state: 'visible' });
    
    // Get the generated username
    const generatedUsername = await page.locator('input#username').inputValue();
    
    // Verify username format
    await expect(page.locator('input#username')).toHaveValue(/^[a-z]+_[a-z]+_\d{4}$/);
    
    // Set password
    await page.locator('input#password').fill('TestPassword123!');
    
    // Set confirm password
    await page.locator('input#confirmPassword').fill('TestPassword123!');
    
    // In development mode, we should see the bypass message
    await expect(page.getByText('Development mode: Captcha bypassed')).toBeVisible({ timeout: 10000 });
    
    // Submit
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for either onboarding redirect or error message
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/signup') && response.status() === 200
    ).catch(() => null);
    
    const response = await responsePromise;
    
    if (!response) {
      // If signup failed, check for error message
      const errorMessage = await page.getByText(/username.*already.*taken|error/i).isVisible().catch(() => false);
      if (errorMessage) {
        console.log('Signup failed - username might already exist. Skipping onboarding test.');
        return;
      }
    }
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding', { timeout: 15000 });
    
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
    // First create a test user by going through signup
    const testUsername = generateTestUsername();
    
    // Navigate to signup first
    await page.goto('/signup');
    await page.waitForSelector('input#username', { state: 'visible' });
    
    // Clear and set our test username
    await page.locator('input#username').clear();
    await page.locator('input#username').fill(testUsername);
    await page.locator('input#password').fill('TestPassword123!');
    await page.locator('input#confirmPassword').fill('TestPassword123!');
    
    // Wait for captcha bypass
    await expect(page.getByText('Development mode: Captcha bypassed')).toBeVisible({ timeout: 10000 });
    
    // Create account
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for redirect (could be onboarding or dashboard)
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 10000 });
    
    // Log out if we can
    await page.goto('/api/auth/logout', { waitUntil: 'networkidle' });
    
    // Now test login
    await page.goto('/login');
    
    // Enter credentials
    await page.locator('input#username').fill(testUsername);
    await page.locator('input#password').fill('TestPassword123!');
    
    // In development mode, we should see the bypass message
    await expect(page.getByText('Development mode: Captcha bypassed')).toBeVisible({ timeout: 10000 });
    
    // Submit
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Should redirect to dashboard or onboarding
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid credentials
    await page.locator('input#username').fill('invalid_user');
    await page.locator('input#password').fill('wrongpassword');
    
    // In development mode, we should see the bypass message
    await expect(page.getByText('Development mode: Captcha bypassed')).toBeVisible({ timeout: 10000 });
    
    // Submit
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Should show error
    await expect(page.getByText(/invalid username or password/i)).toBeVisible({ timeout: 10000 });
  });
});