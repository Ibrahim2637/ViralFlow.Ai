const decodeKey = (str: string) => {
  try {
    if (typeof window !== 'undefined') {
      return window.atob(str);
    }
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
};

export const PEXELS_API_KEY =
  process.env.PEXELS_API_KEY ||
  process.env.NEXT_PUBLIC_PEXELS_API_KEY ||
  decodeKey('dGg4NDRPU2hhVEFaWXpXNGFCNVlxYldZelE5Mm5rQjNCZmF0UVNkM2puUHVhajVKSnZHOVlBWQ==');

export const ELEVENLABS_API_KEY =
  process.env.ELEVENLABS_API_KEY ||
  process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ||
  decodeKey('c2tfNTMwNTFmNzk3NTg3NDBhMTZkMTNlMTdmOGY3ZDMxMjc2NzZkYjZkYTQxZWIxNDIz');

export const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  decodeKey('QVEuQWI4Uk42S2hVRTlPbnBvNE13djd2RDFDMHRSWjAyZnpKY3VFaFB3X1hzSVFOV2xR');

export const HIGH_QUALITY = true;
