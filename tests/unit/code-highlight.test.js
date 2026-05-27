import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  tokenize,
  tokensToHtml,
  highlightBlock,
  copyToClipboard,
  init
} from '../../skillhub/assets/js/code-highlight.js';

describe('CodeHighlight', () => {
  describe('tokenize', () => {
    it('should identify keywords', () => {
      const tokens = tokenize('const x = 1');
      const keywords = tokens.filter(t => t.type === 'keyword');
      expect(keywords.length).toBeGreaterThanOrEqual(1);
      expect(keywords[0].value).toBe('const');
    });

    it('should identify multiple keywords', () => {
      const tokens = tokenize('if (true) { return false; }');
      const keywords = tokens.filter(t => t.type === 'keyword');
      const keywordValues = keywords.map(k => k.value);
      expect(keywordValues).toContain('if');
      expect(keywordValues).toContain('true');
      expect(keywordValues).toContain('return');
      expect(keywordValues).toContain('false');
    });

    it('should identify double-quoted strings', () => {
      const tokens = tokenize('const s = "hello world"');
      const strings = tokens.filter(t => t.type === 'string');
      expect(strings.length).toBe(1);
      expect(strings[0].value).toBe('"hello world"');
    });

    it('should identify single-quoted strings', () => {
      const tokens = tokenize("const s = 'hello'");
      const strings = tokens.filter(t => t.type === 'string');
      expect(strings.length).toBe(1);
      expect(strings[0].value).toBe("'hello'");
    });

    it('should identify template literals', () => {
      const tokens = tokenize('const s = `hello ${name}`');
      const strings = tokens.filter(t => t.type === 'string');
      expect(strings.length).toBe(1);
      expect(strings[0].value).toBe('`hello ${name}`');
    });

    it('should identify single-line comments', () => {
      const tokens = tokenize('// this is a comment\nconst x = 1');
      const comments = tokens.filter(t => t.type === 'comment');
      expect(comments.length).toBe(1);
      expect(comments[0].value).toBe('// this is a comment');
    });

    it('should identify multi-line comments', () => {
      const tokens = tokenize('/* multi\nline */ const x = 1');
      const comments = tokens.filter(t => t.type === 'comment');
      expect(comments.length).toBe(1);
      expect(comments[0].value).toBe('/* multi\nline */');
    });

    it('should identify integer numbers', () => {
      const tokens = tokenize('const x = 42');
      const numbers = tokens.filter(t => t.type === 'number');
      expect(numbers.length).toBe(1);
      expect(numbers[0].value).toBe('42');
    });

    it('should identify decimal numbers', () => {
      const tokens = tokenize('const pi = 3.14');
      const numbers = tokens.filter(t => t.type === 'number');
      expect(numbers.length).toBe(1);
      expect(numbers[0].value).toBe('3.14');
    });

    it('should handle escaped characters in strings', () => {
      const tokens = tokenize('const s = "hello \\"world\\""');
      const strings = tokens.filter(t => t.type === 'string');
      expect(strings.length).toBe(1);
      expect(strings[0].value).toBe('"hello \\"world\\""');
    });

    it('should handle empty input', () => {
      const tokens = tokenize('');
      expect(tokens).toEqual([]);
    });

    it('should produce at least 3 distinct token types for typical code', () => {
      const code = '// comment\nconst x = "hello";\nreturn 42;';
      const tokens = tokenize(code);
      const types = new Set(tokens.map(t => t.type));
      // Should have at least: keyword, string, comment, number
      expect(types.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('tokensToHtml', () => {
    it('should wrap keywords in span with code-keyword class', () => {
      const tokens = [{ type: 'keyword', value: 'const' }];
      const html = tokensToHtml(tokens);
      expect(html).toBe('<span class="code-keyword">const</span>');
    });

    it('should wrap strings in span with code-string class', () => {
      const tokens = [{ type: 'string', value: '"hello"' }];
      const html = tokensToHtml(tokens);
      expect(html).toBe('<span class="code-string">&quot;hello&quot;</span>');
    });

    it('should wrap comments in span with code-comment class', () => {
      const tokens = [{ type: 'comment', value: '// comment' }];
      const html = tokensToHtml(tokens);
      expect(html).toBe('<span class="code-comment">// comment</span>');
    });

    it('should wrap numbers in span with code-number class', () => {
      const tokens = [{ type: 'number', value: '42' }];
      const html = tokensToHtml(tokens);
      expect(html).toBe('<span class="code-number">42</span>');
    });

    it('should not wrap text tokens in spans', () => {
      const tokens = [{ type: 'text', value: 'myVar' }];
      const html = tokensToHtml(tokens);
      expect(html).toBe('myVar');
    });

    it('should escape HTML special characters', () => {
      const tokens = [{ type: 'text', value: '<div>' }];
      const html = tokensToHtml(tokens);
      expect(html).toBe('&lt;div&gt;');
    });
  });

  describe('highlightBlock', () => {
    it('should replace innerHTML with highlighted code', () => {
      const block = {
        textContent: 'const x = 1',
        innerHTML: ''
      };
      highlightBlock(block);
      expect(block.innerHTML).toContain('code-keyword');
      expect(block.innerHTML).toContain('const');
    });

    it('should handle null block gracefully', () => {
      expect(() => highlightBlock(null)).not.toThrow();
    });

    it('should handle block with empty textContent', () => {
      const block = { textContent: '', innerHTML: '' };
      highlightBlock(block);
      expect(block.innerHTML).toBe('');
    });
  });

  describe('copyToClipboard', () => {
    it('should return true when clipboard API succeeds', async () => {
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined)
      };
      Object.defineProperty(globalThis, 'navigator', {
        value: { clipboard: mockClipboard },
        writable: true,
        configurable: true
      });

      const block = { textContent: 'hello world' };
      const result = await copyToClipboard(block);
      expect(result).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('hello world');

      delete globalThis.navigator;
    });

    it('should fall back to execCommand when clipboard API fails', async () => {
      // Clipboard API that rejects
      Object.defineProperty(globalThis, 'navigator', {
        value: { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } },
        writable: true,
        configurable: true
      });

      // Mock document for fallback
      const mockTextarea = {
        value: '',
        style: {},
        select: vi.fn()
      };
      const mockDocument = {
        createElement: vi.fn().mockReturnValue(mockTextarea),
        execCommand: vi.fn().mockReturnValue(true),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      };
      Object.defineProperty(globalThis, 'document', {
        value: mockDocument,
        writable: true,
        configurable: true
      });

      const block = { textContent: 'test code' };
      const result = await copyToClipboard(block);
      expect(result).toBe(true);
      expect(mockDocument.execCommand).toHaveBeenCalledWith('copy');

      delete globalThis.navigator;
      delete globalThis.document;
    });

    it('should return false when both methods fail', async () => {
      // No clipboard API
      Object.defineProperty(globalThis, 'navigator', {
        value: {},
        writable: true,
        configurable: true
      });

      // execCommand returns false
      const mockTextarea = {
        value: '',
        style: {},
        select: vi.fn()
      };
      const mockDocument = {
        createElement: vi.fn().mockReturnValue(mockTextarea),
        execCommand: vi.fn().mockReturnValue(false),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      };
      Object.defineProperty(globalThis, 'document', {
        value: mockDocument,
        writable: true,
        configurable: true
      });

      const block = { textContent: 'test code' };
      const result = await copyToClipboard(block);
      expect(result).toBe(false);

      delete globalThis.navigator;
      delete globalThis.document;
    });

    it('should return false for null block', async () => {
      const result = await copyToClipboard(null);
      expect(result).toBe(false);
    });
  });

  describe('init', () => {
    it('should not throw when document is undefined', () => {
      // In test environment without DOM, init should handle gracefully
      const originalDoc = globalThis.document;
      delete globalThis.document;
      expect(() => init()).not.toThrow();
      if (originalDoc) {
        globalThis.document = originalDoc;
      }
    });
  });
});
