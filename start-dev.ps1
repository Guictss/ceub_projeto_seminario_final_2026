# =============================================================================
#  start-dev.ps1
#  Projeto Vela Para Todos - Dev Startup
#  -----------------------------------------------------------------------------
#  Sobe backend (Flask) e frontend (Vite) em duas janelas PowerShell separadas,
#  cada uma na sua pasta, com suas dependencias ativadas.
#
#  Uso: na raiz do monorepo, rode .\start-dev.ps1
#       (ou da um duplo-clique no arquivo via Windows Explorer)
#
#  Para parar: fecha cada janela (ou Ctrl+C dentro dela).
# =============================================================================

$ErrorActionPreference = "Stop"

$ROOT     = "C:\dev\a3-vela"
$BACKEND  = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Projeto Vela Para Todos - Dev Startup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# Verificacoes basicas antes de abrir as janelas
# -----------------------------------------------------------------------------
if (-not (Test-Path $BACKEND)) {
    Write-Host ""
    Write-Host "[X] Pasta backend nao encontrada: $BACKEND" -ForegroundColor Red
    Write-Host "    Edite a variavel `$ROOT no topo deste script." -ForegroundColor DarkYellow
    pause
    exit 1
}

if (-not (Test-Path $FRONTEND)) {
    Write-Host ""
    Write-Host "[X] Pasta frontend nao encontrada: $FRONTEND" -ForegroundColor Red
    Write-Host "    Edite a variavel `$ROOT no topo deste script." -ForegroundColor DarkYellow
    pause
    exit 1
}

if (-not (Test-Path (Join-Path $BACKEND "venv\Scripts\Activate.ps1"))) {
    Write-Host ""
    Write-Host "[X] venv do backend nao encontrado." -ForegroundColor Red
    Write-Host "    Crie com: cd backend; python -m venv venv; pip install -r requirements.txt" -ForegroundColor DarkYellow
    pause
    exit 1
}

if (-not (Test-Path (Join-Path $FRONTEND "node_modules"))) {
    Write-Host ""
    Write-Host "[!] node_modules nao encontrado no frontend." -ForegroundColor Yellow
    Write-Host "    Rodando npm install primeiro..." -ForegroundColor Yellow
    Push-Location $FRONTEND
    npm install
    Pop-Location
}

# -----------------------------------------------------------------------------
# Sobe o backend em uma nova janela
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "-> Abrindo janela do BACKEND (Flask em http://localhost:5000)" -ForegroundColor Yellow

$backendCmd = @"
`$Host.UI.RawUI.WindowTitle = 'Vela :: Backend (Flask)'
cd '$BACKEND'
Write-Host '================================================' -ForegroundColor Blue
Write-Host ' Backend (Flask) - http://localhost:5000' -ForegroundColor Blue
Write-Host '================================================' -ForegroundColor Blue
Write-Host ''
.\venv\Scripts\Activate.ps1
python app.py
Write-Host ''
Write-Host '[Backend encerrado - aperte qualquer tecla para fechar]' -ForegroundColor DarkYellow
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# Dá uma pausa curta para o backend comecar antes do frontend tentar conectar
Start-Sleep -Seconds 2

# -----------------------------------------------------------------------------
# Sobe o frontend em outra nova janela
# -----------------------------------------------------------------------------
Write-Host "-> Abrindo janela do FRONTEND (Vite em http://localhost:5173)" -ForegroundColor Yellow

$frontendCmd = @"
`$Host.UI.RawUI.WindowTitle = 'Vela :: Frontend (Vite)'
cd '$FRONTEND'
Write-Host '================================================' -ForegroundColor Magenta
Write-Host ' Frontend (Vite) - http://localhost:5173' -ForegroundColor Magenta
Write-Host '================================================' -ForegroundColor Magenta
Write-Host ''
npm run dev
Write-Host ''
Write-Host '[Frontend encerrado - aperte qualquer tecla para fechar]' -ForegroundColor DarkYellow
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

# -----------------------------------------------------------------------------
# Resumo final
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Ambiente de desenvolvimento iniciado!" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Backend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5000" -ForegroundColor Blue
Write-Host "   Frontend: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host " Duas novas janelas PowerShell foram abertas." -ForegroundColor Gray
Write-Host " Aguarde alguns segundos ate aparecerem os URLs." -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# -----------------------------------------------------------------------------
# Abre o navegador no frontend (apos pequeno delay para o Vite iniciar)
# -----------------------------------------------------------------------------
Write-Host "Abrindo o navegador em 5s... (Ctrl+C para cancelar)" -ForegroundColor DarkGray
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Esta janela ja fez o trabalho dela - pode fechar." -ForegroundColor DarkGray
Write-Host "As janelas do backend e frontend continuam rodando." -ForegroundColor DarkGray
Write-Host ""
