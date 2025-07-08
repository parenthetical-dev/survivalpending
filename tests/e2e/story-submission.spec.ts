import { test, expect } from '@playwright/test';

test.describe('Story Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting a token
    await page.addInitScript(() => {
      localStorage.setItem('token', 'test-jwt-token');
      localStorage.setItem('hasCompletedOnboarding', 'true');
    });
  });

  test('complete story submission flow', async ({ page }) => {
    // Navigate to story submission page
    await page.goto('/story/submit');
    
    // Step 1: Write Stage
    await expect(page.getByRole('heading', { name: 'Share Your Story' })).toBeVisible();
    
    // Type a story
    const storyText = 'This is my test story about finding courage and acceptance.';
    await page.getByPlaceholder(/start typing your story/i).fill(storyText);
    
    // Click continue
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 2: Refine Stage
    await expect(page.getByText(/would you like claude/i)).toBeVisible();
    
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
    await expect(page.getByText(/preview your story/i)).toBeVisible();
    
    // Play full audio
    await page.getByRole('button', { name: /play/i }).click();
    // Wait for audio element to appear
    await expect(page.locator('audio')).toBeVisible({ timeout: 5000 });
    
    // Submit story
    await page.getByRole('button', { name: /submit story/i }).click();
    
    // Verify success
    await expect(page).toHaveURL('/story/success');
    await expect(page.getByText(/story.*submitted/i)).toBeVisible();
  });

  test('quick exit functionality', async ({ page }) => {
    await page.goto('/story/submit');
    
    // Type a story
    await page.getByPlaceholder(/start typing your story/i).fill('Test story');
    
    // Test quick exit button
    await page.getByRole('button', { name: /quick exit/i }).click();
    
    // Should redirect to weather.com
    await expect(page).toHaveURL('https://weather.com');
  });

  test('character limit enforcement', async ({ page }) => {
    await page.goto('/story/submit');
    
    // Type a very long story
    const longStory = 'a'.repeat(1050);
    await page.getByPlaceholder(/start typing your story/i).fill(longStory);
    
    // Check character count
    await expect(page.getByText(/1000.*1000/)).toBeVisible();
    
    // Verify continue button is disabled
    await expect(page.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  test('draft auto-save', async ({ page }) => {
    await page.goto('/story/submit');
    
    // Type a story
    const draftText = 'This is my draft story';
    await page.getByPlaceholder(/start typing your story/i).fill(draftText);
    
    // Wait for auto-save indicator or check localStorage
    await page.waitForFunction(() => {
      const draft = localStorage.getItem('story-draft');
      return draft && JSON.parse(draft).content === 'This is my draft story';
    }, { timeout: 5000 });
    
    // Reload page
    await page.reload();
    
    // Check if draft is restored
    await expect(page.getByPlaceholder(/start typing your story/i)).toHaveValue(draftText);
  });
});