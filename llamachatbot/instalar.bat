@echo off
REM Script para iniciar el chat Max AI en Windows

REM Activar entorno virtual si existe
IF EXIST venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Instalar dependencias
pip install -r requirements.txt

REM Ejecutar la app
python modelo_2_llama.py

pause
