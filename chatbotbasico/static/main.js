document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chatForm");
    const mensajeInput = document.getElementById("mensajeInput");
    const chatMessages = document.getElementById("chatMessages");

    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const mensaje = mensajeInput.value.trim();
        if (!mensaje) return;

        const userBubble = document.createElement("div");
        userBubble.className = "bubble user";
        userBubble.textContent = mensaje;
        chatMessages.appendChild(userBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        mensajeInput.value = "";
        mensajeInput.focus();

        const loadingBubble = document.createElement("div");
        loadingBubble.className = "bubble bot";
        loadingBubble.textContent = "Cargando...";
        loadingBubble.id = "loadingBubble";
        chatMessages.appendChild(loadingBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensaje: mensaje })
        })
        .then(response => response.json())
        .then(data => {
            const loading = document.getElementById("loadingBubble");
            if (loading) loading.remove();

            const botBubble = document.createElement("div");
            botBubble.className = "bubble bot";
            botBubble.textContent = data.respuesta || data.error || "Error en la respuesta";
            chatMessages.appendChild(botBubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(() => {
            const loading = document.getElementById("loadingBubble");
            if (loading) loading.remove();

            const botBubble = document.createElement("div");
            botBubble.className = "bubble bot";
            botBubble.textContent = "Error de conexión con el servidor.";
            chatMessages.appendChild(botBubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    });
});