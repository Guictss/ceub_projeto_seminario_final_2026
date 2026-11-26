"""Factory da aplicação Flask — Projeto Vela Para Todos."""
import os

from flask import Flask, jsonify

from config import config_by_name
from extensions import cors, db, jwt, limiter, migrate


def create_app(config_name: str | None = None) -> Flask:
    """Application factory. Cria e configura a instância do Flask."""
    config_name = config_name or os.getenv("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # ── Inicializa extensões ────────────────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    # ── Registro de blueprints ──────────────────────────────────────────────
    from routes.aulas import aulas_bp
    from routes.auth import auth_bp, check_if_token_revoked
    from routes.dashboard import dashboard_bp
    from routes.doacoes import doacoes_bp
    from routes.inscricoes import inscricoes_aula_bp, inscricoes_bp
    from routes.noticias import noticias_bp
    from routes.relatorios import relatorios_bp
    from routes.usuarios import usuarios_bp
    from routes.voluntarios import voluntarios_bp

    api = app.config["API_PREFIX"]
    app.register_blueprint(auth_bp, url_prefix=f"{api}/auth")
    app.register_blueprint(aulas_bp, url_prefix=f"{api}/aulas")
    app.register_blueprint(inscricoes_bp, url_prefix=f"{api}/inscricoes")
    app.register_blueprint(inscricoes_aula_bp, url_prefix=f"{api}/aulas")
    app.register_blueprint(noticias_bp, url_prefix=f"{api}/noticias")
    app.register_blueprint(doacoes_bp, url_prefix=f"{api}/doacoes")
    app.register_blueprint(voluntarios_bp, url_prefix=f"{api}/voluntarios")
    app.register_blueprint(relatorios_bp, url_prefix=f"{api}/relatorios")
    app.register_blueprint(usuarios_bp, url_prefix="/api/v1/usuarios")
    app.register_blueprint(dashboard_bp, url_prefix=f"{api}/dashboard")

    # Conecta o verificador de blocklist ao JWTManager
    jwt.token_in_blocklist_loader(check_if_token_revoked)

    # ── Health check ────────────────────────────────────────────────────────
    @app.route("/health")
    def health():
        from sqlalchemy import text
        try:
            db.session.execute(text("SELECT 1"))
            db_status = "connected"
        except Exception:
            db_status = "disconnected"
        return jsonify({
            "status": "healthy" if db_status == "connected" else "unhealthy",
            "db": db_status,
            "version": "1.0.0",
        }), 200 if db_status == "connected" else 503

    # ── Endpoint raiz da API ────────────────────────────────────────────────
    @app.route("/api/v1")
    def api_info():
        return jsonify({
            "name": "Vela Para Todos API",
            "version": "1.0.0",
            "docs": "/apidocs",
        })

    # ── Tratamento global de erros ──────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Recurso não encontrado", "code": "RESOURCE_NOT_FOUND"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Erro interno do servidor", "code": "INTERNAL_ERROR"}), 500

    return app


# Executa a aplicação quando chamado diretamente (python app.py)
if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
