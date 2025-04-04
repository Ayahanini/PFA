from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin


# Charger le modèle pré-entraîné
model = joblib.load("modele_heart.pkl")

def predict_heart_disease(data):
    """Prend une liste de caractéristiques et retourne la prédiction."""
    data_array = np.array(data).reshape(1, -1)
    prediction = model.predict(data_array)
    return int(prediction[0])


@app.route("/chat", methods=["POST", "GET"])
def chat():
    print("Headers reçus:", request.headers)  # Voir les en-têtes
    print("Données brutes reçues:", request.data)  # Voir les données envoyées
    
    try:
        json_data = request.get_json()
        print("JSON reçu:", json_data)  # Afficher le JSON reçu
        
        if not json_data:
            return jsonify({"error": "Aucune donnée JSON reçue"}), 400
        
        user_message = json_data.get("message", "").lower()
        
        responses = {
            "symptômes": "Les symptômes incluent douleur thoracique, essoufflement et fatigue.",
            "prévention": "Une alimentation équilibrée et l'exercice régulier sont recommandés.",
            "traitement": "Les traitements varient : médicaments, chirurgie ou changements de mode de vie."
        }
        
        response = responses.get(user_message, "Je ne suis pas sûr. Pouvez-vous préciser votre question ?")
        return jsonify({"response": response})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/")
def home():
    return "Bienvenue sur l'API du chatbot médical !"

if __name__ == "_main_":
    app.run(debug=True,port=5000)