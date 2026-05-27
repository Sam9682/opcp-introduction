// OPCP Introduction Skillhub - Main Application Entry Point
// Wires all JavaScript modules together: i18n, navigation, lessons, search, code-highlight
// Handles initialization sequence, event listeners, and lazy-loading

/**
 * @typedef {Object} SearchIndexEntry
 * @property {string} id - Lesson ID
 * @property {string} title - Page title
 * @property {string[]} headings - All h2/h3 headings on the page
 * @property {string} body - Stripped text content (first 500 chars)
 * @property {string} path - Relative URL path
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} lessonId - Matching lesson ID
 * @property {string} title - Page title
 * @property {string} snippet - Context snippet with match
 * @property {string} path - URL to navigate to
 * @property {'title'|'heading'|'body'} matchType - Where the match occurred
 */

const MAX_RESULTS = 20;
const MIN_QUERY_LENGTH = 2;

/** @type {SearchIndexEntry[]|null} */
let searchIndex = null;

/** @type {boolean} */
let indexLoadFailed = false;

/** @type {boolean} */
let searchIndexRequested = false;

/**
 * Lesson structure data for navigation.
 * Defines all sections and lessons in hierarchical order.
 */
const LESSON_STRUCTURE = [
  {
    id: 'introduction',
    title: 'Introduction',
    lessons: [
      { id: 'introduction/what-is-opcp', title: 'What is OPCP?', file: 'introduction/what-is-opcp.html', difficulty: 'beginner' },
      { id: 'introduction/benefits', title: 'Benefits', file: 'introduction/benefits.html', difficulty: 'beginner' },
      { id: 'introduction/target-audience', title: 'Target Audience', file: 'introduction/target-audience.html', difficulty: 'beginner' },
      { id: 'introduction/key-features', title: 'Key Features', file: 'introduction/key-features.html', difficulty: 'beginner' }
    ]
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    lessons: [
      { id: 'getting-started/account-setup', title: 'Account Setup', file: 'getting-started/account-setup.html', difficulty: 'beginner' },
      { id: 'getting-started/dashboard-access', title: 'Dashboard Access', file: 'getting-started/dashboard-access.html', difficulty: 'beginner' },
      { id: 'getting-started/navigation', title: 'Navigation', file: 'getting-started/navigation.html', difficulty: 'beginner' },
      { id: 'getting-started/initial-configuration', title: 'Initial Configuration', file: 'getting-started/initial-configuration.html', difficulty: 'beginner' }
    ]
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    lessons: [
      { id: 'core-concepts/node-lifecycle', title: 'Node Lifecycle', file: 'core-concepts/node-lifecycle.html', difficulty: 'intermediate' },
      { id: 'core-concepts/node-types', title: 'Node Types', file: 'core-concepts/node-types.html', difficulty: 'intermediate' },
      { id: 'core-concepts/resource-allocation', title: 'Resource Allocation', file: 'core-concepts/resource-allocation.html', difficulty: 'intermediate' },
      { id: 'core-concepts/network-architecture', title: 'Network Architecture', file: 'core-concepts/network-architecture.html', difficulty: 'intermediate' }
    ]
  },
  {
    id: 'technical-operations',
    title: 'Technical Operations',
    lessons: [
      { id: 'technical-operations/instance-setup', title: 'Instance Setup', file: 'technical-operations/instance-setup.html', difficulty: 'intermediate' },
      { id: 'technical-operations/api-credentials', title: 'API Credentials', file: 'technical-operations/api-credentials.html', difficulty: 'intermediate' },
      { id: 'technical-operations/node-configuration', title: 'Node Configuration', file: 'technical-operations/node-configuration.html', difficulty: 'advanced' },
      { id: 'technical-operations/lacp-trunk-raid', title: 'LACP, Trunk & RAID', file: 'technical-operations/lacp-trunk-raid.html', difficulty: 'advanced' }
    ]
  },
  {
    id: 'storage',
    title: 'Storage Solutions',
    lessons: [
      { id: 'storage/cloudstore-overview', title: 'CloudStore Overview', file: 'storage/cloudstore-overview.html', difficulty: 'beginner' },
      { id: 'storage/storage-capabilities', title: 'Storage Capabilities', file: 'storage/storage-capabilities.html', difficulty: 'intermediate' },
      { id: 'storage/data-management', title: 'Data Management', file: 'storage/data-management.html', difficulty: 'intermediate' },
      { id: 'storage/backup-recovery', title: 'Backup & Recovery', file: 'storage/backup-recovery.html', difficulty: 'intermediate' }
    ]
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    lessons: [
      { id: 'best-practices/operations-security', title: 'Operations & Security', file: 'best-practices/operations-security.html', difficulty: 'intermediate' },
      { id: 'best-practices/performance-troubleshooting', title: 'Performance & Troubleshooting', file: 'best-practices/performance-troubleshooting.html', difficulty: 'intermediate' },
      { id: 'best-practices/resources-support', title: 'Resources & Support', file: 'best-practices/resources-support.html', difficulty: 'beginner' },
      { id: 'best-practices/quick-reference', title: 'Quick Reference', file: 'best-practices/quick-reference.html', difficulty: 'beginner' }
    ]
  }
];

// ============================================================
// Search Module
// ============================================================

/**
 * Initializes the search module with a pre-built search index.
 * @param {SearchIndexEntry[]} index - Pre-built search index array
 */
export function init(index) {
  if (Array.isArray(index)) {
    searchIndex = index;
    indexLoadFailed = false;
  } else {
    searchIndex = null;
    indexLoadFailed = true;
  }
}

/**
 * Lazily loads the search index from the search-index.json file.
 * Called on first search interaction if index hasn't been loaded yet.
 * @returns {Promise<boolean>} - Whether the index was loaded successfully
 */
export async function loadIndex() {
  if (searchIndex !== null) {
    return true;
  }

  if (indexLoadFailed) {
    return false;
  }

  try {
    if (typeof fetch === 'undefined') {
      indexLoadFailed = true;
      return false;
    }

    // Determine the base path to search-index.json relative to current page
    const basePath = getAssetBasePath();
    const response = await fetch(basePath + 'assets/search-index.json');
    if (!response.ok) {
      indexLoadFailed = true;
      return false;
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      indexLoadFailed = true;
      return false;
    }

    searchIndex = data;
    return true;
  } catch {
    indexLoadFailed = true;
    return false;
  }
}

/**
 * Determines the relative base path from the current page to the skillhub root.
 * Uses the current page URL to calculate the correct relative path.
 * @returns {string} - Relative path prefix (e.g., '../../' for pages in en/section/)
 */
function getAssetBasePath() {
  if (typeof window === 'undefined' || !window.location) {
    return '';
  }

  const path = window.location.pathname;
  // Count directory depth from skillhub root
  // Pages are at: /skillhub/en/section/page.html (depth 2 from skillhub)
  // or /skillhub/fr/section/page.html
  const match = path.match(/\/(en|fr)\//);
  if (match) {
    // We're in a lesson page (lang/section/page.html) — go up 2 levels
    return '../../';
  }
  // We're at the root level
  return '';
}

/**
 * Performs a search query against the loaded index.
 * @param {string} query - User search input (minimum 2 characters)
 * @returns {SearchResult[]} - Ordered results, max 20
 */
export function search(query) {
  if (!query || typeof query !== 'string' || query.trim().length < MIN_QUERY_LENGTH) {
    return [];
  }

  if (!searchIndex || indexLoadFailed) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();

  /** @type {SearchResult[]} */
  const titleMatches = [];
  /** @type {SearchResult[]} */
  const headingMatches = [];
  /** @type {SearchResult[]} */
  const bodyMatches = [];

  for (const entry of searchIndex) {
    // Check title match
    if (entry.title && entry.title.toLowerCase().includes(normalizedQuery)) {
      titleMatches.push({
        lessonId: entry.id,
        title: entry.title,
        snippet: createSnippet(entry.title, normalizedQuery),
        path: entry.path,
        matchType: 'title'
      });
      continue;
    }

    // Check heading matches
    let headingMatch = false;
    if (Array.isArray(entry.headings)) {
      for (const heading of entry.headings) {
        if (heading && heading.toLowerCase().includes(normalizedQuery)) {
          headingMatches.push({
            lessonId: entry.id,
            title: entry.title,
            snippet: createSnippet(heading, normalizedQuery),
            path: entry.path,
            matchType: 'heading'
          });
          headingMatch = true;
          break;
        }
      }
    }

    if (headingMatch) {
      continue;
    }

    // Check body match
    if (entry.body && entry.body.toLowerCase().includes(normalizedQuery)) {
      bodyMatches.push({
        lessonId: entry.id,
        title: entry.title,
        snippet: createSnippet(entry.body, normalizedQuery),
        path: entry.path,
        matchType: 'body'
      });
    }
  }

  // Combine results: title first, then heading, then body
  const allResults = [...titleMatches, ...headingMatches, ...bodyMatches];

  // Limit to MAX_RESULTS
  return allResults.slice(0, MAX_RESULTS);
}

/**
 * Creates a snippet of text around the first match occurrence.
 * @param {string} text - Source text
 * @param {string} normalizedQuery - Lowercased query string
 * @returns {string} - Snippet with context around the match
 */
function createSnippet(text, normalizedQuery) {
  const lowerText = text.toLowerCase();
  const matchIndex = lowerText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return text.slice(0, 100);
  }

  const snippetStart = Math.max(0, matchIndex - 40);
  const snippetEnd = Math.min(text.length, matchIndex + normalizedQuery.length + 60);

  let snippet = text.slice(snippetStart, snippetEnd);

  if (snippetStart > 0) {
    snippet = '...' + snippet;
  }
  if (snippetEnd < text.length) {
    snippet = snippet + '...';
  }

  return snippet;
}

/**
 * Highlights matching terms in result text by wrapping them in <mark> tags.
 * All case-insensitive occurrences of the query are wrapped.
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {string} - HTML with <mark> tags around matches
 */
export function highlight(text, query) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (!query || typeof query !== 'string' || query.length === 0) {
    return text;
  }

  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Create a case-insensitive global regex
  const regex = new RegExp(escapedQuery, 'gi');

  // Replace all matches with <mark> wrapped version
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

/**
 * Returns the current state of the search index.
 * @returns {{ loaded: boolean, failed: boolean, entryCount: number }}
 */
export function getSearchState() {
  return {
    loaded: searchIndex !== null,
    failed: indexLoadFailed,
    entryCount: searchIndex ? searchIndex.length : 0
  };
}

/**
 * Resets the search module state. Useful for testing.
 */
export function resetSearch() {
  searchIndex = null;
  indexLoadFailed = false;
  searchIndexRequested = false;
}

/**
 * Renders search results into a DOM container.
 * Handles all display states: unavailable, hint, no results, results.
 * @param {string} query - The search query
 * @param {SearchResult[]} results - Search results to display
 * @param {HTMLElement|null} container - DOM element to render into
 */
export function renderResults(query, results, container) {
  if (!container || typeof document === 'undefined') {
    return;
  }

  container.innerHTML = '';

  // Search unavailable state
  if (indexLoadFailed) {
    container.innerHTML = '<p class="search-message search-unavailable">Search unavailable</p>';
    return;
  }

  // Query too short hint
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    container.innerHTML = '<p class="search-message search-hint">Please enter at least 2 characters to search.</p>';
    return;
  }

  // No results state
  if (results.length === 0) {
    container.innerHTML = '<p class="search-message search-no-results">No results found. Try shorter keywords or check your spelling.</p>';
    return;
  }

  // Render results
  const list = document.createElement('ul');
  list.className = 'search-results-list';
  list.setAttribute('role', 'list');

  for (const result of results) {
    const item = document.createElement('li');
    item.className = 'search-result-item';

    const link = document.createElement('a');
    link.href = result.path;
    link.className = 'search-result-link';

    const title = document.createElement('span');
    title.className = 'search-result-title';
    title.innerHTML = highlight(result.title, query);

    const snippet = document.createElement('span');
    snippet.className = 'search-result-snippet';
    snippet.innerHTML = highlight(result.snippet, query);

    const matchBadge = document.createElement('span');
    matchBadge.className = `search-result-badge search-result-badge--${result.matchType}`;
    matchBadge.textContent = result.matchType;

    link.appendChild(title);
    link.appendChild(snippet);
    link.appendChild(matchBadge);
    item.appendChild(link);
    list.appendChild(item);
  }

  container.appendChild(list);
}

// ============================================================
// Application Initialization
// ============================================================

/**
 * Detects the current page's lesson ID from the URL path.
 * @returns {string|null} - Lesson ID like 'introduction/what-is-opcp' or null
 */
function getCurrentLessonId() {
  if (typeof window === 'undefined' || !window.location) {
    return null;
  }

  const path = window.location.pathname;
  // Match pattern: /lang/section/page.html
  const match = path.match(/\/(en|fr)\/([\w-]+)\/([\w-]+)\.html$/);
  if (match) {
    return match[2] + '/' + match[3];
  }
  return null;
}

/**
 * Detects the current language from the URL path.
 * @returns {'en'|'fr'} - Current language
 */
function getCurrentLanguage() {
  if (typeof window === 'undefined' || !window.location) {
    return 'en';
  }

  const path = window.location.pathname;
  if (path.includes('/fr/')) {
    return 'fr';
  }
  return 'en';
}

/**
 * Sets up the search input event listener.
 * Lazy-loads the search index on first interaction.
 */
function setupSearchListener() {
  if (typeof document === 'undefined') {
    return;
  }

  const searchInput = document.querySelector('.search-input');
  if (!searchInput) {
    return;
  }

  // Create search results container if it doesn't exist
  let resultsContainer = document.querySelector('.search-results');
  if (!resultsContainer) {
    resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    resultsContainer.setAttribute('role', 'region');
    resultsContainer.setAttribute('aria-label', 'Search results');
    resultsContainer.setAttribute('aria-live', 'polite');
    searchInput.parentElement.appendChild(resultsContainer);
  }

  // Lazy-load search index on first focus/input
  searchInput.addEventListener('focus', async function onFirstFocus() {
    if (!searchIndexRequested) {
      searchIndexRequested = true;
      await loadIndex();
    }
    searchInput.removeEventListener('focus', onFirstFocus);
  });

  // Handle search input with debounce
  let debounceTimer = null;
  searchInput.addEventListener('input', async () => {
    const query = searchInput.value;

    // Lazy-load index if not yet loaded
    if (!searchIndexRequested) {
      searchIndexRequested = true;
      await loadIndex();
    }

    // Debounce search execution
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      const results = search(query);
      renderResults(query, results, resultsContainer);
    }, 150);
  });

  // Clear results when input is emptied
  searchInput.addEventListener('search', () => {
    if (searchInput.value === '') {
      resultsContainer.innerHTML = '';
    }
  });
}

/**
 * Sets up the language switch event listener.
 * Handles clicks on the language switch link to navigate to the same page in the other language.
 */
function setupLanguageSwitchListener() {
  if (typeof document === 'undefined') {
    return;
  }

  const langSwitch = document.querySelector('.language-switch');
  if (!langSwitch) {
    return;
  }

  langSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    const href = langSwitch.getAttribute('href');
    if (href) {
      window.location.href = href;
    }
  });
}

/**
 * Sets up navigation click listeners for sidebar lesson links.
 * Handles collapsible sections and lesson navigation.
 */
function setupNavigationListeners() {
  if (typeof document === 'undefined') {
    return;
  }

  const sidebar = document.querySelector('.nav-sidebar');
  if (!sidebar) {
    return;
  }

  // Hamburger menu toggle
  const hamburger = document.querySelector('.nav-hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('nav-sidebar--open');
      sidebar.classList.toggle('nav-sidebar--open', !isOpen);
      hamburger.setAttribute('aria-expanded', String(!isOpen));

      const overlay = document.querySelector('.nav-overlay');
      if (overlay) {
        overlay.classList.toggle('nav-overlay--visible', !isOpen);
      }
    });
  }

  // Overlay click to close
  const overlay = document.querySelector('.nav-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('nav-sidebar--open');
      if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');
      }
      overlay.classList.remove('nav-overlay--visible');
    });
  }

  // Close button in sidebar
  const closeBtn = sidebar.querySelector('.nav-sidebar__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('nav-sidebar--open');
      if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');
      }
      const ov = document.querySelector('.nav-overlay');
      if (ov) {
        ov.classList.remove('nav-overlay--visible');
      }
    });
  }
}

/**
 * Initializes the navigation sidebar with lesson structure data.
 * Renders sections and lessons, highlights the current page.
 */
function initializeNavigation() {
  if (typeof document === 'undefined') {
    return;
  }

  const sidebar = document.querySelector('.nav-sidebar');
  if (!sidebar) {
    return;
  }

  const currentLessonId = getCurrentLessonId();
  const currentLang = getCurrentLanguage();

  // Build navigation items in the sidebar
  let navContent = sidebar.querySelector('.nav-sections');
  if (!navContent) {
    navContent = document.createElement('div');
    navContent.className = 'nav-sections';
    sidebar.appendChild(navContent);
  }

  navContent.innerHTML = '';

  for (const section of LESSON_STRUCTURE) {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'nav-section nav-section--expanded';
    sectionEl.setAttribute('data-section-id', section.id);

    // Section header (collapsible)
    const header = document.createElement('button');
    header.className = 'nav-section__header';
    header.setAttribute('aria-expanded', 'true');
    header.textContent = section.title;

    // Lesson list
    const lessonList = document.createElement('ul');
    lessonList.className = 'nav-section__lessons';

    header.addEventListener('click', () => {
      const isExpanded = sectionEl.classList.contains('nav-section--expanded');
      sectionEl.classList.toggle('nav-section--expanded', !isExpanded);
      header.setAttribute('aria-expanded', String(!isExpanded));
      lessonList.style.display = isExpanded ? 'none' : '';
    });

    for (const lesson of section.lessons) {
      const li = document.createElement('li');
      li.className = 'nav-lesson';
      li.setAttribute('data-lesson-id', lesson.id);

      // Highlight current page
      if (currentLessonId && lesson.id === currentLessonId) {
        li.classList.add('nav-lesson--active');
      }

      const link = document.createElement('a');
      link.className = 'nav-lesson__link';
      // Use relative path — all internal links must be relative
      link.href = lesson.file;
      link.textContent = lesson.title;

      const check = document.createElement('span');
      check.className = 'nav-lesson__check';
      check.setAttribute('aria-hidden', 'true');

      li.appendChild(check);
      li.appendChild(link);
      lessonList.appendChild(li);
    }

    sectionEl.appendChild(header);
    sectionEl.appendChild(lessonList);
    navContent.appendChild(sectionEl);
  }
}

/**
 * Initializes the progress tracker.
 * Sets up IntersectionObserver on the last content element to detect lesson completion.
 * Updates navigation indicators with current progress.
 */
function initializeProgressTracker() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const currentLessonId = getCurrentLessonId();
  const currentLang = getCurrentLanguage();

  if (!currentLessonId) {
    return;
  }

  const fullLessonId = currentLang + '/' + currentLessonId;

  // Read existing progress from localStorage
  let progressData = null;
  try {
    const storage = getLocalStorage();
    if (storage) {
      const raw = storage.getItem('opcp-progress');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 && Array.isArray(parsed.completedLessons)) {
          progressData = parsed;
        }
      }
    }
  } catch {
    // Silently degrade
  }

  // Update lastVisited
  if (progressData) {
    progressData.lastVisited = fullLessonId;
    progressData.lastUpdated = new Date().toISOString();
    saveProgress(progressData);
  }

  // Update navigation completion indicators
  updateProgressDisplay(progressData, currentLang);

  // Set up IntersectionObserver on the last content element
  const contentArea = document.querySelector('main') || document.querySelector('article');
  if (!contentArea) {
    return;
  }

  const contentElements = contentArea.querySelectorAll(
    'p, h1, h2, h3, h4, h5, h6, ul, ol, table, pre, blockquote, figure, .content-block'
  );

  if (contentElements.length === 0) {
    return;
  }

  const lastElement = contentElements[contentElements.length - 1];

  if (typeof IntersectionObserver === 'undefined') {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        markLessonCompleted(fullLessonId, currentLang);
        observer.disconnect();
      }
    }
  }, { threshold: 0.1 });

  observer.observe(lastElement);
}

/**
 * Safely access localStorage.
 * @returns {Storage|null}
 */
function getLocalStorage() {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const testKey = '__opcp_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    return null;
  }
}

/**
 * Saves progress data to localStorage.
 * @param {object} data - Progress data object
 */
function saveProgress(data) {
  try {
    const storage = getLocalStorage();
    if (storage) {
      storage.setItem('opcp-progress', JSON.stringify(data));
    }
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') {
      console.warn('[OPCP] localStorage quota exceeded.');
    }
  }
}

/**
 * Marks a lesson as completed and updates the UI.
 * @param {string} lessonId - Full lesson ID (e.g., 'en/introduction/what-is-opcp')
 * @param {string} lang - Current language
 */
function markLessonCompleted(lessonId, lang) {
  let progressData = null;
  try {
    const storage = getLocalStorage();
    if (storage) {
      const raw = storage.getItem('opcp-progress');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 && Array.isArray(parsed.completedLessons)) {
          progressData = parsed;
        }
      }
    }
  } catch {
    // Silently degrade
  }

  if (!progressData) {
    progressData = {
      version: 1,
      lang: lang,
      completedLessons: [],
      lastVisited: lessonId,
      lastUpdated: new Date().toISOString()
    };
  }

  if (!progressData.completedLessons.includes(lessonId)) {
    progressData.completedLessons.push(lessonId);
    progressData.lastUpdated = new Date().toISOString();
    saveProgress(progressData);
    updateProgressDisplay(progressData, lang);
  }
}

/**
 * Updates the navigation sidebar with completion indicators and progress bar.
 * @param {object|null} progressData - Progress data from localStorage
 * @param {string} lang - Current language
 */
function updateProgressDisplay(progressData, lang) {
  if (typeof document === 'undefined') {
    return;
  }

  const completedLessons = progressData && Array.isArray(progressData.completedLessons)
    ? progressData.completedLessons
    : [];

  // Count total lessons
  let totalLessons = 0;
  for (const section of LESSON_STRUCTURE) {
    totalLessons += section.lessons.length;
  }

  // Count completed for current language
  const completedForLang = completedLessons.filter(id => id.startsWith(lang + '/'));
  const percentage = totalLessons > 0
    ? Math.round((completedForLang.length / totalLessons) * 100)
    : 0;

  // Update progress bar display
  const progressFill = document.querySelector('.progress-display__fill');
  const progressPercentage = document.querySelector('.progress-display__percentage');
  const progressBar = document.querySelector('.progress-display__bar');

  if (progressFill) {
    progressFill.style.width = percentage + '%';
  }
  if (progressPercentage) {
    progressPercentage.textContent = percentage + '%';
  }
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', String(percentage));
  }

  // Update checkmarks on lesson items
  const allLessonItems = document.querySelectorAll('.nav-lesson');
  for (const item of allLessonItems) {
    const lessonId = item.getAttribute('data-lesson-id');
    const fullId = lang + '/' + lessonId;
    const check = item.querySelector('.nav-lesson__check');

    if (check) {
      if (completedLessons.includes(fullId)) {
        check.classList.add('nav-lesson__check--completed');
        check.textContent = '✓';
      } else {
        check.classList.remove('nav-lesson__check--completed');
        check.textContent = '';
      }
    }
  }
}

/**
 * Initializes code syntax highlighting for all code blocks on the page.
 */
function initializeCodeHighlight() {
  if (typeof document === 'undefined') {
    return;
  }

  const codeBlocks = document.querySelectorAll('pre code');
  if (codeBlocks.length === 0) {
    return;
  }

  // Keywords for syntax highlighting
  const KEYWORDS = [
    'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
    'return', 'import', 'export', 'class', 'new', 'this', 'try', 'catch',
    'throw', 'async', 'await', 'switch', 'case', 'break', 'continue',
    'default', 'do', 'in', 'of', 'typeof', 'instanceof', 'void', 'delete',
    'yield', 'from', 'extends', 'super', 'static', 'true', 'false', 'null',
    'undefined', 'with', 'finally', 'debugger'
  ];

  function tokenize(code) {
    const tokens = [];
    let i = 0;
    while (i < code.length) {
      if (code[i] === '/' && code[i + 1] === '*') {
        const end = code.indexOf('*/', i + 2);
        const closeIdx = end === -1 ? code.length : end + 2;
        tokens.push({ type: 'comment', value: code.slice(i, closeIdx) });
        i = closeIdx;
        continue;
      }
      if (code[i] === '/' && code[i + 1] === '/') {
        const end = code.indexOf('\n', i);
        const closeIdx = end === -1 ? code.length : end;
        tokens.push({ type: 'comment', value: code.slice(i, closeIdx) });
        i = closeIdx;
        continue;
      }
      if (code[i] === '`') {
        let j = i + 1;
        while (j < code.length) {
          if (code[j] === '\\') { j += 2; continue; }
          if (code[j] === '`') { j++; break; }
          j++;
        }
        tokens.push({ type: 'string', value: code.slice(i, j) });
        i = j;
        continue;
      }
      if (code[i] === '"' || code[i] === "'") {
        const quote = code[i];
        let j = i + 1;
        while (j < code.length) {
          if (code[j] === '\\') { j += 2; continue; }
          if (code[j] === quote) { j++; break; }
          if (code[j] === '\n') { break; }
          j++;
        }
        tokens.push({ type: 'string', value: code.slice(i, j) });
        i = j;
        continue;
      }
      if (/[0-9]/.test(code[i])) {
        let j = i;
        while (j < code.length && /[0-9.]/.test(code[j])) { j++; }
        tokens.push({ type: 'number', value: code.slice(i, j) });
        i = j;
        continue;
      }
      if (/[a-zA-Z_$]/.test(code[i])) {
        let j = i;
        while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) { j++; }
        const word = code.slice(i, j);
        tokens.push({ type: KEYWORDS.includes(word) ? 'keyword' : 'text', value: word });
        i = j;
        continue;
      }
      tokens.push({ type: 'text', value: code[i] });
      i++;
    }
    return tokens;
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightBlock(block) {
    const code = block.textContent;
    const tokens = tokenize(code);
    block.innerHTML = tokens.map(t => {
      const escaped = escapeHtml(t.value);
      return t.type === 'text' ? escaped : `<span class="code-${t.type}">${escaped}</span>`;
    }).join('');
  }

  async function copyToClipboard(block) {
    const text = block.textContent || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* fall through */ }
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch { return false; }
  }

  codeBlocks.forEach((codeEl) => {
    const pre = codeEl.parentElement;
    highlightBlock(codeEl);

    // Add copy button
    pre.style.position = 'relative';
    const btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.textContent = 'Copy';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copy code to clipboard');

    btn.addEventListener('click', async () => {
      const success = await copyToClipboard(codeEl);
      if (success) {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      } else {
        btn.textContent = 'Copy failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 3000);
      }
    });

    pre.appendChild(btn);
  });
}

/**
 * Ensures all internal links use relative paths.
 * Scans the page for links and warns about any absolute internal paths.
 */
function validateRelativePaths() {
  if (typeof document === 'undefined') {
    return;
  }

  const links = document.querySelectorAll('a[href], link[href], script[src], img[src]');
  for (const el of links) {
    const attr = el.getAttribute('href') || el.getAttribute('src');
    if (!attr) continue;

    // Skip external URLs (http://, https://, mailto:, tel:, etc.)
    if (/^(https?:|mailto:|tel:|#)/.test(attr)) continue;

    // Flag absolute paths starting with /
    if (attr.startsWith('/')) {
      console.warn('[OPCP] Absolute internal path detected:', attr, 'on element:', el);
    }
  }
}

/**
 * Main application initialization.
 * Called on DOMContentLoaded to wire all modules together.
 */
function initializeApp() {
  // 1. Initialize navigation with lesson structure
  initializeNavigation();

  // 2. Set up navigation event listeners (hamburger, overlay, collapsible sections)
  setupNavigationListeners();

  // 3. Initialize progress tracker and update navigation indicators
  initializeProgressTracker();

  // 4. Set up search with lazy-loading
  setupSearchListener();

  // 5. Set up language switch listener
  setupLanguageSwitchListener();

  // 6. Initialize code syntax highlighting
  initializeCodeHighlight();

  // 7. Validate that all internal links use relative paths
  validateRelativePaths();
}

// Run initialization when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
}

// ============================================================
// Exports for testing
// ============================================================

const Search = {
  init,
  loadIndex,
  search,
  highlight,
  getSearchState,
  resetSearch,
  renderResults
};

export default Search;
export { LESSON_STRUCTURE };
