import { computeCatalogDiff } from '@/lib/catalogDiff';
import { Movie } from '@/types/movie';

const base = (id: string, title: string): Movie => ({
  id,
  title,
  genres: ['Drama'],
  releaseYear: 2020,
  rating: 4,
  thumbnailUrl: 'https://example.com/x.jpg',
  description: 'Desc',
});

describe('computeCatalogDiff', () => {
  it('returns null when there was no previous catalog', () => {
    expect(computeCatalogDiff([], [base('1', 'A')])).toBeNull();
  });

  it('detects additions and removals', () => {
    const prev = [base('1', 'Keep'), base('2', 'Gone')];
    const next = [base('1', 'Keep'), base('3', 'New')];
    const d = computeCatalogDiff(prev, next);
    expect(d).not.toBeNull();
    expect(d!.added.map((m) => m.id)).toEqual(['3']);
    expect(d!.removed).toEqual([{ id: '2', title: 'Gone' }]);
    expect(d!.totalCount).toBe(2);
    expect(d!.previousCount).toBe(2);
  });

  it('detects empty diff when lists are identical', () => {
    const prev = [base('1', 'A')];
    const next = [base('1', 'A')];
    const d = computeCatalogDiff(prev, next);
    expect(d!.added).toHaveLength(0);
    expect(d!.removed).toHaveLength(0);
  });
});
