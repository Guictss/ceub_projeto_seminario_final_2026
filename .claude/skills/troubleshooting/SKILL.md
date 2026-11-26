---
name: troubleshooting
description: Erros gerais recorrentes do ambiente de desenvolvimento do Projeto Vela Para Todos — cold start do Render Free, PowerShell quebrando UTF-8 em requests JSON, Zone Identifier bloqueando scripts .ps1 baixados, PowerShell curl sendo alias pro Invoke-WebRequest, VLibras gerando warnings normais no console, e lembrete de commitar antes de pausar. Use quando o problema não é código mas ambiente, ou quando algo "funciona local e quebra em prod".
---

# Troubleshooting — erros gerais

> Problemas de ambiente/workflow que já pegamos, com o fix pronto. Diferente das
> pegadinhas de código (que estão em `/pegadinhas-backend` e `/pegadinhas-frontend`),
> aqui estão os tropeços de **Windows, PowerShell, Render Free, etc**.

---

## Render Free — cold start

### Render Free dorme após 15 min sem tráfego

Primeira requisição depois demora **30-60 segundos**.

**Pra apresentação/demo ao vivo:** acordar o backend 2-3 min antes:

```powershell
Invoke-RestMethod https://vela-para-todos-api.onrender.com/health
```

Ou simplesmente abrir no navegador.

### Como saber que acordou

`/health` retorna rapidamente (200 OK com JSON). A partir daí o backend fica acordado por ~15 min desde a última requisição.

---

## PowerShell 5.1 — bugs clássicos

### `curl` ≠ curl real (é alias pro `Invoke-WebRequest`)

```powershell
# ⚠️ Isso não é curl Unix! É alias pro Invoke-WebRequest
curl https://...

# ✅ Pra APIs JSON, usar:
Invoke-RestMethod -Uri https://...

# ✅ Ou curl real (nativo no Win10+):
curl.exe https://...
```

### PowerShell 5.1 quebra UTF-8 em body JSON

Caracteres acentuados viram lixo quando passados como `-Body` string.

**Fix:** helper `Invoke-ApiJson` em `backend/vela-init.ps1` que converte pra `UTF8.GetBytes()` antes de enviar:

```powershell
function Invoke-ApiJson {
  param($Uri, $Method = "GET", $Body = $null, $Headers = @{})
  $headers = $Headers + @{ "Content-Type" = "application/json; charset=utf-8" }
  if ($Body) {
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 10))
    return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -Body $bodyBytes
  }
  return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers
}
```

### `Out-File -Encoding UTF8` adiciona BOM (3 bytes)

Quebra o Vite se usado em `.env.local`:
```powershell
# ❌ ERRADO
"VITE_API_URL=..." | Out-File -Encoding UTF8 .env.local

# ✅ CERTO (ASCII pra .env*)
"VITE_API_URL=..." | Out-File -Encoding ASCII .env.local
```

Pra código fonte `.jsx` com acentos, usar:
```powershell
[System.IO.File]::WriteAllText($path, $texto, [System.Text.UTF8Encoding]::new($false))
# $false = sem BOM
```

---

## Windows — Zone Identifier

### Zone Identifier bloqueia scripts baixados

Arquivos `.ps1` ou `.bat` baixados da web/chat vêm marcados como "untrusted zone" e são bloqueados por default.

**Fix antes de rodar:**
```powershell
Unblock-File -Path .\script.ps1
```

---

## Git / workflow

### Commitar antes de pausar sessão

**Sempre fazer `git status` + commit antes de pausar.** Refatorações grandes não-commitadas se misturam com o trabalho do dia seguinte e viram pesadelo de merge mental.

```powershell
git status
git add -p                  # review interativo
git commit -m "wip: ..."
```

Mesmo um `wip:` commit é melhor que arquivo solto em `modified`.

---

## VLibras

### Warnings normais no console (não silenciar)

A integração oficial do VLibras (`https://vlibras.gov.br/app/vlibras-plugin.js`) gera warnings sobre:

- `An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing.`
- `[Violation] Permissions policy violation: accelerometer is not allowed in this document.`
- `The devicemotion events are blocked by permissions policy.`

Todos vêm do iframe interno do VLibras, **não do nosso código**. **Não afetam funcionalidade** — o VLibras funciona normal, traduz Libras, fecha, abre. Não silenciar, não é bug nosso.

---

## Browser / rede

### Conteúdo cacheado após deploy

Forçar reload: `Ctrl+Shift+R` (ignora cache) ou abrir em aba anônima.

Vercel às vezes serve build antigo mesmo depois de deploy novo. Redeploy com "Build Cache" desmarcado resolve.

### Cold start + CORS = erro confuso

Se o backend está dormindo e o frontend tenta fazer POST, você vê "CORS error" no navegador. **Não é CORS** — é timeout. Acorda o backend primeiro com `/health`.

---

## Setup local do zero

Se o projeto parar de funcionar local depois de um `git pull` grande:

1. **Backend:**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt    # pode ter dep nova
   flask db upgrade                    # pode ter migration nova
   python seed.py                      # dados demo
   python app.py
   ```

2. **Frontend:**
   ```powershell
   cd frontend
   npm install                         # pode ter dep nova
   npm run dev
   ```

3. **Se Cypress reclamar:**
   ```powershell
   npm install-scripts approve cypress
   npx cypress install
   ```

4. **Se .env.local sumiu:**
   ```powershell
   "VITE_API_URL=http://localhost:5000/api/v1" | Out-File -Encoding ASCII .env.local
   ```

---

## Apresentação — kit de sobrevivência

**Se wifi falhar:**
- Hotspot do celular pronto
- `.\start-dev.ps1` roda tudo local sem internet

**Se Render dormir:**
- `/health` no navegador antes de começar
- Fallback: mostrar local com `.\start-dev.ps1`

**Se Vercel estiver fora:**
- Fallback: mostrar local
- Branch preview CEUB pode estar OK mesmo se main cair (diferentes URLs)

**Se Cypress quebrar na hora da demo:**
- Pular pra demo manual no navegador (é mais impactante mesmo)
- Mostrar GitHub Actions verde como prova de que a suíte passa

---

## 📚 Skills relacionados

- `/pegadinhas-backend` — erros de código no backend
- `/pegadinhas-frontend` — erros de código no frontend
- `/deploy` — cold start, env vars, smoke tests
- `/testing-backend`, `/testing-frontend` — se o erro é em teste
