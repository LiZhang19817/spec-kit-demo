/**
 * LocalStorage utility functions
 * Type-safe localStorage operations with error handling
 */

/**
 * Storage keys used in the application
 */
export const STORAGE_KEYS = {
  FAVORITES: 'netflix-dashboard:favorites',
  PREFERENCES: 'netflix-dashboard:preferences',
  THEME: 'netflix-dashboard:theme',
} as const;

/**
 * Get item from localStorage with type safety
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Set item in localStorage with type safety
 */
export function setItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 */
export function clearAll(): boolean {
  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all keys matching a prefix
 */
export function getKeysByPrefix(prefix: string): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('Error getting keys from localStorage:', error);
    return [];
  }
}
