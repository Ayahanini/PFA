async function askBot() {
    const messageInput = document.getElementById("message");
    const responseElement = document.getElementById("response");

    const message = messageInput.value.trim();
    if (!message) {
        responseElement.innerText = "❗ Veuillez entrer une question.";
        return;
    }

    responseElement.innerText = "⏳ Le bot réfléchit...";

    try {
        const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });

        const data = await res.json();
        responseElement.innerText = data.response;
    } catch (error) {
        responseElement.innerText = "❌ Erreur lors de la communication avec le serveur.";
        console.error("Erreur fetch:", error);
    }

    messageInput.value = "";
}
