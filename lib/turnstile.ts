export async function verifyTurnstileToken(token: string): Promise<boolean> {
  // Skip verification in development
  if (process.env.NODE_ENV === 'development' && token === 'development-token') {
    return true;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;

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