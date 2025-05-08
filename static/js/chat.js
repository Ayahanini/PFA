document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const messageForm = document.getElementById('message-form');
    const userInput = document.getElementById('user-input');
    const quickButtons = document.querySelectorAll('.quick-btn');
    const backButton = document.getElementById('back-btn');

    // Simulation de réponses du chatbot
    const botResponses = {
        "Rappel médicament": "Vous devez prendre votre Atorvastatine 40mg ce matin avec un verre d'eau. Voulez-vous que je vous rappelle dans 1 heure ?",
        "Symptômes": "Pour évaluer vos symptômes, pourriez-vous préciser :\n1. Ressentez-vous des douleurs thoraciques ?\n2. Avez-vous des essoufflements anormaux ?\n3. Remarquez-vous des palpitations ?",
        "Rendez-vous": "Votre prochain rendez-vous avec le Dr. Martin est prévu le 15/06/2023 à 14h30. Souhaitez-vous le modifier ?",
        "default": "Je suis votre assistant cardiaque. Posez-moi vos questions sur vos médicaments, symptômes ou rendez-vous."
    };

    // Gestion de l'envoi de messages
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            userInput.value = '';
            
            // Réponse automatique après 1 seconde
            setTimeout(() => {
                const botResponse = getBotResponse(message);
                addMessage(botResponse, 'bot');
                scrollToBottom();
            }, 1000);
        }
    });

    // Gestion des boutons rapides
    quickButtons.forEach(button => {
        button.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            userInput.value = query;
            messageForm.dispatchEvent(new Event('submit'));
        });
    });

    // Bouton de retour
    backButton.addEventListener('click', function() {
        window.location.href = '/profile';
    });

    // Fonction pour ajouter un message
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${text.replace(/\n/g, '<br>')}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Fonction pour obtenir une réponse du bot
    function getBotResponse(message) {
        for (const [key, value] of Object.entries(botResponses)) {
            if (message.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
        return botResponses.default;
    }

    // Faire défiler vers le bas
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Message de bienvenue initial
    setTimeout(() => {
        addMessage(botResponses.default, 'bot');
    }, 500);
});