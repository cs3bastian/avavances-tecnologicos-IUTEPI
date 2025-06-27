# Max AI Chat (ChatGPT-like) - Flask

## Descripción
Max AI Chat es una aplicación web de chat tipo ChatGPT, desarrollada con Flask y diseñada con una interfaz moderna inspirada en Gemini y OpenAI. Permite interactuar con modelos de lenguaje avanzados (GPT-4o vía OpenRouter/OpenAI) en un entorno visual atractivo, portable y fácil de usar.

## ¿Cómo funciona?
- El usuario escribe mensajes en la interfaz web.
- El backend (Flask) recibe el mensaje y lo envía a la API de OpenRouter/OpenAI.
- El modelo responde y la respuesta aparece en la pantalla, diferenciando visualmente los mensajes del usuario y del asistente.
- Todo el procesamiento ocurre en el servidor local, solo la consulta a la IA se realiza vía API.

## Usos principales
- Chat conversacional con IA avanzada.
- Asistente virtual para tareas, dudas, redacción, brainstorming, etc.
- Demostraciones de IA en presentaciones o clases.
- Base para proyectos personalizados de chatbots.

## Requisitos
- Python 3.8+
- Acceso a una API Key de OpenRouter (o OpenAI compatible)

## Instalación y ejecución
1. **Descarga o copia la carpeta del proyecto.**
2. **Crea un entorno virtual:**
   - Windows: `python -m venv venv`
   - Linux/Mac: `python3 -m venv venv`
3. **Activa el entorno virtual:**
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. **Instala dependencias:**
   - `pip install -r requirements.txt`
5. **Configura tu API Key:**
   - Crea un archivo `.env` en la raíz con: `OPENROUTER_API_KEY=tu_api_key`
6. **Inicia el chat:**
   - Windows: `iniciar_chat.bat`
   - Linux/Mac: `bash iniciar_chat.sh`
7. **Abre el navegador en** [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Estructura del proyecto
- `app.py`: Servidor Flask y lógica de conexión con la API.
- `templates/index.html`: Interfaz web principal.
- `static/styles.css`: Estilos modernos y responsivos.
- `static/main.js`: Lógica de interacción del chat.
- `requirements.txt`: Dependencias mínimas.
- `iniciar_chat.bat` / `iniciar_chat.sh`: Scripts de arranque multiplataforma.
- `.env`: Tu clave API (no compartir).

## Portabilidad
- El proyecto es portable: puedes copiarlo a cualquier PC (Windows, Linux, Mac).
- **No copies la carpeta `venv`**: crea el entorno virtual en el destino y ejecuta los pasos de instalación.

## Ejemplo de uso
1. Escribe un mensaje en el chat.
2. Recibe la respuesta de la IA en segundos.
3. Úsalo para resolver dudas, redactar textos, programar, etc.

## Troubleshooting
- Si no responde, revisa tu `.env` y la conexión a internet.
- Si hay errores de dependencias, reinstala con `pip install -r requirements.txt`.
- Si la API Key es inválida, obtén una nueva en [openrouter.ai](https://openrouter.ai/).

## Licencia
Uso educativo y personal. No distribuir claves API.

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



