export async function verifyTurnstileToken(token: string): Promise<boolean> {
  // Skip verification ONLY in local development and test environments
  // SECURITY: This bypass is strictly for local development only
  if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_BYPASS === 'true' && token === 'development-token') {
    console.warn('[SECURITY] Using development token bypass - this should NEVER appear in production logs');
    return true;
  }
  
  // Allow bypass in test environment for automated testing
  if (process.env.NODE_ENV === 'test' && token === 'test-token') {
    return true;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return false;
  }

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json() as { success: boolean };
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}