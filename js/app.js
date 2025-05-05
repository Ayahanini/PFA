const chatbox = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', async () => {
    const question = userInput.value.trim();
    if (!question) return;

    // Afficher la question dans le chatbox
    addMessage('user', question);
    userInput.value = '';

    // Envoyer la question au serveur Flask
    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });
        const data = await response.json();

        // Afficher la réponse dans le chatbox
        addMessage('bot', data.response);
    } catch (error) {
        addMessage('bot', "Erreur : Impossible de contacter le serveur.");
    }
});

function addMessage(sender, text) {
    const message = document.createElement('div');
    message.classList.add('message', sender);
    message.textContent = text;
    chatbox.appendChild(message);
    chatbox.scrollTop = chatbox.scrollHeight;
}