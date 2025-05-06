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
    
    def generate_token(self, user_id=None):
        """
        Génère un token temporaire pour Direct Line
        """
        token = secrets.token_urlsafe(16)
        expiration = datetime.now() + timedelta(hours=self.token_validity_hours)
        self.tokens[token] = {
            "expiration": expiration,
            "user_id": user_id
        }
        return {
            "token": token,
            "expires_in": self.token_validity_hours * 3600
        }
    
    def validate_token(self, token):
        """
        Valide un token et retourne True s'il est valide
        """
        if token not in self.tokens:
            return False
        
        token_data = self.tokens[token]
        if datetime.now() > token_data["expiration"]:
            # Nettoyer les tokens expirés
            del self.tokens[token]
            return False
        
        return True
    
