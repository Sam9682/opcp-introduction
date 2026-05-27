import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  markCompleted,
  isCompleted,
  getCompletionPercentage,
  getProgressData,
  reset,
  init
} from '../../skillhub/assets/js/lessons.js';

// Mock localStorage
function createMockStorage() {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get _store() { return store; }
  };
}

describe('ProgressTracker', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = createMockStorage();
    // Set up global localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  describe('markCompleted', () => {
    it('should store a lesson as completed', () => {
      markCompleted('en/introduction/what-is-opcp');
      expect(mockStorage.setItem).toHaveBeenCalled();

      // Find the call that stores progress data (key = 'opcp-progress')
      const progressCall = mockStorage.setItem.mock.calls.find(c => c[0] === 'opcp-progress');
      expect(progressCall).toBeDefined();
      const stored = JSON.parse(progressCall[1]);
      expect(stored.completedLessons).toContain('en/introduction/what-is-opcp');
    });

    it('should not duplicate lesson IDs', () => {
      markCompleted('en/introduction/what-is-opcp');
      markCompleted('en/introduction/what-is-opcp');

      const lastCall = mockStorage.setItem.mock.calls[mockStorage.setItem.mock.calls.length - 1];
      const stored = JSON.parse(lastCall[1]);
      const count = stored.completedLessons.filter(id => id === 'en/introduction/what-is-opcp').length;
      expect(count).toBe(1);
    });

    it('should set the lang field from the lesson ID', () => {
      markCompleted('fr/introduction/what-is-opcp');

      const lastCall = mockStorage.setItem.mock.calls[mockStorage.setItem.mock.calls.length - 1];
      const stored = JSON.parse(lastCall[1]);
      expect(stored.lang).toBe('fr');
    });

    it('should do nothing if lessonId is empty', () => {
      markCompleted('');
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('should set version to 1', () => {
      markCompleted('en/introduction/benefits');

      const lastCall = mockStorage.setItem.mock.calls[mockStorage.setItem.mock.calls.length - 1];
      const stored = JSON.parse(lastCall[1]);
      expect(stored.version).toBe(1);
    });

    it('should set lastUpdated as ISO 8601 timestamp', () => {
      markCompleted('en/introduction/benefits');

      const lastCall = mockStorage.setItem.mock.calls[mockStorage.setItem.mock.calls.length - 1];
      const stored = JSON.parse(lastCall[1]);
      expect(new Date(stored.lastUpdated).toISOString()).toBe(stored.lastUpdated);
    });
  });

  describe('isCompleted', () => {
    it('should return true for a completed lesson', () => {
      markCompleted('en/introduction/what-is-opcp');
      expect(isCompleted('en/introduction/what-is-opcp')).toBe(true);
    });

    it('should return false for an incomplete lesson', () => {
      expect(isCompleted('en/introduction/what-is-opcp')).toBe(false);
    });

    it('should return false when localStorage is empty', () => {
      expect(isCompleted('en/core-concepts/node-types')).toBe(false);
    });
  });

  describe('getCompletionPercentage', () => {
    it('should return 0 when no lessons are completed', () => {
      expect(getCompletionPercentage('en')).toBe(0);
    });

    it('should calculate correct percentage', () => {
      markCompleted('en/introduction/what-is-opcp');
      markCompleted('en/introduction/benefits');
      markCompleted('en/introduction/target-audience');

      // 3 out of 24 = 12.5% -> rounds to 13
      expect(getCompletionPercentage('en', 24)).toBe(13);
    });

    it('should return 100 when all lessons are completed', () => {
      for (let i = 0; i < 24; i++) {
        markCompleted(`en/section/lesson-${i}`);
      }
      expect(getCompletionPercentage('en', 24)).toBe(100);
    });

    it('should only count lessons for the specified language', () => {
      markCompleted('en/introduction/what-is-opcp');
      markCompleted('fr/introduction/what-is-opcp');

      expect(getCompletionPercentage('en', 24)).toBe(4); // 1/24 = 4.17 -> 4
      expect(getCompletionPercentage('fr', 24)).toBe(4);
    });

    it('should return 0 when totalLessons is 0 or negative', () => {
      markCompleted('en/introduction/what-is-opcp');
      expect(getCompletionPercentage('en', 0)).toBe(0);
      expect(getCompletionPercentage('en', -1)).toBe(0);
    });

    it('should use default totalLessons of 24', () => {
      markCompleted('en/introduction/what-is-opcp');
      // 1/24 = 4.17 -> rounds to 4
      expect(getCompletionPercentage('en')).toBe(4);
    });
  });

  describe('getProgressData', () => {
    it('should return empty progress data when nothing is stored', () => {
      const data = getProgressData();
      expect(data.version).toBe(1);
      expect(data.completedLessons).toEqual([]);
      expect(data.lastVisited).toBe('');
    });

    it('should return stored progress data', () => {
      markCompleted('en/introduction/what-is-opcp');
      markCompleted('en/introduction/benefits');

      const data = getProgressData();
      expect(data.version).toBe(1);
      expect(data.completedLessons).toContain('en/introduction/what-is-opcp');
      expect(data.completedLessons).toContain('en/introduction/benefits');
    });
  });

  describe('reset', () => {
    it('should clear all progress data', () => {
      markCompleted('en/introduction/what-is-opcp');
      reset();

      expect(mockStorage.removeItem).toHaveBeenCalledWith('opcp-progress');
      expect(isCompleted('en/introduction/what-is-opcp')).toBe(false);
    });

    it('should result in empty progress data after reset', () => {
      markCompleted('en/introduction/what-is-opcp');
      reset();

      const data = getProgressData();
      expect(data.completedLessons).toEqual([]);
    });
  });

  describe('localStorage unavailable', () => {
    beforeEach(() => {
      // Simulate localStorage being unavailable
      Object.defineProperty(globalThis, 'localStorage', {
        get() { throw new Error('localStorage is not available'); },
        configurable: true
      });
    });

    it('should degrade silently - isCompleted returns false', () => {
      expect(isCompleted('en/introduction/what-is-opcp')).toBe(false);
    });

    it('should degrade silently - getCompletionPercentage returns 0', () => {
      expect(getCompletionPercentage('en')).toBe(0);
    });

    it('should degrade silently - getProgressData returns empty', () => {
      const data = getProgressData();
      expect(data.completedLessons).toEqual([]);
    });

    it('should degrade silently - markCompleted does not throw', () => {
      expect(() => markCompleted('en/introduction/what-is-opcp')).not.toThrow();
    });

    it('should degrade silently - reset does not throw', () => {
      expect(() => reset()).not.toThrow();
    });
  });

  describe('corrupted data handling', () => {
    it('should reset on invalid JSON', () => {
      mockStorage.getItem.mockReturnValue('not valid json{{{');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const data = getProgressData();
      expect(data.completedLessons).toEqual([]);
      expect(mockStorage.removeItem).toHaveBeenCalledWith('opcp-progress');

      consoleSpy.mockRestore();
    });

    it('should reset on missing version field', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify({ completedLessons: [] }));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const data = getProgressData();
      expect(data.completedLessons).toEqual([]);
      expect(mockStorage.removeItem).toHaveBeenCalledWith('opcp-progress');

      consoleSpy.mockRestore();
    });

    it('should reset on wrong version number', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify({ version: 2, completedLessons: [] }));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const data = getProgressData();
      expect(data.completedLessons).toEqual([]);

      consoleSpy.mockRestore();
    });

    it('should reset on missing completedLessons array', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify({ version: 1 }));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const data = getProgressData();
      expect(data.completedLessons).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('QuotaExceededError handling', () => {
    it('should catch QuotaExceededError and continue', () => {
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';

      // Allow the storage test write to pass, but throw on actual data write
      let callCount = 0;
      mockStorage.setItem.mockImplementation((key, value) => {
        callCount++;
        if (key === 'opcp-progress') {
          throw quotaError;
        }
        // Allow test key writes through
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => markCompleted('en/introduction/what-is-opcp')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('quota exceeded')
      );

      consoleSpy.mockRestore();
    });
  });
});
