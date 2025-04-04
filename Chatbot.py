from flask  import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Charger le modèle pré-entraîné
model = joblib.load("modele_heart.pkl")

@app.route("/")
def home():
    return "Bienvenue sur l'API du chatbot médical !"

@app.route("/chat", methods=["POST"])
def chat():
    """Endpoint pour répondre aux questions générales sur les maladies cardiaques."""
    user_message = request.json.get("message", "").lower()
    responses = {
        "symptômes": "Les symptômes incluent douleur thoracique, essoufflement et fatigue.",
        "prévention": "Une alimentation équilibrée et l'exercice régulier sont recommandés.",
        "traitement": "Les traitements varient : médicaments, chirurgie ou changements de mode de vie."
    }
    response = responses.get(user_message, "Je ne suis pas sûr. Pouvez-vous préciser votre question ?")
    return jsonify({"response": response})

if __name__ == "_main_":
    app.run(debug=True,port=5001)
