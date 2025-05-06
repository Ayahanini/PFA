"""
Configuration simplifiée de Direct Line pour développement local
"""

import secrets
import time
from datetime import datetime, timedelta

class DirectLineConfig:
    """
    Classe de configuration pour le service Direct Line local
    """
    def __init__(self):
        self.trusted_origins = ["http://localhost:5000"]
        self.token_validity_hours = 24
        # Générer un secret fixe pour le développement
        self._secret = "LOCAL_DIRECT_LINE_SECRET"
        self.tokens = {}  # token -> expiration_time
    
