"""Decorators de autorização por perfil de usuário."""
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request

# Mapeamento de papel singular -> plural correto em português
_PLURAIS = {
    "aluno": "alunos",
    "professor": "professores",
}


def _check_papel(papel_requerido: str):
    """Fábrica de decorators que exigem um papel específico."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("papel") != papel_requerido:
                plural = _PLURAIS.get(papel_requerido, papel_requerido + "s")
                return jsonify({
                    "error": f"Acesso restrito a {plural}",
                    "code": "INSUFFICIENT_PERMISSION",
                }), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


# Decorators prontos para usar
aluno_required = _check_papel("aluno")
professor_required = _check_papel("professor")
