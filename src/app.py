"""
OPCP Introduction Skillhub - Flask Application Factory

Provides the create_app() factory function for initializing the Flask
application with appropriate configuration and extensions.
"""

from flask import Flask


def create_app(config_name=None):
    """
    Create and configure the Flask application.

    Args:
        config_name: Optional configuration name ('development', 'production', 'testing')

    Returns:
        Configured Flask application instance
    """
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../skillhub/assets",
    )

    # Load configuration
    if config_name == "testing":
        app.config.from_object("src.config.TestingConfig")
    elif config_name == "production":
        app.config.from_object("src.config.ProductionConfig")
    else:
        app.config.from_object("src.config.DevelopmentConfig")

    # Register routes
    _register_routes(app)

    return app


def _register_routes(app):
    """Register application routes."""

    @app.route("/")
    def index():
        return app.send_static_file("../skillhub/index.html")

    @app.route("/admin")
    def admin():
        from flask import render_template
        return render_template("admin.html")
