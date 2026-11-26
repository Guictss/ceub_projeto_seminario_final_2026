---
name: deploy
description: Deploy em produção do Projeto Vela Para Todos — backend Flask no Render.com (Web Service Free + PostgreSQL Free) e frontend React na Vercel (projeto único com branch main=FBVA e apresentacao-ceub=preview). Use ao configurar ou alterar variáveis de ambiente, atualizar Build/Start Command, mexer em vercel.json, configurar CORS_ORIGINS em produção, executar smoke tests pós-deploy, resolver cold start do Render Free, ou entender o pipeline de CI/CD GitHub Actions com 4 jobs paralelos. Inclui checklist pré-apresentação.
---

# Deploy — Produção

> Backend no **Render.com** (Web Service Free + PostgreSQL Free)
> Frontend na **Vercel** (projeto único — `main` = production, `apresentacao-ceub` = preview)
> CI/CD no **GitHub Actions** (4 jobs em paralelo, ~1 min)

---

## 1. Backend — Render.com

### Configuração do Web Service

| Campo | Valor |
|---|---|
| **Nome** | `vela-para-todos-api` |
| **Tipo** | Web Service (free tier) |
| **Região** | Oregon (mesma do PostgreSQL pra latência mínima) |
| **Runtime** | Python 3 |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt && flask db upgrade && python seed.py` |
| **Start Command** | `gunicorn "app:create_app()" --bind 0.0.0.0:$PORT` |
| **Health Check Path** | `/health` |
| **URL** | https://vela-para-todos-api.onrender.com |

### Env vars obrigatórias (no painel do Render)

```
FLASK_ENV=production
SECRET_KEY=<gerar com: python -c "import secrets; print(secrets.token_urlsafe(48))">
JWT_SECRET_KEY=<gerar igual, outra string>
DATABASE_URL=<auto-preenchida pelo Internal Database URL do PostgreSQL linkado>
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://vela-para-todos.vercel.app,https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app
PYTHON_VERSION=3.12.4
```

⚠️ **PYTHON_VERSION é crítico** — sem ela, Render usa versão default (3.7) que quebra com Flask 3.

### PostgreSQL linkado

- Plano Free
- Mesma região do Web Service
- Linkado via "Internal Database URL" (mais rápido que External)
- Backup: snapshots diários automáticos, retenção 7 dias

### ⚠️ Fix do driver psycopg2

SQLAlchemy 2+ tenta `psycopg` v3 por default, mas `requirements.txt` tem `psycopg2-binary`.

Em `config.py` (já implementado):

```python
def _normalizar_database_url(url: str) -> str:
    if not url:
        return url
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://") and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url

class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = _normalizar_database_url(os.environ.get("DATABASE_URL", ""))
```

### Cold start

Render Free dorme após **15 min sem tráfego**. Primeira requisição depois demora **30-60 segundos**.

**Para apresentação:** acordar o backend 2-3 min antes:
```powershell
Invoke-RestMethod https://vela-para-todos-api.onrender.com/health
```

---

## 2. Frontend — Vercel

### Projeto único `vela-para-todos`

- **Branch `main`** = Production FBVA (paleta azul-amarelo)
  - URL: https://vela-para-todos.vercel.app
- **Branch `apresentacao-ceub`** = Preview CEUB (paleta roxa)
  - URL (preview estável): https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app

### Configuração

| Campo | Valor |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (default do Vite) |
| **Output Directory** | `dist` (default) |
| **Install Command** | `npm ci` |
| **Bundle** | ~1,37 MB (gzip 407 KB) |

### Env var obrigatória

```
VITE_API_URL=https://vela-para-todos-api.onrender.com/api/v1
```

### `vercel.json` (SPA routing)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Sem isso, URLs tipo `/login` acessadas direto dão 404.

### ⚠️ Preview CEUB NÃO é projeto separado

Vive dentro do projeto único. Pra separar, criar com nome explicitamente diferente.

### ⚠️ Deployment URL (com hash) ≠ Production/Preview URL

Pro CORS, SEMPRE usar o URL estável — URL com hash muda a cada deploy.

---

## 3. CORS em produção

No backend (Render env var):
```
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://vela-para-todos.vercel.app,https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app
```

Mudanças exigem **redeploy manual** do backend (ou push novo).

---

## 4. CI/CD — GitHub Actions

### Arquivo: `.github/workflows/ci.yml`

### Jobs (rodam em paralelo)

| Job | O que faz | Tempo |
|---|---|---|
| **Backend Tests (pytest)** | Instala deps + roda `pytest --cov-fail-under=80` + upload de htmlcov como artifact | ~37s |
| **Frontend Build (Vite)** | `npm ci` + `npm run build` + upload do `dist/` como artifact | ~31s |
| **Lint Backend (ruff)** | Instala ruff + `ruff check .` | ~11s |
| **Lint Frontend (eslint)** | `npm ci` + `npm run lint` | ~34s |

**Total:** ~1 min (paralelo)

### Dispara em

- Push nas branches `main` e `apresentacao-ceub`
- Pull requests pra `main`

### Env vars pros testes (dentro do workflow)

```yaml
env:
  FLASK_ENV: testing
  SECRET_KEY: ci-secret-key-only-for-tests-not-production
  JWT_SECRET_KEY: ci-jwt-secret-key-at-least-32-bytes-long-for-ci
```

### Badge no README

```markdown
![CI](https://github.com/Guictss/ceub_projeto_seminario_final_2026/actions/workflows/ci.yml/badge.svg)
```

### Deploy automático

- **Vercel**: push na branch dispara deploy automaticamente (não precisa de GitHub Action pra isso)
- **Render**: push na `main` dispara deploy automaticamente

CI do GitHub Actions é **gating** — só bloqueia merge se jobs falharem.

---

## 5. Smoke test pós-deploy

```powershell
# 1. Health check
Invoke-RestMethod https://vela-para-todos-api.onrender.com/health

# 2. Login + aulas autenticadas
$body = @{email="carlos@teste.com"; senha="Senha123!"} | ConvertTo-Json
$login = Invoke-RestMethod -Uri https://vela-para-todos-api.onrender.com/api/v1/auth/login `
  -Method POST -Body $body -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($login.access_token)" }
Invoke-RestMethod -Uri https://vela-para-todos-api.onrender.com/api/v1/aulas -Headers $headers

# 3. Frontend carrega
Invoke-WebRequest https://vela-para-todos.vercel.app | Select-Object StatusCode
```

---

## 6. Checklist pré-apresentação

1. **Acorda o backend** 2-3 min antes:
   ```
   https://vela-para-todos-api.onrender.com/health
   ```
   (Render Free dorme após 15 min)

2. **Abre as 2 abas** prontas:
   - FBVA: https://vela-para-todos.vercel.app
   - CEUB: https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app

3. **Credenciais à mão**:
   - Professor: `carlos@teste.com` / `Senha123!`
   - Aluno: `maria@teste.com` / `Senha123!`

4. **Backup local**: `.\start-dev.ps1` pronto pra rodar caso wifi/Render falhe

5. **Hotspot do celular** como fallback de internet

6. **GitHub aberto em outra aba** (mostrar CI verde, cobertura, estrutura do monorepo)

---

## 7. Troubleshooting de deploy

### Backend não sobe no Render

1. Verificar logs no dashboard do Render
2. Erros comuns:
   - `ModuleNotFoundError: No module named 'psycopg'` → fix do `_normalizar_database_url`
   - `ModuleNotFoundError: No module named 'dateutil'` → adicionar `python-dateutil` no `requirements.txt`
   - `KeyError: 'DATABASE_URL'` → `os.environ[]` em classe → trocar pra `os.environ.get()`
   - Build Command falhando em `flask db upgrade` → verificar se migrations estão commitadas

### Frontend 404 em rotas diretas

Criar `frontend/vercel.json` com o rewrite.

### CORS error em produção

- Conferir `CORS_ORIGINS` no painel do Render (não no `.env` local!)
- URL do frontend precisa estar listada **sem trailing slash**
- Redeploy do backend após mudar

### Deploy antigo ficou cacheado no Vercel

Forçar redeploy: botão "Redeploy" com `Use existing Build Cache` desmarcado.

---

## 📚 Skills relacionados

- `/pegadinhas-backend` — psycopg driver, os.environ, python-dateutil
- `/pegadinhas-frontend` — vercel.json, encoding UTF-8, Vite 8
- `/troubleshooting` — cold start, PowerShell encoding
- `/testing-backend` — como CI roda pytest
