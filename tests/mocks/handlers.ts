/**
 * MSW (Mock Service Worker) handlers
 * Mock API endpoints and localStorage for testing
 */

import { http, HttpResponse } from 'msw';
import moviesFixture from '../fixtures/movies.json';

/**
 * API endpoint handlers
 */
export const handlers = [
  /**
   * Mock /data/movies.json endpoint
   */
  http.get('/data/movies.json', () => {
    return HttpResponse.json(moviesFixture);
  }),

  /**
   * Mock error response for testing error handling
   */
  http.get('/data/movies-error.json', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),
];

/**
 * LocalStorage mock for testing
 */
export class LocalStorageMock {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map();
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }
}

/**
 * Setup localStorage mock
 */
export function setupLocalStorageMock(): void {
  const localStorageMock = new LocalStorageMock();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

/**
 * Clear localStorage mock
 */
export function clearLocalStorageMock(): void {
  window.localStorage.clear();
}
