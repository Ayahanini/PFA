// Chat JavaScript - Version Complète
class ChatBot {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.medicalPanel = document.getElementById('medicalPanel');
        this.medicalForm = document.getElementById('medicalForm');
        this.predictionResult = document.getElementById('predictionResult');
        this.emergencyModal = document.getElementById('emergencyModal');
        
        this.initializeEventListeners();
        this.responses = this.initializeBotResponses();
        this.conversationHistory = [];
        
        // Simulation d'état utilisateur
        this.userProfile = {
            name: 'Patient',
            lastAssessment: new Date(),
            riskLevel: 'faible',
            medications: ['Aspirine 100mg', 'Lisinopril 10mg']
        };
    }

    initializeEventListeners() {
        // Envoi de message avec Enter
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Formulaire médical
        this.medicalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.analyzeMedicalData();
        });

        // Fermeture des modales avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMedicalPanel();
                this.closeEmergencyModal();
            }
        });
    }

    initializeBotResponses() {
        return {
            greetings: [
                "Bonjour ! Comment vous sentez-vous aujourd'hui ?",
                "Salut ! Que puis-je faire pour vous aider avec votre santé ?",
                "Bonjour ! Avez-vous des préoccupations médicales aujourd'hui ?"
            ],
            symptoms: [
                "Pouvez-vous décrire vos symptômes plus en détail ? Depuis quand les ressentez-vous ?",
                "Ces symptômes sont-ils nouveaux ou récurrents ? Y a-t-il des facteurs déclenchants ?",
                "Je vous recommande de consulter un médecin si ces symptômes persistent. En attendant, voici quelques conseils..."
            ],
            medications: [
                "Il est important de prendre vos médicaments régulièrement. Avez-vous des difficultés avec votre traitement ?",
                "Voici un rappel de vos médicaments actuels. N'hésitez pas à me poser des questions sur leur usage.",
                "Je peux vous aider à configurer des rappels pour vos médicaments. Souhaitez-vous que je le fasse ?"
            ],
            emergency: [
                "Si vous ressentez une douleur thoracique intense, des difficultés respiratoires ou des étourdissements sévères, contactez immédiatement les services d'urgence !",
                "En cas d'urgence médicale, appelez le 15 (SAMU) ou le 112. Ne tardez pas !",
                "Votre sécurité est prioritaire. Si vous avez des doutes sur la gravité de vos symptômes, consultez rapidement."
            ],
            assessment: [
                "Je vais vous guider dans une évaluation de votre risque cardiaque. Cela ne remplace pas un avis médical professionnel.",
                "Commençons par collecter quelques informations sur votre santé. Tout restera confidentiel.",
                "Cette évaluation utilise l'intelligence artificielle pour estimer votre risque. Prêt à commencer ?"
            ]
        };
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Ajouter le message utilisateur
        this.addMessage(message, 'user');
        this.conversationHistory.push({ type: 'user', content: message, timestamp: new Date() });

        // Vider l'input
        this.messageInput.value = '';

        // Afficher l'indicateur de frappe
        this.showTypingIndicator();

        // Réponse du bot avec délai réaliste
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateBotResponse(message);
            this.addMessage(response.text, 'bot', response.suggestions);
            this.conversationHistory.push({ type: 'bot', content: response.text, timestamp: new Date() });
        }, 800 + Math.random() * 1200);
    }

    addMessage(content, sender, suggestions = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const textP = document.createElement('p');
        textP.textContent = content;
        contentDiv.appendChild(textP);

        // Ajouter les suggestions si fournies
        if (suggestions && sender === 'bot' && suggestions.length > 0) {
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'message-suggestions';
            suggestions.forEach(suggestion => {
                const btn = document.createElement('button');
                btn.className = 'suggestion-btn';
                btn.textContent = suggestion;
                btn.onclick = () => this.sendSuggestion(suggestion);
                suggestionsDiv.appendChild(btn);
            });
            contentDiv.appendChild(suggestionsDiv);
        }

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = this.formatTime(new Date());
        contentDiv.appendChild(timeSpan);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-message';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Détection d'urgence
        if (this.isEmergency(message)) {
            setTimeout(() => this.showEmergencyModal(), 1000);
            return {
                text: this.getRandomResponse('emergency'),
                suggestions: ['Appeler les secours', 'Voir les contacts d\'urgence']
            };
        }
        
        // Détection du type de message avec suggestions appropriées
        if (this.containsKeywords(message, ['bonjour', 'salut', 'hello', 'bonsoir', 'hey'])) {
            return {
                text: this.getRandomResponse('greetings'),
                suggestions: ['Évaluation cardiaque', 'Mes médicaments', 'Conseils santé']
            };
        }
        
        if (this.containsKeywords(message, ['mal', 'douleur', 'symptôme', 'fatigue', 'essoufflement', 'vertige'])) {
            return {
                text: this.getRandomResponse('symptoms'),
                suggestions: ['Évaluer le risque', 'Contact urgence', 'Conseils repos']
            };
        }
        
        if (this.containsKeywords(message, ['médicament', 'pilule', 'traitement', 'rappel', 'ordonnance'])) {
            return {
                text: this.getRandomResponse('medications'),
                suggestions: ['Voir mes médicaments', 'Configurer rappels', 'Effets secondaires']
            };
        }
        
        if (this.containsKeywords(message, ['évaluation', 'risque', 'analyse', 'prédiction', 'test'])) {
            setTimeout(() => this.showMedicalPanel(), 1000);
            return {
                text: this.getRandomResponse('assessment'),
                suggestions: ['Commencer maintenant', 'Plus d\'infos', 'Résultats précédents']
            };
        }
        
        // Réponses contextuelles spécifiques
        if (this.containsKeywords(message, ['tension', 'pression', 'artérielle', 'hypertension'])) {
            return {
                text: "La tension artérielle normale est généralement inférieure à 120/80 mmHg. Avez-vous mesuré la vôtre récemment ? Je peux vous aider à interpréter vos résultats.",
                suggestions: ['Interpréter résultats', 'Conseils réduction', 'Mesurer tension']
            };
        }
        
        if (this.containsKeywords(message, ['cholestérol', 'lipides', 'gras'])) {
            return {
                text: "Le cholestérol total devrait idéalement être inférieur à 200 mg/dL. Un mode de vie sain avec une alimentation équilibrée et de l'exercice aide à le maintenir. Souhaitez-vous des conseils nutritionnels ?",
                suggestions: ['Conseils nutrition', 'Exercices recommandés', 'Interpréter analyses']
            };
        }
        
        if (this.containsKeywords(message, ['exercice', 'sport', 'activité', 'marche', 'course'])) {
            return {
                text: "L'exercice régulier est excellent pour la santé cardiaque ! Je recommande 150 minutes d'activité modérée par semaine. Voulez-vous que je vous aide à planifier un programme adapté ?",
                suggestions: ['Programme exercices', 'Exercices cardio', 'Précautions']
            };
        }

        if (this.containsKeywords(message, ['stress', 'anxiété', 'nerveux', 'inquiet'])) {
            return {
                text: "Le stress peut affecter votre santé cardiaque. Des techniques de relaxation comme la respiration profonde, la méditation ou le yoga peuvent aider. Voulez-vous que je vous guide ?",
                suggestions: ['Techniques relaxation', 'Exercices respiration', 'Gérer le stress']
            };
        }

        if (this.containsKeywords(message, ['alimentation', 'nutrition', 'régime', 'manger'])) {
            return {
                text: "Une alimentation saine pour le cœur comprend des fruits, légumes, poissons gras, noix et grains entiers. Limitez le sel, les graisses saturées et les sucres ajoutés.",
                suggestions: ['Recettes santé', 'Aliments à éviter', 'Plan alimentaire']
            };
        }
        
        // Réponse générale avec suggestions contextuelles
        return {
            text: "Je comprends votre préoccupation. Pouvez-vous me donner plus de détails ? Je suis là pour vous aider avec vos questions de santé cardiaque.",
            suggestions: ['Évaluation complète', 'Questions fréquentes', 'Parler à un médecin']
        };
    }

    isEmergency(message) {
        const emergencyKeywords = [
            'urgence', 'douleur poitrine', 'crise cardiaque', 'infarctus', 
            'respiration difficile', 'étourdissement grave', 'malaise',
            'douleur bras gauche', 'oppression thoracique', 'syncope',
            'palpitations intenses', 'sueurs froides', 'nausées soudaines'
        ];
        return emergencyKeywords.some(keyword => message.includes(keyword));
    }

    containsKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    getRandomResponse(category) {
        const responses = this.responses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    sendSuggestion(suggestion) {
        this.messageInput.value = suggestion;
        this.sendMessage();
    }

    formatTime(date) {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    // Fonctions pour les actions rapides
    startHealthAssessment() {
        this.showMedicalPanel();
        this.addMessage("J'aimerais faire une évaluation de mon risque cardiaque", 'user');
        setTimeout(() => {
            this.addMessage(this.getRandomResponse('assessment'), 'bot', ['Commencer l\'évaluation', 'En savoir plus']);
        }, 1000);
    }

    showMedicationReminder() {
        const medications = this.userProfile.medications;
        let reminderText = "📋 Rappel de vos médicaments :\n\n";
        medications.forEach((med, index) => {
            reminderText += `• ${med} - Prochaine prise dans ${(index + 1) * 30} minutes\n`;
        });
        reminderText += "\n💡 N'oubliez pas de les prendre avec un verre d'eau !";
        
        this.addMessage("Peux-tu me rappeler mes médicaments ?", 'user');
        setTimeout(() => {
            this.addMessage(reminderText, 'bot', ['Configurer rappels', 'Ajouter médicament', 'Effets secondaires']);
        }, 800);
    }

    emergencyContact() {
        this.showEmergencyModal();
    }

    // Gestion du panel médical
    showMedicalPanel() {
        this.medicalPanel.classList.add('active');
    }

    closeMedicalPanel() {
        this.medicalPanel.classList.remove('active');
        this.predictionResult.style.display = 'none';
    }

    // Analyse des données médicales
    async analyzeMedicalData() {
        const data = {
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            bloodPressure: parseInt(document.getElementById('bloodPressure').value) || null,
            cholesterol: parseInt(document.getElementById('cholesterol').value) || null,
            heartRate: parseInt(document.getElementById('heartRate').value) || null,
            smoking: document.getElementById('smoking').checked,
            diabetes: document.getElementById('diabetes').checked,
            familyHistory: document.getElementById('familyHistory').checked
        };

        // Validation des données
        if (!data.age || !data.gender) {
            this.showError('Veuillez remplir au moins l\'âge et le sexe.');
            return;
        }

        // Affichage du loading
        this.showLoading();

        try {
            // Utilisation du système ML si disponible
            let prediction;
            if (window.predictHeartRisk) {
                prediction = await window.predictHeartRisk(data);
            } else {
                // Fallback vers calcul simple
                prediction = this.calculateRiskPrediction(data);
            }
            
            this.displayPredictionResult(prediction);
            this.hideLoading();
            
            // Ajouter le résultat au chat
            setTimeout(() => {
                const riskText = this.getRiskText(prediction.riskLevel || prediction.level);
                this.addMessage(`✅ Analyse terminée ! Votre risque cardiaque est évalué comme ${riskText}. Consultez le panel à droite pour les détails et recommandations.`, 'bot', ['Voir détails', 'Nouvelles recommandations', 'Sauvegarder résultat']);
            }, 500);
            
        } catch (error) {
            this.hideLoading();
            this.showError('Erreur lors de l\'analyse. Veuillez réessayer.');
            console.error('Erreur ML:', error);
        }
    }

    calculateRiskPrediction(data) {
        // Algorithme simplifié de prédiction de risque cardiaque
        let riskScore = 0;
        
        // Facteurs d'âge
        if (data.age > 65) riskScore += 3;
        else if (data.age > 55) riskScore += 2;
        else if (data.age > 45) riskScore += 1;
        
        // Facteur de genre
        if (data.gender === 'M' && data.age > 45) riskScore += 1;
        if (data.gender === 'F' && data.age > 55) riskScore += 1;
        
        // Tension artérielle
        if (data.bloodPressure > 140) riskScore += 3;
        else if (data.bloodPressure > 130) riskScore += 2;
        else if (data.bloodPressure > 120) riskScore += 1;
        
        // Cholestérol
        if (data.cholesterol > 240) riskScore += 2;
        else if (data.cholesterol > 200) riskScore += 1;
        
        // Fréquence cardiaque
        if (data.heartRate > 100) riskScore += 1;
        else if (data.heartRate < 60) riskScore += 1;
        
        // Facteurs de risque
        if (data.smoking) riskScore += 3;
        if (data.diabetes) riskScore += 2;
        if (data.familyHistory) riskScore += 2;
        
        // Détermination du niveau de risque
        let level, recommendations;
        if (riskScore <= 3) {
            level = 'low';
            recommendations = [
                'Continuez vos bonnes habitudes de vie',
                'Maintenez une alimentation équilibrée',
                'Pratiquez une activité physique régulière',
                'Contrôles médicaux annuels recommandés'
            ];
        } else if (riskScore <= 7) {
            level = 'moderate';
            recommendations = [
                'Consultez votre médecin pour un suivi',
                'Réduisez la consommation de sel et de graisses saturées',
                'Augmentez votre activité physique progressivement',
                'Surveillez régulièrement votre tension artérielle',
                'Contrôles médicaux tous les 6 mois'
            ];
        } else {
            level = 'high';
            recommendations = [
                '⚠️ Consultez rapidement un cardiologue',
                'Suivez strictement les recommandations médicales',
                'Surveillez quotidiennement vos paramètres vitaux',
                'Évitez les efforts intenses sans avis médical',
                'Contrôles médicaux fréquents nécessaires'
            ];
        }
        
        return {
            level: level,
            score: riskScore,
            percentage: Math.min(95, Math.max(5, (riskScore / 15) * 100)),
            recommendations: recommendations
        };
    }

    getRiskText(level) {
        const riskTexts = {
            low: 'faible',
            moderate: 'modéré', 
            high: 'élevé'
        };
        return riskTexts[level] || 'indéterminé';
    }

    displayPredictionResult(prediction) {
        const resultDiv = document.getElementById('predictionResult');
        const riskLevelDiv = document.getElementById('riskLevel');
        const recommendationsDiv = document.getElementById('recommendations');
        
        // Configuration du niveau de risque
        const riskConfig = {
            low: { text: 'Risque Faible', class: 'low', icon: '💚' },
            moderate: { text: 'Risque Modéré', class: 'moderate', icon: '🟡' },
            high: { text: 'Risque Élevé', class: 'high', icon: '🔴' }
        };
        
        const level = prediction.riskLevel || prediction.level;
        const config = riskConfig[level];
        
        riskLevelDiv.className = `risk-level ${config.class}`;
        riskLevelDiv.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${config.icon}</div>
            <div style="font-size: 1.2rem; font-weight: bold;">${config.text}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">Score: ${prediction.score || 0}/15 (${Math.round(prediction.percentage || 0)}%)</div>
        `;
        
        recommendationsDiv.innerHTML = `
            <h5>Recommandations Personnalisées</h5>
            <ul>
                ${prediction.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            <p style="margin-top: 1rem; font-style: italic; color: var(--gray-600);">
                ⚠️ Cette évaluation est indicative et ne remplace pas un diagnostic médical professionnel.
            </p>
        `;
        
        resultDiv.style.display = 'block';
        
        // Mise à jour du profil utilisateur
        this.userProfile.lastAssessment = new Date();
        this.userProfile.riskLevel = level;
        this.updateHealthSummary();
    }

    updateHealthSummary() {
        // Mise à jour du résumé de santé dans la sidebar
        const riskElement = document.querySelector('.metric-value');
        if (riskElement) {
            const riskConfig = {
                low: { text: 'Faible', class: 'low' },
                moderate: { text: 'Modéré', class: 'moderate' },
                high: { text: 'Élevé', class: 'high' }
            };
            
            const config = riskConfig[this.userProfile.riskLevel];
            if (config) {
                riskElement.textContent = config.text;
                riskElement.className = `metric-value ${config.class}`;
            }
        }
    }

    showLoading() {
        const button = document.querySelector('.analyze-btn');
        if (button) {
            button.innerHTML = '<div class="loading-spinner"></div> Analyse en cours...';
            button.disabled = true;
        }
    }

    hideLoading() {
        const button = document.querySelector('.analyze-btn');
        if (button) {
            button.innerHTML = '<i class="fas fa-brain"></i> Analyser avec l\'IA';
            button.disabled = false;
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        this.medicalForm.insertBefore(errorDiv, this.medicalForm.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Gestion du modal d'urgence
    showEmergencyModal() {
        this.emergencyModal.classList.add('active');
    }

    closeEmergencyModal() {
        this.emergencyModal.classList.remove('active');
    }

    // Fonctions utilitaires
    clearChat() {
        if (confirm('Êtes-vous sûr de vouloir effacer la conversation ?')) {
            this.messagesContainer.innerHTML = '';
            this.conversationHistory = [];
            
            // Réajouter le message de bienvenue
            setTimeout(() => {
                this.addMessage("Conversation effacée. Comment puis-je vous aider ?", 'bot', ['Évaluation cardiaque', 'Mes médicaments', 'Conseils santé']);
            }, 500);
        }
    }

    exportChat() {
        const chatData = {
            user: this.userProfile.name,
            date: new Date().toISOString(),
            conversation: this.conversationHistory,
            lastAssessment: this.userProfile.lastAssessment,
            riskLevel: this.userProfile.riskLevel
        };
        
        const dataStr = JSON.stringify(chatData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `conversation-medicale-${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}.json`;
        link.click();
        
        this.addMessage("💾 Conversation exportée avec succès !", 'bot');
    }

    // Fonctions pour les boutons d'action
    attachFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png,.txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.addMessage(`📎 Fichier joint: ${file.name}`, 'user');
                setTimeout(() => {
                    this.addMessage("J'ai reçu votre fichier. Malheureusement, je ne peux pas encore analyser les fichiers joints, mais cette fonctionnalité sera bientôt disponible !", 'bot', ['Décrire le contenu', 'Autre question']);
                }, 1000);
            }
        };
        input.click();
    }

    voiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'fr-FR';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onstart = () => {
                this.addMessage("🎤 Écoute en cours... Parlez maintenant.", 'bot');
            };
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.addMessage("✅ Message vocal reçu !", 'bot');
            };
            
            recognition.onerror = () => {
                this.addMessage("❌ Erreur lors de la reconnaissance vocale. Veuillez réessayer.", 'bot');
            };
            
            recognition.start();
        } else {
            this.addMessage("❌ La reconnaissance vocale n'est pas supportée par votre navigateur.", 'bot');
        }
    }
}

// Fonctions globales pour les événements
function sendMessage() {
    if (window.chatBot) {
        window.chatBot.sendMessage();
    }
}

function sendSuggestion(suggestion) {
    if (window.chatBot) {
        window.chatBot.sendSuggestion(suggestion);
    }
}

function startHealthAssessment() {
    if (window.chatBot) {
        window.chatBot.startHealthAssessment();
    }
}

function showMedicationReminder() {
    if (window.chatBot) {
        window.chatBot.showMedicationReminder();
    }
}

function emergencyContact() {
    if (window.chatBot) {
        window.chatBot.emergencyContact();
    }
}

function closeMedicalPanel() {
    if (window.chatBot) {
        window.chatBot.closeMedicalPanel();
    }
}

function closeEmergencyModal() {
    if (window.chatBot) {
        window.chatBot.closeEmergencyModal();
    }
}

function clearChat() {
    if (window.chatBot) {
        window.chatBot.clearChat();
    }
}

function exportChat() {
    if (window.chatBot) {
        window.chatBot.exportChat();
    }
}

function attachFile() {
    if (window.chatBot) {
        window.chatBot.attachFile();
    }
}

function voiceInput() {
    if (window.chatBot) {
        window.chatBot.voiceInput();
    }
}

// Initialisation quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    // Créer l'instance globale du chatbot
    window.chatBot = new ChatBot();
    
    // Animation d'entrée des éléments
    const elements = document.querySelectorAll('.chat-sidebar, .chat-main, .medical-panel');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Notification de bienvenue après animation
    setTimeout(() => {
        window.chatBot.addMessage("💡 Astuce: Vous pouvez utiliser les boutons d'action rapide dans la barre latérale pour accéder rapidement aux fonctionnalités principales.", 'bot', ['Découvrir les fonctions', 'Commencer l\'évaluation']);
    }, 3000);
    
    // Simulation de données temps réel
    setInterval(() => {
        updateRealTimeData();
    }, 30000); // Mise à jour toutes les 30 secondes
});

// Mise à jour des données en temps réel
function updateRealTimeData() {
    const now = new Date();
    const timeElements = document.querySelectorAll('.message-time');
    
    // Mettre à jour l'heure du dernier message
    if (timeElements.length > 0) {
        const lastMessage = timeElements[timeElements.length - 1];
        if (lastMessage.textContent.includes(':')) {
            const messageTime = new Date();
            const diffMinutes = Math.floor((now - messageTime) / (1000 * 60));
            
            if (diffMinutes > 0 && diffMinutes < 60) {
                lastMessage.textContent = `Il y a ${diffMinutes} min`;
            } else if (diffMinutes >= 60) {
                const diffHours = Math.floor(diffMinutes / 60);
                lastMessage.textContent = `Il y a ${diffHours}h`;
            }
        }
    }
    
    // Simulation de notifications de médicaments
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    if (minute === 0 && (hour === 8 || hour === 13 || hour === 20)) {
        if (window.chatBot) {
            window.chatBot.addMessage(`⏰ Rappel: Il est temps de prendre vos médicaments !`, 'bot', ['Confirmer prise', 'Reporter 10min', 'Voir médicaments']);
        }
    }
}

// Gestion des raccourcis clavier
document.addEventListener('keydown', function(e) {
    // Ctrl + Entrée pour évaluation rapide
    if (e.ctrlKey && e.key === 'Enter') {
        startHealthAssessment();
    }
    
    // Ctrl + M pour rappel médicaments
    if (e.ctrlKey && e.key === 'm') {
        showMedicationReminder();
    }
    
    // Ctrl + E pour urgence
    if (e.ctrlKey && e.key === 'e') {
        emergencyContact();
    }
    
    // Ctrl + L pour effacer le chat
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearChat();
    }
});

// Gestion de la déconnexion/reconnexion
window.addEventListener('online', function() {
    if (window.chatBot) {
        window.chatBot.addMessage("🌐 Connexion rétablie ! Toutes les fonctionnalités sont disponibles.", 'bot', ['Continuer la conversation']);
    }
});

window.addEventListener('offline', function() {
    if (window.chatBot) {
        window.chatBot.addMessage("⚠️ Connexion perdue. Certaines fonctionnalités peuvent être limitées.", 'bot', ['Mode hors ligne']);
    }
});

// Prévention de la perte de données
window.addEventListener('beforeunload', function(e) {
    if (window.chatBot && window.chatBot.conversationHistory.length > 2) {
        e.preventDefault();
        e.returnValue = 'Êtes-vous sûr de vouloir quitter ? Votre conversation sera perdue.';
        return e.returnValue;
    }
});

// Gestion responsive pour mobile
function handleMobileView() {
    const isMobile = window.innerWidth <= 768;
    const sidebar = document.querySelector('.chat-sidebar');
    const medicalPanel = document.querySelector('.medical-panel');
    const chatContainer = document.querySelector('.chat-container');
    
    if (isMobile) {
        // Masquer la sidebar sur mobile
        if (sidebar) {
            sidebar.style.display = 'none';
        }
        
        // Adapter le container pour mobile
        if (chatContainer) {
            chatContainer.style.gridTemplateColumns = '1fr';
        }
        
        // Adapter le panel médical pour mobile
        if (medicalPanel) {
            medicalPanel.style.position = 'fixed';
            medicalPanel.style.top = '80px';
            medicalPanel.style.right = '0';
            medicalPanel.style.width = '100%';
            medicalPanel.style.height = 'calc(100vh - 80px)';
            medicalPanel.style.zIndex = '1000';
        }
    } else {
        // Rétablir le layout desktop
        if (sidebar) {
            sidebar.style.display = 'block';
        }
        
        if (chatContainer) {
            chatContainer.style.gridTemplateColumns = '300px 1fr 350px';
        }
        
        if (medicalPanel) {
            medicalPanel.style.position = 'static';
            medicalPanel.style.width = 'auto';
            medicalPanel.style.height = 'auto';
            medicalPanel.style.zIndex = 'auto';
        }
    }
}

// Écouter les changements de taille d'écran
window.addEventListener('resize', handleMobileView);

// Gestionnaire de performance du chat
class ChatPerformanceMonitor {
    constructor() {
        this.messageCount = 0;
        this.startTime = Date.now();
        this.lastCleanup = Date.now();
    }
    
    onMessageAdded() {
        this.messageCount++;
        
        // Nettoyage automatique après 100 messages
        if (this.messageCount > 100) {
            this.cleanupOldMessages();
        }
    }
    
    cleanupOldMessages() {
        const messages = document.querySelectorAll('.message');
        if (messages.length > 50) {
            // Garder seulement les 30 derniers messages
            for (let i = 0; i < messages.length - 30; i++) {
                messages[i].remove();
            }
            this.messageCount = 30;
        }
    }
    
    getStats() {
        return {
            messageCount: this.messageCount,
            uptime: Date.now() - this.startTime,
            lastCleanup: this.lastCleanup
        };
    }
}

// Système de sauvegarde automatique
class AutoSave {
    constructor(chatBot) {
        this.chatBot = chatBot;
        this.saveInterval = 30000; // 30 secondes
        this.maxSaves = 5;
        this.init();
    }
    
    init() {
        setInterval(() => {
            this.save();
        }, this.saveInterval);
        
        // Sauvegarder avant de quitter
        window.addEventListener('beforeunload', () => {
            this.save();
        });
    }
    
    save() {
        try {
            const saveData = {
                conversation: this.chatBot.conversationHistory,
                userProfile: this.chatBot.userProfile,
                timestamp: new Date().toISOString()
            };
            
            // Rotation des sauvegardes
            const saves = this.getSaves();
            saves.unshift(saveData);
            if (saves.length > this.maxSaves) {
                saves.splice(this.maxSaves);
            }
            
            localStorage.setItem('cardiacare-chat-saves', JSON.stringify(saves));
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde automatique:', error);
        }
    }
    
    getSaves() {
        try {
            const saves = localStorage.getItem('cardiacare-chat-saves');
            return saves ? JSON.parse(saves) : [];
        } catch (error) {
            return [];
        }
    }
    
    restore(index = 0) {
        const saves = this.getSaves();
        if (saves[index]) {
            const saveData = saves[index];
            this.chatBot.conversationHistory = saveData.conversation;
            this.chatBot.userProfile = saveData.userProfile;
            
            // Reconstruire l'interface
            this.chatBot.messagesContainer.innerHTML = '';
            saveData.conversation.forEach(msg => {
                this.chatBot.addMessage(msg.content, msg.type);
            });
            
            return true;
        }
        return false;
    }
}

// Système de thèmes pour le chat
class ChatThemeManager {
    constructor() {
        this.themes = {
            default: {
                name: 'Médical Classique',
                primary: '#2563eb',
                secondary: '#10b981',
                background: '#ffffff'
            },
            dark: {
                name: 'Mode Sombre',
                primary: '#3b82f6',
                secondary: '#22c55e',
                background: '#1f2937'
            },
            warm: {
                name: 'Chaleureux',
                primary: '#dc2626',
                secondary: '#f59e0b',
                background: '#fef7ed'
            }
        };
        
        this.currentTheme = this.getStoredTheme() || 'default';
        this.applyTheme(this.currentTheme);
    }
    
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;
        
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--chat-background', theme.background);
        
        this.currentTheme = themeName;
        this.storeTheme(themeName);
    }
    
    getStoredTheme() {
        return localStorage.getItem('cardiacare-chat-theme');
    }
    
    storeTheme(themeName) {
        localStorage.setItem('cardiacare-chat-theme', themeName);
    }
    
    getAvailableThemes() {
        return Object.keys(this.themes).map(key => ({
            key,
            name: this.themes[key].name
        }));
    }
}

// Initialisation des systèmes auxiliaires
let performanceMonitor, autoSave, themeManager;

document.addEventListener('DOMContentLoaded', function() {
    // Appeler la fonction de gestion responsive au chargement
    handleMobileView();
    
    // Initialiser les systèmes auxiliaires après le chatbot
    setTimeout(() => {
        if (window.chatBot) {
            performanceMonitor = new ChatPerformanceMonitor();
            autoSave = new AutoSave(window.chatBot);
            themeManager = new ChatThemeManager();
            
            // Surcharger la méthode addMessage pour le monitoring
            const originalAddMessage = window.chatBot.addMessage;
            window.chatBot.addMessage = function(...args) {
                originalAddMessage.apply(this, args);
                performanceMonitor.onMessageAdded();
            };
            
            console.log('✅ Systèmes auxiliaires du chat initialisés');
        }
    }, 1000);
});

// Exposition des utilitaires pour le debug
window.ChatUtils = {
    getPerformanceStats: () => performanceMonitor?.getStats(),
    restoreChat: (index) => autoSave?.restore(index),
    changeTheme: (theme) => themeManager?.applyTheme(theme),
    getThemes: () => themeManager?.getAvailableThemes(),
    exportDebugInfo: () => {
        return {
            performance: performanceMonitor?.getStats(),
            theme: themeManager?.currentTheme,
            saves: autoSave?.getSaves().length || 0,
            chatbot: {
                messages: window.chatBot?.conversationHistory.length || 0,
                userProfile: window.chatBot?.userProfile
            }
        };
    }
};

// Log de démarrage
console.log('🤖 CardiaCare Chat System initialisé');
console.log('💡 Utilisez ChatUtils pour accéder aux outils de debug');