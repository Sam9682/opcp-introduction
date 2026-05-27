import { describe, it, expect, beforeEach } from 'vitest';
import {
  init,
  search,
  highlight,
  getSearchState,
  resetSearch
} from '../../skillhub/assets/js/main.js';

// Sample search index for testing
function createSampleIndex() {
  return [
    {
      id: 'en/introduction/what-is-opcp',
      title: 'What is OPCP?',
      headings: ['Overview', 'Cloud Infrastructure Basics', 'Key Benefits'],
      body: 'OPCP stands for OVHcloud Hosted Private Cloud. It provides dedicated compute resources for enterprise workloads.',
      path: 'en/introduction/what-is-opcp.html'
    },
    {
      id: 'en/introduction/benefits',
      title: 'Benefits of OPCP',
      headings: ['Cost Savings', 'Scalability', 'Security'],
      body: 'The main benefits include reduced operational costs, elastic scaling, and enterprise-grade security features.',
      path: 'en/introduction/benefits.html'
    },
    {
      id: 'en/core-concepts/node-types',
      title: 'Node Types',
      headings: ['Compute Nodes', 'Storage Nodes', 'Network Nodes'],
      body: 'Different node types serve different purposes in the infrastructure. Compute nodes handle processing workloads.',
      path: 'en/core-concepts/node-types.html'
    },
    {
      id: 'en/getting-started/account-setup',
      title: 'Account Setup',
      headings: ['Creating Your Account', 'Verification Steps'],
      body: 'Follow these steps to set up your OPCP account and get started with the platform.',
      path: 'en/getting-started/account-setup.html'
    },
    {
      id: 'en/storage/cloudstore-overview',
      title: 'CloudStore Overview',
      headings: ['What is CloudStore', 'Storage Tiers'],
      body: 'CloudStore is the storage solution integrated with OPCP providing scalable object and block storage.',
      path: 'en/storage/cloudstore-overview.html'
    }
  ];
}

describe('Search Module', () => {
  beforeEach(() => {
    resetSearch();
  });

  describe('init', () => {
    it('should accept a valid search index array', () => {
      const index = createSampleIndex();
      init(index);

      const state = getSearchState();
      expect(state.loaded).toBe(true);
      expect(state.failed).toBe(false);
      expect(state.entryCount).toBe(5);
    });

    it('should mark as failed for non-array input', () => {
      init(null);

      const state = getSearchState();
      expect(state.loaded).toBe(false);
      expect(state.failed).toBe(true);
    });

    it('should mark as failed for undefined input', () => {
      init(undefined);

      const state = getSearchState();
      expect(state.loaded).toBe(false);
      expect(state.failed).toBe(true);
    });

    it('should accept an empty array', () => {
      init([]);

      const state = getSearchState();
      expect(state.loaded).toBe(true);
      expect(state.failed).toBe(false);
      expect(state.entryCount).toBe(0);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      init(createSampleIndex());
    });

    it('should return empty array for queries shorter than 2 characters', () => {
      expect(search('a')).toEqual([]);
      expect(search('')).toEqual([]);
      expect(search(' ')).toEqual([]);
    });

    it('should return empty array for null or undefined query', () => {
      expect(search(null)).toEqual([]);
      expect(search(undefined)).toEqual([]);
    });

    it('should find matches in titles (case-insensitive)', () => {
      const results = search('opcp');
      expect(results.length).toBeGreaterThan(0);

      const titleMatch = results.find(r => r.matchType === 'title');
      expect(titleMatch).toBeDefined();
      expect(titleMatch.title).toBe('What is OPCP?');
    });

    it('should find matches in headings', () => {
      const results = search('Compute Nodes');
      expect(results.length).toBeGreaterThan(0);

      const headingMatch = results.find(r => r.matchType === 'heading');
      expect(headingMatch).toBeDefined();
      expect(headingMatch.lessonId).toBe('en/core-concepts/node-types');
    });

    it('should find matches in body text', () => {
      const results = search('enterprise workloads');
      expect(results.length).toBeGreaterThan(0);

      const bodyMatch = results.find(r => r.matchType === 'body');
      expect(bodyMatch).toBeDefined();
    });

    it('should be case-insensitive', () => {
      const results1 = search('OPCP');
      const results2 = search('opcp');
      expect(results1.length).toBe(results2.length);
    });

    it('should rank title matches before heading matches', () => {
      const results = search('node');
      // "Node Types" is a title match, "Compute Nodes" etc. are heading matches
      const firstTitleIndex = results.findIndex(r => r.matchType === 'title');
      const firstHeadingIndex = results.findIndex(r => r.matchType === 'heading');

      if (firstTitleIndex !== -1 && firstHeadingIndex !== -1) {
        expect(firstTitleIndex).toBeLessThan(firstHeadingIndex);
      }
    });

    it('should rank heading matches before body matches', () => {
      const results = search('storage');
      const headingIndices = results
        .map((r, i) => r.matchType === 'heading' ? i : -1)
        .filter(i => i !== -1);
      const bodyIndices = results
        .map((r, i) => r.matchType === 'body' ? i : -1)
        .filter(i => i !== -1);

      if (headingIndices.length > 0 && bodyIndices.length > 0) {
        expect(Math.max(...headingIndices)).toBeLessThan(Math.min(...bodyIndices));
      }
    });

    it('should limit results to maximum 20', () => {
      // Create a large index
      const largeIndex = [];
      for (let i = 0; i < 50; i++) {
        largeIndex.push({
          id: `en/section/lesson-${i}`,
          title: `Lesson ${i} about testing`,
          headings: ['Testing Heading'],
          body: 'Testing body content for search.',
          path: `en/section/lesson-${i}.html`
        });
      }
      init(largeIndex);

      const results = search('testing');
      expect(results.length).toBeLessThanOrEqual(20);
    });

    it('should return empty array when index is not loaded', () => {
      resetSearch();
      expect(search('opcp')).toEqual([]);
    });

    it('should return empty array when index load failed', () => {
      init(null); // Triggers failed state
      expect(search('opcp')).toEqual([]);
    });

    it('should trim whitespace from query', () => {
      const results = search('  opcp  ');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should include path in results', () => {
      const results = search('opcp');
      for (const result of results) {
        expect(result.path).toBeDefined();
        expect(result.path.length).toBeGreaterThan(0);
      }
    });

    it('should include snippet in results', () => {
      const results = search('opcp');
      for (const result of results) {
        expect(result.snippet).toBeDefined();
        expect(result.snippet.length).toBeGreaterThan(0);
      }
    });

    it('should not return duplicate entries for the same lesson', () => {
      // A lesson that matches in title should not also appear as body match
      const results = search('opcp');
      const lessonIds = results.map(r => r.lessonId);
      const uniqueIds = [...new Set(lessonIds)];
      expect(lessonIds.length).toBe(uniqueIds.length);
    });
  });

  describe('highlight', () => {
    it('should wrap matching text in <mark> tags', () => {
      const result = highlight('Hello World', 'World');
      expect(result).toBe('Hello <mark>World</mark>');
    });

    it('should be case-insensitive', () => {
      const result = highlight('Hello World', 'world');
      expect(result).toBe('Hello <mark>World</mark>');
    });

    it('should highlight all occurrences', () => {
      const result = highlight('test one test two test', 'test');
      expect(result).toBe('<mark>test</mark> one <mark>test</mark> two <mark>test</mark>');
    });

    it('should preserve original case in highlighted text', () => {
      const result = highlight('OPCP is great, opcp rocks', 'opcp');
      expect(result).toBe('<mark>OPCP</mark> is great, <mark>opcp</mark> rocks');
    });

    it('should return original text when query is empty', () => {
      expect(highlight('Hello World', '')).toBe('Hello World');
    });

    it('should return empty string for null text', () => {
      expect(highlight(null, 'test')).toBe('');
    });

    it('should return original text for null query', () => {
      expect(highlight('Hello World', null)).toBe('Hello World');
    });

    it('should handle special regex characters in query', () => {
      const result = highlight('Price is $100.00 (USD)', '$100.00');
      expect(result).toBe('Price is <mark>$100.00</mark> (USD)');
    });

    it('should handle query with parentheses', () => {
      const result = highlight('Function call foo(bar)', 'foo(bar)');
      expect(result).toBe('Function call <mark>foo(bar)</mark>');
    });

    it('should not alter characters outside matched substrings', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const result = highlight(text, 'fox');
      expect(result).toBe('The quick brown <mark>fox</mark> jumps over the lazy dog');
    });

    it('should handle text with existing HTML entities', () => {
      const result = highlight('A &amp; B test', 'test');
      expect(result).toBe('A &amp; B <mark>test</mark>');
    });

    it('should handle single character query', () => {
      const result = highlight('abc', 'b');
      expect(result).toBe('a<mark>b</mark>c');
    });
  });

  describe('getSearchState', () => {
    it('should report not loaded initially', () => {
      const state = getSearchState();
      expect(state.loaded).toBe(false);
      expect(state.failed).toBe(false);
      expect(state.entryCount).toBe(0);
    });

    it('should report loaded after successful init', () => {
      init(createSampleIndex());
      const state = getSearchState();
      expect(state.loaded).toBe(true);
      expect(state.failed).toBe(false);
      expect(state.entryCount).toBe(5);
    });

    it('should report failed after failed init', () => {
      init(null);
      const state = getSearchState();
      expect(state.loaded).toBe(false);
      expect(state.failed).toBe(true);
    });
  });

  describe('resetSearch', () => {
    it('should reset all state', () => {
      init(createSampleIndex());
      resetSearch();

      const state = getSearchState();
      expect(state.loaded).toBe(false);
      expect(state.failed).toBe(false);
      expect(state.entryCount).toBe(0);
    });
  });
});
