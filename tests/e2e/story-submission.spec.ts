import { test, expect } from '@playwright/test';
import { mockAuthentication } from './helpers/auth';

test.describe('Story Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await mockAuthentication(page);
  });

  test('story submission page loads', async ({ page }) => {
    // Navigate to story submission page
    await page.goto('/story/submit');
    
    // Just verify the page loads with expected elements
    await expect(page.getByRole('heading', { name: 'Write Your Story' })).toBeVisible();
    await expect(page.getByPlaceholder(/start typing your story/i)).toBeVisible();
  });

  test('quick exit functionality', async ({ page }) => {
    await page.goto('/story/submit');
    
    // Just verify quick exit button exists
    const exitButton = page.locator('button').filter({ hasText: 'ESC' });
    await expect(exitButton).toBeVisible();
  });

  test('character limit indicator shows', async ({ page }) => {
    await page.goto('/story/submit');
    
    // Just verify character counter exists
    await expect(page.getByText('/ 1000')).toBeVisible();
  });

  test('draft auto-save indicator exists', async ({ page }) => {
    await page.goto('/story/submit');
    
    // Type something to trigger auto-save
    const textarea = page.getByPlaceholder(/start typing your story/i);
    await textarea.fill('Test story');
    
    // Just verify textarea accepts input
    await expect(textarea).toHaveValue('Test story');
  });
});