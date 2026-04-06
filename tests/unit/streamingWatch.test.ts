import { getStreamingWatchLink, normalizeMaxWatchUrl } from '@/lib/streamingWatch';
import { Movie } from '@/types/movie';

const base = (overrides: Partial<Movie> = {}): Movie => ({
  id: 't-1',
  title: 'The Judge Returns',
  genres: ['Drama'],
  releaseYear: 2026,
  rating: 4,
  thumbnailUrl: 'https://example.com/x.jpg',
  description: 'Desc',
  ...overrides,
});

describe('normalizeMaxWatchUrl', () => {
  it('rewrites broken www.max.com search URLs to play.max.com', () => {
    expect(
      normalizeMaxWatchUrl('https://www.max.com/search?q=The%20Judge%20Returns')
    ).toBe('https://play.max.com/search?q=The%20Judge%20Returns');
    expect(normalizeMaxWatchUrl('https://max.com/search?q=x')).toBe(
      'https://play.max.com/search?q=x'
    );
  });

  it('leaves play.max.com URLs unchanged', () => {
    const u = 'https://play.max.com/search?q=Foo';
    expect(normalizeMaxWatchUrl(u)).toBe(u);
  });
});

describe('getStreamingWatchLink', () => {
  it('uses Max when only Max is a watch provider and URL is max.com', () => {
    const m = base({
      watchProviders: ['max'],
      netflixUrl: 'https://www.max.com/search?q=The%20Judge%20Returns',
    });
    const r = getStreamingWatchLink(m);
    expect(r.provider).toBe('max');
    expect(r.url).toMatch(/^https:\/\/play\.max\.com\/search\?/);
    expect(r.secondaryUrl).toBeUndefined();
  });

  it('uses Max fallback search when only Max and no netflixUrl', () => {
    const m = base({ watchProviders: ['max'] });
    const r = getStreamingWatchLink(m);
    expect(r.provider).toBe('max');
    expect(r.url).toMatch(/^https:\/\/play\.max\.com\/search\?/);
    expect(decodeURIComponent(r.url)).toContain('The Judge Returns');
  });

  it('uses Netflix when only Netflix is a watch provider', () => {
    const m = base({
      watchProviders: ['netflix'],
      netflixUrl: 'https://www.netflix.com/search?q=Foo',
    });
    const r = getStreamingWatchLink(m);
    expect(r.provider).toBe('netflix');
    expect(r.url).toContain('netflix.com');
  });

  it('returns Netflix primary and Max secondary when both providers', () => {
    const m = base({
      watchProviders: ['netflix', 'max'],
      netflixUrl: 'https://www.netflix.com/search?q=Foo',
      maxUrl: 'https://www.max.com/search?q=Foo',
    });
    const r = getStreamingWatchLink(m);
    expect(r.provider).toBe('netflix');
    expect(r.url).toContain('netflix.com');
    expect(r.secondaryUrl).toMatch(/^https:\/\/play\.max\.com\/search\?/);
  });

  it('infers Max from netflixUrl host when watchProviders missing', () => {
    const m = base({
      netflixUrl: 'https://www.max.com/search?q=The%20Judge%20Returns',
    });
    const r = getStreamingWatchLink(m);
    expect(r.provider).toBe('max');
    expect(r.url).toMatch(/^https:\/\/play\.max\.com\/search\?/);
  });

  it('infers Netflix from netflixUrl host when watchProviders missing', () => {
    const m = base({
      netflixUrl: 'https://www.netflix.com/search?q=Foo',
    });
    const r = getStreamingWatchLink(m);
    expect(r.provider).toBe('netflix');
  });

  it('defaults to Netflix search when no providers and no URL', () => {
    const m = base();
    const r = getStreamingWatchLink(m);
    expect(r.provider).toBe('netflix');
    expect(r.url).toContain('netflix.com');
  });
});
