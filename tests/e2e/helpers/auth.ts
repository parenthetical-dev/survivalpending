import { Page } from '@playwright/test';

export async function mockAuthentication(page: Page) {
  // Mock authentication by setting a token and onboarding status
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-jwt-token');
    localStorage.setItem('hasCompletedOnboarding', 'true');
    
    // Also set a mock user data for tests that might need it
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-id',
      username: 'test_user_1234',
      createdAt: new Date().toISOString()
    }));
  });
}

export async function clearAuthentication(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('user');
    localStorage.removeItem('draft_story');
    sessionStorage.clear();
  });
}