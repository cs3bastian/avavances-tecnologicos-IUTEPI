# Instrucciones para ejecutar el chat Max AI en cualquier PC

## 1. Copia el proyecto
Copia toda la carpeta del proyecto (incluyendo static, templates, app.py, requirements.txt, .env, scripts, etc.) a tu pendrive.

## 2. Lleva la carpeta al nuevo dispositivo
Pega la carpeta en cualquier ubicación del nuevo equipo.

## 3. Instala Python
Descarga e instala Python desde https://www.python.org/ si no lo tienes.

## 4. Crea un entorno virtual (recomendado)
Abre una terminal en la carpeta del proyecto y ejecuta:

- En Windows:
  ```
  python -m venv venv
  venv\Scripts\activate
  ```
- En Linux/Mac:
  ```
  python3 -m venv venv
  source venv/bin/activate
  ```

## 5. Instala las dependencias
En la terminal activa, ejecuta:
```
pip install -r requirements.txt
```



## 6. Ejecuta la app
En la terminal activa, ejecuta:

python app.py

Abre tu navegador y ve a: http://localhost:5000



