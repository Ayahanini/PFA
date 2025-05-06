import os
import requests
import time
import secrets
from datetime import datetime, timedelta

class DirectLineConfig:
    """Configuration pour l'API DirectLine de Bot Framework"""
    
    def __init__(self):
        # Récupérer la clé DirectLine depuis les variables d'environnement ou utiliser une valeur par défaut pour le dev
        self.direct_line_secret = os.environ.get("DIRECT_LINE_SECRET", "YOUR_DIRECT_LINE_SECRET")
        self.token_endpoint = "https://directline.botframework.com/v3/directline/tokens/generate"
        self.conversation_endpoint = "https://directline.botframework.com/v3/directline/conversations"
        
        # Durée de validité du token (en secondes)
        self.token_validity = 3600
    
    def generate_token(self, user_id=None):
        """Génère un token DirectLine pour un utilisateur spécifique"""
        if not user_id:
            user_id = f"user-{secrets.token_hex(8)}"
            
        try:
            headers = {
                "Authorization": f"Bearer {self.direct_line_secret}"
            }
            
            # Pour le développement/test, on peut simuler un token
            if self.direct_line_secret == "YOUR_DIRECT_LINE_SECRET":
                # En mode développement, créer un faux token
                print("AVERTISSEMENT: Utilisation d'un token DirectLine simulé (mode développement)")
                return {
                    "token": f"fake_token_{secrets.token_hex(16)}",
                    "expires_in": self.token_validity,
                    "conversation_id": f"conv_{user_id}_{int(time.time())}"
                }
            
            # En production, obtenir un vrai token
            response = requests.post(
                self.token_endpoint,
                headers=headers,
                json={"user": {"id": user_id}}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "token": data["token"],
                    "expires_in": data["expires_in"],
                    "conversation_id": data.get("conversationId", f"conv_{user_id}")
                }
            else:
                print(f"Erreur lors de la génération du token DirectLine: {response.status_code}")
                print(response.text)
                
                # En cas d'erreur, retourner un token fictif pour le développement
                return {
                    "token": f"error_token_{secrets.token_hex(8)}",
                    "expires_in": 300,  # 5 minutes
                    "conversation_id": f"error_conv_{user_id}"
                }
                
        except Exception as e:
            print(f"Exception lors de la génération du token DirectLine: {e}")
            # En cas d'exception, retourner un token fictif pour le développement
            return {
                "token": f"exception_token_{secrets.token_hex(8)}",
                "expires_in": 300,  # 5 minutes
                "conversation_id": f"exception_conv_{user_id}"
            }
    
    def create_conversation(self, user_id=None):
        """Crée une nouvelle conversation dans DirectLine"""
        if not user_id:
            user_id = f"user-{secrets.token_hex(8)}"
            
        try:
            headers = {
                "Authorization": f"Bearer {self.direct_line_secret}"
            }
            
            response = requests.post(
                self.conversation_endpoint,
                headers=headers
            )
            
            if response.status_code == 201:
                return response.json()
            else:
                print(f"Erreur lors de la création de la conversation: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Exception lors de la création de la conversation: {e}")
            return None

# Instance unique à utiliser dans l'application
directline_config = DirectLineConfig()