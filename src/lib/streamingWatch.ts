import { Movie } from '@/types/movie';

export type StreamingProviderId = 'netflix' | 'max';

/**
 * Legacy catalog used `https://www.max.com/search?...`, which 404s. Max search lives on play.max.com.
 */
export function normalizeMaxWatchUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.replace(/\/$/, '') || '/';
    if (path === '/search' && (host === 'max.com' || host === 'www.max.com')) {
      u.hostname = 'play.max.com';
      return u.toString();
    }
  } catch {
    return url;
  }
  return url;
}

/**
 * Resolves which service the primary "Watch" action should use and the correct URL.
 * Catalog data may store a Max URL in `netflixUrl` when only Max is available.
 */
export function getStreamingWatchLink(movie: Movie): {
  url: string;
  provider: StreamingProviderId;
  /** Present when both Netflix and Max are in `watchProviders` and `maxUrl` exists */
  secondaryUrl?: string;
} {
  const wp = new Set(movie.watchProviders ?? []);
  const nu = movie.netflixUrl;
  const maxUrl = movie.maxUrl;
  const q = encodeURIComponent(movie.title);

  const netflixFallback = `https://www.netflix.com/search?q=${q}`;
  const maxFallback = `https://play.max.com/search?q=${q}`;

  const onlyMax = wp.has('max') && !wp.has('netflix');
  const onlyNetflix = wp.has('netflix') && !wp.has('max');
  const both = wp.has('netflix') && wp.has('max');

  if (onlyMax) {
    const raw =
      nu && nu.includes('max.com')
        ? nu
        : maxUrl && maxUrl.includes('max.com')
          ? maxUrl
          : maxFallback;
    return { url: normalizeMaxWatchUrl(raw), provider: 'max' };
  }

  if (onlyNetflix) {
    const url = nu && nu.includes('netflix.com') ? nu : netflixFallback;
    return { url, provider: 'netflix' };
  }

  if (both) {
    const primary = nu && nu.includes('netflix.com') ? nu : netflixFallback;
    const secondaryRaw = maxUrl && maxUrl.includes('max.com') ? maxUrl : maxFallback;
    return {
      url: primary,
      provider: 'netflix',
      secondaryUrl: normalizeMaxWatchUrl(secondaryRaw),
    };
  }

  if (nu?.includes('max.com')) {
    return { url: normalizeMaxWatchUrl(nu), provider: 'max' };
  }
  if (nu?.includes('netflix.com')) {
    return { url: nu, provider: 'netflix' };
  }

  return {
    url: nu || netflixFallback,
    provider: 'netflix',
  };
}
