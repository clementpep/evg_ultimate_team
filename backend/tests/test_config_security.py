import pytest
from pydantic import ValidationError

from app.config import Settings, _DEFAULT_SECRET_KEY, _DEFAULT_ADMIN_PASSWORD


def _make(**overrides):
    # _env_file=None isolates the test from any local .env file.
    return Settings(_env_file=None, **overrides)


def test_production_rejects_default_secret_key():
    with pytest.raises((ValidationError, ValueError)):
        _make(environment="production", admin_password="real-admin-pw")


def test_production_rejects_default_admin_password():
    with pytest.raises((ValidationError, ValueError)):
        _make(environment="production", secret_key="a-real-secret-key")


def test_production_accepts_overridden_secrets():
    settings = _make(
        environment="production",
        secret_key="a-real-secret-key",
        admin_password="real-admin-pw",
    )
    assert settings.environment == "production"
    assert settings.secret_key == "a-real-secret-key"


def test_development_allows_defaults():
    settings = _make(environment="development")
    assert settings.secret_key == _DEFAULT_SECRET_KEY
    assert settings.admin_password == _DEFAULT_ADMIN_PASSWORD
