from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()
print(os.environ.get("OPENROUTER_API_KEY"))
app = Flask(__name__)

# Configura el cliente OpenAI para usar OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY"),
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message') if data else None
    if not user_message:
        return jsonify({'error': 'No message'}), 400

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-4o",  # Cambia por el modelo que prefieras y tengas acceso
            messages=[
                {"role": "system", "content": "Eres un asistente virtual"},
                {"role": "user", "content": user_message}
            ],
            max_tokens=150,
            temperature=0.7,
        )
        assistant_reply = completion.choices[0].message.content
        return jsonify({'reply': assistant_reply})
    except Exception as e:
        print(f"Error de comunicación: {e}")
        return jsonify({'error': 'Error al obtener la respuesta de la API'}), 500

if __name__ == '__main__':
    import threading
    import webbrowser
    def open_browser():
        webbrowser.open_new('http://127.0.0.1:5000/')
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        threading.Timer(1, open_browser).start()
    app.run(debug=True)