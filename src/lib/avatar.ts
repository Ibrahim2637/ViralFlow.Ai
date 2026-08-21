export async function generateAvatarClip(prompt: string) {
  const heygenKey = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;
  if (!heygenKey) {
    console.warn('[Avatar] HeyGen key not set – using placeholder video');
    return '/placeholder_avatar.mp4';
  }

  const premium = process.env.HIGH_QUALITY === 'true';
  const url = premium
    ? 'https://api.heygen.com/v2/video/generate?resolution=1080p'
    : 'https://api.heygen.com/v2/video/generate';

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${heygenKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar_id: 'default',
        script: [{ text: prompt, voice_id: 'en_us_001' }],
      }),
    });

    const json = await resp.json();
    return json.preview_url || '/placeholder_avatar.mp4';
  } catch (err) {
    console.error('[Avatar] HeyGen request failed:', err);
    return '/placeholder_avatar.mp4';
  }
}
