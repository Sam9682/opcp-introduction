// OPCP Introduction Skillhub - Navigation System
// Handles sidebar rendering, active state, and responsive behavior

/**
 * Internal state for the navigation module.
 */
let _structure = [];
let _currentPage = '';
let _mobileNavOpen = false;

/**
 * Flattens the lesson structure into a sequential list of lesson entries.
 * @param {LessonStructure} structure
 * @returns {LessonEntry[]}
 */
export function flattenLessons(structure) {
  const lessons = [];
  for (const section of structure) {
    for (const lesson of section.lessons) {
      lessons.push(lesson);
    }
  }
  return lessons;
}

/**
 * Returns the previous and next lesson relative to the current page.
 * @param {string} currentPage - Current page path or lesson ID
 * @param {LessonStructure} [structure] - Optional structure override (uses internal state if not provided)
 * @returns {{ prev: string|null, next: string|null }}
 */
export function getSequentialNav(currentPage, structure) {
  const src = structure || _structure;
  const lessons = flattenLessons(src);

  if (lessons.length === 0) {
    return { prev: null, next: null };
  }

  const index = lessons.findIndex(
    (lesson) => lesson.id === currentPage || lesson.file === currentPage
  );

  if (index === -1) {
    return { prev: null, next: null };
  }

  const prev = index > 0 ? lessons[index - 1].id : null;
  const next = index < lessons.length - 1 ? lessons[index + 1].id : null;

  return { prev, next };
}

/**
 * Toggles mobile navigation overlay visibility.
 */
export function toggleMobileNav() {
  _mobileNavOpen = !_mobileNavOpen;

  if (typeof document === 'undefined') {
    return;
  }

  const sidebar = document.querySelector('.nav-sidebar');
  const overlay = document.querySelector('.nav-overlay');

  if (sidebar) {
    sidebar.classList.toggle('nav-sidebar--open', _mobileNavOpen);
  }

  if (overlay) {
    overlay.classList.toggle('nav-overlay--visible', _mobileNavOpen);
  }

  // Update hamburger button aria state
  const hamburger = document.querySelector('.nav-hamburger');
  if (hamburger) {
    hamburger.setAttribute('aria-expanded', String(_mobileNavOpen));
  }
}

/**
 * Closes the mobile navigation overlay.
 */
function closeMobileNav() {
  if (_mobileNavOpen) {
    _mobileNavOpen = false;

    if (typeof document === 'undefined') {
      return;
    }

    const sidebar = document.querySelector('.nav-sidebar');
    const overlay = document.querySelector('.nav-overlay');
    const hamburger = document.querySelector('.nav-hamburger');

    if (sidebar) {
      sidebar.classList.remove('nav-sidebar--open');
    }
    if (overlay) {
      overlay.classList.remove('nav-overlay--visible');
    }
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }
}

/**
 * Highlights the active lesson in the sidebar.
 * @param {string} pagePath - Path of the active page
 */
export function setActive(pagePath) {
  _currentPage = pagePath;

  if (typeof document === 'undefined') {
    return;
  }

  // Remove existing active class from all items
  const allItems = document.querySelectorAll('.nav-lesson');
  for (const item of allItems) {
    item.classList.remove('nav-lesson--active');
  }

  // Find and activate the matching item
  const activeItem = document.querySelector(
    `.nav-lesson[data-lesson-id="${pagePath}"], .nav-lesson[data-lesson-file="${pagePath}"]`
  );

  if (activeItem) {
    activeItem.classList.add('nav-lesson--active');

    // Expand the parent section if collapsed
    const parentSection = activeItem.closest('.nav-section');
    if (parentSection) {
      parentSection.classList.add('nav-section--expanded');
      const lessonList = parentSection.querySelector('.nav-section__lessons');
      if (lessonList) {
        lessonList.style.display = '';
      }
    }
  }
}

/**
 * Updates completion indicators based on progress data.
 * @param {ProgressData} progress - Current progress state
 */
export function updateCompletionIndicators(progress) {
  if (typeof document === 'undefined') {
    return;
  }

  if (!progress || !Array.isArray(progress.completedLessons)) {
    return;
  }

  // Reset all indicators
  const allIndicators = document.querySelectorAll('.nav-lesson__check');
  for (const indicator of allIndicators) {
    indicator.classList.remove('nav-lesson__check--completed');
    indicator.textContent = '';
  }

  // Mark completed lessons
  for (const lessonId of progress.completedLessons) {
    const lessonItem = document.querySelector(`.nav-lesson[data-lesson-id="${lessonId}"]`);
    if (lessonItem) {
      const check = lessonItem.querySelector('.nav-lesson__check');
      if (check) {
        check.classList.add('nav-lesson__check--completed');
        check.textContent = '✓';
      }
    }
  }
}

/**
 * Renders the sequential navigation buttons (Previous/Next) at the page bottom.
 * @param {string} currentPage - Current page path
 * @param {LessonStructure} [structure] - Optional structure override
 */
function renderSequentialButtons(currentPage, structure) {
  if (typeof document === 'undefined') {
    return;
  }

  const src = structure || _structure;
  const { prev, next } = getSequentialNav(currentPage, src);
  const lessons = flattenLessons(src);

  // Find or create the sequential nav container
  let container = document.querySelector('.nav-sequential');
  if (!container) {
    container = document.createElement('nav');
    container.className = 'nav-sequential';
    container.setAttribute('aria-label', 'Sequential navigation');

    const main = document.querySelector('main') || document.body;
    main.appendChild(container);
  }

  // Clear existing content
  container.innerHTML = '';

  // Previous button
  if (prev !== null) {
    const prevLesson = lessons.find((l) => l.id === prev);
    const prevBtn = document.createElement('a');
    prevBtn.className = 'nav-sequential__btn nav-sequential__btn--prev';
    prevBtn.href = prevLesson ? prevLesson.file : '#';
    prevBtn.setAttribute('aria-label', `Previous lesson: ${prevLesson ? prevLesson.title : ''}`);
    prevBtn.innerHTML = `<span class="nav-sequential__arrow">←</span> <span class="nav-sequential__label">Previous</span>`;
    container.appendChild(prevBtn);
  }

  // Next button
  if (next !== null) {
    const nextLesson = lessons.find((l) => l.id === next);
    const nextBtn = document.createElement('a');
    nextBtn.className = 'nav-sequential__btn nav-sequential__btn--next';
    nextBtn.href = nextLesson ? nextLesson.file : '#';
    nextBtn.setAttribute('aria-label', `Next lesson: ${nextLesson ? nextLesson.title : ''}`);
    nextBtn.innerHTML = `<span class="nav-sequential__label">Next</span> <span class="nav-sequential__arrow">→</span>`;
    container.appendChild(nextBtn);
  }
}

/**
 * Renders the sidebar navigation from the lesson structure.
 * @param {LessonStructure} structure - Hierarchical lesson data
 */
function renderSidebar(structure) {
  if (typeof document === 'undefined') {
    return;
  }

  let sidebar = document.querySelector('.nav-sidebar');
  if (!sidebar) {
    sidebar = document.createElement('nav');
    sidebar.className = 'nav-sidebar';
    sidebar.setAttribute('aria-label', 'Lesson navigation');
    document.body.insertBefore(sidebar, document.body.firstChild);
  }

  // Create close button for mobile overlay
  const closeBtn = document.createElement('button');
  closeBtn.className = 'nav-sidebar__close';
  closeBtn.setAttribute('aria-label', 'Close navigation');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeMobileNav);

  // Build sidebar content
  sidebar.innerHTML = '';
  sidebar.appendChild(closeBtn);

  for (const section of structure) {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'nav-section nav-section--expanded';
    sectionEl.setAttribute('data-section-id', section.id);

    // Section header (collapsible)
    const header = document.createElement('button');
    header.className = 'nav-section__header';
    header.setAttribute('aria-expanded', 'true');
    header.setAttribute('aria-controls', `nav-section-${section.id}`);
    header.textContent = section.title;
    header.addEventListener('click', () => {
      const isExpanded = sectionEl.classList.contains('nav-section--expanded');
      sectionEl.classList.toggle('nav-section--expanded', !isExpanded);
      header.setAttribute('aria-expanded', String(!isExpanded));
      lessonList.style.display = isExpanded ? 'none' : '';
    });

    // Lesson list
    const lessonList = document.createElement('ul');
    lessonList.className = 'nav-section__lessons';
    lessonList.id = `nav-section-${section.id}`;

    for (const lesson of section.lessons) {
      const li = document.createElement('li');
      li.className = 'nav-lesson';
      li.setAttribute('data-lesson-id', lesson.id);
      li.setAttribute('data-lesson-file', lesson.file);

      const link = document.createElement('a');
      link.className = 'nav-lesson__link';
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
    sidebar.appendChild(sectionEl);
  }
}

/**
 * Creates the hamburger menu button for mobile navigation.
 */
function createHamburgerButton() {
  if (typeof document === 'undefined') {
    return;
  }

  // Don't create if already exists
  if (document.querySelector('.nav-hamburger')) {
    return;
  }

  const btn = document.createElement('button');
  btn.className = 'nav-hamburger';
  btn.setAttribute('aria-label', 'Open navigation menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span class="nav-hamburger__icon">☰</span>';
  btn.addEventListener('click', toggleMobileNav);

  document.body.insertBefore(btn, document.body.firstChild);
}

/**
 * Creates the overlay backdrop for mobile navigation.
 */
function createOverlay() {
  if (typeof document === 'undefined') {
    return;
  }

  // Don't create if already exists
  if (document.querySelector('.nav-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.addEventListener('click', closeMobileNav);

  document.body.appendChild(overlay);
}

/**
 * Initializes the sidebar with lesson structure.
 * @param {LessonStructure} structure - Hierarchical lesson data
 * @param {string} currentPage - Current page path
 */
export function init(structure, currentPage) {
  _structure = structure || [];
  _currentPage = currentPage || '';
  _mobileNavOpen = false;

  if (typeof document === 'undefined') {
    return;
  }

  // Render sidebar
  renderSidebar(_structure);

  // Create mobile navigation elements
  createHamburgerButton();
  createOverlay();

  // Set active page
  if (_currentPage) {
    setActive(_currentPage);
  }

  // Render sequential navigation buttons
  renderSequentialButtons(_currentPage, _structure);
}

/**
 * Returns whether mobile nav is currently open (for testing).
 * @returns {boolean}
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

const Navigation = {
  init,
  setActive,
  updateCompletionIndicators,
  getSequentialNav,
  toggleMobileNav
};

export default Navigation;
