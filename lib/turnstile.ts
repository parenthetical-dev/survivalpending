export async function verifyTurnstileToken(token: string): Promise<boolean> {
  // Skip verification in development and test environments
  if ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.CI === 'true') && token === 'development-token') {
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

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}