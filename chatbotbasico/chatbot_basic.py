from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

def obtener_respuesta(mensaje):
    respuestas = {
        'hola': '¡Hola! ¿En qué puedo ayudarte?',
        'adiós': '¡Hasta luego! Que tengas un buen día.',
        'cómo estás': 'Estoy bien, gracias por preguntar.',
        'quién eres': 'Soy un chatbot básico creado para ayudarte.',
        'qué puedes hacer': 'Puedo responder preguntas básicas y conversar contigo.',
        'gracias': '¡De nada! ¿En qué más puedo ayudarte?',
        'cuál es tu nombre': 'Me llamo Max AI, tu asistente virtual.',
        'qué día es hoy': 'Hoy es un gran día para aprender algo nuevo.',
        'cuál es la capital de francia': 'La capital de Francia es París.',
        'cuántos años tienes': 'No tengo edad, soy un programa.',
        'te gusta la música': '¡Claro! Aunque no puedo escuchar, me encanta la música.',
        'cuál es tu color favorito': 'Me gustan todos los colores, pero el azul es especial.',
        'cuál es el sentido de la vida': '¡Buena pregunta! Para muchos, es ser feliz y ayudar a los demás.',
        'cuéntame un chiste': '¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas.',
        'default': 'Lo siento, no entiendo tu mensaje.'
    }
    mensaje = mensaje.lower()
    for clave in respuestas:
        if clave in mensaje:
            return respuestas[clave]
    return respuestas['default']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    mensaje = data.get('mensaje', '')
    respuesta = obtener_respuesta(mensaje)
    return jsonify({'respuesta': respuesta})

if __name__ == '__main__':
    import threading
    import webbrowser
    def open_navegador():
        webbrowser.open('http://127.0.0.1:5000')
    threading.Timer(1, open_navegador).start()
    app.run(debug=True)
