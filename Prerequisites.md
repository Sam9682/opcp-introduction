# Prerequisites

## Required Software

Before running the OPCP Introduction Skillhub, ensure you have the following installed:

### Docker

- **Docker Engine** version 20.10 or later
- **Docker Compose** version 2.0 or later (or docker-compose v1.29+)

#### Installation

- **Linux**: Follow the [official Docker installation guide](https://docs.docker.com/engine/install/)
- **macOS**: Install [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

### Verify Installation

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Verify Docker is running
docker info
```

## Optional (Development)

For local development without Docker:

- **Python 3.11+** (for Flask scaffolding)
- **Node.js 18+** (for running tests)
- **npm** or **yarn** (for package management)

## Network Requirements

- Port 8080 must be available (or configure a custom port via `SKILLHUB_PORT` environment variable)
- No internet connection required once the Docker image is built (fully self-contained)

## Hardware Requirements

- Minimum 512MB RAM available for the Docker container
- Approximately 100MB disk space for the Docker image
