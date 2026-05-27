@echo off
chcp 65001 >nul
title Dynamox → Power BI

echo ============================================
echo   Dynamox API - Conector para Power BI
echo ============================================
echo.

:: Verifica se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [!] Python nao encontrado. Tentando instalar automaticamente...
    echo.

    :: Tenta instalar via winget (disponivel no Windows 10/11)
    winget --version >nul 2>&1
    if errorlevel 1 (
        echo [ERRO] Winget nao disponivel neste Windows.
        echo.
        echo Instale o Python manualmente:
        echo   1. Acesse: https://www.python.org/downloads/
        echo   2. Clique em "Download Python"
        echo   3. Execute o instalador
        echo   4. IMPORTANTE: marque "Add Python to PATH"
        echo   5. Apos instalar, execute este arquivo novamente.
        echo.
        pause
        exit /b 1
    )

    echo Instalando Python via winget...
    winget install --id Python.Python.3.12 --source winget --silent --accept-package-agreements --accept-source-agreements
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar Python automaticamente.
        echo.
        echo Instale manualmente em: https://www.python.org/downloads/
        echo Marque a opcao "Add Python to PATH" durante a instalacao.
        echo.
        pause
        exit /b 1
    )

    :: Recarrega o PATH para reconhecer o Python recem instalado
    call refreshenv >nul 2>&1
    python --version >nul 2>&1
    if errorlevel 1 (
        echo.
        echo [!] Python instalado. Feche e abra este arquivo novamente para continuar.
        echo     (o terminal precisa ser reiniciado para reconhecer o Python)
        echo.
        pause
        exit /b 0
    )
)

echo [OK] Python encontrado.
echo.

:: Instala dependências
echo Instalando dependencias (pode demorar na primeira vez)...
pip install PyJWT cryptography requests pandas flask --quiet
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.
echo.

:: Testa a autenticação
echo Testando autenticacao com a API Dynamox...
python dynamox_auth.py >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Falha na autenticacao. Verifique o arquivo dynamox_config.json.
    pause
    exit /b 1
)
echo [OK] Autenticacao bem-sucedida.
echo.

:: Inicia o servidor
echo ============================================
echo   Servidor iniciado em:
echo   http://localhost:8765
echo.
echo   Use estes enderecos no Power BI (Obter Dados > Web):
echo   http://localhost:8765/machines
echo   http://localhost:8765/sensors
echo   http://localhost:8765/alerts
echo   http://localhost:8765/measurements
echo.
echo   Deixe esta janela ABERTA enquanto usar o Power BI.
echo   Para encerrar, feche esta janela ou pressione Ctrl+C.
echo ============================================
echo.
python dynamox_server.py

pause
