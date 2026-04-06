/**
 * Client-side cache for TMDB zh-CN title / overview (movies & TV).
 * Used when UI locale is Simplified Chinese.
 */

import { create } from 'zustand';
import { Movie } from '@/types/movie';

export type TmdbMediaKind = 'movie' | 'tv';

function parseTmdbIdFromStringId(id: string): number | null {
  const m = id.match(/(?:tmdb-movie-|tmdb-tv-|netflix-movie-|netflix-series-)(\d+)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isNaN(n) ? null : n;
}

/** Resolve TMDB kind + numeric id for API calls */
export function resolveTmdbMedia(movie: Movie): { kind: TmdbMediaKind; id: number } | null {
  const id = movie.tmdbId ?? movie.netflixId ?? parseTmdbIdFromStringId(movie.id);
  if (id == null || Number.isNaN(id)) return null;
  const kind: TmdbMediaKind = movie.type === 'series' ? 'tv' : 'movie';
  return { kind, id };
}

function cacheKey(kind: TmdbMediaKind, id: number): string {
  return `${kind}:${id}`;
}

export interface ZhTextEntry {
  title: string;
  overview: string;
}

interface TmdbZhState {
  cache: Record<string, ZhTextEntry>;
  loading: Record<string, boolean>;
  ensureChineseDetails: (movie: Movie, apiKey: string) => void;
}

export const useTmdbZhStore = create<TmdbZhState>((set, get) => ({
  cache: {},
  loading: {},

  ensureChineseDetails: (movie, apiKey) => {
    const resolved = resolveTmdbMedia(movie);
    if (!resolved || !apiKey.trim()) return;

    const key = cacheKey(resolved.kind, resolved.id);
    if (get().cache[key] || get().loading[key]) return;

    set((s) => ({ loading: { ...s.loading, [key]: true } }));

    const url = `https://api.themoviedb.org/3/${resolved.kind}/${resolved.id}?api_key=${encodeURIComponent(apiKey)}&language=zh-CN`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data?.status_code) {
          throw new Error(data.status_message || 'TMDB error');
        }
        const title =
          resolved.kind === 'movie'
            ? (data.title as string | undefined)
            : (data.name as string | undefined);
        const overview = typeof data.overview === 'string' ? data.overview : '';

        set((s) => ({
          cache: {
            ...s.cache,
            [key]: {
              title: (title && title.trim()) || movie.title,
              overview: overview.trim() || movie.description,
            },
          },
          loading: { ...s.loading, [key]: false },
        }));
      })
      .catch(() => {
        set((s) => ({
          cache: {
            ...s.cache,
            [key]: { title: movie.title, overview: movie.description },
          },
          loading: { ...s.loading, [key]: false },
        }));
      });
  },
}));

export function getZhCacheKey(movie: Movie): string | null {
  const r = resolveTmdbMedia(movie);
  return r ? cacheKey(r.kind, r.id) : null;
}
