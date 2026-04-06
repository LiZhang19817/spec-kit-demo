import { ContentRating, Genre } from '@/types/movie';
import type { MessageId } from './messages';

const GENRE_TO_MESSAGE: Record<Genre, MessageId> = {
  Action: 'genre_Action',
  Adventure: 'genre_Adventure',
  Animation: 'genre_Animation',
  Comedy: 'genre_Comedy',
  Crime: 'genre_Crime',
  Drama: 'genre_Drama',
  Fantasy: 'genre_Fantasy',
  Horror: 'genre_Horror',
  Mystery: 'genre_Mystery',
  Romance: 'genre_Romance',
  'Sci-Fi': 'genre_SciFi',
  Thriller: 'genre_Thriller',
};

export function genreToMessageId(genre: Genre): MessageId {
  return GENRE_TO_MESSAGE[genre];
}

export function contentRatingToDescId(rating: ContentRating): MessageId {
  return `cr_${rating}` as MessageId;
}

export function contentRatingToPillId(rating: ContentRating): MessageId {
  return `crPill_${rating}` as MessageId;
}
