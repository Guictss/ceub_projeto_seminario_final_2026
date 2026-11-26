"""Configurações da aplicação Flask por ambiente."""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


def _normalizar_database_url(url: str) -> str:
    """Normaliza a DATABASE_URL para o formato esperado pelo SQLAlchemy 2+."""
    
    if not url:
        return url
    # postgres:// → postgresql:// (Render/Heroku legacy)
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    # postgresql:// → postgresql+psycopg2:// (driver explícito)
    if url.startswith("postgresql://") and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


class BaseConfig:
    """Configurações compartilhadas por todos os ambientes."""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-change-me")

    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI = _normalizar_database_url(
        os.getenv("DATABASE_URL", "sqlite:///vela.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,  # testa conexão antes de usar
    }

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 604800))
    )
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

    # API
    API_PREFIX = "/api/v1"


class DevelopmentConfig(BaseConfig):
    """Desenvolvimento local — debug habilitado, erros detalhados."""
    DEBUG = True
    TESTING = False


class TestingConfig(BaseConfig):
    """Para rodar pytest — banco em memória."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-key-com-pelo-menos-32-bytes-pra-silenciar-warning"
    WTF_CSRF_ENABLED = False
    RATELIMIT_ENABLED = False


class ProductionConfig(BaseConfig):
    """Produção — debug desabilitado, erros genéricos."""
    DEBUG = False
    TESTING = False

    SECRET_KEY = os.environ.get("SECRET_KEY", "")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    SQLALCHEMY_DATABASE_URI = _normalizar_database_url(
        os.environ.get("DATABASE_URL", "")
    )


# Mapeamento usado pelo app.py para selecionar a config correta
config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
