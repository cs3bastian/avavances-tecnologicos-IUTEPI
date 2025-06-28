@echo off
REM Script para instalar dependencias y ejecutar el chatbot en Windows

REM Crear entorno virtual
python -m venv venv

REM Activar entorno virtual
call venv\Scripts\activate

REM Instalar Flask
pip install flask

REM Ejecutar el chatbot
python chatbot_basic.py

pause
