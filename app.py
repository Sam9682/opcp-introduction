"""
OPCP Introduction Skillhub - Root Application Entry Point

This is the main entry point for the Flask application scaffolding.
The primary purpose of this project is to serve the static skillhub
training website via Docker/nginx. The Flask app is scaffolding for
potential future admin features.
"""

from src.app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
