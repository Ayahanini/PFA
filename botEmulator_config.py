import os
import secrets
from datetime import datetime

# Configuration pour le développement local avec Bot Framework Emulator
class BotEmulatorConfig:
    """Configuration pour développement local avec Bot Framework Emulator"""
    
    def __init__(self):
        # URL du bot en local (ajustez selon votre configuration)
        self.bot_url = os.environ.get("BOT_URL", "http://localhost:3978/api/messages")
        
        # Ces valeurs ne sont pas nécessaires pour l'émulateur local mais conservées pour compatibilité
        self.direct_line_secret = "EMULATOR_MODE"
        
    def generate_local_session(self, user_id=None):
        """Génère des informations de session pour le mode émulateur"""
        if not user_id:
            user_id = f"user-{secrets.token_hex(8)}"
            
        return {
            "user_id": user_id,
            "session_id": f"session_{secrets.token_hex(8)}",
            "created_at": datetime.now().isoformat(),
            "bot_url": self.bot_url
        }

# Instance unique à utiliser dans l'application
emulator_config = BotEmulatorConfig()