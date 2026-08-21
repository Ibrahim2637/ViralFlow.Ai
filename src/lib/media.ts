// src/lib/media.ts
import { PEXELS_API_KEY } from '@/config/keys';

export async function searchVideos(query: string, perPage = 5) {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY },
  });
  if (!res.ok) throw new Error('Pexels request failed');
  const data = await res.json();
  return data.videos; // array of video objects
}
