"""
OPCP Introduction Skillhub - Flask Configuration

Configuration classes for different environments.
"""

import os


class BaseConfig:
    """Base configuration shared across all environments."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    STATIC_FOLDER = "skillhub/assets"
    TEMPLATES_FOLDER = "templates"


class DevelopmentConfig(BaseConfig):
    """Development environment configuration."""

    DEBUG = True
    TESTING = False


class ProductionConfig(BaseConfig):
    """Production environment configuration."""

    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get("SECRET_KEY")


class TestingConfig(BaseConfig):
    """Testing environment configuration."""

    DEBUG = True
    TESTING = True
