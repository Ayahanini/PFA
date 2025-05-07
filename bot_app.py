#!/usr/bin/env python3
# Copyright (c) Your Company. All rights reserved.

import sys
import traceback
import os
from datetime import datetime
import asyncio
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from routes import initialize_routes
from errors import errors

# Imports du Bot Framework
from botbuilder.core import (
    BotFrameworkAdapter,
    BotFrameworkAdapterSettings,
    ConversationState,
    MemoryStorage,
    TurnContext,
)
from botbuilder.schema import Activity, ActivityTypes

# Import depuis les modules existants
try:
    from chatbot import analyser_question
    from knowledge_base import kb
    from models import charger_modele, predire_risque
    from directline_config import directline_config
except ImportError as e:
    logger.error(f"Erreur d'importation des modules nécessaires: {e}")
    sys.exit("Modules nécessaires manquants. Impossible de démarrer l'application.")


class MedicalChatBotService:
    """
    Classe qui encapsule la logique du chatbot médical.
    Cette classe est utilisée comme service par l'application Flask.
    """
    def __init__(self):
        # Configuration du Bot Framework
        self.app_id = os.environ.get("MicrosoftAppId", "")
        self.app_password = os.environ.get("MicrosoftAppPassword", "")
        self.settings = BotFrameworkAdapterSettings(self.app_id, self.app_password)
        self.adapter = BotFrameworkAdapter(self.settings)
        
        # Créer un état de conversation pour stocker les données de l'utilisateur
        self.memory = MemoryStorage()
        self.conversation_state = ConversationState(self.memory)
        
        # Configurer le gestionnaire d'erreurs
        self.adapter.on_turn_error = self.on_error
        
        # Initialiser le modèle et la base de connaissances
        self.model = self.initialiser_modele()
        self.kb_initialized = self.initialiser_kb()

    def initialiser_modele(self):
        """Initialise le modèle de prédiction de risque"""
        try:
            model = charger_modele()
            logger.info("Modèle de prédiction chargé avec succès")
            return model
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle: {e}")
            return None

    def initialiser_kb(self):
        """Initialise la base de connaissances"""
        try:
            kb_initialized = kb.initialize_resources()
            if kb_initialized:
                logger.info(f"Base de connaissances initialisée avec {kb.documents_count} documents")
            else:
                logger.warning("La base de connaissances n'a pas pu être initialisée")
            return kb_initialized
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de la base de connaissances: {e}")
            return False

    async def on_error(self, context: TurnContext, error: Exception):
        """Gestionnaire d'erreurs pour le bot"""
        logger.error(f"[on_turn_error] Erreur non gérée: {error}")
        traceback.print_exc()
        
        # Envoyer une réponse d'erreur à l'utilisateur
        await context.send_activity("Désolé, une erreur s'est produite. Nous travaillons à la résoudre.")
        
        # Enregistrer l'erreur avec plus de détails
        if context.activity.channel_id == "emulator":
            trace_activity = Activity(
                label="TurnError",
                name="on_turn_error Trace",
                timestamp=datetime.utcnow(),
                type=ActivityTypes.trace,
                value=f"{error}",
                value_type="https://www.botframework.com/schemas/error",
            )
            await context.send_activity(trace_activity)
        
        # Enregistrer l'état de la conversation pour éviter de perdre les données
        if self.conversation_state:
            try:
                await self.conversation_state.save_changes(context)
            except Exception as e:
                logger.error(f"Erreur lors de la sauvegarde de l'état de la conversation: {e}")

    async def get_best_response(self, user_message):
        """
        Détermine la meilleure réponse entre le chatbot simple et la base de connaissances
        """
        # Réponse du chatbot simple
        simple_response = analyser_question(user_message)
        
        # Si la base de connaissances est disponible, essayer de l'utiliser
        if self.kb_initialized:
            try:
                kb_result = kb.answer_question(user_message)
                kb_response = kb_result.get("response", "")
                kb_confidence = kb_result.get("confidence", 0)
                
                # Si la confiance de la base de connaissances est élevée, l'utiliser
                if kb_confidence > 0.6:
                    return kb_response
            except Exception as e:
                logger.warning(f"Erreur lors de l'utilisation de la base de connaissances: {e}")
        
        # Par défaut, retourner la réponse du chatbot simple
        return simple_response

    async def bot_logic(self, turn_context: TurnContext):
        """Logique principale du bot"""
        logger.debug(f"Activité reçue: {turn_context.activity.type}")
        
        if turn_context.activity.type == ActivityTypes.message:
            user_message = turn_context.activity.text.strip() if turn_context.activity.text else ""
            logger.debug(f"Message reçu: {user_message}")
            
            # Vérifier si c'est une demande de prédiction de risque
            if "prédire" in user_message.lower() and "risque" in user_message.lower() and self.model:
                await turn_context.send_activity("Pour prédire votre risque cardiaque, j'ai besoin de plusieurs informations médicales. Utilisez le format suivant: ")
                await turn_context.send_activity("PRÉDICTION: âge, sexe (1=homme, 0=femme), pression artérielle, cholestérol, glycémie, etc.")
            
            # Vérifier si c'est un message de prédiction formaté
            elif user_message.upper().startswith("PRÉDICTION:") and self.model:
                try:
                    # Extraire les valeurs des caractéristiques
                    values_str = user_message.split(":", 1)[1].strip()
                    values = [float(x.strip()) for x in values_str.split(",")]
                    
                    # Faire la prédiction
                    result = predire_risque(self.model, values)
                    
                    if result.get("prediction") == 1:
                        await turn_context.send_activity("⚠️ Selon les données fournies, vous présentez un risque élevé de maladie cardiaque. Il est recommandé de consulter un professionnel de santé.")
                    else:
                        await turn_context.send_activity("✅ Selon les données fournies, votre risque de maladie cardiaque semble faible. Continuez à adopter un mode de vie sain.")
                except Exception as e:
                    await turn_context.send_activity(f"Je n'ai pas pu analyser les données. Assurez-vous de les fournir au format correct. Erreur: {str(e)}")
            
            # Sinon, traiter comme une question normale
            else:
                response = await self.get_best_response(user_message)
                await turn_context.send_activity(response)
                
        elif turn_context.activity.type == ActivityTypes.conversation_update:
            # Message de bienvenue lors d'une nouvelle conversation
            for member in turn_context.activity.members_added:
                if member.id != turn_context.activity.recipient.id:
                    welcome_message = (
                        "Bonjour! Je suis votre assistant médical spécialisé dans les maladies cardiaques. "
                        "Je peux répondre à vos questions sur les symptômes, la prévention, et les facteurs de risque. "
                        "Je peux également évaluer votre risque cardiaque. Comment puis-je vous aider aujourd'hui?"
                    )
                    await turn_context.send_activity(welcome_message)
        
        # Sauvegarder les changements d'état de la conversation
        await self.conversation_state.save_changes(turn_context)


def create_app():
    """Crée et configure l'application Flask avec le service MedicalChatBot intégré"""
    app = Flask(__name__)
    
    # Configuration de l'encodage UTF-8
    app.config['JSON_AS_ASCII'] = False
    
    # Enregistrer le blueprint des erreurs
    app.register_blueprint(errors)
    
    # Configuration CORS simplifiée et cohérente
    CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"], 
         methods=["GET", "POST", "OPTIONS"])
    
    # Configuration des dossiers statiques
    app.static_folder = 'static'
    
    # Créer l'instance du service de chatbot
    chatbot_service = MedicalChatBotService()
    
    # Stocker le service dans l'application pour y accéder depuis les routes
    app.config['CHATBOT_SERVICE'] = chatbot_service
    
    # Ajouter la route pour obtenir un token Direct Line
    @app.route("/api/directline/token", methods=["GET"])
    def get_directline_token():
        user_id = request.args.get("userId", "anonymous")
        token_info = directline_config.generate_token(user_id)
        
        response = jsonify({
            "token": token_info["token"],
            "expires_in": token_info["expires_in"],
            "conversationId": token_info.get("conversation_id", f"conversation-{user_id}")
        })
        
        return response
    
    # Route pour les messages du bot
    @app.route("/api/messages", methods=["POST"])
    def messages():
        if "application/json" not in request.headers.get("Content-Type", ""):
            return jsonify({"error": "Unsupported Media Type"}), 415

        try:
            body = request.json
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse du JSON: {e}")
            return jsonify({"error": "Invalid JSON"}), 400

        activity = Activity().deserialize(body)
        auth_header = request.headers.get("Authorization", "")

        # Utiliser un event loop dédié pour éviter les conflits
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Obtenir le service de chatbot depuis la configuration de l'application
            chatbot_service = app.config['CHATBOT_SERVICE']
            
            # Exécuter le traitement de l'activité de manière asynchrone
            response = loop.run_until_complete(
                chatbot_service.adapter.process_activity(activity, auth_header, chatbot_service.bot_logic)
            )
            loop.close()
            
            if response:
                return Response(response.body, status=response.status, 
                               content_type=response.headers.get("Content-Type", "application/json"))
            return Response(status=201)
        except Exception as e:
            loop.close()
            logger.error(f"Erreur lors du traitement de l'activité: {e}")
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
    
    # Initialiser les routes standard de l'API
    initialize_routes(app)
    
    return app


if __name__ == "__main__":
    try:
        # Créer l'application Flask avec le service de chatbot intégré
        app = create_app()
        
        # Lancer le serveur Flask
        app.run(debug=True, host='localhost', port=3978)
    except Exception as error:
        logger.error(f"Erreur lors de l'initialisation de l'application: {error}")
        sys.exit(1)