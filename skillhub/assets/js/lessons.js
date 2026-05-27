/**
 * SkillHub — Progress Tracking Module
 *
 * Handles lesson completion tracking via localStorage.
 * Also defines the lesson catalog data.
 * Shared via the window.SkillHub namespace (no build tools).
 * Also exports functions for testing.
 */

var STORAGE_KEY = 'opcp-progress';
var DEFAULT_TOTAL_LESSONS = 24;

var SECTIONS = [
  { id: 'introduction', titleEN: 'Introduction', titleFR: 'Introduction' },
  { id: 'getting-started', titleEN: 'Getting Started', titleFR: 'Premiers Pas' },
  { id: 'core-concepts', titleEN: 'Core Concepts', titleFR: 'Concepts Clés' },
  { id: 'technical-operations', titleEN: 'Technical Operations', titleFR: 'Opérations Techniques' },
  { id: 'storage', titleEN: 'Storage Solutions', titleFR: 'Solutions de Stockage' },
  { id: 'best-practices', titleEN: 'Best Practices', titleFR: 'Bonnes Pratiques' }
];

var LESSONS = [
  { id: 'introduction/what-is-opcp', section: 'introduction', slug: 'introduction/what-is-opcp', titleEN: 'What is OPCP?', titleFR: "Qu'est-ce que l'OPCP ?", difficulty: 'beginner', estimatedMinutes: 10 },
  { id: 'introduction/benefits', section: 'introduction', slug: 'introduction/benefits', titleEN: 'Benefits', titleFR: 'Avantages', difficulty: 'beginner', estimatedMinutes: 10 },
  { id: 'introduction/target-audience', section: 'introduction', slug: 'introduction/target-audience', titleEN: 'Target Audience', titleFR: 'Public Cible', difficulty: 'beginner', estimatedMinutes: 5 },
  { id: 'introduction/key-features', section: 'introduction', slug: 'introduction/key-features', titleEN: 'Key Features', titleFR: 'Fonctionnalités Clés', difficulty: 'beginner', estimatedMinutes: 10 },
  { id: 'getting-started/account-setup', section: 'getting-started', slug: 'getting-started/account-setup', titleEN: 'Account Setup', titleFR: 'Configuration du Compte', difficulty: 'beginner', estimatedMinutes: 15 },
  { id: 'getting-started/dashboard-access', section: 'getting-started', slug: 'getting-started/dashboard-access', titleEN: 'Dashboard Access', titleFR: 'Accès au Tableau de Bord', difficulty: 'beginner', estimatedMinutes: 10 },
  { id: 'getting-started/navigation', section: 'getting-started', slug: 'getting-started/navigation', titleEN: 'Navigation', titleFR: 'Navigation', difficulty: 'beginner', estimatedMinutes: 10 },
  { id: 'getting-started/initial-configuration', section: 'getting-started', slug: 'getting-started/initial-configuration', titleEN: 'Initial Configuration', titleFR: 'Configuration Initiale', difficulty: 'beginner', estimatedMinutes: 15 },
  { id: 'core-concepts/node-lifecycle', section: 'core-concepts', slug: 'core-concepts/node-lifecycle', titleEN: 'Node Lifecycle', titleFR: 'Cycle de Vie des Nœuds', difficulty: 'intermediate', estimatedMinutes: 15 },
  { id: 'core-concepts/node-types', section: 'core-concepts', slug: 'core-concepts/node-types', titleEN: 'Node Types', titleFR: 'Types de Nœuds', difficulty: 'intermediate', estimatedMinutes: 10 },
  { id: 'core-concepts/resource-allocation', section: 'core-concepts', slug: 'core-concepts/resource-allocation', titleEN: 'Resource Allocation', titleFR: 'Allocation de Ressources', difficulty: 'intermediate', estimatedMinutes: 15 },
  { id: 'core-concepts/network-architecture', section: 'core-concepts', slug: 'core-concepts/network-architecture', titleEN: 'Network Architecture', titleFR: 'Architecture Réseau', difficulty: 'intermediate', estimatedMinutes: 15 },
  { id: 'technical-operations/instance-setup', section: 'technical-operations', slug: 'technical-operations/instance-setup', titleEN: 'Instance Setup', titleFR: "Configuration d'Instance", difficulty: 'intermediate', estimatedMinutes: 20 },
  { id: 'technical-operations/api-credentials', section: 'technical-operations', slug: 'technical-operations/api-credentials', titleEN: 'API Credentials', titleFR: 'Identifiants API', difficulty: 'intermediate', estimatedMinutes: 15 },
  { id: 'technical-operations/node-configuration', section: 'technical-operations', slug: 'technical-operations/node-configuration', titleEN: 'Node Configuration', titleFR: 'Configuration des Nœuds', difficulty: 'advanced', estimatedMinutes: 20 },
  { id: 'technical-operations/lacp-trunk-raid', section: 'technical-operations', slug: 'technical-operations/lacp-trunk-raid', titleEN: 'LACP, Trunk & RAID', titleFR: 'LACP, Trunk & RAID', difficulty: 'advanced', estimatedMinutes: 25 },
  { id: 'storage/cloudstore-overview', section: 'storage', slug: 'storage/cloudstore-overview', titleEN: 'CloudStore Overview', titleFR: 'Présentation CloudStore', difficulty: 'beginner', estimatedMinutes: 10 },
  { id: 'storage/storage-capabilities', section: 'storage', slug: 'storage/storage-capabilities', titleEN: 'Storage Capabilities', titleFR: 'Capacités de Stockage', difficulty: 'intermediate', estimatedMinutes: 15 },
  { id: 'storage/data-management', section: 'storage', slug: 'storage/data-management', titleEN: 'Data Management', titleFR: 'Gestion des Données', difficulty: 'intermediate', estimatedMinutes: 15 },
  { id: 'storage/backup-recovery', section: 'storage', slug: 'storage/backup-recovery', titleEN: 'Backup & Recovery', titleFR: 'Sauvegarde & Récupération', difficulty: 'intermediate', estimatedMinutes: 15 },
  { id: 'best-practices/operations-security', section: 'best-practices', slug: 'best-practices/operations-security', titleEN: 'Operations & Security', titleFR: 'Opérations & Sécurité', difficulty: 'intermediate', estimatedMinutes: 15 },
  { id: 'best-practices/performance-troubleshooting', section: 'best-practices', slug: 'best-practices/performance-troubleshooting', titleEN: 'Performance & Troubleshooting', titleFR: 'Performance & Dépannage', difficulty: 'intermediate', estimatedMinutes: 15 },
  { id: 'best-practices/resources-support', section: 'best-practices', slug: 'best-practices/resources-support', titleEN: 'Resources & Support', titleFR: 'Ressources & Support', difficulty: 'beginner', estimatedMinutes: 10 },
  { id: 'best-practices/quick-reference', section: 'best-practices', slug: 'best-practices/quick-reference', titleEN: 'Quick Reference', titleFR: 'Aide-Mémoire', difficulty: 'beginner', estimatedMinutes: 5 }
];

/**
 * Safely access localStorage. Returns null if unavailable.
 */
function getStorage() {
  try {
    if (typeof localStorage === 'undefined') { return null; }
    var testKey = '__opcp_storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch (e) { return null; }
}

/**
 * Reads and parses progress data from localStorage.
 */
function readProgressData() {
  var storage = getStorage();
  if (!storage) { return null; }
  try {
    var raw = storage.getItem(STORAGE_KEY);
    if (!raw) { return null; }
    var data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.completedLessons)) {
      console.warn('[ProgressTracker] Corrupted progress data detected, resetting to empty state.');
      storage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('[ProgressTracker] Corrupted progress data detected, resetting to empty state.');
    try { storage.removeItem(STORAGE_KEY); } catch (e2) { /* noop */ }
    return null;
  }
}

/**
 * Writes progress data to localStorage.
 */
function writeProgressData(data) {
  var storage = getStorage();
  if (!storage) { return; }
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
 * Marks a specific lesson as completed.
 */
export function markCompleted(lessonId) {
  if (!lessonId) { return; }
  var data = readProgressData() || createEmptyProgressData();
  var langMatch = lessonId.match(/^(en|fr)\//);
  if (langMatch) { data.lang = langMatch[1]; }
  if (!data.completedLessons.includes(lessonId)) {
    data.completedLessons.push(lessonId);
  }
  data.lastUpdated = new Date().toISOString();
  writeProgressData(data);
}

/**
 * Checks if a lesson has been completed.
 */
export function isCompleted(lessonId) {
  var data = readProgressData();
  if (!data) { return false; }
  return data.completedLessons.includes(lessonId);
}

/**
 * Calculates overall completion percentage for a given language.
 */
export function getCompletionPercentage(lang, totalLessons) {
  if (totalLessons === undefined) { totalLessons = DEFAULT_TOTAL_LESSONS; }
  if (totalLessons <= 0) { return 0; }
  var data = readProgressData();
  if (!data) { return 0; }
  var completedForLang = data.completedLessons.filter(function (id) {
    return id.startsWith(lang + '/');
  });
  return Math.round((completedForLang.length / totalLessons) * 100);
}

/**
 * Returns all completion data from localStorage.
 */
export function getProgressData() {
  var data = readProgressData();
  if (!data) { return createEmptyProgressData(); }
  return data;
}

/**
 * Resets all progress data.
 */
export function reset() {
  var storage = getStorage();
  if (!storage) { return; }
  try { storage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
}

/**
 * Initializes progress tracking (no-op in non-browser environments).
 */
export function init() {
  // Progress tracking initialization is handled by main.js in the browser
}

// Browser global namespace
if (typeof window !== 'undefined') {
  window.SkillHub = window.SkillHub || {};
  window.SkillHub.lessons = LESSONS;
  window.SkillHub.sections = SECTIONS;
}
