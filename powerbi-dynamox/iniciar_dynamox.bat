@echo off
title Dynamox - Power BI

echo ============================================
echo   Dynamox API - Conector para Power BI
echo ============================================
echo.

:: Tenta encontrar Python no PATH
set PYTHON=
python --version >nul 2>&1
if not errorlevel 1 (
    set PYTHON=python
    goto python_ok
)

py --version >nul 2>&1
if not errorlevel 1 (
    set PYTHON=py
    goto python_ok
)

:: Procura Python nas pastas de instalacao comuns
for %%V in (313 312 311 310 39 38) do (
    if exist "%LOCALAPPDATA%\Programs\Python\Python%%V\python.exe" (
        set PYTHON="%LOCALAPPDATA%\Programs\Python\Python%%V\python.exe"
        goto python_ok
    )
    if exist "C:\Python%%V\python.exe" (
        set PYTHON="C:\Python%%V\python.exe"
        goto python_ok
    )
    if exist "C:\Program Files\Python%%V\python.exe" (
        set PYTHON="C:\Program Files\Python%%V\python.exe"
        goto python_ok
    )
)

echo [ERRO] Python nao encontrado mesmo estando instalado.
echo.
echo Solucao: reinstale o Python marcando "Add Python to PATH":
echo   1. Abra o instalador do Python novamente
echo   2. Clique em "Modify"
echo   3. Avance ate "Advanced Options"
echo   4. Marque "Add Python to environment variables"
echo   5. Clique em "Install"
echo   6. Feche e abra este arquivo novamente
echo.
pause
exit /b 1

:python_ok
echo [OK] Python encontrado: %PYTHON%
echo.

:: Instala dependencias
echo Instalando dependencias...
%PYTHON% -m pip install PyJWT cryptography requests pandas flask --quiet
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.
echo.

:: Testa autenticacao
echo Testando autenticacao com a API Dynamox...
%PYTHON% dynamox_auth.py >nul 2>&1
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
echo   Use estes enderecos no Power BI (Obter Dados - Web):
echo   http://localhost:8765/machines
echo   http://localhost:8765/sensors
echo   http://localhost:8765/alerts
echo   http://localhost:8765/measurements
echo.
echo   Deixe esta janela ABERTA enquanto usar o Power BI.
echo   Para encerrar, feche esta janela ou pressione Ctrl+C.
echo ============================================
echo.
%PYTHON% dynamox_server.py

pause
