/**
 * Unit Tests: useMovieFilter Hook
 * Tests filtering logic with combined filters (genre, year, rating)
 */

import { renderHook, act } from '@testing-library/react';
import { useMovieFilter } from '@/hooks/useMovieFilter';
import { Movie, Genre } from '@/types/movie';

describe('useMovieFilter', () => {
  const mockMovies: Movie[] = [
    {
      id: 'action-2020',
      title: 'Action Movie 2020',
      genres: ['Action' as Genre, 'Thriller' as Genre],
      releaseYear: 2020,
      rating: 4.5,
      thumbnailUrl: '/action.jpg',
      description: 'An action movie',
      runtime: 120,
    },
    {
      id: 'comedy-2015',
      title: 'Comedy Movie 2015',
      genres: ['Comedy' as Genre],
      releaseYear: 2015,
      rating: 3.8,
      thumbnailUrl: '/comedy.jpg',
      description: 'A comedy movie',
      runtime: 90,
    },
    {
      id: 'drama-2022',
      title: 'Drama Movie 2022',
      genres: ['Drama' as Genre],
      releaseYear: 2022,
      rating: 4.8,
      thumbnailUrl: '/drama.jpg',
      description: 'A drama movie',
      runtime: 150,
    },
    {
      id: 'scifi-2018',
      title: 'Sci-Fi Movie 2018',
      genres: ['Sci-Fi' as Genre, 'Action' as Genre],
      releaseYear: 2018,
      rating: 4.2,
      thumbnailUrl: '/scifi.jpg',
      description: 'A sci-fi movie',
      runtime: 130,
    },
  ];

  it('should filter by single genre', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setGenreFilter(['Action' as Genre]);
    });

    expect(result.current.filteredMovies).toHaveLength(2);
    expect(result.current.filteredMovies.map((m) => m.id)).toEqual([
      'action-2020',
      'scifi-2018',
    ]);
  });

  it('should filter by multiple genres (OR logic)', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setGenreFilter(['Action' as Genre, 'Comedy' as Genre]);
    });

    expect(result.current.filteredMovies).toHaveLength(3);
    expect(result.current.filteredMovies.map((m) => m.id)).toContain(
      'action-2020'
    );
    expect(result.current.filteredMovies.map((m) => m.id)).toContain(
      'comedy-2015'
    );
    expect(result.current.filteredMovies.map((m) => m.id)).toContain(
      'scifi-2018'
    );
  });

  it('should filter by year range', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setYearRange(2018, 2020);
    });

    expect(result.current.filteredMovies).toHaveLength(2);
    expect(result.current.filteredMovies.map((m) => m.id)).toEqual([
      'action-2020',
      'scifi-2018',
    ]);
  });

  it('should filter by minimum rating', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setMinRating(4.5);
    });

    expect(result.current.filteredMovies).toHaveLength(2);
    expect(result.current.filteredMovies.map((m) => m.id)).toEqual([
      'action-2020',
      'drama-2022',
    ]);
  });

  it('should combine genre + year filters', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setGenreFilter(['Action' as Genre]);
      result.current.setYearRange(2019, 2021);
    });

    expect(result.current.filteredMovies).toHaveLength(1);
    expect(result.current.filteredMovies[0].id).toBe('action-2020');
  });

  it('should combine all filters (genre + year + rating)', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setGenreFilter(['Action' as Genre]);
      result.current.setYearRange(2015, 2020);
      result.current.setMinRating(4.0);
    });

    // Both action-2020 and scifi-2018 match (both have Action genre, in year range, rating >= 4.0)
    expect(result.current.filteredMovies).toHaveLength(2);
    expect(result.current.filteredMovies.map((m) => m.id)).toContain('action-2020');
    expect(result.current.filteredMovies.map((m) => m.id)).toContain('scifi-2018');
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setGenreFilter(['Action' as Genre]);
      result.current.setYearRange(2018, 2020);
      result.current.setMinRating(4.0);
    });

    // action-2020 and scifi-2018 both match
    expect(result.current.filteredMovies).toHaveLength(2);

    act(() => {
      result.current.clearAllFilters();
    });

    // All 4 movies should be shown
    expect(result.current.filteredMovies).toHaveLength(4);
    expect(result.current.activeFilters).toHaveLength(0);
  });

  it('should return empty array when no movies match filters', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setGenreFilter(['Horror' as Genre]);
    });

    expect(result.current.filteredMovies).toHaveLength(0);
  });

  it('should track active filters', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setGenreFilter(['Action' as Genre, 'Drama' as Genre]);
      result.current.setYearRange(2015, 2022);
      result.current.setMinRating(4.0);
    });

    expect(result.current.activeFilters).toHaveLength(3);
    expect(result.current.activeFilters).toContainEqual({
      type: 'genre',
      label: 'Action, Drama',
    });
    expect(result.current.activeFilters).toContainEqual({
      type: 'year',
      label: '2015 - 2022',
    });
    expect(result.current.activeFilters).toContainEqual({
      type: 'rating',
      label: '4.0+',
    });
  });

  it('should handle runtime filter', () => {
    const { result } = renderHook(() => useMovieFilter(mockMovies));

    act(() => {
      result.current.setMinRuntime(100);
      result.current.setMaxRuntime(140);
    });

    expect(result.current.filteredMovies).toHaveLength(2);
    expect(result.current.filteredMovies.map((m) => m.id)).toEqual([
      'action-2020',
      'scifi-2018',
    ]);
  });
});
