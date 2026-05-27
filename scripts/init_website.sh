#!/usr/bin/env bash
#
# OPCP Introduction Skillhub - Website Initialization Script
#
# Initializes the skillhub website for first-time deployment.
# Verifies prerequisites, builds the Docker image, and starts the container.
#
# Usage: ./scripts/init_website.sh
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONTAINER_NAME="opcp-introduction-skillhub"
DEFAULT_PORT="${SKILLHUB_PORT:-8080}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        log_error "See: https://docs.docker.com/engine/install/"
        exit 1
    fi

    # Check Docker Compose
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose."
        log_error "See: https://docs.docker.com/compose/install/"
        exit 1
    fi

    # Check Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi

    # Check port availability
    if command -v ss &> /dev/null; then
        if ss -tlnp | grep -q ":${DEFAULT_PORT} "; then
            log_warn "Port ${DEFAULT_PORT} is already in use."
            log_warn "Set SKILLHUB_PORT environment variable to use a different port."
            log_warn "Example: SKILLHUB_PORT=9090 ./scripts/init_website.sh"
        fi
    fi

    log_info "All prerequisites met!"
}

# Build and start the container
start_website() {
    log_info "Building and starting the OPCP Introduction Skillhub..."

    cd "${PROJECT_ROOT}"

    # Stop existing container if running
    if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        log_info "Stopping existing container..."
        docker compose down
    fi

    # Build and start
    if docker compose up -d --build; then
        log_info "Container started successfully!"
    else
        log_error "Failed to start the container. Check Docker logs for details."
        log_error "Run: docker compose logs"
        exit 1
    fi

    # Wait for health check
    log_info "Waiting for the website to become available..."
    local retries=10
    local wait_time=1

    for i in $(seq 1 $retries); do
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${DEFAULT_PORT}" | grep -q "200"; then
            log_info "Website is ready!"
            log_info "Access the skillhub at: http://localhost:${DEFAULT_PORT}"
            return 0
        fi
        sleep $wait_time
    done

    log_warn "Website may not be fully ready yet. Check: http://localhost:${DEFAULT_PORT}"
}

# Main execution
main() {
    log_info "=== OPCP Introduction Skillhub - Initialization ==="
    echo ""

    check_prerequisites
    echo ""
    start_website

    echo ""
    log_info "=== Initialization Complete ==="
    log_info "Skillhub URL: http://localhost:${DEFAULT_PORT}"
    log_info "To stop: docker compose down"
    log_info "To view logs: docker compose logs -f"
}

main "$@"
