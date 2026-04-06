import {
  getStreamingCatalogsForMovie,
  movieAppearsOnStreamingCatalog,
} from '@/lib/streamingCatalog';
import { Movie } from '@/types/movie';

const base = (overrides: Partial<Movie> = {}): Movie => ({
  id: 't-1',
  title: 'Test',
  genres: ['Drama'],
  releaseYear: 2020,
  rating: 4,
  thumbnailUrl: 'https://example.com/x.jpg',
  description: 'Desc',
  ...overrides,
});

describe('streamingCatalog', () => {
  it('maps watchProviders to catalogs', () => {
    expect(
      getStreamingCatalogsForMovie(base({ watchProviders: ['netflix'] }))
    ).toEqual(new Set(['netflix']));
    expect(getStreamingCatalogsForMovie(base({ watchProviders: ['max'] }))).toEqual(
      new Set(['max'])
    );
    expect(
      getStreamingCatalogsForMovie(base({ watchProviders: ['netflix', 'max'] }))
    ).toEqual(new Set(['netflix', 'max']));
  });

  it('infers from netflixUrl when watchProviders missing', () => {
    expect(
      getStreamingCatalogsForMovie(
        base({ netflixUrl: 'https://www.max.com/search?q=x' })
      )
    ).toEqual(new Set(['max']));
    expect(
      getStreamingCatalogsForMovie(
        base({ netflixUrl: 'https://www.netflix.com/search?q=x' })
      )
    ).toEqual(new Set(['netflix']));
  });

  it('defaults legacy rows without URL to Netflix catalog', () => {
    expect(getStreamingCatalogsForMovie(base())).toEqual(new Set(['netflix']));
  });

  it('filters by catalog', () => {
    const dual = base({ watchProviders: ['netflix', 'max'] });
    expect(movieAppearsOnStreamingCatalog(dual, 'netflix')).toBe(true);
    expect(movieAppearsOnStreamingCatalog(dual, 'max')).toBe(true);
    const maxOnly = base({ watchProviders: ['max'] });
    expect(movieAppearsOnStreamingCatalog(maxOnly, 'netflix')).toBe(false);
    expect(movieAppearsOnStreamingCatalog(maxOnly, 'max')).toBe(true);
  });
});
