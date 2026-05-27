import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  init,
  setActive,
  updateCompletionIndicators,
  getSequentialNav,
  toggleMobileNav,
  flattenLessons,
  isMobileNavOpen,
  _reset
} from '../../skillhub/assets/js/navigation.js';

// Sample lesson structure for testing
const sampleStructure = [
  {
    id: 'introduction',
    title: 'Introduction',
    lessons: [
      { id: 'en/introduction/what-is-opcp', title: 'What is OPCP?', file: 'en/introduction/what-is-opcp.html', difficulty: 'beginner' },
      { id: 'en/introduction/benefits', title: 'Benefits', file: 'en/introduction/benefits.html', difficulty: 'beginner' },
      { id: 'en/introduction/target-audience', title: 'Target Audience', file: 'en/introduction/target-audience.html', difficulty: 'beginner' },
      { id: 'en/introduction/key-features', title: 'Key Features', file: 'en/introduction/key-features.html', difficulty: 'beginner' }
    ]
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    lessons: [
      { id: 'en/getting-started/account-setup', title: 'Account Setup', file: 'en/getting-started/account-setup.html', difficulty: 'beginner' },
      { id: 'en/getting-started/dashboard-access', title: 'Dashboard Access', file: 'en/getting-started/dashboard-access.html', difficulty: 'intermediate' }
    ]
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    lessons: [
      { id: 'en/core-concepts/node-lifecycle', title: 'Node Lifecycle', file: 'en/core-concepts/node-lifecycle.html', difficulty: 'intermediate' },
      { id: 'en/core-concepts/node-types', title: 'Node Types', file: 'en/core-concepts/node-types.html', difficulty: 'advanced' }
    ]
  }
];

describe('Navigation - getSequentialNav', () => {
  it('returns prev: null for the first lesson', () => {
    const result = getSequentialNav('en/introduction/what-is-opcp', sampleStructure);
    expect(result.prev).toBeNull();
    expect(result.next).toBe('en/introduction/benefits');
  });

  it('returns next: null for the last lesson', () => {
    const result = getSequentialNav('en/core-concepts/node-types', sampleStructure);
    expect(result.prev).toBe('en/core-concepts/node-lifecycle');
    expect(result.next).toBeNull();
  });

  it('returns both prev and next for a middle lesson', () => {
    const result = getSequentialNav('en/introduction/benefits', sampleStructure);
    expect(result.prev).toBe('en/introduction/what-is-opcp');
    expect(result.next).toBe('en/introduction/target-audience');
  });

  it('navigates across section boundaries', () => {
    const result = getSequentialNav('en/getting-started/account-setup', sampleStructure);
    expect(result.prev).toBe('en/introduction/key-features');
    expect(result.next).toBe('en/getting-started/dashboard-access');
  });

  it('returns both null for unknown page', () => {
    const result = getSequentialNav('en/unknown/page', sampleStructure);
    expect(result.prev).toBeNull();
    expect(result.next).toBeNull();
  });

  it('returns both null for empty structure', () => {
    const result = getSequentialNav('en/introduction/what-is-opcp', []);
    expect(result.prev).toBeNull();
    expect(result.next).toBeNull();
  });

  it('handles single lesson structure', () => {
    const single = [{ id: 'intro', title: 'Intro', lessons: [
      { id: 'only-lesson', title: 'Only', file: 'only.html', difficulty: 'beginner' }
    ]}];
    const result = getSequentialNav('only-lesson', single);
    expect(result.prev).toBeNull();
    expect(result.next).toBeNull();
  });

  it('matches by file path as well as id', () => {
    const result = getSequentialNav('en/introduction/benefits.html', sampleStructure);
    expect(result.prev).toBe('en/introduction/what-is-opcp');
    expect(result.next).toBe('en/introduction/target-audience');
  });
});

describe('Navigation - flattenLessons', () => {
  it('flattens all lessons from all sections in order', () => {
    const flat = flattenLessons(sampleStructure);
    expect(flat).toHaveLength(8);
    expect(flat[0].id).toBe('en/introduction/what-is-opcp');
    expect(flat[4].id).toBe('en/getting-started/account-setup');
    expect(flat[7].id).toBe('en/core-concepts/node-types');
  });

  it('returns empty array for empty structure', () => {
    expect(flattenLessons([])).toEqual([]);
  });
});

describe('Navigation - toggleMobileNav', () => {
  beforeEach(() => {
    _reset();
  });

  it('toggles mobile nav state', () => {
    expect(isMobileNavOpen()).toBe(false);
    toggleMobileNav();
    expect(isMobileNavOpen()).toBe(true);
    toggleMobileNav();
    expect(isMobileNavOpen()).toBe(false);
  });
});

describe('Navigation - DOM operations (graceful degradation)', () => {
  it('init does not throw when document is undefined', () => {
    // In node environment without DOM, init should not throw
    // The vitest environment is 'node', so document is undefined
    expect(() => init(sampleStructure, 'en/introduction/what-is-opcp')).not.toThrow();
  });

  it('setActive does not throw when document is undefined', () => {
    expect(() => setActive('en/introduction/benefits')).not.toThrow();
  });

  it('updateCompletionIndicators does not throw when document is undefined', () => {
    const progress = {
      version: 1,
      lang: 'en',
      completedLessons: ['en/introduction/what-is-opcp'],
      lastVisited: '',
      lastUpdated: ''
    };
    expect(() => updateCompletionIndicators(progress)).not.toThrow();
  });

  it('updateCompletionIndicators handles null progress gracefully', () => {
    expect(() => updateCompletionIndicators(null)).not.toThrow();
  });

  it('updateCompletionIndicators handles progress without completedLessons', () => {
    expect(() => updateCompletionIndicators({ version: 1 })).not.toThrow();
  });

  it('toggleMobileNav does not throw when document is undefined', () => {
    expect(() => toggleMobileNav()).not.toThrow();
  });
});
