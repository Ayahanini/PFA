from flask import Flask, request, jsonify, render_template
from bot import MedicalBot  # ton propre module

app = Flask(__name__)

# Chargement du bot
bot = MedicalBot("D:/CHATBOTMEDICAL2/botbuilder-tools/CardioBot/medical_knowledge.json")

@app.route("/")
def index():
    return render_template("index.html")  # Ton fichier dans le dossier templates/

@app.route("/api/ask", methods=["POST"])
def ask():
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        print(f"Question: {user_message}")
        
        # Appel direct à ta base de connaissance vectorielle
        answer = bot.kb.answer_question(user_message)
        print(f"Réponse: {answer}")

        return jsonify({"response": answer})

    except Exception as e:
        print("Erreur :", e)
        return jsonify({"response": "Désolé, une erreur est survenue."}), 500

if __name__ == "__main__":
    app.run(debug=True)
