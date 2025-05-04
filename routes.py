from flask import request, jsonify, Blueprint
from models import charger_modele, predire_risque
from knowledge_base import get_medical_response
from utils import log_message
from chatbot import analyser_question
from errors import handle_model_prediction_error, error_response
import nltk
import os

# Création d'un blueprint pour les routes
routes_bp = Blueprint('routes', __name__)

# Variable globale pour le modèle
modele = None

def initialize_routes(app):
    """Initialise les routes Flask, charge le modèle et les ressources NLTK."""
    global modele
    
    # Initialisation de NLTK
    try:
        # Définir le chemin des données NLTK avec plusieurs options
        nltk_data_paths = [
            "nltk_data",  # Dossier local au projet
            os.path.join(os.path.expanduser("~"), "nltk_data"),  # Dossier utilisateur
            os.path.abspath(os.path.join(os.path.dirname(__file__), "nltk_data"))  # Chemin absolu
        ]
        
        # Ajouter les chemins à NLTK
        for path in nltk_data_paths:
            os.makedirs(path, exist_ok=True)
            nltk.data.path.append(path)
        
        # Télécharger les ressources NLTK nécessaires
        nltk.download('punkt', quiet=False)
        nltk.download('stopwords', quiet=False)
        nltk.download('wordnet', quiet=False)
        
        app.logger.info("Ressources NLTK initialisées avec succès")
    except Exception as e:
        app.logger.error(f"Erreur lors de l'initialisation des ressources NLTK: {str(e)}")
    
    # Charger le modèle
    modele = charger_modele()
    app.register_blueprint(routes_bp)

@routes_bp.route("/predict", methods=["POST"])
def predict():
    try:
        # Vérification des données
        if not request.is_json:
            return error_response('INPUT_VALIDATION', "Le corps de la requête doit être en JSON")
        
        data = request.get_json()
        if not data:
            return error_response('MISSING_DATA', "Le corps de la requête est vide")
        
        features = data.get("features")
        if not features:
            return error_response('MISSING_DATA', "Le champ 'features' est manquant")
        
        # Appel au modèle
        result = predire_risque(modele, features)
        return jsonify(result)
        
    except ValueError as e:
        return handle_model_prediction_error(e)
    except Exception as e:
        return error_response('SERVER', str(e), e)

@routes_bp.route("/chat", methods=["POST"])
def chat():
    try:
        if not request.is_json:
            return error_response('INPUT_VALIDATION', "Le corps de la requête doit être en JSON")
        
        data = request.get_json()
        user_message = data.get("message")
        if not user_message:
            return error_response('MISSING_DATA', "Le champ 'message' est vide")
        
        # Vérifier que les ressources NLTK sont disponibles
        try:
            # Test simple pour vérifier que punkt est disponible
            nltk.tokenize.sent_tokenize("Ceci est un test. Assurez-vous que NLTK fonctionne.")
        except LookupError:
            # Si le test échoue, essayer de télécharger punkt à nouveau
            nltk.download('punkt')
        
        # Enregistrer le message dans les logs
        log_message(user_message)
        
        # Traitement du message avec le chatbot
        response = analyser_question(user_message)
        
        return jsonify({"response": response})
    except Exception as e:
        return error_response('SERVER', f"Erreur dans le traitement de la requête chat: {str(e)}", e)

@routes_bp.route("/nltk-status")
def nltk_status():
    """Route de diagnostic pour vérifier l'état des ressources NLTK"""
    try:
        # Vérifier les chemins de données
        paths = nltk.data.path
        
        # Vérifier les packages installés
        packages = []
        try:
            for pkg in nltk.data.find('*'):
                packages.append(str(pkg))
        except:
            pass
        
        # Tester la tokenization
        test_text = "Ceci est un test. Vérifions si NLTK fonctionne correctement."
        tokens = nltk.tokenize.word_tokenize(test_text)
        sentences = nltk.tokenize.sent_tokenize(test_text)
        
        return jsonify({
            "status": "OK",
            "paths": paths,
            "packages": packages[:10],  # Limiter pour éviter une réponse trop grande
            "test_tokenization": {
                "tokens": tokens,
                "sentences": sentences
            }
        })
    except Exception as e:
        return jsonify({
            "status": "ERROR",
            "error": str(e),
            "paths": nltk.data.path
        })

@routes_bp.route("/")
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
            .error { color: red; }
            .status { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <h1>Chatbot Médical</h1>
        <div id="chat-container"></div>
        <input type="text" id="user-input" placeholder="Posez votre question médicale...">
        <button onclick="sendMessage()">Envoyer</button>
        <div class="status">
            <p>Statut du système: <span id="system-status">En attente...</span></p>
            <button onclick="checkStatus()">Vérifier l'état NLTK</button>
        </div>

        <script>
            // Vérifier l'état du système au chargement
            window.onload = function() {
                checkStatus();
            };
            
            function checkStatus() {
                fetch('/nltk-status')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('system-status').textContent = 
                            data.status === 'OK' ? 'Opérationnel' : 'Problème détecté';
                    })
                    .catch(error => {
                        document.getElementById('system-status').textContent = 'Non disponible';
                        document.getElementById('system-status').classList.add('error');
                    });
            }
            
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
