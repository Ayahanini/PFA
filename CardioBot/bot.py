from botbuilder.core import ActivityHandler, TurnContext
from botbuilder.schema import ChannelAccount, Activity, ActivityTypes, Attachment, CardAction, ActionTypes, HeroCard
from typing import List
import asyncio

class UserProfile:
    def __init__(self):
        self.history = []

class MedicalBot(ActivityHandler):
    def __init__(self, conversation_state, user_state, kb):
        super().__init__()
        self.conversation_state = conversation_state
        self.user_state = user_state
        self.kb = kb
        self.user_profile_accessor = self.user_state.create_property("UserProfile")

    async def on_members_added_activity(self, members_added: List[ChannelAccount], turn_context: TurnContext):
        for member in members_added:
            if member.id != turn_context.activity.recipient.id:
                card = HeroCard(
                    text="👋 Bonjour ! Je suis votre assistant médical spécialisé en maladies cardiaques. Posez-moi une question ou cliquez sur le bouton ci-dessous.",
                    buttons=[
                        CardAction(
                            type=ActionTypes.im_back,
                            title="📜 Voir l'historique",
                            value="Voir l'historique"
                        )
                    ]
                )

                reply = Activity(
                    type=ActivityTypes.message,
                    attachments=[
                        Attachment(
                            content_type="application/vnd.microsoft.card.hero",
                            content=card
                        )
                    ]
                )
                await turn_context.send_activity(reply)

    async def on_message_activity(self, turn_context: TurnContext):
        user_question = turn_context.activity.text.strip()
        user_profile = await self.user_profile_accessor.get(turn_context, UserProfile)

        if not user_question:
            await turn_context.send_activity("❓ Pouvez-vous reformuler votre question ?")
            return

        # 🔍 Voir l'historique
        if user_question.lower() == "voir l'historique":
            if not user_profile.history:
                await turn_context.send_activity("ℹ️ Aucun historique trouvé.")
            else:
                history_text = "\n\n".join([f"❓ {q}\n💬 {a}" for q, a in user_profile.history])
                await turn_context.send_activity(f"🧾 Voici l'historique de vos échanges :\n\n{history_text}")
            return

        # ⌨️ Affiche l'indicateur de saisie "typing"
        typing_activity = Activity(type=ActivityTypes.typing)
        await turn_context.send_activity(typing_activity)

        # 🕓 Attendre 5 secondes
        await asyncio.sleep(5)

        # 🔁 Obtenir la réponse de la KB
        response = self.kb.answer_question(user_question)

        # 🧠 Enregistrer dans l’historique
        user_profile.history.append((user_question, response))

        await turn_context.send_activity(response)
