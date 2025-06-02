#!/usr/bin/env python3
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import os
from dotenv import load_dotenv

# Chargement des variables d'environnement depuis un fichier .env
load_dotenv()

class DefaultConfig:
    """Configuration par défaut du bot."""

    PORT = 3978
    APP_ID = os.environ.get("MicrosoftAppId", "")
    APP_PASSWORD = os.environ.get("MicrosoftAppPassword", "")
    # Vous pouvez aussi définir d'autres configurations ici si nécessaire
    
    # Configuration spécifique au bot médical
    MAX_QUESTION_LENGTH = 500  # Longueur maximale des questions
    DEFAULT_CONFIDENCE_THRESHOLD = 0.7  # Seuil de confiance minimal