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