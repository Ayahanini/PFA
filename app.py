from flask import request, jsonify
from models import predict_heart_disease , charger_modele, predire_risque
from knowledge_base import get_medical_response
from utils import log_message
from chatbot import analyser_question
from errors import handle_model_prediction_error, handle_missing_data_error
modele = charger_modele()
def initialize_routes(app):
    """Initialise les routes Flask."""
    
    @app.route("/predict", methods=["POST"])
    def predict():
        """Route pour prédire le risque de maladie cardiaque."""
        try:
            if not request.is_json:
                return handle_missing_data_error("Le corps de la requête doit être en JSON")
            
            data = request.get_json()
            valeurs = data.get("features")
            if not valeurs:
                return handle_missing_data_error("features")
            
            result = predire_risque(modele, valeurs)
            return jsonify(result)
        except Exception as e:
            return handle_model_prediction_error(e)

    @app.route("/chat", methods=["POST"])
    def chat():
        try:
            if not request.is_json:
                return jsonify({"error": "Le corps de la requête doit être en JSON"}), 400
            
            data = request.get_json()
            user_message = data.get("message")
            if not user_message:
                return jsonify({"error": "Le champ 'message' est vide"}), 400
            
            # Enregistrer le message dans les logs
            log_message(user_message)
            
            # Traitement du message (par exemple, appel à la base de connaissances)
            response = get_medical_response(user_message)
            return jsonify({"response": response})
        except Exception as e:
            return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500


    @app.route("/")
    def home():
      return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Chatbot Médical</title>
        <style>
            body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
            #chat-container { height: 400px; border: 1px solid #ccc; padding: 10px; overflow-y: auto; margin-bottom: 10px; }
            #user-input { width: 80%; padding: 8px; }
            button { padding: 8px 15px; }
        </style>
    </head>
    <body>
        <h1>Chatbot Médical</h1>
        <div id="chat-container"></div>
        <input type="text" id="user-input" placeholder="Posez votre question médicale...">
        <button onclick="sendMessage()">Envoyer</button>

        <script>
            function sendMessage() {
                const userInput = document.getElementById('user-input');
                const chatContainer = document.getElementById('chat-container');
                
                if (!userInput.value.trim()) return;
                
                // Afficher le message de l'utilisateur
                chatContainer.innerHTML += <p><strong>Vous:</strong> ${userInput.value}</p>;
                
                // Envoyer le message au serveur
                fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: userInput.value
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    // Afficher la réponse du chatbot
                    chatContainer.innerHTML += <p><strong>Chatbot:</strong> ${data.response}</p>;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    chatContainer.innerHTML += <p><strong>Erreur:</strong> Impossible de communiquer avec le serveur</p>;
                });
                
                userInput.value = '';
            }
            
            // Permettre l'envoi avec la touche Entrée
            document.getElementById('user-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        </script>
    </body>
   </html>
    """
