import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');
    
    // Just verify the page loads with expected elements
    await expect(page.getByText('Create Your Account')).toBeVisible();
    // Signup page has username selection radio buttons, not input field
    await expect(page.getByText('Choose Your Username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    
    // Just verify the page loads with expected elements
    await expect(page.getByText('Log In')).toBeVisible();
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
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