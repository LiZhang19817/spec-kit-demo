import { Movie } from '@/types/movie';

export type StreamingCatalogId = 'netflix' | 'max';

/**
 * Which streaming catalog(s) a title belongs to for browsing.
 * Titles available on both services appear on both catalog pages.
 */
export function getStreamingCatalogsForMovie(movie: Movie): Set<StreamingCatalogId> {
  const wp = new Set(movie.watchProviders ?? []);
  const nu = movie.netflixUrl ?? '';

  if (wp.size > 0) {
    const out = new Set<StreamingCatalogId>();
    if (wp.has('netflix')) out.add('netflix');
    if (wp.has('max')) out.add('max');
    return out;
  }

  if (nu.includes('max.com')) return new Set(['max']);
  if (nu.includes('netflix.com')) return new Set(['netflix']);
  return new Set(['netflix']);
}

export function movieAppearsOnStreamingCatalog(movie: Movie, catalog: StreamingCatalogId): boolean {
  return getStreamingCatalogsForMovie(movie).has(catalog);
}
