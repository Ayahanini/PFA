from flask import request, jsonify
from flask_cors import CORS
from medical_bot_new import MedicalBotFlask  # Import ton bot personnalisé
from knowledge_base import KnowledgeBase      # Base de connaissances
from models import predire_risque    # Pour la prédiction
from flask import render_template
kb = KnowledgeBase("medical_knowledge.json")
bot_flask = MedicalBotFlask(kb)
from flask import request, jsonify
from botbuilder.schema import Activity
from bot_adapter import ADAPTER, BOT, CONVERSATION_STATE, USER_STATE
from flask import session
from PFA.pdf_rapport import generer_rapport
from user import User
def initialize_routes(app):
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5000"],
            "methods": ["GET", "POST"],
            "allow_headers": ["Content-Type"]
        }
    })

    @app.after_request
    def add_utf8_header(response):
        if response.headers.get('Content-Type') == 'application/json':
            response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "Service d'API médicale opérationnel"
        })


    @app.route("/api/question", methods=["POST"])
    def ask_bot():
        data = request.json
        if not data or "question" not in data:
            return jsonify({"error": "La question est requise"}), 400

        question = data["question"]
        try:
            response = bot_flask.get_response(question)

            return jsonify({
                "question": question,
                "answer": response,
                "source": "bot"
            })
        except Exception as e:
            return jsonify({
                "error": str(e),
                "answer": "Une erreur est survenue."
            }), 500

    @app.route("/api/prediction", methods=["POST"])
    def predict_risk():
        if "user_id" not in session:
         return jsonify({"error": "Authentification requise"}), 401
         
        data = request.json

        if not data or "features" not in data:
            return jsonify({"error": "Paramètres manquants"}), 400

        features = data["features"]

        if not app.config.get('MODEL'):
            return jsonify({"error": "Modèle ML non disponible"}), 503

        try:
            result = predire_risque(app.config['MODEL'], features)
            prediction = int(result["prediction"])
            return jsonify({
                "prediction": prediction,
                "probability": float(result.get("probability", 0)),
                "risk_level": "élevé" if prediction == 1 else "faible",
                "recommendations": [
                    "Consultez un professionnel" if prediction == 1 else "Continuez vos bonnes habitudes",
                    "Adoptez une alimentation équilibrée",
                    "Surveillez régulièrement votre santé"
                ]
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    app.route("/api/messages", methods=["POST"])
    def messages():
        if "application/json" in request.headers.get("Content-Type", ""):
            body = request.get_json()
        else:
            return jsonify({"error": "Content-Type must be application/json"}), 415

        activity = Activity().deserialize(body)
        auth_header = request.headers.get("Authorization", "")

        async def aux_func(turn_context):
            await BOT.on_turn(turn_context)
            await CONVERSATION_STATE.save_changes(turn_context)
            await USER_STATE.save_changes(turn_context)

        try:
            task = ADAPTER.process_activity(activity, auth_header, aux_func)
            response = task.result()
            if response:
                return jsonify(response.body), response.status
            return "", 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    user = User.query.get(session["user_id"])
    result = predire_risque(app.config['MODEL'], request.json["features"])
    path = generer_rapport(user.email, result["prediction"], result["probability"])
    
    return jsonify({
        "prediction": int(result["prediction"]),
        "probability": float(result["probability"]),
        "rapport_url": f"/{path}"
    })    