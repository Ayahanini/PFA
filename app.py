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

@app.route("/predict", methods=["POST" , "GET"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Le corps de la requête doit être en JSON"}), 400
            
        features = data.get("features")
        if not features:
            return jsonify({"error": "Le champ 'features' est manquant"}), 400
            
        # Vérifier que nous avons le bon nombre de caractéristiques
        # Pour les modèles scikit-learn, on peut souvent obtenir cette information comme ceci:
        if hasattr(model, 'n_features_in_'):
            expected_features = model.n_features_in_
        else:
            # Fallback pour les anciens modèles ou types différents
            expected_features = len(features)  # On suppose que la première requête est correcte
            
        if len(features) != expected_features:
            return jsonify({"error": f"Attendu {expected_features} caractéristiques, mais reçu {len(features)}"}), 400
            
        result = predict_heart_disease(features)
        return jsonify({"prediction": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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