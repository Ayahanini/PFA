#!/usr/bin/env python3
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import sys
import traceback
import os
from datetime import datetime
import asyncio

# Charger la configuration
from config_bot import load_configuration
load_configuration()

from aiohttp import web
from aiohttp.web import Request, Response
from botbuilder.core import (
    BotFrameworkAdapter,
    BotFrameworkAdapterSettings,
    ConversationState,
    MemoryStorage,
    TurnContext,
)

from botbuilder.schema import Activity, ActivityTypes

# Import depuis votre application existante
from chatbot import analyser_question
from knowledge_base import kb
from models import charger_modele, predire_risque

# Configure les paramètres du Bot Framework
APP_ID = os.environ.get("MicrosoftAppId", "")
APP_PASSWORD = os.environ.get("MicrosoftAppPassword", "")
SETTINGS = BotFrameworkAdapterSettings(APP_ID, APP_PASSWORD)
ADAPTER = BotFrameworkAdapter(SETTINGS)

# Créer un état de conversation pour stocker les données de l'utilisateur
MEMORY = MemoryStorage()
CONVERSATION_STATE = ConversationState(MEMORY)

# Charger le modèle de prédiction
try:
    MODEL = charger_modele()
    print("Modèle de prédiction chargé avec succès")
except Exception as e:
    print(f"Erreur lors du chargement du modèle: {e}")
    MODEL = None

# Initialiser la base de connaissances
KB_INITIALIZED = kb.initialize_resources()
if KB_INITIALIZED:
    print(f"Base de connaissances initialisée avec {kb.documents_count} documents")
else:
    print("AVERTISSEMENT: La base de connaissances n'a pas pu être initialisée")

# Gestionnaire d'erreurs pour le bot
async def on_error(context: TurnContext, error: Exception):
    print(f"\n [on_turn_error] Erreur non gérée: {error}")
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

ADAPTER.on_turn_error = on_error
# Détermination de la meilleure réponse
async def get_best_response(user_message):
    """
    Détermine la meilleure réponse entre le chatbot simple et la base de connaissances
    """
    # Réponse du chatbot simple
    simple_response = analyser_question(user_message)
    
    # Si la base de connaissances est disponible, essayer de l'utiliser
    if KB_INITIALIZED:
        try:
            kb_result = kb.answer_question(user_message)
            kb_response = kb_result["response"]
            kb_confidence = kb_result["confidence"]
            
            # Si la confiance de la base de connaissances est élevée, l'utiliser
            if kb_confidence > 0.6:
                return kb_response
        except:
            pass
    
    # Par défaut, retourner la réponse du chatbot simple
    return simple_response
# Route principale pour les activités du bot
async def messages(req: Request) -> Response:
    if "application/json" in req.headers["Content-Type"]:
        body = await req.json()
    else:
        return Response(status=415)

    activity = Activity().deserialize(body)
    auth_header = req.headers["Authorization"] if "Authorization" in req.headers else ""

    try:
        response = await ADAPTER.process_activity(activity, auth_header, bot_logic)
        if response:
            return web.json_response(response.body)
        return Response(status=201)
    except Exception as exception:
        raise exception

# Logique principale du bot
async def bot_logic(turn_context: TurnContext):
    if turn_context.activity.type == ActivityTypes.message:
        user_message = turn_context.activity.text
        
        # Vérifier si c'est une demande de prédiction de risque
        if "prédire" in user_message.lower() and "risque" in user_message.lower() and MODEL:
            await turn_context.send_activity("Pour prédire votre risque cardiaque, j'ai besoin de plusieurs informations médicales. Utilisez le format suivant: ")
            await turn_context.send_activity("PRÉDICTION: âge, sexe (1=homme, 0=femme), pression artérielle, cholestérol, glycémie, etc.")
        
        # Vérifier si c'est un message de prédiction formaté
        elif user_message.upper().startswith("PRÉDICTION:") and MODEL:
            try:
                # Extraire les valeurs des caractéristiques
                values_str = user_message.split(":", 1)[1].strip()
                values = [float(x.strip()) for x in values_str.split(",")]
                
                # Faire la prédiction
                result = predire_risque(MODEL, values)
                
                if result["prediction"] == 1:
                    await turn_context.send_activity("⚠️ Selon les données fournies, vous présentez un risque élevé de maladie cardiaque. Il est recommandé de consulter un professionnel de santé.")
                else:
                    await turn_context.send_activity("✅ Selon les données fournies, votre risque de maladie cardiaque semble faible. Continuez à adopter un mode de vie sain.")
            except Exception as e:
                await turn_context.send_activity(f"Je n'ai pas pu analyser les données. Assurez-vous de les fournir au format correct. Erreur: {str(e)}")
        
        # Sinon, traiter comme une question normale
        else:
            response = await get_best_response(user_message)
            await turn_context.send_activity(response)
    elif turn_context.activity.type == ActivityTypes.conversation_update:
        # Message de bienvenue lors d'une nouvelle conversation
        for member in turn_context.activity.members_added:
            if member.id != turn_context.activity.recipient.id:
                welcome_message = "Bonjour! Je suis votre assistant médical spécialisé dans les maladies cardiaques. Je peux répondre à vos questions sur les symptômes, la prévention, et les facteurs de risque. Je peux également évaluer votre risque cardiaque. Comment puis-je vous aider aujourd'hui?"
                await turn_context.send_activity(welcome_message)

# Configuration de l'application aiohttp
APP = web.Application()
APP.router.add_post("/api/messages", messages)

if __name__ == "__main__":
    try:
        web.run_app(APP, host="localhost", port=3978)
    except Exception as error:
        raise error