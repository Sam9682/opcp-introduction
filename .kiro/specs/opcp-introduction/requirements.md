# Requirements Document

## Introduction

This document defines the requirements for the OPCP Introduction training website — a static skillhub designed to educate non-technical personnel (sales team, business stakeholders, project managers) on OVHcloud's Hosted Private Cloud (OPCP) service. The website provides bilingual (EN/FR) learning content with simplified explanations, visual aids, and progress tracking, served via Docker/nginx following the established opcp-openstack-first-steps project structure.

## Glossary

- **Skillhub**: The static HTML/CSS/JS training website served by nginx, containing lesson pages organized by language
- **OPCP**: OVHcloud's Hosted Private Cloud service (the subject matter being taught)
- **Lesson_Page**: An individual HTML file representing a single learning topic within the skillhub
- **Navigation_System**: The sidebar and menu components that allow users to browse and access lesson pages
- **Progress_Tracker**: The localStorage-based system that records which lessons a user has completed
- **Language_Selector**: The landing page component that detects or allows selection of the user's preferred language (EN/FR)
- **Lab_Module**: A Python-based demonstration/walkthrough exercise within the labs directory structure
- **CloudStore**: OVHcloud's storage solution covered in the training content
- **Node**: A compute resource unit within the OPCP infrastructure

## Requirements

### Requirement 1: Project Structure

**User Story:** As a developer, I want the project to follow the established opcp-openstack-first-steps structure, so that deployment and maintenance remain consistent across training projects.

#### Acceptance Criteria

1. THE Skillhub SHALL include a root directory containing the following files: app.py, Dockerfile, docker-compose.yml, requirements.txt, README.md, Prerequisites.md, and .gitignore, where each file exists and is non-empty
2. THE Skillhub SHALL include a src/ directory containing Flask application files: app.py, config.py, database.py, and __init__.py
3. THE Skillhub SHALL include a templates/ directory containing Flask templates: index.html, admin.html, and billing.html
4. THE Skillhub SHALL include a conf/ directory containing nginx configuration files: deploy.ini, nginx.conf, and nginx.conf.template
5. THE Skillhub SHALL include a scripts/ directory containing shell scripts: backup.sh and init_website.sh
6. THE Skillhub SHALL include a running_skillhub/ directory containing an nginx.conf file for Docker deployment
7. THE Skillhub SHALL include a skillhub/ directory containing the static training website files including at least one HTML file
8. THE Skillhub SHALL include a labs/ directory containing at least one Python file (.py extension) serving as a demonstration module
9. THE Skillhub SHALL include a docs/ directory containing at least one documentation file

### Requirement 2: Static Website Core Structure

**User Story:** As a developer, I want the skillhub to follow the established static site structure, so that it integrates with the existing deployment pipeline.

#### Acceptance Criteria

1. THE Skillhub SHALL contain an index.html file serving as the language selector landing page
2. THE Skillhub SHALL contain a 404.html error page that provides a navigation link back to the index.html landing page
3. THE Skillhub SHALL contain an assets/css/style.css stylesheet
4. THE Skillhub SHALL contain JavaScript files in assets/js/ including lessons.js, i18n.js, navigation.js, code-highlight.js, and main.js
5. THE Skillhub SHALL contain an assets/images/ directory for visual content
6. THE Skillhub SHALL contain an en/ directory with English Lesson_Pages as individual HTML files, one per topic defined in Requirements 6 through 11
7. THE Skillhub SHALL contain a fr/ directory with French Lesson_Pages as individual HTML files, mirroring the en/ directory structure one-to-one
8. THE Skillhub SHALL use only relative paths for all internal links and asset references so that the site is servable by nginx as static files without server-side processing

### Requirement 3: Bilingual Support

**User Story:** As a sales team member, I want to access training content in English or French, so that I can learn in my preferred language.

#### Acceptance Criteria

1. WHEN a user first visits the Skillhub, THE Language_Selector SHALL detect the browser's preferred language and, if it matches EN or FR, pre-select that language option on the landing page
2. IF the browser's preferred language is neither EN nor FR, THEN THE Language_Selector SHALL default to English as the pre-selected language option
3. WHEN a user selects a language on the landing page, THE Language_Selector SHALL redirect the user to the corresponding language directory
4. THE Skillhub SHALL provide equivalent content in both English and French for every Lesson_Page, maintaining the same lesson structure and topic coverage in both language directories
5. THE Navigation_System SHALL display a language switch control on every Lesson_Page allowing the user to toggle between EN and FR
6. WHEN a user switches language via the language switch control, THE Navigation_System SHALL navigate to the same Lesson_Page in the selected language directory, preserving the user's current lesson selection

### Requirement 4: Navigation and Menu System

**User Story:** As a non-technical user, I want clear and intuitive navigation, so that I can easily find and access training content.

#### Acceptance Criteria

1. THE Navigation_System SHALL display a sidebar menu listing all available sections and lesson pages in hierarchical order, with sections as collapsible parent items and individual Lesson_Pages as child items
2. THE Navigation_System SHALL visually distinguish the currently active Lesson_Page from all other items in the sidebar using a distinct background color or font weight
3. WHEN a user completes a Lesson_Page, THE Navigation_System SHALL display a visual completion indicator next to that lesson in the sidebar
4. THE Navigation_System SHALL provide Previous and Next buttons at the bottom of each Lesson_Page for sequential navigation
5. IF the current Lesson_Page is the first in the sequence, THEN THE Navigation_System SHALL hide or disable the Previous button
6. IF the current Lesson_Page is the last in the sequence, THEN THE Navigation_System SHALL hide or disable the Next button
7. WHEN the viewport width is below 768 pixels, THE Navigation_System SHALL collapse the sidebar into a hamburger menu
8. WHEN a user activates the hamburger menu, THE Navigation_System SHALL display the full navigation as an overlay
9. WHEN a user taps outside the overlay or activates a close button, THE Navigation_System SHALL dismiss the navigation overlay

### Requirement 5: Progress Tracking

**User Story:** As a sales team member, I want my learning progress to be tracked, so that I can resume where I left off and see what I have completed.

#### Acceptance Criteria

1. WHEN a user scrolls to the bottom of a Lesson_Page content area such that the last content element is visible in the viewport, THE Progress_Tracker SHALL mark that lesson as completed in localStorage
2. THE Progress_Tracker SHALL display an overall completion percentage on the sidebar, calculated as the number of completed lessons divided by the total number of lessons in the currently selected language, rounded to the nearest whole number
3. WHEN a user returns to the Skillhub, THE Progress_Tracker SHALL restore the user's previous completion state from localStorage
4. THE Progress_Tracker SHALL visually distinguish completed lessons from incomplete lessons in the Navigation_System by displaying a checkmark icon next to each completed lesson
5. IF localStorage is unavailable or the stored progress data cannot be parsed, THEN THE Progress_Tracker SHALL display all lessons as incomplete and allow the user to continue using the Skillhub without progress persistence

### Requirement 6: Introduction Section Content

**User Story:** As a sales team member, I want to understand what OPCP is and its value proposition, so that I can effectively communicate it to customers.

#### Acceptance Criteria

1. THE Skillhub SHALL provide a Lesson_Page explaining what OPCP is using non-technical language and at least one real-world analogy that relates cloud infrastructure concepts to everyday experiences
2. THE Skillhub SHALL provide a Lesson_Page listing at least 3 business benefits of OPCP, each accompanied by a use case that identifies a business problem and describes how OPCP addresses it
3. THE Skillhub SHALL provide a Lesson_Page describing the target audience segments and recommended use cases for OPCP, identifying at least 3 audience roles or industry scenarios
4. THE Skillhub SHALL provide a Lesson_Page presenting at least 4 features of OPCP, each accompanied by at least one visual diagram illustrating the feature

### Requirement 7: Getting Started Guide Content

**User Story:** As a sales team member, I want to understand the onboarding process for OPCP, so that I can guide customers through initial setup conversations.

#### Acceptance Criteria

1. THE Skillhub SHALL provide a Lesson_Page describing the account setup process with at least 1 annotated screenshot per major step, where each screenshot includes visual callouts identifying the relevant interface elements
2. THE Skillhub SHALL provide a Lesson_Page explaining how to access the OPCP dashboard, including the entry point URL location, login prerequisites, and at least 1 annotated screenshot of the dashboard landing view
3. THE Skillhub SHALL provide a Lesson_Page covering navigation within the OPCP interface, identifying the main menu sections, how to move between sections, and how to return to the dashboard
4. THE Skillhub SHALL provide a Lesson_Page outlining initial configuration steps where each step uses non-technical language suitable for the target audience and defines any OPCP-specific terms on first use
5. IF a Lesson_Page in the Getting Started Guide uses a technical term specific to OPCP, THEN THE Skillhub SHALL provide a definition or analogy for that term within the same page

### Requirement 8: Core Concepts Content

**User Story:** As a sales team member, I want to understand OPCP core concepts, so that I can answer customer questions about infrastructure capabilities.

#### Acceptance Criteria

1. THE Skillhub SHALL provide a Lesson_Page explaining the Node lifecycle that covers at minimum the stages of provisioning, configuration, operation, and decommissioning, using at least one visual diagram depicting the stage transitions and at least one real-world analogy
2. THE Skillhub SHALL provide a Lesson_Page describing available Node types that includes for each type a summary of its compute specifications (CPU, RAM, storage) expressed in business-relevant comparisons (e.g., workload suitability) rather than raw technical metrics alone
3. THE Skillhub SHALL provide a Lesson_Page covering resource allocation concepts including CPU, RAM, and storage assignment, explaining how resources are requested and distributed using at least one visual diagram
4. THE Skillhub SHALL provide a Lesson_Page explaining network architecture basics covering connectivity between Nodes, public and private network separation, and bandwidth concepts, using at least one visual diagram illustrating the network topology

### Requirement 9: Technical Operations Content

**User Story:** As a sales team member, I want a high-level understanding of technical operations, so that I can set appropriate expectations with customers.

#### Acceptance Criteria

1. THE Skillhub SHALL provide a Lesson_Page explaining instance setup procedures that describes the end-to-end workflow steps without requiring the reader to execute commands or interpret code
2. THE Skillhub SHALL provide a Lesson_Page covering API usage and credential management that explains what APIs enable, how credentials are obtained, and how they are rotated, using only business-context language without referencing specific endpoints or code syntax
3. THE Skillhub SHALL provide a Lesson_Page describing Node configuration options and their business implications, where each configuration option is paired with at least one customer-facing impact statement explaining how it affects service availability, performance, or cost
4. THE Skillhub SHALL provide a Lesson_Page explaining LACP, Trunk, and Software RAID concepts, where each concept includes at least one analogy mapping the technical mechanism to a familiar non-technical domain and a one-sentence summary of when a customer would need it
5. IF a Lesson_Page in the Technical Operations section contains implementation-specific syntax, CLI commands, or raw API calls, THEN THE Skillhub SHALL NOT display that page until the content is revised to present the information as conceptual descriptions only

### Requirement 10: Storage Solutions Content

**User Story:** As a sales team member, I want to understand CloudStore capabilities, so that I can discuss storage options with customers.

#### Acceptance Criteria

1. THE Skillhub SHALL provide a Lesson_Page presenting a CloudStore overview that includes at least one real-world analogy, a description of what CloudStore is, and a summary of customer-relevant use cases
2. THE Skillhub SHALL provide a Lesson_Page describing at least three storage capabilities (such as scalability, redundancy, or access methods) and listing available capacity tiers or ranges in business-relevant terms
3. THE Skillhub SHALL provide a Lesson_Page covering data management practices using language appropriate for non-technical audiences, defining all technical terms on first use and including at least one visual diagram illustrating data lifecycle or organization
4. THE Skillhub SHALL provide a Lesson_Page explaining backup and recovery concepts that includes at least two visual workflow diagrams showing the backup process and the recovery process respectively

### Requirement 11: Best Practices and Resources Content

**User Story:** As a sales team member, I want access to best practices and support resources, so that I can provide informed guidance to customers.

#### Acceptance Criteria

1. THE Skillhub SHALL provide a Lesson_Page covering operational guidelines for OPCP usage (including resource management, monitoring, and maintenance practices) and security considerations (including access control, data protection, and compliance awareness), presented using non-technical language
2. THE Skillhub SHALL provide a Lesson_Page describing performance optimization strategies and common troubleshooting scenarios, using real-world analogies and simplified explanations without requiring technical expertise to understand
3. THE Skillhub SHALL provide a Lesson_Page listing at least 3 documentation links, at least 2 support channels, and at least 2 community resources, where each entry includes a title, a brief description of what it provides, and a hyperlink to the resource
4. THE Skillhub SHALL provide a Lesson_Page presenting one quick reference card per skillhub content section (Introduction, Getting Started, Core Concepts, Technical Operations, Storage Solutions, and Best Practices), where each card summarizes the section's main topics, terminology, and customer-relevant talking points

### Requirement 12: Visual Design and Branding

**User Story:** As a sales team member, I want the training site to look professional and consistent with OVHcloud branding, so that it feels like an official resource.

#### Acceptance Criteria

1. THE Skillhub SHALL apply OVHcloud primary color (#000E9C) and accent color (#4949FF) to all branded elements including headings, buttons, links, and navigation components
2. THE Skillhub SHALL display a layout with a defined content area no wider than 1200px, a persistent navigation menu, distinct page sections separated by spacing, and heading sizes that decrease from h1 to h4 to establish visual hierarchy
3. THE Skillhub SHALL display a difficulty badge on each lesson indicating one of three levels (beginner, intermediate, advanced), where each level is visually distinct from the others through a unique color or icon
4. THE Skillhub SHALL use a single font family, a defined type scale, and uniform spacing values across all pages so that no page deviates in typography or component styling from the established design

### Requirement 13: Responsive Design

**User Story:** As a sales team member, I want to access training content on any device, so that I can learn on my laptop, tablet, or phone.

#### Acceptance Criteria

1. THE Skillhub SHALL render on viewports from 320 pixels to 2560 pixels wide without horizontal scrolling, without content overflow beyond the viewport edge, and without text truncation
2. WHEN the viewport width is below 768 pixels, THE Skillhub SHALL reflow content into a single-column layout
3. IF content cannot reflow into a single column at viewports below 768 pixels (such as wide tables or diagrams), THEN THE Skillhub SHALL provide a horizontally scrollable container for that element while keeping the rest of the page in single-column layout
4. WHILE the viewport width is below 768 pixels, THE Skillhub SHALL ensure all interactive elements have a minimum touch target size of 44x44 pixels
5. THE Skillhub SHALL scale images and diagrams proportionally to fit the available viewport width without reducing them below 150 pixels in width

### Requirement 14: Accessibility

**User Story:** As a user with disabilities, I want the training site to be accessible, so that I can consume the content using assistive technologies.

#### Acceptance Criteria

1. THE Skillhub SHALL use semantic HTML5 elements (nav, main, article, section, header, footer) for page structure
2. THE Skillhub SHALL provide alt text of no more than 150 characters for all informational images and diagrams, and an empty alt attribute for decorative images
3. THE Skillhub SHALL ensure a minimum color contrast ratio of 4.5:1 for normal text and 3:1 for large text (defined as text at or above 18pt, or bold text at or above 14pt)
4. THE Skillhub SHALL support keyboard navigation for all interactive elements with a visible focus indicator and a tab order that follows the visual reading sequence of the page
5. THE Skillhub SHALL include ARIA labels for navigation landmarks and interactive components including buttons, links, form inputs, and modal dialogs
6. WHEN an interactive element receives keyboard focus, THE Skillhub SHALL display a focus indicator with a minimum contrast ratio of 3:1 against adjacent colors
7. THE Skillhub SHALL not rely on color alone to convey meaning, providing a secondary visual cue such as text labels, patterns, or icons alongside color-coded information

### Requirement 15: Content Presentation for Non-Technical Audience

**User Story:** As a non-technical user, I want content presented in simple, engaging ways, so that I can understand complex cloud concepts without a technical background.

#### Acceptance Criteria

1. THE Skillhub SHALL use real-world analogies to explain technical concepts on each Lesson_Page
2. THE Skillhub SHALL include at least one visual diagram or illustration on each Lesson_Page that covers a technical concept
3. THE Skillhub SHALL provide a glossary of terms reachable within one navigation action (single click or tap) from every Lesson_Page
4. THE Skillhub SHALL use step-by-step guides with annotated screenshots for procedural content
5. THE Skillhub SHALL define all technical terms on first use within each Lesson_Page by providing an inline definition or a link to the corresponding glossary entry
6. WHEN a Lesson_Page contains a technical term listed in the glossary, THE Skillhub SHALL visually distinguish that term from surrounding text to indicate that a definition is available

### Requirement 16: Docker Deployment

**User Story:** As a developer, I want the site to be deployable via Docker, so that it can be consistently served in any environment.

#### Acceptance Criteria

1. WHEN the developer runs `docker-compose up` from the project root directory, THE Skillhub SHALL build the image and start the container without requiring any prior manual setup steps beyond having Docker and Docker Compose installed
2. THE Skillhub SHALL serve all static content (HTML, CSS, JavaScript, and assets) through nginx within the Docker container
3. WHEN the Docker container starts, THE Skillhub SHALL be accessible via HTTP on port 8080 by default, with the port configurable through the docker-compose.yml file
4. THE Skillhub SHALL include a Dockerfile that produces a self-contained image including the nginx server and all static site files, requiring no runtime network fetches to serve content
5. WHEN the Docker container is running, THE Skillhub SHALL respond with an HTTP 200 status code on the root path within 10 seconds of container start

### Requirement 17: Lab Modules (Demonstration-Oriented)

**User Story:** As a sales team member, I want guided demonstrations of OPCP features, so that I can see the product in action without needing technical skills.

#### Acceptance Criteria

1. THE Lab_Module SHALL follow the established structure with modules containing README.md, exercises/, setup/, and solutions/ directories
2. THE Lab_Module SHALL provide walkthrough-style demonstrations consisting of numbered steps where each step describes an action to observe or a pre-built script to execute, rather than requiring the user to write or modify code
3. THE Lab_Module SHALL include configuration via a YAML file named lab_config.yaml specifying at minimum the module title, description, estimated duration in minutes, prerequisite modules (if any), and the ordered list of exercise files
4. THE Lab_Module SHALL provide step-by-step instructions written at a non-specialist reading level, using no undefined technical jargon and limiting each step to one action with an expected outcome statement describing what the user should observe upon success
5. WHEN a Lab_Module requires technical commands, THE Lab_Module SHALL provide pre-built scripts in the setup/ directory that execute with a single command invocation requiring no arguments
6. IF a pre-built script fails during execution, THEN THE Lab_Module SHALL display an error message indicating the failure reason and a suggested remediation action
7. THE Lab_Module SHALL specify in its README.md the prerequisites (software and access credentials) required before starting the demonstration, and the total number of steps SHALL NOT exceed 15 per exercise

### Requirement 18: Search Functionality

**User Story:** As a sales team member, I want to search for specific topics, so that I can quickly find relevant information during customer conversations.

#### Acceptance Criteria

1. WHEN a user enters a search query of at least 2 characters, THE Skillhub SHALL display matching lesson pages and content sections where a match is defined as a case-insensitive substring occurrence in the page title, heading, or body text
2. WHEN search results are returned, THE Skillhub SHALL display results ordered by relevance with matches in page titles ranked above matches in body text, showing a maximum of 20 results
3. WHEN search results are displayed, THE Skillhub SHALL visually highlight the search terms within the displayed result text
4. WHEN no results match the search query, THE Skillhub SHALL display a message indicating no results were found and suggesting the user try shorter keywords or check spelling
5. THE Skillhub SHALL perform search operations client-side without requiring a server backend
6. WHEN a user submits a search query, THE Skillhub SHALL display results within 500 milliseconds of query submission

### Requirement 19: Code Syntax Highlighting

**User Story:** As a sales team member viewing technical examples, I want code snippets to be visually formatted, so that I can distinguish code from regular text.

#### Acceptance Criteria

1. THE Skillhub SHALL apply CSS-based syntax highlighting to all code blocks within Lesson_Pages, rendering at least 3 visually distinct colors for different token types (keywords, strings, comments)
2. THE Skillhub SHALL visually distinguish code blocks from surrounding content using a background color that differs from the page background and a visible border on at least one side
3. WHEN the user activates the copy-to-clipboard button on a code block, THE Skillhub SHALL copy the full text content of that code block to the system clipboard and display a confirmation indicator for at least 2 seconds
4. IF the clipboard operation fails, THEN THE Skillhub SHALL display a notification indicating the copy action was unsuccessful
