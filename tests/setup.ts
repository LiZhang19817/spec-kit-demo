/**
 * Jest test setup configuration
 * Global test setup and utilities
 */

import '@testing-library/jest-dom';

/**
 * Mock window.matchMedia for theme detection tests
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * Mock IntersectionObserver for virtualized list tests
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

/**
 * Mock ResizeObserver for responsive component tests
 */
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

/**
 * Suppress console errors/warnings in tests (optional)
 * Uncomment if needed to reduce noise
 */
// const originalError = console.error;
// const originalWarn = console.warn;
//
// beforeAll(() => {
//   console.error = jest.fn();
//   console.warn = jest.fn();
// });
//
// afterAll(() => {
//   console.error = originalError;
//   console.warn = originalWarn;
// });

/**
 * Clear all mocks after each test
 */
afterEach(() => {
  jest.clearAllMocks();
});
