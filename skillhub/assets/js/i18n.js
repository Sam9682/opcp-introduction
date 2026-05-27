/**
 * SkillHub — Language Router (i18n)
 *
 * Detects user language preference, routes to the correct locale folder,
 * and provides language switching on all pages.
 * Shared via the window.SkillHub namespace (no build tools).
 * Also exports functions for testing.
 */

var SUPPORTED_LOCALES = ['en', 'fr'];
var DEFAULT_LOCALE = 'en';
var STORAGE_KEY = 'skillhub-lang';

function storageGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* noop */ }
}

/**
 * Detects the user's preferred language from navigator object.
 * @param {object|null} nav - Navigator-like object (or null)
 * @returns {'en'|'fr'}
 */
export function detectLanguage(nav) {
  if (!nav) { return DEFAULT_LOCALE; }
  var languages = nav.languages || [];
  var primary = (languages.length > 0 ? languages[0] : nav.language) || '';
  if (primary.toLowerCase().substring(0, 2) === 'fr') { return 'fr'; }
  return DEFAULT_LOCALE;
}

/**
 * Redirects to the selected language folder.
 * @param {string} lang - 'en' or 'fr'
 */
export function selectLanguage(lang) {
  if (typeof window === 'undefined' || !window) { return; }
  window.location.href = './' + lang + '/';
}

/**
 * Switches the current page to the target language by replacing the locale segment in the path.
 * @param {string} targetLang - 'en' or 'fr'
 */
export function switchLanguage(targetLang) {
  if (typeof window === 'undefined' || !window || !window.location) { return; }
  var currentPath = window.location.pathname;
  var newPath = currentPath.replace(/\/(en|fr)\//, '/' + targetLang + '/');
  window.location.href = newPath;
}

function detectLocale() {
  var stored = storageGet(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.indexOf(stored) !== -1) { return stored; }
  var browserLang = (typeof navigator !== 'undefined' ? navigator.language : '') || '';
  browserLang = browserLang.substring(0, 2).toLowerCase();
  if (browserLang && SUPPORTED_LOCALES.indexOf(browserLang) !== -1) { return browserLang; }
  return DEFAULT_LOCALE;
}

function getCurrentLocale() {
  if (typeof window === 'undefined' || !window || !window.location) { return DEFAULT_LOCALE; }
  var path = window.location.pathname;
  for (var i = 0; i < SUPPORTED_LOCALES.length; i++) {
    if (path.indexOf('/' + SUPPORTED_LOCALES[i] + '/') !== -1) {
      return SUPPORTED_LOCALES[i];
    }
  }
  return DEFAULT_LOCALE;
}

function pageExists(url) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false);
    xhr.send();
    return xhr.status >= 200 && xhr.status < 400;
  } catch (e) { return false; }
}

function showTranslationPendingIndicator() {
  if (typeof document === 'undefined') { return; }
  var toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = 'Translation pending / Traduction en cours';
  toast.style.cssText =
    'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);' +
    'background:#f59e0b;color:#fff;padding:0.75rem 1.5rem;border-radius:6px;' +
    'font-weight:600;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
  document.body.appendChild(toast);
  setTimeout(function () {
    if (toast.parentNode) { toast.parentNode.removeChild(toast); }
  }, 4000);
}

function switchLanguageNav(targetLocale) {
  if (SUPPORTED_LOCALES.indexOf(targetLocale) === -1) { return; }
  var currentLocale = getCurrentLocale();
  if (typeof window === 'undefined' || !window || !window.location) { return; }
  var currentPath = window.location.pathname;
  var newPath = currentPath.replace('/' + currentLocale + '/', '/' + targetLocale + '/');
  storageSet(STORAGE_KEY, targetLocale);
  if (!pageExists(newPath)) {
    showTranslationPendingIndicator();
    var landingPath = newPath.replace(/\/[^/]*$/, '/index.html');
    setTimeout(function () { window.location.href = landingPath; }, 1500);
    return;
  }
  window.location.href = newPath;
}

function renderLanguageToggle(locale) {
  if (typeof document === 'undefined') { return; }
  var container = document.querySelector('.lang-toggle');
  if (!container) { return; }
  container.innerHTML = '';
  SUPPORTED_LOCALES.forEach(function (loc) {
    var btn = document.createElement('button');
    btn.textContent = loc.toUpperCase();
    btn.setAttribute('aria-label', 'Switch language to ' + loc.toUpperCase());
    if (loc === locale) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'true');
    }
    btn.addEventListener('click', function () {
      if (loc !== locale) { switchLanguageNav(loc); }
    });
    container.appendChild(btn);
  });
}

// Browser global namespace
if (typeof window !== 'undefined') {
  window.SkillHub = window.SkillHub || {};
  window.SkillHub.i18n = {
    detectLocale: detectLocale,
    getCurrentLocale: getCurrentLocale,
    switchLanguage: switchLanguageNav,
    renderLanguageToggle: renderLanguageToggle,
    SUPPORTED_LOCALES: SUPPORTED_LOCALES,
    DEFAULT_LOCALE: DEFAULT_LOCALE,
    STORAGE_KEY: STORAGE_KEY
  };
}
