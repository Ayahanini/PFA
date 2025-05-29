from flask import Flask, request, jsonify, render_template
from knowledge_base import KnowledgeBase
from bot import MedicalBotFlask

app = Flask(__name__)

# Chargement de la KB vectorisée
kb = KnowledgeBase("D:/CHATBOTMEDICAL2/PFA/medical_knowledge.json")

# Instanciation du bot version Flask
bot = MedicalBotFlask(kb)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("message", "")
    response = bot.get_response(question)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
