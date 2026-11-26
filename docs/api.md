# API REST — Projeto Vela Para Todos

**Versão:** 1.0.0
**Base URL (produção):** `https://vela-para-todos-api.onrender.com/api/v1`
**Base URL (local):** `http://localhost:5000/api/v1`
**Formato:** JSON em todas as requisições e respostas
**Autenticação:** JWT (JSON Web Token) via header `Authorization: Bearer <token>`

---

## Sumário

1. [Convenções Gerais](#1-convenções-gerais)
2. [Autenticação e Autorização](#2-autenticação-e-autorização)
3. [Tratamento de Erros](#3-tratamento-de-erros)
4. [Paginação](#4-paginação)
5. [Endpoints de Autenticação](#5-endpoints-de-autenticação)
6. [Endpoints de Aulas](#6-endpoints-de-aulas)
7. [Endpoints de Inscrições](#7-endpoints-de-inscrições)
8. [Endpoints de Usuários](#8-endpoints-de-usuários)
9. [Endpoints de Doações](#9-endpoints-de-doações)
10. [Endpoints de Notícias](#10-endpoints-de-notícias)
11. [Endpoints de Voluntários](#11-endpoints-de-voluntários)
12. [Endpoints de Relatórios](#12-endpoints-de-relatórios)
13. [Endpoints de Dashboard](#13-endpoints-de-dashboard)
14. [Endpoints Utilitários](#14-endpoints-utilitários)
15. [Regras de Negócio Globais](#15-regras-de-negócio-globais)

---

## 1. Convenções Gerais

### Métodos HTTP

| Método | Uso |
|---|---|
| `GET` | Ler recurso(s) — nunca altera estado |
| `POST` | Criar novo recurso |
| `PUT` | Atualizar recurso existente (substituição completa) |
| `PATCH` | Atualizar parcialmente (usado apenas em `/voluntarios/{id}/status`) |
| `DELETE` | Remover recurso |

### Códigos de Status

| Código | Significado |
|---|---|
| `200 OK` | Requisição bem-sucedida |
| `201 Created` | Recurso criado com sucesso |
| `204 No Content` | Operação bem-sucedida sem corpo de resposta |
| `400 Bad Request` | Requisição malformada ou validação falhou |
| `401 Unauthorized` | Token ausente, inválido ou expirado |
| `403 Forbidden` | Autenticado mas sem permissão para o recurso |
| `404 Not Found` | Recurso inexistente |
| `409 Conflict` | Conflito (ex: e-mail já cadastrado, inscrição duplicada) |
| `422 Unprocessable Entity` | Validação de negócio falhou |
| `429 Too Many Requests` | Rate limit excedido |
| `500 Internal Server Error` | Erro inesperado no servidor |

### Headers Obrigatórios

Em todas as requisições com corpo (POST, PUT):

```http
Content-Type: application/json
```

Em todos os endpoints protegidos:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Formatos de Data

- **Datas:** `YYYY-MM-DD` (ISO 8601) — ex: `2026-11-20`
- **Horários:** `HH:MM:SS` ou `HH:MM` — ex: `14:30:00`
- **Timestamps:** `YYYY-MM-DDTHH:MM:SSZ` (UTC) — ex: `2026-11-09T14:30:00Z`

---

## 2. Autenticação e Autorização

### Fluxo de Autenticação

1. Usuário faz `POST /auth/login` com e-mail e senha
2. Backend valida e retorna `access_token` (15 min) e `refresh_token` (7 dias)
3. Frontend armazena os tokens e os envia no header `Authorization` em cada requisição
4. Quando o `access_token` expirar, frontend chama `POST /auth/refresh` com o `refresh_token`
5. No logout, frontend chama `POST /auth/logout` para invalidar o token

### Segurança das Senhas

As senhas são **hasheadas com PBKDF2-SHA256** via `werkzeug.security.generate_password_hash`:

- 600.000 iterações (padrão Werkzeug moderno)
- Salt aleatório por usuário
- Campo no banco: `senha_hash` (não `senha`)
- **Irreversível** — mesmo admin não consegue ver a senha original

### Estrutura do JWT

**Payload do access_token:**

```json
{
  "sub": "42",
  "nome": "Maria Silva",
  "papel": "aluno",
  "iat": 1762693800,
  "exp": 1762694700,
  "type": "access"
}
```

### Níveis de Acesso

| Nível | Descrição |
|---|---|
| **Público** | Não requer autenticação |
| **JWT** | Requer token válido (qualquer perfil) |
| **Aluno** | Requer token com `papel: "aluno"` |
| **Professor** | Requer token com `papel: "professor"` |

---

## 3. Tratamento de Erros

Todas as respostas de erro seguem o padrão:

```json
{
  "error": "Mensagem resumida do erro",
  "code": "CODIGO_ERRO_INTERNO",
  "details": {
    "campo": ["Mensagem de validação específica"]
  }
}
```

### Códigos de Erro Internos

| Code | Status HTTP | Significado |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Payload não passou na validação |
| `INVALID_CREDENTIALS` | 401 | E-mail ou senha incorretos |
| `TOKEN_EXPIRED` | 401 | Token JWT expirou |
| `TOKEN_INVALID` | 401 | Token malformado ou revogado |
| `INSUFFICIENT_PERMISSION` | 403 | Perfil do usuário não permite a ação |
| `RESOURCE_NOT_FOUND` | 404 | Recurso solicitado não existe |
| `EMAIL_ALREADY_EXISTS` | 409 | E-mail já cadastrado |
| `ALREADY_ENROLLED` | 409 | Aluno já inscrito nesta aula |
| `NO_VACANCIES` | 422 | Aula sem vagas disponíveis |
| `CANNOT_DELETE_SELF` | 409 | Professor não pode deletar a si mesmo |
| `RATE_LIMIT_EXCEEDED` | 429 | Muitas requisições em pouco tempo |

**Exemplo de erro de validação:**

```json
{
  "error": "Dados inválidos",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["E-mail inválido"],
    "senha": ["Senha deve ter no mínimo 8 caracteres"]
  }
}
```

---

## 4. Paginação

Todas as listagens suportam paginação via query strings:

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | integer | `1` | Página atual (base 1) |
| `per_page` | integer | `20` | Itens por página (máx: 100) |

**Formato de resposta paginada (padrão geral):**

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 48,
    "total_pages": 3
  }
}
```

> ⚠️ **Exceção:** o endpoint `/usuarios` usa shape diferente:
> ```json
> {
>   "items": [ ... ],
>   "page": 1,
>   "per_page": 20,
>   "pages": 3
> }
> ```
> Inconsistência conhecida, pendente de padronização.

---

## 5. Endpoints de Autenticação

### 5.1 Cadastro

```http
POST /api/v1/auth/register
```

**Nível de acesso:** Público
**Rate limit:** 3 req/min por IP

**Request:**

```json
{
  "nome": "Maria Silva Santos",
  "email": "maria@aluno.com",
  "senha": "MinhaSenh@123",
  "data_nascimento": "1998-05-14",
  "papel": "aluno"
}
```

**Validações:**

| Campo | Regra |
|---|---|
| `nome` | Obrigatório, 3-100 caracteres |
| `email` | Obrigatório, formato de e-mail, único no sistema |
| `senha` | Obrigatório, mín. 8 caracteres, pelo menos 1 letra e 1 número |
| `data_nascimento` | Obrigatório, deve ser data passada, idade mín. 14 anos |
| `papel` | Obrigatório, apenas `"aluno"` ou `"professor"` |

**Response 201 Created:**

```json
{
  "message": "Cadastro realizado com sucesso",
  "usuario": {
    "id": 42,
    "nome": "Maria Silva Santos",
    "email": "maria@aluno.com",
    "papel": "aluno",
    "criado_em": "2026-11-09T14:30:00Z"
  }
}
```

**Erros possíveis:** `400` validação, `409 EMAIL_ALREADY_EXISTS`, `429 RATE_LIMIT_EXCEEDED`

---

### 5.2 Login

```http
POST /api/v1/auth/login
```

**Nível de acesso:** Público
**Rate limit:** 5 tentativas/minuto por IP

**Request:**

```json
{
  "email": "maria@aluno.com",
  "senha": "MinhaSenh@123"
}
```

**Response 200 OK:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900,
  "usuario": {
    "id": 42,
    "nome": "Maria Silva Santos",
    "email": "maria@aluno.com",
    "papel": "aluno"
  }
}
```

**Erros possíveis:** `401 INVALID_CREDENTIALS`, `429 RATE_LIMIT_EXCEEDED`

---

### 5.3 Refresh Token

```http
POST /api/v1/auth/refresh
```

**Nível de acesso:** Refresh token válido no header `Authorization`

**Response 200 OK:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Erros possíveis:** `401 TOKEN_INVALID`, `401 TOKEN_EXPIRED`

---

### 5.4 Logout

```http
POST /api/v1/auth/logout
```

**Nível de acesso:** JWT

**Response 200 OK:**

```json
{
  "message": "Logout realizado com sucesso"
}
```

**Efeito:** Adiciona o token atual à blocklist em memória, invalidando-o antes da expiração natural.

---

### 5.5 Usuário Autenticado

```http
GET /api/v1/auth/me
```

**Nível de acesso:** JWT

**Response 200 OK:**

```json
{
  "id": 42,
  "nome": "Maria Silva Santos",
  "email": "maria@aluno.com",
  "data_nascimento": "1998-05-14",
  "papel": "aluno",
  "criado_em": "2026-11-09T14:30:00Z"
}
```

---

### 5.6 Esqueci Minha Senha

```http
POST /api/v1/auth/esqueci-senha
```

**Nível de acesso:** Público
**Rate limit:** 3 req/min por IP

**Request:**

```json
{
  "email": "maria@aluno.com"
}
```

**Response 200 OK (sempre):**

```json
{
  "message": "Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição."
}
```

**Regra de segurança:** A resposta é **sempre 200**, independente de o e-mail existir ou não. Evita **enumeração de usuários** (atacante não consegue descobrir se um e-mail está cadastrado só chamando essa rota).

**Implementação:** O backend gera um JWT com claim `type: "password_reset"` (válido 1h) e, no MVP, registra o link completo nos logs do servidor (`/redefinir-senha?token=XXX`). Em produção real, esse link seria enviado por e-mail.

---

### 5.7 Redefinir Senha

```http
POST /api/v1/auth/redefinir-senha
```

**Nível de acesso:** Público (mas exige token JWT válido no body)
**Rate limit:** 5 req/min por IP

**Request:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "nova_senha": "NovaSenh@456"
}
```

**Validações:**

| Campo | Regra |
|---|---|
| `token` | JWT válido com claim `type: "password_reset"`, não expirado |
| `nova_senha` | Mesmas regras do cadastro (mín. 8 chars, 1 letra, 1 número) |

**Response 200 OK:**

```json
{
  "message": "Senha redefinida com sucesso. Faça login com a nova senha."
}
```

**Erros possíveis:** `400 VALIDATION_ERROR`, `401 TOKEN_INVALID`, `401 TOKEN_EXPIRED`

---

## 6. Endpoints de Aulas

### 6.1 Listar Aulas

```http
GET /api/v1/aulas
```

**Nível de acesso:** JWT (aluno e professor)

**Query strings:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `data_inicio` | date | Filtra aulas a partir desta data |
| `data_fim` | date | Filtra aulas até esta data |
| `professor_id` | integer | Filtra aulas de um professor específico |
| `com_vagas` | boolean | Se `true`, apenas aulas com vagas disponíveis |
| `page`, `per_page` | integer | Paginação |

**Response 200 OK:**

```json
{
  "data": [
    {
      "id": 1,
      "data": "2026-11-20",
      "horario": "14:00",
      "duracao_min": 90,
      "vagas_total": 8,
      "vagas_disponiveis": 3,
      "descricao": "Aula introdutória para iniciantes",
      "professor": {
        "id": 7,
        "nome": "Carlos Andrade"
      }
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 15, "total_pages": 1 }
}
```

---

### 6.2 Detalhes de uma Aula

```http
GET /api/v1/aulas/{id}
```

**Nível de acesso:** JWT

**Response 200 OK:**

```json
{
  "id": 1,
  "data": "2026-11-20",
  "horario": "14:00",
  "duracao_min": 90,
  "vagas_total": 8,
  "vagas_disponiveis": 3,
  "descricao": "Aula introdutória para iniciantes",
  "professor": {
    "id": 7,
    "nome": "Carlos Andrade",
    "email": "carlos@vela.com"
  },
  "inscritos_count": 5,
  "criado_em": "2026-10-15T08:00:00Z"
}
```

**Erros:** `404 RESOURCE_NOT_FOUND`

---

### 6.3 Criar Aula

```http
POST /api/v1/aulas
```

**Nível de acesso:** Professor

**Request:**

```json
{
  "data": "2026-11-20",
  "horario": "14:00",
  "duracao_min": 90,
  "vagas": 8,
  "descricao": "Aula introdutória para iniciantes"
}
```

**Validações:**

| Campo | Regra |
|---|---|
| `data` | Obrigatório, deve ser data futura |
| `horario` | Obrigatório, formato `HH:MM` |
| `duracao_min` | Obrigatório, entre 15 e 480 minutos |
| `vagas` | Obrigatório, entre 1 e 50 |
| `descricao` | Opcional (default: ""), até 255 caracteres |

**Regra de negócio:** O `professor_id` é extraído automaticamente do JWT — o professor só pode criar aulas em seu próprio nome.

**Response 201 Created:** retorna o objeto completo da aula criada (mesma estrutura do GET).

---

### 6.4 Atualizar Aula

```http
PUT /api/v1/aulas/{id}
```

**Nível de acesso:** Professor (apenas o criador da aula)

**Request:** mesma estrutura do POST.

⚠️ **PUT exige body COMPLETO** — precisa enviar todos os campos obrigatórios (`data`, `horario`, `duracao_min`, `vagas`, `descricao`), não só os que mudaram. Diferente de outros endpoints, não aceita update parcial.

**Regra de negócio:**
- Professor só pode editar aulas que ele mesmo criou
- Se já houver inscritos, não é possível reduzir `vagas` abaixo do número de inscritos atuais

**Response 200 OK:** retorna o objeto atualizado.

**Erros:** `400` body incompleto, `403 INSUFFICIENT_PERMISSION`, `404 RESOURCE_NOT_FOUND`, `422` se `vagas < inscritos`.

---

### 6.5 Excluir Aula

```http
DELETE /api/v1/aulas/{id}
```

**Nível de acesso:** Professor (apenas o criador)

**Regra de negócio:** Ao excluir, todas as inscrições associadas são removidas em cascata.

**Response 200/204 No Content**

**Erros:** `403 INSUFFICIENT_PERMISSION`, `404 RESOURCE_NOT_FOUND`

---

## 7. Endpoints de Inscrições

### 7.1 Listar Minhas Inscrições

```http
GET /api/v1/inscricoes
```

**Nível de acesso:** Aluno (JWT — o backend detecta o aluno via token)

**Query strings:** `page`, `per_page`

**Response 200 OK:**

```json
{
  "data": [
    {
      "id": 101,
      "inscrito_em": "2026-11-05T10:15:00Z",
      "aula": {
        "id": 1,
        "data": "2026-11-20",
        "horario": "14:00",
        "duracao_min": 90,
        "professor_nome": "Carlos Andrade"
      }
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 3, "total_pages": 1 }
}
```

---

### 7.2 Criar Inscrição

```http
POST /api/v1/inscricoes
```

**Nível de acesso:** Aluno

**Request:**

```json
{
  "aula_id": 1
}
```

**Regras de negócio:**
- Aluno não pode se inscrever duas vezes na mesma aula → `409 ALREADY_ENROLLED` (ou `422`)
- Aula precisa ter vagas disponíveis → `422 NO_VACANCIES`
- Aula precisa estar no futuro → `422` com mensagem "Não é possível se inscrever em aulas passadas"
- Professores não podem se inscrever → `403`

**Response 201 Created:**

```json
{
  "id": 101,
  "aluno_id": 42,
  "aula_id": 1,
  "inscrito_em": "2026-11-09T14:30:00Z"
}
```

---

### 7.3 Cancelar Inscrição

```http
DELETE /api/v1/inscricoes/{id}
```

**Nível de acesso:** Aluno (apenas o dono da inscrição)

**Regra de negócio:**
- Só pode cancelar a própria inscrição
- Cancelamento libera vaga para outro aluno

**Response 200/204 No Content**

**Erros:** `403` se não for o dono, `404`, `401` sem autenticação

---

### 7.4 Inscritos em uma Aula (Professor)

```http
GET /api/v1/aulas/{id}/inscricoes
```

**Nível de acesso:** Professor (apenas o criador da aula)

**Response 200 OK:**

```json
{
  "data": [
    {
      "id": 101,
      "inscrito_em": "2026-11-05T10:15:00Z",
      "aluno": {
        "id": 42,
        "nome": "Maria Silva Santos",
        "email": "maria@aluno.com"
      }
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 5, "total_pages": 1 }
}
```

---

## 8. Endpoints de Usuários

> ⚠️ **Shape de paginação diferente:** `/usuarios` usa `items + page/pages/per_page` ao invés de `data + meta` (padrão do resto da API). Veja seção 4.

### 8.1 Listar Usuários

```http
GET /api/v1/usuarios
```

**Nível de acesso:** Professor

**Query strings:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `papel` | string | Filtra por `"aluno"` ou `"professor"` |
| `q` | string | Busca por nome ou e-mail (contém, case-insensitive) |
| `page`, `per_page` | integer | Paginação |

**Response 200 OK:**

```json
{
  "items": [
    {
      "id": 42,
      "nome": "Maria Silva Santos",
      "email": "maria@aluno.com",
      "data_nascimento": "1998-05-14",
      "papel": "aluno",
      "criado_em": "2026-10-15T08:00:00Z"
    }
  ],
  "page": 1,
  "per_page": 20,
  "pages": 3
}
```

---

### 8.2 Detalhes de um Usuário

```http
GET /api/v1/usuarios/{id}
```

**Nível de acesso:** Professor, ou o próprio usuário

**Response 200 OK:**

```json
{
  "id": 42,
  "nome": "Maria Silva Santos",
  "email": "maria@aluno.com",
  "data_nascimento": "1998-05-14",
  "papel": "aluno",
  "criado_em": "2026-10-15T08:00:00Z"
}
```

**Erros:** `403` (aluno tentando ver outro aluno), `404`

---

### 8.3 Atualizar Usuário

```http
PUT /api/v1/usuarios/{id}
```

**Nível de acesso:** Professor (qualquer), ou o próprio usuário (apenas a si)

**Request (todos os campos opcionais):**

```json
{
  "nome": "Maria Silva Santos",
  "email": "maria.nova@aluno.com",
  "data_nascimento": "1998-05-14",
  "papel": "professor"
}
```

**Regras de negócio:**
- **Apenas professor pode alterar o campo `papel`** — alunos não conseguem se auto-promover
- Validação de email único: se mudar e-mail para um já existente → `409`

**Response 200 OK:** retorna o usuário atualizado.

---

### 8.4 Excluir Usuário

```http
DELETE /api/v1/usuarios/{id}
```

**Nível de acesso:** Professor

**Regra de negócio:** **`CANNOT_DELETE_SELF`** — professor não pode deletar a si mesmo (previne auto-bloqueio administrativo). Retorna `409` nesse caso.

**Response 200/204 No Content**

**Erros:** `403` (aluno tentando deletar), `404`, `409 CANNOT_DELETE_SELF`

> 💡 **Alteração de senha pelo próprio usuário:** não há endpoint dedicado nesta versão. O fluxo de reset é via `/auth/esqueci-senha` + `/auth/redefinir-senha` (ver seção 5.6 e 5.7).

---

## 9. Endpoints de Doações

### 9.1 Listar Doações

```http
GET /api/v1/doacoes
```

**Nível de acesso:** Professor

**Query strings:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `forma_pagamento` | string | `"pix"`, `"transferencia"` ou `"paypal"` |
| `page`, `per_page` | integer | Paginação |

**Response 200 OK:**

```json
{
  "data": [
    {
      "id": 25,
      "nome_doador": "João Pereira",
      "valor": 150.00,
      "forma_pagamento": "pix",
      "doado_em": "2026-11-05T09:30:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 7, "total_pages": 1 },
  "resumo": {
    "total_arrecadado": 2450.00,
    "total_doacoes": 15
  }
}
```

---

### 9.2 Registrar Doação

```http
POST /api/v1/doacoes
```

**Nível de acesso:** Público
**Rate limit:** 10 req/min por IP

**Request:**

```json
{
  "nome_doador": "João Pereira",
  "valor": 150.00,
  "forma_pagamento": "pix"
}
```

**Validações:**

| Campo | Regra |
|---|---|
| `nome_doador` | Obrigatório, 3-100 caracteres |
| `valor` | Obrigatório, > 0, máx 999999.99 |
| `forma_pagamento` | Obrigatório, enum `pix`/`transferencia`/`paypal` |

**Response 201 Created:** retorna o objeto criado.

---

## 10. Endpoints de Notícias

### 10.1 Listar Notícias

```http
GET /api/v1/noticias
```

**Nível de acesso:** Público

**Query strings:** `page`, `per_page`, `q` (busca no título, ilike case-insensitive)

**Response 200 OK (NoticiaListSchema):**

```json
{
  "data": [
    {
      "id": 5,
      "titulo": "Projeto social ensina pessoas com deficiência a velejar",
      "resumo": "A TV Record Brasília exibiu uma reportagem no DF no AR...",
      "imagem": "/assets/img/noticia-5.jpg",
      "publicado_em": "2026-10-20T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 12, "total_pages": 1 }
}
```

**Regra:** `resumo` é derivado dos primeiros ~200 caracteres do `conteudo`. Para o texto completo, usar o endpoint de detalhes.

---

### 10.2 Detalhes de Notícia

```http
GET /api/v1/noticias/{id}
```

**Nível de acesso:** Público

**Response 200 OK (NoticiaDetailSchema — inclui `conteudo` completo):**

```json
{
  "id": 5,
  "titulo": "Projeto social ensina pessoas com deficiência a velejar",
  "conteudo": "<p>Conteúdo completo da notícia em texto...</p>",
  "imagem": "/assets/img/noticia-5.jpg",
  "publicado_em": "2026-10-20T10:00:00Z"
}
```

---

### 10.3 Criar Notícia

```http
POST /api/v1/noticias
```

**Nível de acesso:** Professor

**Request:**

```json
{
  "titulo": "Nova regata no Lago Paranoá",
  "conteudo": "Conteúdo completo da notícia...",
  "imagem": "/assets/img/nova-regata.jpg"
}
```

**Validações:** título 5-200, conteúdo mínimo 20, imagem opcional até 255 caracteres.

---

### 10.4 Atualizar Notícia

```http
PUT /api/v1/noticias/{id}
```

**Nível de acesso:** Professor

---

### 10.5 Excluir Notícia

```http
DELETE /api/v1/noticias/{id}
```

**Nível de acesso:** Professor

---

## 11. Endpoints de Voluntários

### 11.1 Cadastrar Voluntário

```http
POST /api/v1/voluntarios
```

**Nível de acesso:** Público
**Rate limit:** 3 req/min por IP

**Request:**

```json
{
  "nome": "Ana Costa",
  "email": "ana@email.com",
  "mensagem": "Tenho experiência com vela e gostaria de ajudar..."
}
```

**Validações:** nome mín. 3, e-mail válido, mensagem mín. 20 caracteres.

**Response 201 Created:**

```json
{
  "message": "Inscrição recebida! Entraremos em contato em breve.",
  "voluntario": {
    "id": 10,
    "nome": "Ana Costa",
    "email": "ana@email.com",
    "status": "pendente",
    "inscrito_em": "2026-11-09T14:30:00Z"
  }
}
```

---

### 11.2 Listar Voluntários

```http
GET /api/v1/voluntarios
```

**Nível de acesso:** Professor

**Query strings:** `status` (`pendente`/`aprovado`/`recusado`), `page`, `per_page`

---

### 11.3 Atualizar Status do Voluntário

```http
PATCH /api/v1/voluntarios/{id}/status
```

**Nível de acesso:** Professor

**Request:**

```json
{
  "status": "aprovado"
}
```

**Validação:** `status` deve ser `"pendente"`, `"aprovado"` ou `"recusado"`.

---

## 12. Endpoints de Relatórios

### 12.1 Relatório de Inscrições em PDF

```http
GET /api/v1/relatorios/inscricoes.pdf
```

**Nível de acesso:** Professor

**Query strings:** `data_inicio`, `data_fim`, `professor_id` (todas opcionais)

**Response 200 OK:**

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="relatorio_inscricoes_2026-11-09.pdf"
```

Corpo: binário do PDF gerado pelo ReportLab.

**Conteúdo do relatório:**
- Cabeçalho com logo FBVA e data de geração
- Resumo: total de aulas, total de inscrições, média de ocupação
- Tabela de aulas com data, horário, professor, vagas, inscritos, % ocupação
- Lista de inscritos por aula com nome e data de inscrição

---

## 13. Endpoints de Dashboard

### 13.1 Estatísticas do Dashboard

```http
GET /api/v1/dashboard/stats
```

**Nível de acesso:** JWT (métricas variam por papel)

**Response (professor) 200 OK:**

```json
{
  "minhas_aulas": 8,
  "total_inscricoes": 42,
  "alunos_unicos": 18,
  "voluntarios_pendentes": 3,
  "doacoes_mes_valor": 1225.50,
  "doacoes_mes_count": 6,
  "proximas_aulas": [
    {
      "id": 1,
      "data": "2026-11-20",
      "horario": "14:00",
      "descricao": "Aula introdutória",
      "vagas_disponiveis": 3
    }
  ],
  "doacoes_por_forma": [
    { "forma_pagamento": "pix", "total": 800.00, "count": 4 },
    { "forma_pagamento": "transferencia", "total": 425.50, "count": 2 }
  ]
}
```

**Response (aluno) 200 OK:**

```json
{
  "minhas_inscricoes": 2,
  "proximas_aulas_inscritas": [ ... ],
  "aulas_disponiveis": 5,
  "noticias_recentes": [ ... ]
}
```

---

## 14. Endpoints Utilitários

### 14.1 Health Check

```http
GET /health
```

**Nível de acesso:** Público

**Response 200 OK (sempre):**

```json
{
  "status": "healthy",
  "db": "connected",
  "version": "1.0.0"
}
```

Se o banco estiver inacessível, retorna **200** mas com `db: "disconnected"` (não retorna 503). Usado em CI/smoke tests e pelo Render pra health check.

---

### 14.2 Informações da API

```http
GET /api/v1
```

**Nível de acesso:** Público

**Response 200 OK:**

```json
{
  "name": "Vela Para Todos API",
  "version": "1.0.0"
}
```

---

## 15. Regras de Negócio Globais

### 15.1 Fuso Horário

Todos os timestamps armazenados no banco estão em **UTC**. O frontend é responsável por converter para a timezone do usuário (America/Sao_Paulo por padrão).

### 15.2 Validação de Idade

Usuários menores de 14 anos não podem se cadastrar diretamente. Para o Projeto Vela Para Todos, menores de idade precisam ser cadastrados por um responsável (fora do escopo desta versão).

### 15.3 Isolamento entre Perfis

- **Alunos** veem todas as aulas (quando autenticados) mas só suas próprias inscrições
- **Professores** veem todos os usuários, mas só editam/deletam **suas próprias aulas** e os inscritos nelas
- Um professor não pode editar aulas de outro professor
- Professor não pode deletar a si mesmo (`CANNOT_DELETE_SELF`)

### 15.4 Soft Delete (fora do MVP)

Nesta versão, DELETE remove permanentemente. Em versões futuras pode-se adotar soft delete (coluna `deleted_at`) para auditoria.

### 15.5 Rate Limiting

| Endpoint | Limite |
|---|---|
| `POST /auth/login` | 5 req/min por IP |
| `POST /auth/register` | 3 req/min por IP |
| `POST /auth/esqueci-senha` | 3 req/min por IP |
| `POST /auth/redefinir-senha` | 5 req/min por IP |
| `POST /doacoes` | 10 req/min por IP |
| `POST /voluntarios` | 3 req/min por IP |
| Demais endpoints | sem limite específico |

> ⚠️ Em `DevelopmentConfig` e `TestingConfig`, o rate limiter está **desativado** pra não atrapalhar desenvolvimento e testes automatizados. Em produção (`ProductionConfig`) está ativo.

### 15.6 Versionamento da API

A URL contém `/v1` para permitir evolução futura com `/v2` sem quebrar clientes existentes. Mudanças breaking exigem nova versão; mudanças retrocompatíveis (novos campos opcionais, novos endpoints) ficam na mesma versão.

### 15.7 Segurança — Senhas

- Senhas armazenadas como hash **PBKDF2-SHA256** (600.000 iterações + salt aleatório por usuário)
- Via `werkzeug.security.generate_password_hash` — mesmo admin não consegue ver senha original
- Reset: fluxo híbrido `/auth/esqueci-senha` → `/auth/redefinir-senha` com JWT temporário de 1h

### 15.8 CORS

Origens permitidas em produção:
```
http://localhost:5173
http://127.0.0.1:5173
https://vela-para-todos.vercel.app
https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app
```

---

**Documento gerado em:** 09/11/2026
**Última revisão:** 26/11/2026
**Versão do contrato:** 1.0.0
**Autor:** Guilherme Cervi