@echo off
REM Script para iniciar el chatbot YucaFit en Windows

echo ===============================
echo Iniciando entorno virtual...
IF EXIST venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo Entorno virtual activado.
) ELSE (
    echo No se encontró el entorno virtual. Ejecuta "python -m venv venv" primero.
)

echo ===============================
echo Instalando dependencias...
pip install -r requirements.txt
IF %ERRORLEVEL% NEQ 0 (
    echo Error al instalar dependencias. Revisa requirements.txt.
    pause
    exit /b
)
echo Dependencias instaladas correctamente.

echo ===============================
echo Ejecutando la aplicación...
python app.py

echo ===============================
echo Proceso finalizado.
pause
