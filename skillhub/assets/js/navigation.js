/**
 * SkillHub — Navigation System
 *
 * Renders sidebar navigation from the lesson catalog (grouped by sections),
 * tracks learning progress via localStorage, and handles the mobile hamburger menu.
 * Shared via the window.SkillHub namespace (no build tools).
 * Also exports functions for testing.
 */

var COMPLETED_KEY = 'skillhub-completed';
var _structure = [];
var _currentPage = '';
var _mobileNavOpen = false;

/**
 * Flattens the lesson structure into a sequential list of lesson entries.
 */
export function flattenLessons(structure) {
  var lessons = [];
  for (var i = 0; i < structure.length; i++) {
    var section = structure[i];
    for (var j = 0; j < section.lessons.length; j++) {
      lessons.push(section.lessons[j]);
    }
  }
  return lessons;
}

/**
 * Returns the previous and next lesson relative to the current page.
 */
export function getSequentialNav(currentPage, structure) {
  var src = structure || _structure;
  var lessons = flattenLessons(src);
  if (lessons.length === 0) { return { prev: null, next: null }; }
  var index = -1;
  for (var i = 0; i < lessons.length; i++) {
    if (lessons[i].id === currentPage || lessons[i].file === currentPage) {
      index = i;
      break;
    }
  }
  if (index === -1) { return { prev: null, next: null }; }
  var prev = index > 0 ? lessons[index - 1].id : null;
  var next = index < lessons.length - 1 ? lessons[index + 1].id : null;
  return { prev: prev, next: next };
}

/**
 * Toggles mobile navigation overlay visibility.
 */
export function toggleMobileNav() {
  _mobileNavOpen = !_mobileNavOpen;
  if (typeof document === 'undefined') { return; }
  var sidebar = document.querySelector('.nav-sidebar');
  var overlay = document.querySelector('.nav-overlay');
  if (sidebar) { sidebar.classList.toggle('nav-sidebar--open', _mobileNavOpen); }
  if (overlay) { overlay.classList.toggle('nav-overlay--visible', _mobileNavOpen); }
  var hamburger = document.querySelector('.nav-hamburger');
  if (hamburger) { hamburger.setAttribute('aria-expanded', String(_mobileNavOpen)); }
}

/**
 * Highlights the active lesson in the sidebar.
 */
export function setActive(pagePath) {
  _currentPage = pagePath;
  if (typeof document === 'undefined') { return; }
  var allItems = document.querySelectorAll('.nav-lesson');
  for (var i = 0; i < allItems.length; i++) {
    allItems[i].classList.remove('nav-lesson--active');
  }
  var activeItem = document.querySelector(
    '.nav-lesson[data-lesson-id="' + pagePath + '"], .nav-lesson[data-lesson-file="' + pagePath + '"]'
  );
  if (activeItem) {
    activeItem.classList.add('nav-lesson--active');
    var parentSection = activeItem.closest('.nav-section');
    if (parentSection) {
      parentSection.classList.add('nav-section--expanded');
      var lessonList = parentSection.querySelector('.nav-section__lessons');
      if (lessonList) { lessonList.style.display = ''; }
    }
  }
}

/**
 * Updates completion indicators based on progress data.
 */
export function updateCompletionIndicators(progress) {
  if (typeof document === 'undefined') { return; }
  if (!progress || !Array.isArray(progress.completedLessons)) { return; }
  var allIndicators = document.querySelectorAll('.nav-lesson__check');
  for (var i = 0; i < allIndicators.length; i++) {
    allIndicators[i].classList.remove('nav-lesson__check--completed');
    allIndicators[i].textContent = '';
  }
  for (var j = 0; j < progress.completedLessons.length; j++) {
    var lessonId = progress.completedLessons[j];
    var lessonItem = document.querySelector('.nav-lesson[data-lesson-id="' + lessonId + '"]');
    if (lessonItem) {
      var check = lessonItem.querySelector('.nav-lesson__check');
      if (check) {
        check.classList.add('nav-lesson__check--completed');
        check.textContent = '\u2713';
      }
    }
  }
}

/**
 * Returns whether mobile nav is currently open (for testing).
 */
export function isMobileNavOpen() {
  return _mobileNavOpen;
}

/**
 * Resets internal state (for testing).
 */
export function _reset() {
  _structure = [];
  _currentPage = '';
  _mobileNavOpen = false;
}

/**
 * Initializes the sidebar with lesson structure.
 */
export function init(structure, currentPage) {
  _structure = structure || [];
  _currentPage = currentPage || '';
  _mobileNavOpen = false;
  if (typeof document === 'undefined') { return; }
  // DOM rendering handled by browser-specific code below
}

// ============================================================
// Browser-specific navigation rendering (via window.SkillHub)
// ============================================================

function getCompletedLessons() {
  try {
    var raw = localStorage.getItem(COMPLETED_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) { return parsed; }
    }
  } catch (e) { /* graceful degradation */ }
  return [];
}

function saveCompletedLessons(arr) {
  try { localStorage.setItem(COMPLETED_KEY, JSON.stringify(arr)); } catch (e) { /* noop */ }
}

function getBasePathToLocaleRoot(currentPath, locale) {
  var localeIndex = currentPath.indexOf('/' + locale + '/');
  if (localeIndex === -1) { return ''; }
  var afterLocale = currentPath.substring(localeIndex + locale.length + 2);
  var segments = afterLocale.split('/').filter(function (s) { return s.length > 0; });
  if (segments.length >= 2) { return '../'; }
  return '';
}

function renderNavigation(locale, currentPath) {
  if (typeof window === 'undefined' || !window.SkillHub) { return; }
  var lessons = window.SkillHub.lessons;
  var sections = window.SkillHub.sections;
  if (!lessons || !lessons.length || !sections) { return; }
  var sidebarEl = document.getElementById('sidebar-nav');
  if (!sidebarEl) { return; }

  var completed = getCompletedLessons();
  var basePath = getBasePathToLocaleRoot(currentPath, locale);
  var html = '';

  for (var s = 0; s < sections.length; s++) {
    var section = sections[s];
    var sectionTitle = locale === 'fr' ? section.titleFR : section.titleEN;
    html += '<span class="nav-section-title">' + sectionTitle + '</span>';
    html += '<ul class="nav-list" role="list">';

    for (var i = 0; i < lessons.length; i++) {
      var lesson = lessons[i];
      if (lesson.section !== section.id) { continue; }
      var isActive = currentPath.indexOf('/' + lesson.slug + '.html') !== -1;
      var isCompleted = completed.indexOf(lesson.id) !== -1;
      var classes = 'nav-item';
      if (isActive) { classes += ' active'; }
      if (isCompleted) { classes += ' completed'; }
      var title = locale === 'fr' ? lesson.titleFR : lesson.titleEN;
      var badgeClass = 'badge badge-' + lesson.difficulty;
      var badge = '<span class="' + badgeClass + '">' + lesson.difficulty + '</span>';
      var href = basePath + lesson.slug + '.html';
      html += '<li class="' + classes + '" data-lesson-id="' + lesson.id + '">';
      html += '<a href="' + href + '" aria-label="' + title + ' \u2014 ' + lesson.difficulty + '">';
      html += '<span class="nav-title">' + title + '</span> ' + badge;
      html += '</a></li>';
    }
    html += '</ul>';
  }

  sidebarEl.innerHTML = html;
  var progress = getProgress();
  updateProgressBar(progress.percentage, locale);
}

function markLessonComplete(lessonId) {
  var completed = getCompletedLessons();
  if (completed.indexOf(lessonId) === -1) {
    completed.push(lessonId);
    saveCompletedLessons(completed);
  }
  var navItem = document.querySelector('.nav-item[data-lesson-id="' + lessonId + '"]');
  if (navItem) { navItem.classList.add('completed'); }
  if (typeof window !== 'undefined' && window.SkillHub && window.SkillHub.i18n) {
    var locale = window.SkillHub.i18n.getCurrentLocale();
    var progress = getProgress();
    updateProgressBar(progress.percentage, locale);
  }
}

function getProgress() {
  if (typeof window === 'undefined' || !window.SkillHub) { return { completedCount: 0, totalCount: 0, percentage: 0 }; }
  var lessons = window.SkillHub.lessons || [];
  var totalCount = lessons.length;
  var completed = getCompletedLessons();
  var completedCount = 0;
  for (var i = 0; i < lessons.length; i++) {
    if (completed.indexOf(lessons[i].id) !== -1) { completedCount++; }
  }
  var percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  return { completedCount: completedCount, totalCount: totalCount, percentage: percentage };
}

function updateProgressBar(percentage, locale) {
  if (typeof document === 'undefined') { return; }
  var fill = document.querySelector('.progress-bar-fill');
  if (fill) { fill.style.width = percentage + '%'; }
  var text = document.querySelector('.progress-text');
  if (text) {
    var label = locale === 'fr' ? '% terminé' : '% complete';
    text.textContent = Math.round(percentage) + label;
  }
  var container = document.querySelector('.progress-bar-container');
  if (container) { container.setAttribute('aria-valuenow', String(Math.round(percentage))); }
}

function initHamburgerMenu() {
  if (typeof document === 'undefined') { return; }
  var hamburgerBtn = document.querySelector('.hamburger-btn');
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  if (!hamburgerBtn || !sidebar) { return; }
  hamburgerBtn.addEventListener('click', function () {
    sidebar.classList.toggle('open');
    var isOpen = sidebar.classList.contains('open');
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    if (overlay) { overlay.classList.toggle('visible'); }
  });
  if (overlay) {
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  }
}

// Browser global namespace
if (typeof window !== 'undefined') {
  window.SkillHub = window.SkillHub || {};
  window.SkillHub.navigation = {
    renderNavigation: renderNavigation,
    markLessonComplete: markLessonComplete,
    getProgress: getProgress,
    updateProgressBar: updateProgressBar,
    initHamburgerMenu: initHamburgerMenu,
    getCompletedLessons: getCompletedLessons
  };
}
