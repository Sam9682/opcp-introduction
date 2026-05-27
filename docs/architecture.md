# Architecture Documentation

## OPCP Introduction Skillhub

### Overview

The OPCP Introduction Skillhub is a static training website served via Docker/nginx. It provides bilingual (EN/FR) learning content for non-technical personnel about OVHcloud's Hosted Private Cloud (OPCP) service.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                 nginx (port 80)                     │ │
│  │                                                    │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │           Static Files (skillhub/)           │ │ │
│  │  │                                              │ │ │
│  │  │  ┌─────────┐  ┌─────────┐  ┌────────────┐ │ │ │
│  │  │  │  HTML   │  │  CSS/JS │  │   Images   │ │ │ │
│  │  │  │  Pages  │  │  Assets │  │  Diagrams  │ │ │ │
│  │  │  └─────────┘  └─────────┘  └────────────┘ │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
         │
         │ HTTP :8080 (configurable)
         ▼
┌─────────────────┐
│    Browser      │
│                 │
│  ┌───────────┐  │
│  │localStorage│  │
│  │ (progress)│  │
│  └───────────┘  │
└─────────────────┘
```

### Components

#### 1. Static Website (skillhub/)

The core training content is a pure client-side HTML/CSS/JavaScript application:

- **Language Selector** (`index.html`): Landing page with browser language detection
- **Lesson Pages** (`en/`, `fr/`): Bilingual content organized by section
- **Assets** (`assets/`): CSS, JavaScript, and images
- **Error Page** (`404.html`): Custom error page with navigation back to home

#### 2. Client-Side JavaScript Modules

| Module | Responsibility |
|--------|---------------|
| `i18n.js` | Language detection and switching |
| `navigation.js` | Sidebar menu, routing, responsive behavior |
| `lessons.js` | Progress tracking via localStorage |
| `main.js` | App initialization, search engine |
| `code-highlight.js` | Syntax highlighting for code blocks |

#### 3. Docker/nginx Deployment

- **Dockerfile**: Multi-stage build (Python builder + nginx production)
- **docker-compose.yml**: Service definition with configurable port (default 8080)
- **nginx.conf**: Static file serving with caching, compression, and security headers

#### 4. Flask Scaffolding (src/)

Placeholder for potential future admin features. Not used in production deployment.

#### 5. Lab Modules (labs/)

Guided demonstration exercises for hands-on learning.

### Data Flow

1. User accesses `http://localhost:8080`
2. nginx serves `index.html` (language selector)
3. User selects language → redirected to `en/` or `fr/`
4. JavaScript modules initialize:
   - Navigation renders sidebar from lesson structure
   - Progress tracker restores state from localStorage
   - Search index loads on first search interaction
5. User navigates lessons; progress saved to localStorage

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| Static site (no SSR) | Simplifies deployment, works offline once loaded |
| localStorage for state | No user accounts needed, privacy preserved |
| Client-side search | No search server required, fast response |
| Directory-based i18n | Avoids runtime translation complexity |
| Docker/nginx serving | Consistent deployment across environments |

### Security Considerations

- Content Security Policy headers restrict resource loading
- No server-side processing reduces attack surface
- Hidden files and backup files are denied by nginx
- X-Frame-Options prevents clickjacking
- No external CDN dependencies (fully self-contained)
