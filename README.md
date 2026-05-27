# OPCP Introduction Skillhub

A static training website designed to educate non-technical personnel (sales team, business stakeholders, project managers) on OVHcloud's Hosted Private Cloud (OPCP) service.

## Overview

This skillhub provides bilingual (EN/FR) learning content with:
- Simplified explanations using real-world analogies
- Visual aids and diagrams
- Client-side progress tracking
- Responsive design for all devices
- Docker/nginx deployment

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- See [Prerequisites.md](Prerequisites.md) for detailed requirements

### Running the Skillhub

```bash
# Start the skillhub (accessible at http://localhost:8080)
docker-compose up

# Start in detached mode
docker-compose up -d

# Use a custom port
SKILLHUB_PORT=9090 docker-compose up
```

### Stopping

```bash
docker-compose down
```

## Project Structure

```
opcp-introduction/
├── app.py                  # Flask entry point (scaffolding)
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Service definition (port 8080)
├── requirements.txt        # Python dependencies
├── src/                    # Flask application scaffolding
├── templates/              # Flask templates
├── conf/                   # nginx configuration files
├── scripts/                # Deployment helper scripts
├── running_skillhub/       # Docker-specific nginx config
├── skillhub/               # Static training website
├── labs/                   # Demonstration lab modules
└── docs/                   # Project documentation
```

## Development

The static site is served by nginx within a Docker container. For local development without Docker, you can serve the `skillhub/` directory with any static file server:

```bash
# Using Python's built-in server
cd skillhub && python -m http.server 8080
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## License

Internal OVHcloud training material.
