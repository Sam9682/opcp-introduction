// OPCP Introduction Skillhub - Internationalization
// Handles language detection and switching

/**
 * Detects browser preferred language.
 * Reads navigator.language or navigator.languages[0].
 * @param {object} [nav] - Optional navigator-like object (for testing)
 * @returns {'en' | 'fr'} - Detected language, defaults to 'en'
 */
export function detectLanguage(nav) {
  const n = nav || (typeof navigator !== 'undefined' ? navigator : null);

  if (!n) {
    return 'en';
  }

  let browserLang = '';

  if (n.languages && n.languages.length > 0) {
    browserLang = n.languages[0];
  } else if (n.language) {
    browserLang = n.language;
  }

  if (browserLang && browserLang.toLowerCase().startsWith('fr')) {
    return 'fr';
  }

  return 'en';
}

/**
 * Redirects user to the selected language directory.
 * @param {string} lang - 'en' or 'fr'
 */
export function selectLanguage(lang) {
  const target = './' + lang + '/';

  if (typeof window !== 'undefined' && window.location) {
    window.location.href = target;
  }
}

/**
 * Navigates to the equivalent page in the other language.
 * Replaces '/en/' with '/fr/' (or vice versa) in the current URL path.
 * @param {string} targetLang - Target language code ('en' or 'fr')
 */
export function switchLanguage(targetLang) {
  if (typeof window === 'undefined' || !window.location) {
    return;
  }

  const currentPath = window.location.pathname;
  let newPath;

  if (targetLang === 'fr') {
    newPath = currentPath.replace('/en/', '/fr/');
  } else {
    newPath = currentPath.replace('/fr/', '/en/');
  }

  window.location.href = newPath;
}

const I18n = {
  detectLanguage,
  selectLanguage,
  switchLanguage
};

export default I18n;
