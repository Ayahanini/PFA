// Chat JavaScript - Version propre sans émojis

class ChatBot {
    constructor() {
        this.isAuthenticated = false;
        this.apiEndpoint = '/api/messages';
        this.init();
    }
    
    async init() {
        console.log('Initialisation du ChatBot...');
        
        // Vérifier l'authentification d'abord
        await this.checkAuthentication();
        
        // Initialiser l'interface
        this.setupUI();
        
        // Message de bienvenue
        if (this.isAuthenticated) {
            this.addBotMessage("Bonjour ! Je suis votre assistant médical. Comment puis-je vous aider ?", [
                "Evaluer mon risque cardiaque",
                "Symptomes inhabituels", 
                "Conseils preventifs"
            ]);
        } else {
            this.addBotMessage("Vous devez être connecté pour utiliser le chatbot.", [
                "Se connecter"
            ]);
        }
    }
    
    async checkAuthentication() {
        try {
            console.log('Vérification de l\'authentification...');
            
            const response = await fetch('/api/chat/test-auth', {
                method: 'GET',
                credentials: 'include'
            });
            
            console.log('Auth response status:', response.status);
            
            if (response.status === 401) {
                console.log('Non authentifié');
                this.isAuthenticated = false;
                return;
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('Authentifié:', data);
                this.isAuthenticated = true;
            } else {
                console.log('Réponse non-JSON, probablement redirigé');
                this.isAuthenticated = false;
            }
            
        } catch (error) {
            console.error('Erreur d\'authentification:', error);
            this.isAuthenticated = false;
        }
    }
    
    setupUI() {
        // Trouver les éléments de l'interface
        this.chatContainer = this.findElement([
            '#chat-messages',
            '.chat-messages',
            '.messages-container',
            '[data-chat-messages]'
        ]);
        
        this.messageInput = this.findElement([
            '#message-input',
            '#messageInput',
            'input[name="message"]',
            '.message-input',
            'input[type="text"]:last-of-type'
        ]);
        
        this.sendButton = this.findElement([
            '#send-button',
            '#sendButton',
            'button[type="submit"]',
            '.send-button',
            'button:last-of-type'
        ]);
        
        console.log('Éléments UI trouvés:', {
            chat: !!this.chatContainer,
            input: !!this.messageInput,
            button: !!this.sendButton
        });
        
        // Attacher les événements
        this.attachEvents();
    }
    
    findElement(selectors) {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
        }
        return null;
    }
    
    attachEvents() {
        if (this.sendButton) {
            this.sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }
        
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }
    
    async sendMessage() {
        if (!this.isAuthenticated) {
            this.addBotMessage("Vous devez être connecté. Veuillez vous connecter et recharger la page.", ["Se connecter"]);
            return;
        }
        
        const message = this.messageInput?.value?.trim();
        if (!message) return;
        
        // Afficher le message utilisateur
        this.addUserMessage(message);
        this.messageInput.value = '';
        
        // Indicateur de typing
        this.showTyping();
        
        try {
            console.log('Envoi du message:', message);
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ message: message })
            });
            
            console.log('Statut réponse:', response.status);
            console.log('Type contenu:', response.headers.get('content-type'));
            
            // Récupérer le contenu en texte d'abord
            const responseText = await response.text();
            console.log('Réponse brute (100 premiers caractères):', responseText.substring(0, 100));
            
            this.hideTyping();
            
            // Gérer les différents types de réponses
            if (response.status === 401) {
                this.isAuthenticated = false;
                this.addBotMessage("Session expirée. Veuillez vous reconnecter.", ["Se connecter"]);
                return;
            }
            
            if (response.status === 302 || responseText.includes('<html>')) {
                this.isAuthenticated = false;
                this.addBotMessage("Redirection détectée. Veuillez vous connecter.", ["Se connecter"]);
                return;
            }
            
            // Essayer de parser le JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Erreur parsing JSON:', parseError);
                this.addBotMessage("Réponse invalide du serveur. Veuillez réessayer.", ["Réessayer"]);
                return;
            }
            
            console.log('Données parsées:', data);
            
            // Traiter la réponse
            if (data.success && data.response) {
                this.addBotMessage(data.response, data.suggestions || []);
            } else if (data.error) {
                this.addBotMessage("Erreur: " + (data.message || data.error), ["Réessayer"]);
            } else {
                this.addBotMessage("Réponse inattendue du serveur.", ["Réessayer"]);
            }
            
        } catch (error) {
            console.error('Erreur réseau:', error);
            this.hideTyping();
            this.addBotMessage("Erreur de connexion. Vérifiez votre réseau.", ["Réessayer"]);
        }
    }
    
    addUserMessage(message) {
        if (!this.chatContainer) {
            console.warn('Container de chat non trouvé');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = 
            '<div class="message-content">' +
                '<p>' + this.escapeHtml(message) + '</p>' +
                '<span class="message-time">' + this.getTimeString() + '</span>' +
            '</div>';
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addBotMessage(message, suggestions = []) {
        if (!this.chatContainer) {
            console.warn('Container de chat non trouvé');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        let suggestionsHtml = '';
        if (suggestions && suggestions.length > 0) {
            const suggestionButtons = suggestions.map(suggestion => {
                if (suggestion === "Se connecter") {
                    return '<button class="suggestion-btn" onclick="window.location.href=\'/auth/login\'">' + this.escapeHtml(suggestion) + '</button>';
                } else {
                    return '<button class="suggestion-btn" onclick="chatBot.selectSuggestion(\'' + this.escapeHtml(suggestion) + '\')">' + this.escapeHtml(suggestion) + '</button>';
                }
            }).join('');
            
            suggestionsHtml = '<div class="suggestions">' + suggestionButtons + '</div>';
        }
        
        messageDiv.innerHTML = 
            '<div class="message-content">' +
                '<p>' + this.escapeHtml(message) + '</p>' +
                suggestionsHtml +
                '<span class="message-time">' + this.getTimeString() + '</span>' +
            '</div>';
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    selectSuggestion(suggestion) {
        if (this.messageInput) {
            this.messageInput.value = suggestion;
            this.sendMessage();
        }
    }
    
    showTyping() {
        if (!this.chatContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = 
            '<div class="message-content">' +
                '<p>L\'assistant médical réfléchit...</p>' +
            '</div>';
        
        this.chatContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    scrollToBottom() {
        if (this.chatContainer) {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getTimeString() {
        return new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
    
    // Méthodes de diagnostic
    async diagnose() {
        console.log('=== DIAGNOSTIC CHATBOT ===');
        
        // Test 1: Authentification
        console.log('1. Test d\'authentification...');
        await this.checkAuthentication();
        console.log('   Résultat:', this.isAuthenticated ? 'Connecté' : 'Non connecté');
        
        // Test 2: Éléments UI
        console.log('2. Test des éléments UI...');
        console.log('   Chat container:', this.chatContainer ? 'Trouvé' : 'Manquant');
        console.log('   Message input:', this.messageInput ? 'Trouvé' : 'Manquant');
        console.log('   Send button:', this.sendButton ? 'Trouvé' : 'Manquant');
        
        // Test 3: API Backend
        console.log('3. Test de l\'API backend...');
        try {
            const response = await fetch('/api/chat/test');
            const data = await response.json();
            console.log('   API Status:', data);
        } catch (error) {
            console.log('   Erreur API:', error);
        }
        
        console.log('=== FIN DIAGNOSTIC ===');
    }
}

// Initialisation globale
let chatBot;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, initialisation ChatBot...');
    chatBot = new ChatBot();
    
    // Exposer la fonction de diagnostic globalement
    window.diagnoseChatbot = function() {
        if (chatBot) {
            chatBot.diagnose();
        } else {
            console.log('ChatBot non initialisé');
        }
    };
});

// Fonctions utilitaires globales
window.testChatAuth = async function() {
    try {
        const response = await fetch('/api/chat/test-auth');
        const text = await response.text();
        console.log('Auth test result:', text);
    } catch (error) {
        console.error('Auth test error:', error);
    }
};

window.testChatAPI = async function() {
    try {
        const response = await fetch('/api/chat/test');
        const data = await response.json();
        console.log('API test result:', data);
    } catch (error) {
        console.error('API test error:', error);
}
};
