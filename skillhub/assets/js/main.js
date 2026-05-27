/**
 * SkillHub — Main Initialization Script + Search Module
 *
 * Entry point that wires up all modules on DOMContentLoaded.
 * Also contains the search module (exported for testing).
 * Depends on: lessons.js, i18n.js, navigation.js, code-highlight.js
 */

// ============================================================
// Search Module (exported for testing)
// ============================================================

var MAX_RESULTS = 20;
var MIN_QUERY_LENGTH = 2;
var searchIndex = null;
var indexLoadFailed = false;
var searchIndexRequested = false;

/**
 * Initializes the search module with a pre-built search index.
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
 */
export async function loadIndex() {
  if (searchIndex !== null) { return true; }
  if (indexLoadFailed) { return false; }
  try {
    if (typeof fetch === 'undefined') { indexLoadFailed = true; return false; }
    var basePath = getAssetBasePath();
    var response = await fetch(basePath + 'assets/search-index.json');
    if (!response.ok) { indexLoadFailed = true; return false; }
    var data = await response.json();
    if (!Array.isArray(data)) { indexLoadFailed = true; return false; }
    searchIndex = data;
    return true;
  } catch (e) { indexLoadFailed = true; return false; }
}

function getAssetBasePath() {
  if (typeof window === 'undefined' || !window.location) { return ''; }
  var path = window.location.pathname;
  var match = path.match(/\/(en|fr)\//);
  if (match) { return '../../'; }
  return '';
}

/**
 * Performs a search query against the loaded index.
 */
export function search(query) {
  if (!query || typeof query !== 'string' || query.trim().length < MIN_QUERY_LENGTH) { return []; }
  if (!searchIndex || indexLoadFailed) { return []; }
  var normalizedQuery = query.trim().toLowerCase();
  var titleMatches = [];
  var headingMatches = [];
  var bodyMatches = [];

  for (var i = 0; i < searchIndex.length; i++) {
    var entry = searchIndex[i];
    if (entry.title && entry.title.toLowerCase().indexOf(normalizedQuery) !== -1) {
      titleMatches.push({
        lessonId: entry.id, title: entry.title,
        snippet: createSnippet(entry.title, normalizedQuery),
        path: entry.path, matchType: 'title'
      });
      continue;
    }
    var headingMatch = false;
    if (Array.isArray(entry.headings)) {
      for (var h = 0; h < entry.headings.length; h++) {
        if (entry.headings[h] && entry.headings[h].toLowerCase().indexOf(normalizedQuery) !== -1) {
          headingMatches.push({
            lessonId: entry.id, title: entry.title,
            snippet: createSnippet(entry.headings[h], normalizedQuery),
            path: entry.path, matchType: 'heading'
          });
          headingMatch = true;
          break;
        }
      }
    }
    if (headingMatch) { continue; }
    if (entry.body && entry.body.toLowerCase().indexOf(normalizedQuery) !== -1) {
      bodyMatches.push({
        lessonId: entry.id, title: entry.title,
        snippet: createSnippet(entry.body, normalizedQuery),
        path: entry.path, matchType: 'body'
      });
    }
  }

  var allResults = titleMatches.concat(headingMatches).concat(bodyMatches);
  return allResults.slice(0, MAX_RESULTS);
}

function createSnippet(text, normalizedQuery) {
  var lowerText = text.toLowerCase();
  var matchIndex = lowerText.indexOf(normalizedQuery);
  if (matchIndex === -1) { return text.slice(0, 100); }
  var snippetStart = Math.max(0, matchIndex - 40);
  var snippetEnd = Math.min(text.length, matchIndex + normalizedQuery.length + 60);
  var snippet = text.slice(snippetStart, snippetEnd);
  if (snippetStart > 0) { snippet = '...' + snippet; }
  if (snippetEnd < text.length) { snippet = snippet + '...'; }
  return snippet;
}

/**
 * Highlights matching terms in result text by wrapping them in <mark> tags.
 */
export function highlight(text, query) {
  if (!text || typeof text !== 'string') { return ''; }
  if (!query || typeof query !== 'string' || query.length === 0) { return text; }
  var escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var regex = new RegExp(escapedQuery, 'gi');
  return text.replace(regex, function (match) { return '<mark>' + match + '</mark>'; });
}

/**
 * Returns the current state of the search index.
 */
export function getSearchState() {
  return {
    loaded: searchIndex !== null,
    failed: indexLoadFailed,
    entryCount: searchIndex ? searchIndex.length : 0
  };
}

/**
 * Resets the search module state.
 */
export function resetSearch() {
  searchIndex = null;
  indexLoadFailed = false;
  searchIndexRequested = false;
}

// ============================================================
// Application Initialization (browser only)
// ============================================================

function getCurrentLesson(currentPath) {
  if (typeof window === 'undefined' || !window.SkillHub) { return null; }
  var lessons = window.SkillHub.lessons || [];
  for (var i = 0; i < lessons.length; i++) {
    var lesson = lessons[i];
    if (currentPath.indexOf('/' + lesson.slug + '.html') !== -1) { return lesson; }
  }
  return null;
}

function renderBreadcrumbs(locale, currentPath) {
  if (typeof document === 'undefined') { return; }
  var container = document.querySelector('.breadcrumbs');
  if (!container) { return; }
  var homeLabel = locale === 'fr' ? 'Accueil' : 'Home';
  var lesson = getCurrentLesson(currentPath);
  var sections = (typeof window !== 'undefined' && window.SkillHub) ? window.SkillHub.sections || [] : [];

  var basePath = '../';

  var html = '<a href="' + basePath + 'introduction/what-is-opcp.html">' + homeLabel + '</a>';

  if (lesson) {
    var sectionTitle = '';
    for (var s = 0; s < sections.length; s++) {
      if (sections[s].id === lesson.section) {
        sectionTitle = locale === 'fr' ? sections[s].titleFR : sections[s].titleEN;
        break;
      }
    }
    var lessonTitle = locale === 'fr' ? lesson.titleFR : lesson.titleEN;
    if (sectionTitle) {
      html += '<span class="separator">\u203A</span>';
      html += '<span>' + sectionTitle + '</span>';
    }
    html += '<span class="separator">\u203A</span>';
    html += '<span>' + lessonTitle + '</span>';
  }
  container.innerHTML = html;
}

function renderPrevNextButtons(locale, currentPath) {
  if (typeof document === 'undefined' || typeof window === 'undefined' || !window.SkillHub) { return; }
  var container = document.querySelector('.prev-next-nav');
  if (!container) { return; }
  var lessons = window.SkillHub.lessons || [];
  var currentLesson = getCurrentLesson(currentPath);
  if (!currentLesson) { return; }
  var currentIndex = -1;
  for (var i = 0; i < lessons.length; i++) {
    if (lessons[i].id === currentLesson.id) { currentIndex = i; break; }
  }
  if (currentIndex === -1) { return; }
  var prevLabel = locale === 'fr' ? '\u2190 Pr\u00e9c\u00e9dent' : '\u2190 Previous';
  var nextLabel = locale === 'fr' ? 'Suivant \u2192' : 'Next \u2192';
  var html = '';

  if (currentIndex > 0) {
    var prev = lessons[currentIndex - 1];
    var prevTitle = locale === 'fr' ? prev.titleFR : prev.titleEN;
    var prevHref = '../' + prev.slug + '.html';
    if (prev.section === currentLesson.section) {
      var parts = prev.slug.split('/');
      prevHref = parts[parts.length - 1] + '.html';
    }
    html += '<a href="' + prevHref + '" aria-label="' + prevLabel + ': ' + prevTitle + '">' + prevLabel + '</a>';
  } else { html += '<span></span>'; }

  if (currentIndex < lessons.length - 1) {
    var next = lessons[currentIndex + 1];
    var nextTitle = locale === 'fr' ? next.titleFR : next.titleEN;
    var nextHref = '../' + next.slug + '.html';
    if (next.section === currentLesson.section) {
      var nparts = next.slug.split('/');
      nextHref = nparts[nparts.length - 1] + '.html';
    }
    html += '<a href="' + nextHref + '" aria-label="' + nextLabel + ': ' + nextTitle + '">' + nextLabel + '</a>';
  } else { html += '<span></span>'; }

  container.innerHTML = html;
}

function initializeApp() {
  if (typeof window === 'undefined' || !window.SkillHub) { return; }
  var locale = window.SkillHub.i18n.getCurrentLocale();
  var currentPath = window.location.pathname;

  window.SkillHub.navigation.renderNavigation(locale, currentPath);
  window.SkillHub.codeHighlight.initializeCodeBlocks();
  window.SkillHub.i18n.renderLanguageToggle(locale);
  renderBreadcrumbs(locale, currentPath);
  renderPrevNextButtons(locale, currentPath);
  window.SkillHub.navigation.initHamburgerMenu();

  var completeBtn = document.querySelector('.mark-complete-btn');
  if (completeBtn) {
    var lesson = getCurrentLesson(currentPath);
    if (lesson) {
      var completedLessons = window.SkillHub.navigation.getCompletedLessons();

      if (completedLessons.indexOf(lesson.id) !== -1) {
        completeBtn.textContent = locale === 'fr' ? '\u2713 Termin\u00e9' : '\u2713 Completed';
        completeBtn.classList.add('completed');
        completeBtn.setAttribute('disabled', 'true');
      }

      completeBtn.addEventListener('click', function () {
        if (completeBtn.classList.contains('completed')) { return; }
        window.SkillHub.navigation.markLessonComplete(lesson.id);
        completeBtn.textContent = locale === 'fr' ? '\u2713 Termin\u00e9' : '\u2713 Completed';
        completeBtn.classList.add('completed');
        completeBtn.setAttribute('disabled', 'true');
      });
    }
  }
}

// Run initialization when DOM is ready (browser only)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
}
