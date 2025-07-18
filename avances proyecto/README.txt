
# YucaFit Chatbot - Pedido Web

Proyecto web para gestionar pedidos de productos YucaFit mediante un chatbot inteligente y notificaciones automáticas por WhatsApp.

## ¿Qué incluye este proyecto?

- **Backend Flask** (`app.py`):
  - API REST para chat, pedidos y notificaciones.
  - Validación estricta de datos (teléfono solo números).
  - Extracción automática de productos desde el HTML.
  - Almacenamiento de pedidos en SQLite.
  - Notificación de pedidos y resúmenes vía WhatsApp.

- **Frontend**:
  - Formulario de pedidos con validación en HTML y JS.
  - Chatbot flotante para atención y pedidos.
  - Interfaz minimalista y responsiva.

- **APIs utilizadas**:
  - **OpenRouter (OpenAI API)**: Genera respuestas inteligentes en el chatbot usando GPT-4o.
  - **Twilio API**: Envía mensajes y notificaciones por WhatsApp tanto al cliente como al administrador.

- **Validaciones**:
  - Teléfono: Solo acepta números (backend, frontend y HTML).
  - Campos obligatorios en el formulario.

- **Base de datos**:
  - SQLite (`pedidos.db`): Guarda todos los pedidos realizados.

- **Archivos principales**:
  - `app.py`: Lógica backend y endpoints.
  - `static/main.js`: Chatbot y lógica de pedidos.
  - `static/styles.css`: Estilos básicos.
  - `templates/index.html`: Página principal y chat.
  - `requirements.txt`: Dependencias Python.
  - `.env`: Claves API (no se incluye, ver ejemplo abajo).
  - `.gitignore`: Ignora archivos sensibles y temporales.

## Instalación rápida
1. Crea un entorno virtual:
   - Windows: `python -m venv venv`
   - Linux/Mac: `python3 -m venv venv`
2. Activa el entorno virtual:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
3. Instala dependencias:
   - `pip install -r requirements.txt`
4. Crea un archivo `.env` en la raíz con tus claves:
   ```env
   OPENROUTER_API_KEY=tu_clave_openrouter
   TWILIO_ACCOUNT_SID=tu_sid_twilio
   TWILIO_AUTH_TOKEN=tu_token_twilio
   TWILIO_WHATSAPP_FROM=whatsapp:+584XXXXXXXXX
   TWILIO_WHATSAPP_TO=whatsapp:+584XXXXXXXXX
   TWILIO_CONTENT_SID=opcional
   ```
5. Ejecuta la app:
   - `python app.py`

## Estructura
- `app.py`: Backend Flask, lógica de pedidos y WhatsApp.
- `static/main.js`: Chatbot y validaciones frontend.
- `static/styles.css`: Estilos mínimos.
- `templates/index.html`: Web principal y chat.
- `requirements.txt`: Dependencias Python.
- `.gitignore`: Ignora archivos sensibles y temporales.

## Uso
- Abre [http://127.0.0.1:5000](http://127.0.0.1:5000) en tu navegador.
- Completa el formulario o usa el chat para hacer pedidos.
- Recibirás confirmación y detalles por WhatsApp.

## Detalles técnicos
- **Flask**: Framework web para Python.
- **OpenAI (OpenRouter)**: Chatbot inteligente.
- **Twilio**: Mensajería WhatsApp.
- **SQLite**: Base de datos local.
- **Validación**: JS, HTML y backend.




