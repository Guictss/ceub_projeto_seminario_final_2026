"""Helpers de paginação para listagens da API."""
from flask import request


def paginate(query, schema, endpoint: str, **endpoint_kwargs):
    """Aplica paginação a uma query SQLAlchemy e retorna dict padronizado."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return {
        "data": schema.dump(pagination.items, many=True),
        "meta": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
        },
    }
