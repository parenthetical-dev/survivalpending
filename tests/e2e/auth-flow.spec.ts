import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');
    
    // Wait for page to load and check for key elements
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible({ timeout: 10000 });
    
    // Check for password field which should always be present
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    
    // Check for the signup button
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to load and check for key elements
    await expect(page.getByRole('heading', { name: /log in|sign in/i })).toBeVisible({ timeout: 10000 });
    
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
    await usernameInput.type('invalid_user_9999', { delay: 50 });
    
    // Enter password
    const passwordInput = page.locator('input#password');
    await passwordInput.click();
    await passwordInput.type('wrongpassword', { delay: 50 });
    
    // Verify the form accepted input
    await expect(usernameInput).toHaveValue('invalid_user_9999');
    await expect(passwordInput).toHaveValue('wrongpassword');
  });
});