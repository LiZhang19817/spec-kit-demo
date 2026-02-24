/**
 * Movie type definitions
 * Core entity types for the Netflix Movie Dashboard
 */

/**
 * Genre enum - All supported movie genres
 */
export type Genre =
  | 'Action'
  | 'Adventure'
  | 'Animation'
  | 'Comedy'
  | 'Crime'
  | 'Drama'
  | 'Fantasy'
  | 'Horror'
  | 'Mystery'
  | 'Romance'
  | 'Sci-Fi'
  | 'Thriller';

/**
 * All available genres as a const array
 */
export const GENRES: readonly Genre[] = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
] as const;

/**
 * Content Rating - Singapore film classification system
 */
export type ContentRating =
  | 'G' // General - Suitable for all ages
  | 'PG' // Parental Guidance - Some material may be unsuitable for children
  | 'PG13' // Parental Guidance 13 - Suitable for persons aged 13 and above
  | 'NC16' // No Children Under 16 - Suitable for persons aged 16 and above
  | 'M18' // Mature 18 - Suitable for persons aged 18 and above
  | 'R21'; // Restricted 21 - Suitable for adults aged 21 and above

/**
 * All available content ratings as a const array
 */
export const CONTENT_RATINGS: readonly ContentRating[] = [
  'G',
  'PG',
  'PG13',
  'NC16',
  'M18',
  'R21',
] as const;

/**
 * Movie entity - Represents a single movie in the collection
 */
export interface Movie {
  /** Unique identifier (kebab-case: title-year) */
  id: string;

  /** Movie title */
  title: string;

  /** Array of genre classifications */
  genres: Genre[];

  /** Year of theatrical release */
  releaseYear: number;

  /** User rating (0.0 - 5.0 scale) */
  rating: number;

  /** URL to movie poster/thumbnail image */
  thumbnailUrl: string;

  /** Brief plot synopsis */
  description: string;

  /** Runtime in minutes (optional) */
  runtime?: number;

  /** Director name(s) (optional) */
  director?: string;

  /** Main cast members (optional) */
  cast?: string[];

  /** Content rating (Singapore film classification) */
  contentRating?: ContentRating;

  /** Netflix URL for this title */
  netflixUrl?: string;
}

/**
 * Type guard to check if a value is a valid Genre
 */
export function isGenre(value: unknown): value is Genre {
  const validGenres: Genre[] = [
    'Action',
    'Adventure',
    'Animation',
    'Comedy',
    'Crime',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Thriller',
  ];

  return typeof value === 'string' && validGenres.includes(value as Genre);
}

/**
 * Type guard to check if a value is a valid Movie
 */
export function isMovie(value: unknown): value is Movie {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const movie = value as Record<string, unknown>;

  return (
    typeof movie.id === 'string' &&
    typeof movie.title === 'string' &&
    Array.isArray(movie.genres) &&
    movie.genres.every(isGenre) &&
    typeof movie.releaseYear === 'number' &&
    typeof movie.rating === 'number' &&
    typeof movie.thumbnailUrl === 'string' &&
    typeof movie.description === 'string'
  );
}
