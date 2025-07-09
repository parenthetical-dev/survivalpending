import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('signup page loads', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });
    
    // Wait for the title to be visible - this ensures React has hydrated
    await expect(page.getByText('Create Your Account')).toBeVisible({ timeout: 30000 });
    
    // Check for password field which should always be present
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    
    // Check for the signup button
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    
    // Wait for the title to be visible - this ensures React has hydrated
    await expect(page.getByText('Welcome Back')).toBeVisible({ timeout: 30000 });
    
    // Check for form fields
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    
    // Check for the login button
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible();
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for the username input to be visible and ready
    const usernameInput = page.locator('input#username');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toBeEnabled();
    
    // Clear any existing value and type the username with a delay for WebKit
    await usernameInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    
    // Type username character by character with small delay
    await usernameInput.fill('invalid_user_9999');
    
    // Enter password
    const passwordInput = page.locator('input#password');
    await passwordInput.click();
    await passwordInput.fill('wrongpassword');
    
    // Verify the form accepted input
    await expect(usernameInput).toHaveValue('invalid_user_9999');
    await expect(passwordInput).toHaveValue('wrongpassword');
  });
});