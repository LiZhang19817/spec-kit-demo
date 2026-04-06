/**
 * Fuzzy search configuration
 * Fuse.js configuration for movie search
 */

import Fuse from 'fuse.js';
import { Movie } from '@/types/movie';

/** Dropped from multi-token AND so queries like "the matrix" still behave well */
const SEARCH_STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'as',
  'is',
  'was',
  'are',
  'be',
  'been',
  'by',
  'it',
  'its',
]);

/**
 * Tokens used for multi-word AND matching. Returns null when the whole phrase should be searched as one.
 */
export function meaningfulSearchTokens(trimmed: string): string[] | null {
  const raw = trimmed.split(/\s+/).filter(Boolean);
  if (raw.length < 2) return null;

  const tokens = raw
    .map((t) => t.normalize('NFKC').toLowerCase())
    .filter((t) => t.length >= 2 && !SEARCH_STOP_WORDS.has(t));

  return tokens.length >= 2 ? tokens : null;
}

/** Lowercase text used for literal / word-boundary matching */
export function buildSearchHaystack(movie: Movie): string {
  const parts: string[] = [
    movie.title,
    movie.director ?? '',
    movie.description,
    ...movie.genres,
    ...(movie.cast ?? []),
  ];
  return parts.join(' ').normalize('NFKC').toLowerCase();
}

function escapeRegexToken(token: string): string {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True if token appears as its own word (avoids "sins" matching inside "assassins"). */
export function tokenMatchesAsWholeWord(haystack: string, token: string): boolean {
  const re = new RegExp(`\\b${escapeRegexToken(token)}\\b`, 'i');
  return re.test(haystack);
}

function moviesMatchingWordBoundaryAnd(movies: readonly Movie[], tokens: string[]): Movie[] {
  return movies.filter((movie) => {
    const hay = buildSearchHaystack(movie);
    return tokens.every((t) => tokenMatchesAsWholeWord(hay, t));
  });
}

/** Compare full query to title (handles spacing / Unicode). */
export function normalizeForTitleMatch(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Fuse.js options for movie search
 * Configured for <300ms response time per constitution
 */
export const FUSE_OPTIONS = {
  // Fields to search (weighted by importance)
  keys: [
    {
      name: 'title',
      weight: 0.4,
    },
    {
      name: 'director',
      weight: 0.2,
    },
    {
      name: 'cast',
      weight: 0.2,
    },
    {
      name: 'description',
      weight: 0.1,
    },
    {
      name: 'genres',
      weight: 0.1,
    },
  ],

  // Fuzzy matching threshold (0.0 = exact, 1.0 = match anything)
  threshold: 0.32,

  // Search algorithm location
  location: 0,

  // How far to search from location
  distance: 100,

  // Minimum character length before searching
  minMatchCharLength: 2,

  // Include score in results
  includeScore: true,

  // Include matched indices
  includeMatches: false,

  // Case sensitivity
  isCaseSensitive: false,

  // Use extended search
  useExtendedSearch: false,

  // Ignore field length when scoring
  ignoreLocation: true,

  // Field length norm
  fieldNormWeight: 1,
};

/**
 * Create a new Fuse instance with movie data
 */
export function createSearchIndex(movies: Movie[]): Fuse<Movie> {
  return new Fuse(movies, FUSE_OPTIONS);
}

function orderMoviesByFuseRank(fuse: Fuse<Movie>, phrase: string, candidates: Movie[]): Movie[] {
  const idSet = new Set(candidates.map((m) => m.id));
  const ordered: Movie[] = [];
  const seen = new Set<string>();
  for (const r of fuse.search(phrase)) {
    if (idSet.has(r.item.id) && !seen.has(r.item.id)) {
      seen.add(r.item.id);
      ordered.push(r.item);
    }
  }
  for (const m of candidates) {
    if (!seen.has(m.id)) ordered.push(m);
  }
  return ordered;
}

/**
 * Search movies with fuzzy matching.
 * Multi-word queries (2+ meaningful tokens) first require each token as a **whole word** (AND),
 * so "sins" does not match inside "assassins" and "unspeakable sins" stays precise.
 * If that yields nothing (e.g. heavy typos), falls back to fuzzy per-token AND, then fuzzy phrase.
 */
export function searchMovies(fuse: Fuse<Movie>, movies: readonly Movie[], term: string): Movie[] {
  const trimmed = term.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  // Stale UI can call search with an empty list while the Fuse index still holds data — skip fuzzy in that case.
  if (movies.length === 0) {
    return [];
  }

  const queryNorm = normalizeForTitleMatch(trimmed);
  const exactTitleHits = movies.filter((m) => normalizeForTitleMatch(m.title) === queryNorm);
  if (exactTitleHits.length > 0) {
    return orderMoviesByFuseRank(fuse, trimmed, exactTitleHits);
  }

  const tokens = meaningfulSearchTokens(trimmed);
  if (!tokens) {
    return fuse.search(trimmed).map((r) => r.item);
  }

  const wordBoundaryHits = moviesMatchingWordBoundaryAnd(movies, tokens);
  if (wordBoundaryHits.length > 0) {
    return orderMoviesByFuseRank(fuse, trimmed, wordBoundaryHits);
  }

  const perTokenResults = tokens.map((token) => fuse.search(token));
  const idSets = perTokenResults.map((results) => new Set(results.map((r) => r.item.id)));

  let intersection: Set<string> | undefined;
  for (const set of idSets) {
    if (!intersection) {
      intersection = set;
    } else {
      intersection = new Set([...intersection].filter((id) => set.has(id)));
    }
  }

  if (!intersection || intersection.size === 0) {
    return fuse.search(trimmed).map((r) => r.item);
  }

  const fullPhraseResults = fuse.search(trimmed);
  const ordered: Movie[] = [];
  const seen = new Set<string>();
  for (const r of fullPhraseResults) {
    if (intersection.has(r.item.id) && !seen.has(r.item.id)) {
      seen.add(r.item.id);
      ordered.push(r.item);
    }
  }

  const fillFromFirstToken = new Map<string, Movie>();
  for (const r of perTokenResults[0]) {
    if (intersection.has(r.item.id)) {
      fillFromFirstToken.set(r.item.id, r.item);
    }
  }
  for (const id of intersection) {
    if (!seen.has(id)) {
      const m = fillFromFirstToken.get(id);
      if (m) ordered.push(m);
    }
  }

  return ordered;
}

/**
 * Get search result count
 */
export function getSearchResultCount(
  fuse: Fuse<Movie>,
  movies: readonly Movie[],
  term: string
): number {
  return searchMovies(fuse, movies, term).length;
}
