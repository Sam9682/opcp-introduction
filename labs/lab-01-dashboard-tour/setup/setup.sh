#!/bin/bash
# Setup script for Lab 01: Dashboard Tour
# This script verifies that your environment is ready for the lab.
# Usage: bash setup/setup.sh (no arguments required)

set -e

echo "============================================"
echo "Lab 01: Dashboard Tour - Environment Setup"
echo "============================================"
echo ""

# Check Python is available
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed."
    echo "Suggested fix: Install Python 3 from https://www.python.org/downloads/"
    echo "  On Ubuntu/Debian: sudo apt install python3"
    echo "  On macOS: brew install python3"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1)
echo "  Found: $PYTHON_VERSION"
echo ""

# Check that the exercise file exists
echo "Checking exercise files..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(dirname "$SCRIPT_DIR")"

EXERCISE_FILE="$LAB_DIR/exercises/01-explore-dashboard.py"
if [ ! -f "$EXERCISE_FILE" ]; then
    echo "ERROR: Exercise file not found at: $EXERCISE_FILE"
    echo "Suggested fix: Ensure you are running this script from the lab directory."
    echo "  Expected location: labs/lab-01-dashboard-tour/setup/setup.sh"
    exit 1
fi
echo "  Found: exercises/01-explore-dashboard.py"
echo ""

# Check that the exercise file is valid Python
echo "Validating exercise file syntax..."
if ! python3 -c "import py_compile; py_compile.compile('$EXERCISE_FILE', doraise=True)" 2>/dev/null; then
    echo "ERROR: Exercise file has syntax errors."
    echo "Suggested fix: Re-download the lab files or check for file corruption."
    exit 1
fi
echo "  Syntax OK"
echo ""

# Verify web browser availability (informational only)
echo "Checking for web browser..."
BROWSER_FOUND=false
for browser in xdg-open open firefox google-chrome chromium; do
    if command -v "$browser" &> /dev/null; then
        echo "  Found browser command: $browser"
        BROWSER_FOUND=true
        break
    fi
done

if [ "$BROWSER_FOUND" = false ]; then
    echo "  WARNING: No browser command detected."
    echo "  You will need a web browser to complete this lab."
    echo "  Please ensure you have Chrome, Firefox, Edge, or Safari available."
    echo ""
fi

echo ""
echo "============================================"
echo "Setup complete! Your environment is ready."
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Run the exercise: python3 exercises/01-explore-dashboard.py"
echo "  2. Follow the numbered steps displayed on screen."
echo "  3. Have your OVHcloud login credentials ready."
echo ""
