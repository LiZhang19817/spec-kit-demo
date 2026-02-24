/**
 * Unit Tests: localStorage Utility
 * Tests localStorage helper functions
 */

import { getItem, setItem, removeItem, clear } from '@/lib/localStorage';

describe('localStorage utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setItem', () => {
    it('should store string values', () => {
      setItem('test-key', 'test-value');

      const stored = localStorage.getItem('test-key');
      expect(stored).toBe('"test-value"');
    });

    it('should store number values', () => {
      setItem('test-number', 42);

      const stored = localStorage.getItem('test-number');
      expect(stored).toBe('42');
    });

    it('should store boolean values', () => {
      setItem('test-bool', true);

      const stored = localStorage.getItem('test-bool');
      expect(stored).toBe('true');
    });

    it('should store object values', () => {
      const obj = { name: 'test', value: 123 };
      setItem('test-object', obj);

      const stored = localStorage.getItem('test-object');
      expect(stored).toBe(JSON.stringify(obj));
    });

    it('should store array values', () => {
      const arr = [1, 2, 3, 4, 5];
      setItem('test-array', arr);

      const stored = localStorage.getItem('test-array');
      expect(stored).toBe(JSON.stringify(arr));
    });

    it('should store null values', () => {
      setItem('test-null', null);

      const stored = localStorage.getItem('test-null');
      expect(stored).toBe('null');
    });

    it('should handle errors gracefully', () => {
      // Create a circular reference
      interface CircularType {
        a: number;
        self?: CircularType;
      }
      const circular: CircularType = { a: 1 };
      circular.self = circular;

      // Should not throw
      expect(() => setItem('circular', circular)).not.toThrow();
    });
  });

  describe('getItem', () => {
    it('should retrieve string values', () => {
      localStorage.setItem('test-key', '"test-value"');

      const retrieved = getItem<string>('test-key');
      expect(retrieved).toBe('test-value');
    });

    it('should retrieve number values', () => {
      localStorage.setItem('test-number', '42');

      const retrieved = getItem<number>('test-number');
      expect(retrieved).toBe(42);
    });

    it('should retrieve boolean values', () => {
      localStorage.setItem('test-bool', 'true');

      const retrieved = getItem<boolean>('test-bool');
      expect(retrieved).toBe(true);
    });

    it('should retrieve object values', () => {
      const obj = { name: 'test', value: 123 };
      localStorage.setItem('test-object', JSON.stringify(obj));

      const retrieved = getItem<typeof obj>('test-object');
      expect(retrieved).toEqual(obj);
    });

    it('should retrieve array values', () => {
      const arr = [1, 2, 3, 4, 5];
      localStorage.setItem('test-array', JSON.stringify(arr));

      const retrieved = getItem<number[]>('test-array');
      expect(retrieved).toEqual(arr);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = getItem('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should handle corrupted data', () => {
      localStorage.setItem('corrupted', 'invalid json {');

      const retrieved = getItem('corrupted');
      expect(retrieved).toBeNull();
    });

    it('should handle null storage values', () => {
      localStorage.setItem('null-value', 'null');

      const retrieved = getItem('null-value');
      expect(retrieved).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove items from storage', () => {
      setItem('test-key', 'test-value');
      expect(getItem('test-key')).toBe('test-value');

      removeItem('test-key');
      expect(getItem('test-key')).toBeNull();
    });

    it('should not throw for non-existent keys', () => {
      expect(() => removeItem('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items from storage', () => {
      setItem('key1', 'value1');
      setItem('key2', 'value2');
      setItem('key3', 'value3');

      expect(localStorage.length).toBeGreaterThan(0);

      clear();

      expect(localStorage.length).toBe(0);
    });

    it('should work on empty storage', () => {
      expect(() => clear()).not.toThrow();
    });
  });

  describe('storage quota', () => {
    it('should handle storage quota exceeded', () => {
      // Try to fill localStorage (browser dependent)
      const largeString = 'x'.repeat(1024 * 1024); // 1MB

      // Should not throw
      expect(() => {
        for (let i = 0; i < 10; i++) {
          setItem(`large-${i}`, largeString);
        }
      }).not.toThrow();
    });
  });

  describe('type safety', () => {
    it('should maintain type information', () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      setItem('user', user);

      const retrieved = getItem<User>('user');

      expect(retrieved).toEqual(user);
      expect(retrieved?.id).toBe(1);
      expect(retrieved?.name).toBe('John Doe');
      expect(retrieved?.email).toBe('john@example.com');
    });
  });
});
