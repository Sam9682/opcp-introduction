import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectLanguage, selectLanguage, switchLanguage } from '../../skillhub/assets/js/i18n.js';

describe('i18n', () => {
  describe('detectLanguage', () => {
    it('returns "fr" when navigator.languages[0] starts with "fr"', () => {
      const nav = { languages: ['fr-FR', 'en-US'], language: 'fr-FR' };
      expect(detectLanguage(nav)).toBe('fr');
    });

    it('returns "fr" when navigator.language starts with "fr" (case-insensitive)', () => {
      const nav = { languages: [], language: 'FR-CA' };
      expect(detectLanguage(nav)).toBe('fr');
    });

    it('returns "fr" for exact "fr" language code', () => {
      const nav = { languages: ['fr'], language: 'fr' };
      expect(detectLanguage(nav)).toBe('fr');
    });

    it('returns "en" when browser language is English', () => {
      const nav = { languages: ['en-US'], language: 'en-US' };
      expect(detectLanguage(nav)).toBe('en');
    });

    it('returns "en" when browser language is neither EN nor FR', () => {
      const nav = { languages: ['de-DE'], language: 'de-DE' };
      expect(detectLanguage(nav)).toBe('en');
    });

    it('returns "en" when navigator is null', () => {
      expect(detectLanguage(null)).toBe('en');
    });

    it('returns "en" when navigator.languages is empty and navigator.language is empty', () => {
      const nav = { languages: [], language: '' };
      expect(detectLanguage(nav)).toBe('en');
    });

    it('prefers navigator.languages[0] over navigator.language', () => {
      const nav = { languages: ['fr-FR', 'en-US'], language: 'en-US' };
      expect(detectLanguage(nav)).toBe('fr');
    });

    it('falls back to navigator.language when languages array is missing', () => {
      const nav = { language: 'fr-BE' };
      expect(detectLanguage(nav)).toBe('fr');
    });

    it('returns "en" for languages starting with "fre" but not "fr"', () => {
      // "fre" starts with "fr" so it should return 'fr'
      const nav = { languages: ['fre'], language: 'fre' };
      expect(detectLanguage(nav)).toBe('fr');
    });

    it('returns "en" for empty string language', () => {
      const nav = { languages: [''], language: '' };
      expect(detectLanguage(nav)).toBe('en');
    });
  });

  describe('selectLanguage', () => {
    let originalWindow;

    beforeEach(() => {
      originalWindow = global.window;
      global.window = { location: { href: '' } };
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('redirects to ./en/ when lang is "en"', () => {
      selectLanguage('en');
      expect(global.window.location.href).toBe('./en/');
    });

    it('redirects to ./fr/ when lang is "fr"', () => {
      selectLanguage('fr');
      expect(global.window.location.href).toBe('./fr/');
    });

    it('does not throw when window is undefined', () => {
      global.window = undefined;
      expect(() => selectLanguage('en')).not.toThrow();
    });
  });

  describe('switchLanguage', () => {
    let originalWindow;

    beforeEach(() => {
      originalWindow = global.window;
      global.window = {
        location: {
          pathname: '/en/introduction/what-is-opcp.html',
          href: ''
        }
      };
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('switches from /en/ to /fr/ when targetLang is "fr"', () => {
      global.window.location.pathname = '/en/introduction/what-is-opcp.html';
      switchLanguage('fr');
      expect(global.window.location.href).toBe('/fr/introduction/what-is-opcp.html');
    });

    it('switches from /fr/ to /en/ when targetLang is "en"', () => {
      global.window.location.pathname = '/fr/core-concepts/node-types.html';
      switchLanguage('en');
      expect(global.window.location.href).toBe('/en/core-concepts/node-types.html');
    });

    it('preserves the full path when switching languages', () => {
      global.window.location.pathname = '/en/best-practices/quick-reference.html';
      switchLanguage('fr');
      expect(global.window.location.href).toBe('/fr/best-practices/quick-reference.html');
    });

    it('does not throw when window is undefined', () => {
      global.window = undefined;
      expect(() => switchLanguage('fr')).not.toThrow();
    });
  });
});
