class UserProfile:
    def __init__(self):
        self.history = []

class MedicalBotFlask:
    def __init__(self, kb):
        self.kb = kb
        self.user_profile = UserProfile()

    def get_response(self, user_question: str) -> str:
        user_question = user_question.strip()

        if not user_question:
            return "❓ Pouvez-vous reformuler votre question ?"

        if user_question.lower() == "voir l'historique":
            if not self.user_profile.history:
                return "ℹ️ Aucun historique trouvé."
            else:
                history_text = "\n\n".join([f"❓ {q}\n💬 {a}" for q, a in self.user_profile.history])
                return f"🧾 Voici l'historique de vos échanges :\n\n{history_text}"

        # Simule un "typing" côté frontend (optionnel à gérer dans JS)
        # time.sleep(5) —> À gérer côté frontend (afficher un loader 5 sec)

        response = self.kb.answer_question(user_question)
        self.user_profile.history.append((user_question, response))
        return response

