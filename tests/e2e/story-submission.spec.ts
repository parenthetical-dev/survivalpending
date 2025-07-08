import { test, expect } from '@playwright/test';
import { mockAuthentication } from './helpers/auth';

test.describe('Story Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await mockAuthentication(page);
  });

  test('complete story submission flow', async ({ page }) => {
    // Navigate to story submission page
    await page.goto('/story/submit');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Step 1: Write Stage
    await expect(page.getByRole('heading', { name: 'Write Your Story' })).toBeVisible();
    
    // Type a story (minimum 50 characters required)
    const storyText = 'This is my test story about finding courage and acceptance. I want to share my experience of discovering my true self.';
    await page.getByPlaceholder(/start typing your story/i).fill(storyText);
    
    // Wait for auto-save indicator
    await page.waitForTimeout(1500);
    
    // Click continue
    await page.getByRole('button', { name: /continue to refine/i }).click();
    
    // Step 2: Refine Stage
    await expect(page.getByText(/would you like claude/i)).toBeVisible({ timeout: 10000 });
    
    // Skip refinement for this test
    await page.getByRole('button', { name: /skip.*keep original/i }).click();
    
    // Step 3: Voice Stage
    await expect(page.getByText(/choose a voice/i)).toBeVisible();
    
    // Select a voice
    await page.getByRole('button', { name: /sarah/i }).first().click();
    
    // Preview voice
    await page.getByRole('button', { name: /preview/i }).click();
    
    // Wait for audio preview button to be enabled after preview loads
    await expect(page.getByRole('button', { name: /preview/i })).toBeEnabled({ timeout: 5000 });
    
    // Continue
    await page.getByRole('button', { name: /continue.*voice/i }).click();
    
    // Step 4: Preview Stage
    await expect(page.getByText(/preview your story/i)).toBeVisible({ timeout: 10000 });
    
    // Wait for audio to be generated
    await page.waitForTimeout(2000);
    
    // Submit story without playing (faster for tests)
    await page.getByRole('button', { name: /submit story/i }).click();
    
    // Verify success
    await expect(page).toHaveURL('/story/success', { timeout: 10000 });
    await expect(page.getByText(/story.*submitted/i)).toBeVisible({ timeout: 10000 });
  });

  test('quick exit functionality', async ({ page }) => {
    await page.goto('/story/submit');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Type a story
    await page.getByPlaceholder(/start typing your story/i).fill('Test story for quick exit');
    
    // Test quick exit button
    const exitButton = page.locator('button').filter({ hasText: 'ESC' });
    await expect(exitButton).toBeVisible();
    
    // Click exit button
    await exitButton.click();
    
    // Should redirect to google.com
    await page.waitForURL('https://www.google.com/**', { timeout: 10000 });
  });

  test('character limit enforcement', async ({ page }) => {
    await page.goto('/story/submit');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Type exactly 1000 characters (the limit)
    const maxStory = 'a'.repeat(1000);
    await page.getByPlaceholder(/start typing your story/i).fill(maxStory);
    
    // Check character count shows 0 remaining
    await expect(page.getByText('0')).toBeVisible();
    await expect(page.getByText('/ 1000')).toBeVisible();
    
    // Try to type more - it should not accept
    await page.getByPlaceholder(/start typing your story/i).type('b');
    
    // Content should still be 1000 chars
    const content = await page.getByPlaceholder(/start typing your story/i).inputValue();
    expect(content.length).toBe(1000);
  });

  test('draft auto-save', async ({ page }) => {
    await page.goto('/story/submit');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Type a story with minimum length (50 chars)
    const draftText = 'This is my draft story that will be automatically saved by the system';
    const textarea = page.getByPlaceholder(/start typing your story/i);
    await textarea.fill(draftText);
    
    // Wait for auto-save indicator to appear
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 3000 });
    
    // Verify localStorage was updated
    const savedDraft = await page.evaluate(() => localStorage.getItem('draft_story'));
    expect(savedDraft).toBe(draftText);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if draft is restored
    await expect(textarea).toHaveValue(draftText);
    
    // Should show toast notification about draft restoration
    await expect(page.getByText('Draft restored')).toBeVisible({ timeout: 5000 });
  });
});