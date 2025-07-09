import { test, expect } from '@playwright/test';
import { clearAuthentication } from './helpers/auth';

test.describe('Authentication Flow', () => {
  // Generate unique username for each test run to avoid conflicts
  const generateTestUsername = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const uuid = crypto.randomUUID().substring(0, 8);
    return `test_user_${timestamp}_${random}_${uuid}`;
  };

  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication
    await clearAuthentication(page);
    
    // Clean up test users before each test
    try {
      const response = await fetch('http://localhost:3000/api/test/cleanup-users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-test-secret': process.env.TEST_SECRET || 'test-secret'
        }
      });
      if (!response.ok) {
        console.warn('Failed to cleanup test users:', response.statusText);
      }
    } catch (error) {
      console.warn('Could not cleanup test users:', error);
    }
  });
  test('signup with onboarding flow', async ({ page }) => {
    await page.goto('/signup');
    
    // Wait for username to be loaded
    await page.waitForSelector('input#username', { state: 'visible' });
    
    // Generate and set a unique username explicitly
    const uniqueUsername = generateTestUsername();
    await page.locator('input#username').clear();
    await page.locator('input#username').fill(uniqueUsername);
    console.log('Using username:', uniqueUsername);
    
    // Set password
    await page.locator('input#password').fill('TestPassword123!');
    
    // Set confirm password
    await page.locator('input#confirmPassword').fill('TestPassword123!');
    
    // In development mode, we should see the bypass message
    await expect(page.getByText('Development mode: Captcha bypassed')).toBeVisible({ timeout: 15000 });
    
    // Submit
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for navigation or error
    await page.waitForLoadState('networkidle');
    
    // Check if we're still on signup page (indicating an error)
    const currentUrl = page.url();
    if (currentUrl.includes('/signup')) {
      // Look for any error message
      const errorSelectors = [
        'text=/error/i',
        'text=/already/i', 
        'text=/failed/i',
        '.error-message',
        '[role="alert"]',
        '.text-destructive'
      ];
      
      let errorText = '';
      for (const selector of errorSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            errorText = await element.textContent() || '';
            break;
          }
        } catch (e) {
          // Continue checking other selectors
        }
      }
      
      if (errorText) {
        console.error(`Signup failed with error: ${errorText}`);
        // Also check console for errors
        page.on('console', msg => {
          if (msg.type() === 'error') {
            console.error('Browser console error:', msg.text());
          }
        });
        throw new Error(`Signup failed: ${errorText}`);
      }
      
      // If no visible error but still on signup page, check for network issues
      console.error('Signup failed - still on signup page but no visible error');
      throw new Error('Signup failed - no redirect occurred');
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
    await page.goto('/signup');
    await page.waitForSelector('input#username', { state: 'visible' });
    
    // Generate and set a unique username explicitly
    const uniqueUsername = generateTestUsername();
    await page.locator('input#username').clear();
    await page.locator('input#username').fill(uniqueUsername);
    console.log('Creating user for login test:', uniqueUsername);
    
    // Fill in password fields
    await page.locator('input#password').fill('TestPassword123!');
    await page.locator('input#confirmPassword').fill('TestPassword123!');
    
    // Wait for captcha bypass
    await expect(page.getByText('Development mode: Captcha bypassed')).toBeVisible({ timeout: 15000 });
    
    // Create account
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for redirect (could be onboarding or dashboard)
    const signupSucceeded = await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 20000 })
      .then(() => true)
      .catch(() => false);
    
    if (!signupSucceeded) {
      // Check for error message
      const signupError = await page.getByText(/error|already|failed|taken/i).isVisible().catch(() => false);
      if (signupError) {
        const errorText = await page.getByText(/error|already|failed|taken/i).textContent();
        console.log(`Signup failed with error: ${errorText}`);
      }
      expect(signupError).toBe(false); // Fail test if signup error is visible
      
      // Also check if we're still on signup page
      expect(page.url()).not.toContain('/signup');
    }
    
    // Clear cookies/storage to simulate logout
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Now test login
    await page.goto('/login');
    
    // Enter credentials with the generated username
    await page.locator('input#username').fill(uniqueUsername);
    await page.locator('input#password').fill('TestPassword123!');
    
    // In development mode, we should see the bypass message
    await expect(page.getByText('Development mode: Captcha bypassed')).toBeVisible({ timeout: 15000 });
    
    // Submit
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Wait for response and check for errors
    try {
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 20000 });
    } catch (e) {
      // Check for error message to provide better debugging info
      const errorVisible = await page.getByText(/error|invalid|failed|incorrect|wrong/i).isVisible().catch(() => false);
      if (errorVisible) {
        const errorText = await page.getByText(/error|invalid|failed|incorrect|wrong/i).textContent();
        console.log(`Login failed with error: ${errorText}`);
      }
      
      // Log current URL for debugging
      console.log(`Current URL after login attempt: ${page.url()}`);
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'login-failure.png', fullPage: true });
      
      expect(errorVisible).toBe(false); // Fail with a clear message if error is visible
      throw e;
    }
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid credentials
    await page.locator('input#username').fill('invalid_user_9999');
    await page.locator('input#password').fill('wrongpassword');
    
    // In development mode, we should see the bypass message
    await expect(page.getByText('Development mode: Captcha bypassed')).toBeVisible({ timeout: 15000 });
    
    // Submit
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Wait for the response
    await page.waitForLoadState('networkidle');
    
    // Should show error - check for various possible error messages
    const errorSelectors = [
      page.getByText(/invalid username or password/i),
      page.getByText(/incorrect credentials/i),
      page.getByText(/login failed/i),
      page.locator('[role="alert"]'),
      page.locator('.text-destructive'),
      page.locator('.error-message')
    ];
    
    let errorFound = false;
    let errorText = '';
    for (const selector of errorSelectors) {
      try {
        if (await selector.isVisible({ timeout: 2000 })) {
          errorFound = true;
          errorText = await selector.textContent() || 'Error visible but no text';
          console.log(`Found error: ${errorText}`);
          break;
        }
      } catch (e) {
        // Continue checking other selectors
      }
    }
    
    if (!errorFound) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'invalid-login-no-error.png', fullPage: true });
      console.error('No error message found after invalid login attempt');
      console.log('Current URL:', page.url());
      
      // Check if we're still on login page
      if (!page.url().includes('/login')) {
        console.error('Unexpected redirect after invalid login:', page.url());
      }
    }
    
    expect(errorFound).toBe(true);
  });
});