# Implementation Plan: OPCP Introduction Skillhub

## Overview

This plan implements a static training website (skillhub) for OVHcloud OPCP, served via Docker/nginx, with bilingual content (EN/FR), client-side progress tracking, search, and lab modules. The implementation uses HTML, CSS, and vanilla JavaScript for the client-side application, with Docker/nginx for deployment.

## Tasks

- [x] 1. Set up project structure and scaffolding
  - [x] 1.1 Create root project files and directory structure
    - Create app.py, Dockerfile, docker-compose.yml, requirements.txt, README.md, Prerequisites.md, .gitignore
    - Create src/ directory with __init__.py, app.py, config.py, database.py
    - Create templates/ directory with index.html, admin.html, billing.html
    - Create conf/ directory with deploy.ini, nginx.conf, nginx.conf.template
    - Create scripts/ directory with backup.sh and init_website.sh
    - Create running_skillhub/ directory with nginx.conf for Docker deployment
    - Create docs/ directory with architecture.md
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9_

  - [x] 1.2 Create skillhub directory structure and base assets
    - Create skillhub/index.html (language selector landing page)
    - Create skillhub/404.html (error page with link back to index.html)
    - Create skillhub/assets/css/style.css with OVHcloud branding (#000E9C, #4949FF)
    - Create skillhub/assets/js/ directory (empty JS files as placeholders)
    - Create skillhub/assets/images/ directory
    - Create skillhub/en/ and skillhub/fr/ directory structures mirroring all lesson sections
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 1.3 Set up testing framework
    - Initialize package.json with vitest and fast-check dependencies
    - Create vitest.config.js
    - Create tests/ directory structure (tests/unit/, tests/property/, tests/smoke/, tests/integration/)
    - _Requirements: (testing infrastructure)_

- [x] 2. Implement core JavaScript modules
  - [x] 2.1 Implement i18n.js — Language detection and switching
    - Implement detectLanguage() reading navigator.language/navigator.languages[0]
    - Return 'fr' if browser language starts with 'fr' (case-insensitive), 'en' otherwise
    - Implement selectLanguage(lang) to redirect to language directory
    - Implement switchLanguage(targetLang) to replace /en/ with /fr/ (or vice versa) in current URL path
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

  - [x]* 2.2 Write property test for language detection
    - **Property 1: Language detection correctness**
    - **Validates: Requirements 3.1, 3.2**

  - [x]* 2.3 Write property test for language switch path transformation
    - **Property 2: Language switch path transformation**
    - **Validates: Requirements 3.6**

  - [x] 2.4 Implement navigation.js — Sidebar and routing
    - Implement init(structure, currentPage) to render hierarchical sidebar from LessonStructure data
    - Implement setActive(pagePath) to highlight current page with distinct styling
    - Implement updateCompletionIndicators(progress) to show checkmarks for completed lessons
    - Implement getSequentialNav(currentPage) returning prev/next lesson IDs
    - Implement toggleMobileNav() for hamburger menu at < 768px
    - Render Previous/Next buttons at page bottom; hide at boundaries
    - Collapsible sections: clicking section header expands/collapses children
    - Overlay dismisses on outside click or close button
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [x]* 2.5 Write property test for sequential navigation boundaries
    - **Property 3: Sequential navigation boundaries**
    - **Validates: Requirements 4.4, 4.5, 4.6**

  - [x] 2.6 Implement lessons.js — Progress tracking
    - Implement init() setting up IntersectionObserver on last content element
    - Implement markCompleted(lessonId) storing completion in localStorage under key 'opcp-progress'
    - Implement isCompleted(lessonId) checking localStorage
    - Implement getCompletionPercentage(lang) calculating Math.round((completed/total)*100)
    - Implement getProgressData() returning full ProgressData object
    - Implement reset() clearing all progress data
    - Handle localStorage unavailable: degrade silently, all lessons show incomplete
    - Handle corrupted data: reset to empty state, log warning
    - Handle QuotaExceededError: catch, log warning, continue without persisting
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x]* 2.7 Write property test for completion percentage calculation
    - **Property 4: Completion percentage calculation**
    - **Validates: Requirements 5.2**

  - [x]* 2.8 Write property test for progress data round-trip
    - **Property 5: Progress data round-trip**
    - **Validates: Requirements 5.3**

- [x] 3. Checkpoint - Core modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement search and code highlighting
  - [x] 4.1 Implement search functionality in main.js
    - Implement init(index) to load search index JSON (lazy load on first interaction)
    - Implement search(query) with case-insensitive substring matching, minimum 2 chars
    - Rank results: title matches first, heading matches second, body matches third
    - Limit to maximum 20 results
    - Implement highlight(text, query) wrapping matches in <mark> tags
    - Display "Search unavailable" if index fails to load
    - Display hint for queries < 2 chars
    - Display "No results found" with suggestions for empty results
    - Ensure results appear within 500ms
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

  - [x]* 4.2 Write property test for search correctness
    - **Property 6: Search returns only matching results**
    - **Validates: Requirements 18.1**

  - [x]* 4.3 Write property test for search ordering and limit
    - **Property 7: Search results ordering and limit**
    - **Validates: Requirements 18.2**

  - [x]* 4.4 Write property test for search highlight
    - **Property 8: Search highlight preserves content**
    - **Validates: Requirements 18.3**

  - [x] 4.5 Implement code-highlight.js — Syntax highlighting
    - Implement init() scanning for all <pre><code> elements on page load
    - Apply CSS classes for token types: keywords (blue), strings (green), comments (gray)
    - Implement highlightBlock(block) for individual code block highlighting
    - Add "Copy" button to each code block
    - Implement copyToClipboard(block) using navigator.clipboard.writeText()
    - Show confirmation for 2 seconds on successful copy
    - Fall back to document.execCommand('copy') if clipboard API unavailable
    - Show error notification on copy failure
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

  - [x]* 4.6 Write unit tests for code highlighting and clipboard
    - Test that 3+ distinct token colors are applied
    - Test clipboard content and confirmation display
    - Test fallback behavior when clipboard API unavailable
    - _Requirements: 19.1, 19.3, 19.4_

- [x] 5. Checkpoint - Search and code highlighting
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement CSS styling and responsive design
  - [x] 6.1 Implement style.css with OVHcloud branding and layout
    - Apply OVHcloud primary (#000E9C) and accent (#4949FF) colors to headings, buttons, links, navigation
    - Set content area max-width to 1200px
    - Establish type scale with single font family and uniform spacing
    - Create difficulty badge styles (beginner, intermediate, advanced) with distinct colors
    - Style sidebar navigation with active state, completion indicators
    - Style code blocks with distinct background and border
    - Ensure heading sizes decrease h1 > h2 > h3 > h4
    - Ensure color contrast ratio minimum 4.5:1 for normal text, 3:1 for large text
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 14.3_

  - [x] 6.2 Implement responsive design
    - Add media queries for viewports 320px to 2560px without horizontal scrolling
    - Single-column reflow below 768px
    - Horizontally scrollable containers for wide tables/diagrams below 768px
    - Minimum 44x44px touch targets below 768px
    - Proportional image scaling (minimum 150px width)
    - Hamburger menu styling for mobile navigation
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 7. Create English lesson content
  - [x] 7.1 Create Introduction section lesson pages (EN)
    - Create en/introduction/what-is-opcp.html with real-world analogy, non-technical language
    - Create en/introduction/benefits.html with 3+ business benefits and use cases
    - Create en/introduction/target-audience.html with 3+ audience roles/industry scenarios
    - Create en/introduction/key-features.html with 4+ features, each with visual diagram
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 7.2 Create Getting Started section lesson pages (EN)
    - Create en/getting-started/account-setup.html with annotated screenshots
    - Create en/getting-started/dashboard-access.html with entry point URL, login prerequisites, screenshot
    - Create en/getting-started/navigation.html covering main menu sections
    - Create en/getting-started/initial-configuration.html with non-technical language, terms defined on first use
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 7.3 Create Core Concepts section lesson pages (EN)
    - Create en/core-concepts/node-lifecycle.html with lifecycle diagram and analogy
    - Create en/core-concepts/node-types.html with business-relevant comparisons
    - Create en/core-concepts/resource-allocation.html with visual diagram
    - Create en/core-concepts/network-architecture.html with network topology diagram
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 7.4 Create Technical Operations section lesson pages (EN)
    - Create en/technical-operations/instance-setup.html (workflow steps, no commands)
    - Create en/technical-operations/api-credentials.html (business-context language only)
    - Create en/technical-operations/node-configuration.html with customer-facing impact statements
    - Create en/technical-operations/lacp-trunk-raid.html with analogies and one-sentence summaries
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 7.5 Create Storage Solutions section lesson pages (EN)
    - Create en/storage/cloudstore-overview.html with analogy and use cases
    - Create en/storage/storage-capabilities.html with 3+ capabilities and capacity tiers
    - Create en/storage/data-management.html with visual diagram, terms defined
    - Create en/storage/backup-recovery.html with 2 workflow diagrams (backup + recovery)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 7.6 Create Best Practices section lesson pages (EN)
    - Create en/best-practices/operations-security.html covering operations and security in non-technical language
    - Create en/best-practices/performance-troubleshooting.html with analogies and simplified explanations
    - Create en/best-practices/resources-support.html with 3+ doc links, 2+ support channels, 2+ community resources
    - Create en/best-practices/quick-reference.html with one reference card per section
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 8. Create French lesson content
  - [x] 8.1 Create Introduction section lesson pages (FR)
    - Create fr/introduction/ pages mirroring EN content in French
    - _Requirements: 3.4, 6.1, 6.2, 6.3, 6.4_

  - [x] 8.2 Create Getting Started section lesson pages (FR)
    - Create fr/getting-started/ pages mirroring EN content in French
    - _Requirements: 3.4, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 8.3 Create Core Concepts section lesson pages (FR)
    - Create fr/core-concepts/ pages mirroring EN content in French
    - _Requirements: 3.4, 8.1, 8.2, 8.3, 8.4_

  - [x] 8.4 Create Technical Operations section lesson pages (FR)
    - Create fr/technical-operations/ pages mirroring EN content in French
    - _Requirements: 3.4, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 8.5 Create Storage Solutions section lesson pages (FR)
    - Create fr/storage/ pages mirroring EN content in French
    - _Requirements: 3.4, 10.1, 10.2, 10.3, 10.4_

  - [x] 8.6 Create Best Practices section lesson pages (FR)
    - Create fr/best-practices/ pages mirroring EN content in French
    - _Requirements: 3.4, 11.1, 11.2, 11.3, 11.4_

- [x] 9. Checkpoint - Content complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement accessibility and content presentation
  - [x] 10.1 Add semantic HTML and accessibility attributes to all pages
    - Use semantic HTML5 elements (nav, main, article, section, header, footer)
    - Add alt text (max 150 chars) for informational images, empty alt for decorative
    - Add ARIA labels for navigation landmarks and interactive components
    - Ensure visible focus indicators with 3:1 contrast ratio
    - Ensure tab order follows visual reading sequence
    - Ensure no color-alone meaning (provide secondary cues)
    - _Requirements: 14.1, 14.2, 14.4, 14.5, 14.6, 14.7_

  - [x] 10.2 Add content presentation features
    - Add glossary page reachable within one navigation action from every lesson
    - Visually distinguish glossary terms in lesson text
    - Ensure technical terms are defined on first use (inline or glossary link)
    - Ensure real-world analogies and visual diagrams on each technical lesson page
    - Add step-by-step guides with annotated screenshots for procedural content
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [~] 11. Create search index and lab modules
  - [x] 11.1 Create search-index.json
    - Build JSON search index with entries for all lesson pages
    - Each entry: id, title, headings (h2/h3), body (first 500 chars), path
    - Create for both EN and FR content
    - _Requirements: 18.1, 18.5_

  - [x] 11.2 Create lab module — Dashboard Tour
    - Create labs/lab-01-dashboard-tour/ directory structure
    - Create README.md with prerequisites, software requirements, total step count (max 15)
    - Create lab_config.yaml with title, description, duration_minutes, prerequisites, exercises
    - Create exercises/01-explore-dashboard.py with numbered walkthrough steps
    - Create setup/setup.sh executing with single command, no arguments, with error handling
    - Create solutions/01-solution.py
    - Ensure non-specialist reading level, one action per step with expected outcome
    - _Requirements: 1.8, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [ ]* 11.3 Write property test for bilingual content mirror
    - **Property 9: Bilingual content mirror**
    - **Validates: Requirements 2.7, 3.4**

  - [ ]* 11.4 Write property test for lab configuration schema
    - **Property 10: Lab configuration schema validity**
    - **Validates: Requirements 17.3, 17.7**

  - [ ]* 11.5 Write property test for internal relative paths
    - **Property 11: Internal links use relative paths**
    - **Validates: Requirements 2.8**

- [~] 12. Implement Docker deployment
  - [x] 12.1 Create Dockerfile and docker-compose.yml
    - Write Dockerfile: multi-stage build copying skillhub/ + nginx config, self-contained image
    - Write docker-compose.yml: service definition, port 8080 (configurable via env var)
    - Configure nginx to serve skillhub/ as document root with appropriate MIME types and caching
    - Ensure container responds HTTP 200 on root path within 10 seconds of start
    - Ensure no runtime network fetches required
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ]* 12.2 Write integration tests for Docker deployment
    - Test container builds and starts successfully
    - Test nginx serves static content on port 8080
    - Test HTTP 200 response within 10 seconds
    - _Requirements: 16.1, 16.3, 16.5_

- [~] 13. Wire components together and finalize
  - [x] 13.1 Wire all JavaScript modules in main.js initialization
    - Import and initialize all modules (i18n, navigation, lessons, search, code-highlight)
    - Set up event listeners for search input, navigation clicks, language switch
    - Load lesson structure data and pass to navigation
    - Initialize progress tracker and update navigation indicators on page load
    - Lazy-load search index on first search interaction
    - Ensure all internal links use relative paths
    - _Requirements: 2.8, 3.5, 4.1, 5.3, 18.5_

  - [ ]* 13.2 Write smoke tests for project structure
    - Verify all required root files exist and are non-empty
    - Verify all required directories exist with expected contents
    - Verify all lesson pages exist for both languages
    - Verify lab modules follow required directory structure
    - _Requirements: 1.1-1.9, 2.6, 2.7_

- [~] 14. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The site uses vanilla JavaScript (no framework) as specified in the design
- All content pages must include semantic HTML, accessibility attributes, and responsive design
- French content mirrors English structure exactly (1:1 file mapping)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.4", "2.6"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.5", "2.7", "2.8", "4.1", "4.5"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.6", "6.1"] },
    { "id": 5, "tasks": ["6.2", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 7, "tasks": ["10.1", "10.2", "11.1", "11.2"] },
    { "id": 8, "tasks": ["11.3", "11.4", "11.5", "12.1"] },
    { "id": 9, "tasks": ["12.2", "13.1"] },
    { "id": 10, "tasks": ["13.2"] }
  ]
}
```
