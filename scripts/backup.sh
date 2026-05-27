#!/usr/bin/env bash
#
# OPCP Introduction Skillhub - Backup Utility
#
# Creates a timestamped backup of the skillhub static content
# and configuration files.
#
# Usage: ./scripts/backup.sh [backup_directory]
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${1:-${PROJECT_ROOT}/backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_NAME="opcp-introduction-backup-${TIMESTAMP}"

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

# Ensure backup directory exists
if ! mkdir -p "${BACKUP_DIR}"; then
    log_error "Failed to create backup directory: ${BACKUP_DIR}"
    exit 1
fi

log_info "Starting backup of OPCP Introduction Skillhub..."
log_info "Backup destination: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Verify source directories exist
if [ ! -d "${PROJECT_ROOT}/skillhub" ]; then
    log_error "Skillhub directory not found at: ${PROJECT_ROOT}/skillhub"
    exit 1
fi

# Create backup archive
if tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
    -C "${PROJECT_ROOT}" \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='backups' \
    skillhub/ conf/ running_skillhub/ docker-compose.yml Dockerfile; then
    log_info "Backup created successfully: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    log_info "Backup size: $(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)"
else
    log_error "Backup creation failed"
    exit 1
fi

# Clean up old backups (keep last 5)
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "opcp-introduction-backup-*.tar.gz" | wc -l)
if [ "$BACKUP_COUNT" -gt 5 ]; then
    log_info "Cleaning up old backups (keeping last 5)..."
    find "${BACKUP_DIR}" -name "opcp-introduction-backup-*.tar.gz" | sort | head -n -5 | xargs rm -f
    log_info "Old backups removed"
fi

log_info "Backup complete!"
