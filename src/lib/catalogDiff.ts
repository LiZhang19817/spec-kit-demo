import { Movie } from '@/types/movie';

export interface CatalogDiff {
  added: Movie[];
  removed: { id: string; title: string }[];
  totalCount: number;
  previousCount: number;
}

/** Compare two catalogs; returns null on first load (no previous snapshot). */
export function computeCatalogDiff(
  previousMovies: Movie[],
  nextMovies: Movie[]
): CatalogDiff | null {
  if (previousMovies.length === 0) {
    return null;
  }

  const prevMap = new Map(previousMovies.map((m) => [m.id, m]));
  const nextMap = new Map(nextMovies.map((m) => [m.id, m]));

  const added: Movie[] = [];
  for (const m of nextMovies) {
    if (!prevMap.has(m.id)) added.push(m);
  }

  const removed: { id: string; title: string }[] = [];
  for (const m of previousMovies) {
    if (!nextMap.has(m.id)) removed.push({ id: m.id, title: m.title });
  }

  return {
    added,
    removed,
    totalCount: nextMovies.length,
    previousCount: previousMovies.length,
  };
}
