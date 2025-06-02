from botbuilder.core import TurnContext, ActivityHandler, MessageFactory
from botbuilder.schema import Activity
from knowledge_base import KnowledgeBase
from typing import Dict
import json

class UserProfile:
    def __init__(self):
        self.history = []

class MedicalBotFlask(ActivityHandler):
    def __init__(self, kb_path: str = "medical_knowledge.json"):
        super().__init__()
        self.kb = KnowledgeBase(kb_path)
        self.user_profiles: Dict[str, UserProfile] = {}

    def _get_user_profile(self, user_id: str) -> UserProfile:
        """Obtient ou crée un profil utilisateur"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = UserProfile()
        return self.user_profiles[user_id]

    async def on_message_activity(self, turn_context: TurnContext):
        user_input = turn_context.activity.text.strip()
        user_id = turn_context.activity.from_property.id
        
        # Gestion spéciale de la commande historique
        if user_input.lower() == "voir l'historique":
            response = self._handle_history_command(user_id)
        else:
            response = self._generate_response(user_input, user_id)
        
        await turn_context.send_activity(MessageFactory.text(response))

    def _handle_history_command(self, user_id: str) -> str:
        """Gère la commande spéciale pour afficher l'historique"""
        profile = self._get_user_profile(user_id)
        if not profile.history:
            return "ℹ️ Aucun historique trouvé."
        
        history_text = "\n".join([f"❓ {q}\n💬 {a}" for q, a in profile.history])
        return f"🧾 Historique:\n{history_text}"

    def _generate_response(self, user_input: str, user_id: str) -> str:
        """Génère une réponse normale et met à jour l'historique"""
        if not user_input:
            return "❓ Pouvez-vous reformuler votre question ?"
        
        profile = self._get_user_profile(user_id)
        response = self.kb.answer_question(user_input)
        
        # Mise à jour de l'historique
        profile.history.append((user_input, response))
        if len(profile.history) > 50:
            profile.history = profile.history[-50:]
        
        return response

    # Fonction pour l'intégration Flask
    def get_bot_response(self, user_message: str, user_id: str = "default_user") -> dict:
        """Wrapper pour l'intégration avec Flask"""
        response = self._generate_response(user_message, user_id)
        return {
            "type": "message",
            "text": response,
            "user_id": user_id
        }