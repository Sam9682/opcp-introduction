// OPCP Introduction Skillhub - Progress Tracking
// Handles lesson completion tracking via localStorage

const STORAGE_KEY = 'opcp-progress';
const DEFAULT_TOTAL_LESSONS = 24;

/**
 * Safely access localStorage. Returns null if unavailable.
 * @returns {Storage|null}
 */
function getStorage() {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    // Test that localStorage is actually usable
    const testKey = '__opcp_storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    return null;
  }
}

/**
 * Reads and parses progress data from localStorage.
 * Returns null if storage is unavailable or data is corrupted.
 * @returns {ProgressData|null}
 */
function readProgressData() {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const data = JSON.parse(raw);

    // Validate structure
    if (
      !data ||
      typeof data !== 'object' ||
      data.version !== 1 ||
      !Array.isArray(data.completedLessons)
    ) {
      console.warn('[ProgressTracker] Corrupted progress data detected, resetting to empty state.');
      storage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    console.warn('[ProgressTracker] Corrupted progress data detected, resetting to empty state.');
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore removal failure
    }
    return null;
  }
}

/**
 * Writes progress data to localStorage.
 * Handles QuotaExceededError gracefully.
 * @param {ProgressData} data
 */
function writeProgressData(data) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') {
      console.warn('[ProgressTracker] localStorage quota exceeded. Continuing without persisting.');
    } else {
      console.warn('[ProgressTracker] Failed to write progress data:', e);
    }
  }
}

/**
 * Creates a default empty ProgressData object.
 * @returns {ProgressData}
 */
function createEmptyProgressData() {
  return {
    version: 1,
    lang: '',
    completedLessons: [],
    lastVisited: '',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Initializes progress tracking for the current page.
 * Sets up IntersectionObserver on the last content element to detect lesson completion.
 */
export function init() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  // Find the last content element within the main content area
  const contentArea = document.querySelector('main') || document.querySelector('article') || document.body;
  const contentElements = contentArea.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, table, pre, blockquote, figure, .content-block');

  if (contentElements.length === 0) {
    return;
  }

  const lastElement = contentElements[contentElements.length - 1];

  // Determine current lesson ID from the page path
  const currentPath = window.location.pathname;
  const lessonId = extractLessonId(currentPath);

  if (!lessonId) {
    return;
  }

  // Update lastVisited
  const data = readProgressData() || createEmptyProgressData();
  data.lastVisited = lessonId;
  data.lastUpdated = new Date().toISOString();
  writeProgressData(data);

  // Set up IntersectionObserver on the last content element
  if (typeof IntersectionObserver === 'undefined') {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        markCompleted(lessonId);
        observer.disconnect();
      }
    }
  }, {
    threshold: 0.1
  });

  observer.observe(lastElement);
}

/**
 * Extracts a lesson ID from a URL path.
 * Lesson ID format: 'en/section/page' or 'fr/section/page'
 * @param {string} path - URL pathname
 * @returns {string|null}
 */
function extractLessonId(path) {
  // Remove leading slash and .html extension
  let cleaned = path.replace(/^\//, '').replace(/\.html$/, '');

  // Match pattern: lang/section/page
  const match = cleaned.match(/^((?:.*\/)?)(en|fr)\/([\w-]+)\/([\w-]+)$/);
  if (match) {
    return `${match[2]}/${match[3]}/${match[4]}`;
  }

  return null;
}

/**
 * Marks a specific lesson as completed.
 * @param {string} lessonId - Unique lesson identifier (e.g., 'en/introduction/what-is-opcp')
 */
export function markCompleted(lessonId) {
  if (!lessonId) {
    return;
  }

  const data = readProgressData() || createEmptyProgressData();

  // Extract language from lessonId
  const langMatch = lessonId.match(/^(en|fr)\//);
  if (langMatch) {
    data.lang = langMatch[1];
  }

  // Add to completedLessons if not already present
  if (!data.completedLessons.includes(lessonId)) {
    data.completedLessons.push(lessonId);
  }

  data.lastUpdated = new Date().toISOString();
  writeProgressData(data);
}

/**
 * Checks if a lesson has been completed.
 * @param {string} lessonId - Lesson identifier
 * @returns {boolean}
 */
export function isCompleted(lessonId) {
  const data = readProgressData();
  if (!data) {
    return false;
  }

  return data.completedLessons.includes(lessonId);
}

/**
 * Calculates overall completion percentage for a given language.
 * @param {string} lang - Current language ('en' or 'fr')
 * @param {number} [totalLessons=24] - Total number of lessons (default 24)
 * @returns {number} - Percentage 0-100, rounded to nearest integer
 */
export function getCompletionPercentage(lang, totalLessons = DEFAULT_TOTAL_LESSONS) {
  if (totalLessons <= 0) {
    return 0;
  }

  const data = readProgressData();
  if (!data) {
    return 0;
  }

  // Count completed lessons for the specified language
  const completedForLang = data.completedLessons.filter(
    (id) => id.startsWith(lang + '/')
  );

  return Math.round((completedForLang.length / totalLessons) * 100);
}

/**
 * Returns all completion data from localStorage.
 * @returns {ProgressData} - Full progress data object
 */
export function getProgressData() {
  const data = readProgressData();
  if (!data) {
    return createEmptyProgressData();
  }
  return data;
}

/**
 * Resets all progress data.
 */
export function reset() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore removal failure
  }
}

const ProgressTracker = {
  init,
  markCompleted,
  isCompleted,
  getCompletionPercentage,
  getProgressData,
  reset
};

export default ProgressTracker;
