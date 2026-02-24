/**
 * Unit Tests: useFavorites Hook
 * Tests favorites hook with localStorage persistence
 */

import { renderHook, act } from '@testing-library/react';
import { useFavoritesStore } from '@/store/favoritesStore';

describe('useFavorites', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store state
    act(() => {
      useFavoritesStore.getState().clearFavorites();
    });
  });

  it('should start with empty favorites', () => {
    const { result } = renderHook(() => useFavoritesStore());

    expect(result.current.favorites.size).toBe(0);
    expect(result.current.getFavoritesArray()).toEqual([]);
  });

  it('should add a favorite', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('movie-1');
    });

    expect(result.current.favorites.has('movie-1')).toBe(true);
    expect(result.current.isFavorite('movie-1')).toBe(true);
  });

  it('should remove a favorite', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('movie-1');
    });

    expect(result.current.isFavorite('movie-1')).toBe(true);

    act(() => {
      result.current.removeFavorite('movie-1');
    });

    expect(result.current.isFavorite('movie-1')).toBe(false);
  });

  it('should toggle favorite on/off', () => {
    const { result } = renderHook(() => useFavoritesStore());

    // Toggle on
    act(() => {
      result.current.toggleFavorite('movie-1');
    });

    expect(result.current.isFavorite('movie-1')).toBe(true);

    // Toggle off
    act(() => {
      result.current.toggleFavorite('movie-1');
    });

    expect(result.current.isFavorite('movie-1')).toBe(false);
  });

  it('should handle multiple favorites', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('movie-1');
      result.current.addFavorite('movie-2');
      result.current.addFavorite('movie-3');
    });

    expect(result.current.favorites.size).toBe(3);
    expect(result.current.getFavoritesArray()).toContain('movie-1');
    expect(result.current.getFavoritesArray()).toContain('movie-2');
    expect(result.current.getFavoritesArray()).toContain('movie-3');
  });

  it('should clear all favorites', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('movie-1');
      result.current.addFavorite('movie-2');
      result.current.addFavorite('movie-3');
    });

    expect(result.current.favorites.size).toBe(3);

    act(() => {
      result.current.clearFavorites();
    });

    expect(result.current.favorites.size).toBe(0);
  });

  it('should persist favorites to localStorage', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('movie-1');
      result.current.addFavorite('movie-2');
    });

    // Check localStorage
    const stored = localStorage.getItem('netflix-favorites');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.favorites).toContain('movie-1');
    expect(parsed.state.favorites).toContain('movie-2');
  });

  it('should load favorites from localStorage on init', () => {
    // Manually set localStorage
    const initialFavorites = {
      state: {
        favorites: ['movie-1', 'movie-2', 'movie-3'],
      },
      version: 0,
    };

    localStorage.setItem('netflix-favorites', JSON.stringify(initialFavorites));

    // Create new hook instance
    const { result } = renderHook(() => useFavoritesStore());

    expect(result.current.favorites.size).toBe(3);
    expect(result.current.isFavorite('movie-1')).toBe(true);
    expect(result.current.isFavorite('movie-2')).toBe(true);
    expect(result.current.isFavorite('movie-3')).toBe(true);
  });

  it('should handle corrupted localStorage data', () => {
    // Set invalid JSON
    localStorage.setItem('netflix-favorites', 'invalid json');

    // Should not throw and start with empty favorites
    const { result } = renderHook(() => useFavoritesStore());

    expect(result.current.favorites.size).toBe(0);
  });

  it('should not add duplicate favorites', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('movie-1');
      result.current.addFavorite('movie-1');
      result.current.addFavorite('movie-1');
    });

    expect(result.current.favorites.size).toBe(1);
  });

  it('should get favorites as array', () => {
    const { result } = renderHook(() => useFavoritesStore());

    act(() => {
      result.current.addFavorite('movie-1');
      result.current.addFavorite('movie-2');
    });

    const favoritesArray = result.current.getFavoritesArray();

    expect(Array.isArray(favoritesArray)).toBe(true);
    expect(favoritesArray).toHaveLength(2);
    expect(favoritesArray).toContain('movie-1');
    expect(favoritesArray).toContain('movie-2');
  });
});
