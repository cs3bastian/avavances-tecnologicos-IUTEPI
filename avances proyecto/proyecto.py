from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
import os
import sqlite3
from datetime import datetime
from openai import OpenAI
from bs4 import BeautifulSoup

from telegram import Bot


load_dotenv()
app = Flask(__name__)

# Configuración de Telegram
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN', '7243281660:AAE0DQbeRXi7bmwTKxzbXyumUU9OzgkkHMs')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')  # Debes poner tu chat_id aquí
bot_telegram = Bot(token=TELEGRAM_TOKEN)

# Validar variables de entorno críticas
REQUIRED_ENV_VARS = [
    "OPENROUTER_API_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_WHATSAPP_FROM",
    "TWILIO_WHATSAPP_TO",
]

missing_vars = [var for var in REQUIRED_ENV_VARS if not os.environ.get(var)]
if missing_vars:
    raise RuntimeError(f"Faltan variables de entorno requeridas: {', '.join(missing_vars)}")

# Configura el cliente OpenAI para usar OpenRouter
try:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("OPENROUTER_API_KEY"),
    )
except Exception as e:
    print(f"Error inicializando OpenAI: {e}")
    client = None

@app.route('/')
def index():
    return render_template('index.html')

# Endpoint de salud para monitoreo
@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200

# Extrae productos del HTML con manejo de errores

def extraer_productos():
    try:
        with open(os.path.join('templates', 'index.html'), encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
        productos = []
        for card in soup.select('.product-card'):
            nombre = card.select_one('.product-info h3').get_text(strip=True)
            descripcion_corta = card.select_one('.product-info p').get_text(strip=True)
            descripcion_larga = card.select_one('.product-description p').get_text(strip=True)
            nombre_lower = nombre.lower()
            if 'arepa' in nombre_lower:
                descripcion_larga += "\n\nPresentación: Paquetes de 10 unidades de 100 gramos cada arepa."
            elif 'empanada' in nombre_lower or 'tortilla' in nombre_lower:
                descripcion_larga += "\n\nPresentación: Paquetes de medio kilogramo."
            caracteristicas = [li.get_text(strip=True) for li in card.select('.product-description ul li')]
            productos.append({
                'nombre': nombre,
                'descripcion_corta': descripcion_corta,
                'descripcion_larga': descripcion_larga,
                'caracteristicas': caracteristicas
            })
        return productos
    except Exception:
        return []

# db SQLite
def init_db():
    conn = sqlite3.connect('pedidos.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        contacto TEXT NOT NULL,
        producto TEXT NOT NULL,
        cantidad TEXT NOT NULL,
        localidad TEXT NOT NULL,
        fecha_hora TEXT NOT NULL
    )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.get_json()
    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({'reply': "Por favor, escribe un mensaje."})
    if not client:
        return jsonify({'error': 'El cliente de OpenAI no está disponible.'}), 500
    try:
        productos = extraer_productos()
        contexto_productos = "\n".join([
            f"Producto: {p['nombre']}\nDescripción: {p['descripcion_corta']}\nDetalles: {p['descripcion_larga']}\nCaracterísticas: {', '.join(p['caracteristicas'])}"
            for p in productos
        ])
        system_prompt = (
            "Eres un asistente virtual experto en los productos de YucaFit. "
            "Responde de forma breve, clara y amigable, usando emojis relacionados con salud, comida o atención al cliente. "
            "No repitas signos extraños ni comillas al inicio o final de tus respuestas. "
            "Responde preguntas sobre los productos usando solo la información proporcionada a continuación. "
            "Si es posible, incluye ejemplos concretos o sugerencias de uso basados en la información de los productos. "
            "Si no sabes la respuesta, indica que no tienes información suficiente.\n\n" + contexto_productos
        )
        completion = client.chat.completions.create(
            model="openai/gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=200,
            temperature=0.7,
        )
        # Manejo robusto de la respuesta del modelo
        assistant_reply = completion.choices[0].message.content
        if assistant_reply:
            import re
            # Elimina comillas, saltos de línea, espacios, puntos, guiones y asteriscos al inicio y final
            assistant_reply = re.sub(r'^["\'\n\*\-\·\•\s\.]+', '', assistant_reply)
            assistant_reply = re.sub(r'["\'\n\*\-\·\•\s\.]+$', '', assistant_reply)
            # Reemplaza múltiples espacios por uno solo
            assistant_reply = re.sub(r'\s+', ' ', assistant_reply)
            # Corrige espacios innecesarios al inicio y final
            assistant_reply = assistant_reply.strip()
        else:
            assistant_reply = "No se pudo obtener respuesta del asistente."
        return jsonify({'reply': assistant_reply})
    except Exception as e:
        print(f"Error de comunicación: {e}")
        return jsonify({'error': f'Error al obtener la respuesta de la API: {e}'}), 500

@app.route('/api/notificar-pedido', methods=['POST'])
def notificar_pedido():
    data = request.get_json()
    # Configuración de Telegram
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return jsonify({'ok': False, 'error': 'Faltan variables de entorno de Telegram (TELEGRAM_TOKEN, TELEGRAM_CHAT_ID).'}), 500
    variables = {
        "1": data.get('nombre', ''),
        "2": data.get('contacto', ''),
        "3": data.get('producto', ''),
        "4": data.get('cantidad', ''),
        "5": data.get('localidad', ''),
    }
    variables['6'] = datetime.now().strftime('%d/%m/%Y %H:%M')
    # Validación estricta
    if not all([variables['1'], variables['2'], variables['3'], variables['4'], variables['5']]):
        return jsonify({'ok': False, 'error': 'Faltan datos para el pedido. Por favor, completa todos los campos.'}), 400
    # Validación: solo permitir números en el campo contacto
    if not variables['2'].isdigit():
        return jsonify({'ok': False, 'error': 'El número de teléfono solo debe contener dígitos (sin espacios, guiones ni letras).'}), 400
    try:
        # Guardar el pedido en la base de datos
        conn = sqlite3.connect('pedidos.db')
        c = conn.cursor()
        c.execute('''INSERT INTO pedidos (nombre, contacto, producto, cantidad, localidad, fecha_hora) VALUES (?, ?, ?, ?, ?, ?)''',
                  (variables['1'], variables['2'], variables['3'], variables['4'], variables['5'], variables['6']))
        conn.commit()
        conn.close()
        # Notificar pedido individual por Telegram (solo al bot)
        cuerpo = (
            f"Nuevo pedido YucaFit:\n"
            f"Cliente: {variables['1']}\n"
            f"Número de contacto: {variables['2']}\n"
            f"Producto: {variables['3']}\n"
            f"Cantidad: {variables['4']}\n"
            f"Localidad: {variables['5']}\n"
            f"Fecha y hora: {variables['6']}\n"
            f"\nSu pedido será cotizado y confirmado."
        )
        try:
            bot_telegram.send_message(chat_id=TELEGRAM_CHAT_ID, text=cuerpo)
        except Exception as e:
            print(f"Error enviando mensaje por Telegram: {e}")
            return jsonify({'ok': False, 'error': f'Error enviando mensaje por Telegram: {e}'})
        return jsonify({'ok': True, 'msg': 'Pedido notificado por Telegram'})
    except Exception as e:
        print('Error enviando WhatsApp:', e)
        return jsonify({'ok': False, 'error': str(e)})

@app.route('/api/notificar-resumen-pedidos', methods=['POST'])
def notificar_resumen_pedidos():
    # Configuración de Telegram
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return jsonify({'ok': False, 'error': 'Faltan variables de entorno de Telegram (TELEGRAM_TOKEN, TELEGRAM_CHAT_ID).'}), 500
    try:
        conn = sqlite3.connect('pedidos.db')
        c = conn.cursor()
        c.execute('SELECT nombre, contacto, producto, cantidad, localidad, fecha_hora FROM pedidos ORDER BY id DESC LIMIT 10')
        pedidos = c.fetchall()
        conn.close()
        if not pedidos or len(pedidos) < 10:
            return jsonify({'ok': False, 'msg': 'No hay suficientes pedidos registrados para enviar un resumen (mínimo 10).'}), 200
        resumen = 'Resumen de los últimos 10 pedidos YucaFit:\n'
        for idx, p in enumerate(pedidos, 1):
            resumen += (f"{idx}. {p[0]} ({p[1]})\n   Producto: {p[2]} | Cantidad: {p[3]} | Localidad: {p[4]} | Fecha: {p[5]}\n")
        if len(resumen) > 1600:
            resumen = resumen[:1590] + '\n[Resumen truncado]'
        try:
            bot_telegram.send_message(chat_id=TELEGRAM_CHAT_ID, text=resumen)
        except Exception as e:
            print(f"Error enviando resumen por Telegram: {e}")
            return jsonify({'ok': False, 'error': f'Error enviando resumen por Telegram: {e}'})
        return jsonify({'ok': True, 'msg': 'Resumen enviado por Telegram', 'resumen': resumen})
    except Exception as e:
        import traceback
        print('Error enviando resumen WhatsApp:', e)
        print(traceback.format_exc())
        return jsonify({'ok': False, 'error': str(e), 'trace': traceback.format_exc(), 'resumen': resumen if 'resumen' in locals() else ''})

@app.route('/api/whatsapp-info', methods=['POST'])
def whatsapp_info():
    data = request.get_json()
    mensaje = data.get('mensaje', '').lower()
    numero = data.get('numero', '')
    # Normalizar número
    numero = normalizar_numero_whatsapp(numero)
    respuesta = None
    if any(x in mensaje for x in ['arepa', 'arepas']):
        respuesta = "Las arepas se venden en paquetes de 10 unidades, cada una de 100 gramos."
    elif any(x in mensaje for x in ['empanada', 'empanadas', 'tortilla', 'tortillas']):
        respuesta = "Las empanadas y las tortillas se venden en paquetes de medio kilogramo."
    if respuesta:
        try:
            account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
            auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
            whatsapp_from = os.environ.get('TWILIO_WHATSAPP_FROM')
            if not all([account_sid, auth_token, whatsapp_from]):
                return jsonify({'ok': False, 'error': 'Faltan variables de entorno de Twilio.'}), 500
            client_twilio = Client(account_sid, auth_token)
            client_twilio.messages.create(
                body=respuesta,
                from_=whatsapp_from,
                to=numero
            )
            return jsonify({'ok': True, 'msg': 'Respuesta enviada', 'respuesta': respuesta})
        except Exception as e:
            return jsonify({'ok': False, 'error': str(e)})
    else:
        return jsonify({'ok': False, 'msg': 'No se detectó una consulta válida.'})

# Normalización robusta de número de WhatsApp (función reutilizable)
def normalizar_numero_whatsapp(numero):
    numero = str(numero).strip().replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    if not numero.startswith('+'):
        if numero.startswith('58'):
            numero = '+' + numero
        elif numero.startswith('0'):
            numero = '+58' + numero[1:]
        else:
            numero = '+58' + numero
    if not numero.startswith('whatsapp:'):
        numero = 'whatsapp:' + numero
    return numero

if __name__ == '__main__':
    import threading
    import webbrowser
    def abrir_navegador():
        webbrowser.open_new('http://127.0.0.1:5000/')
    threading.Timer(1.5, abrir_navegador).start()
    app.run(debug=True)