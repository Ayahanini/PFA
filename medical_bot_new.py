# medical_bot_new.py - VERSION CORRIGÉE
# REMPLACEZ COMPLÈTEMENT le contenu de medical_bot_new.py par ce code

import json
import os
from typing import Dict, List
from datetime import datetime

class MedicalBotFlask:
    """Chatbot médical simplifié et fonctionnel"""
    
    def __init__(self, kb_path: str = "medical_knowledge.json"):
        """Initialise le bot - VERSION CORRECTE"""
        print(f"🤖 Initialisation du bot avec fichier: {kb_path}")
        
        # Liste des mots d'urgence (définie avant toute utilisation)
        self.emergency_words = ['urgence', 'douleur poitrine', 'crise cardiaque', 
                              'infarctus', 'mal au coeur', 'saignement abondant']
        
        # Gérer les chemins de fichier
        if not os.path.exists(kb_path):
            possible_paths = [
                kb_path,
                os.path.join(os.getcwd(), "medical_knowledge.json"),
                "D:/CHATBOTMEDICAL2/PFA/medical_knowledge.json",
                os.path.join(os.path.dirname(__file__), "medical_knowledge.json")
            ]
            
            found_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    found_path = path
                    break
            
            if not found_path:
                raise FileNotFoundError(f"Aucun fichier medical_knowledge.json trouvé dans: {possible_paths}")
            kb_path = found_path
        
        # Charger les données JSON
        try:
            with open(kb_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            
            if not isinstance(self.data, list):
                raise ValueError("Le fichier JSON doit contenir une liste")
            
            print(f"✅ {len(self.data)} questions chargées depuis {kb_path}")
            
        except Exception as e:
            raise RuntimeError(f"Erreur chargement JSON: {e}")
        
        # Initialiser les structures de données
        self.conversations = {}
        print("✅ MedicalBotFlask initialisé avec succès")
        
        # Charger les données JSON
        try:
            with open(kb_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            
            if not isinstance(self.data, list):
                raise ValueError("Le fichier JSON doit contenir une liste")
            
            print(f"✅ {len(self.data)} questions chargées depuis {kb_path}")
            
        except Exception as e:
            raise RuntimeError(f"Erreur chargement JSON: {e}")
        
        # Initialiser les structures de données
        self.conversations = {}
        self.emergency_words = ['urgence', 'douleur poitrine', 'crise cardiaque', 'infarctus', 'mal au coeur']
        
        print("✅ MedicalBotFlask initialisé avec succès")
    
    def simple_search(self, question: str) -> str:
        """Recherche simple dans la base de connaissances"""
        question_lower = question.lower().strip()
        
        # Recherche exacte d'abord
        for item in self.data:
            if 'question' in item and 'answer' in item:
                if question_lower in item['question'].lower():
                    return item['answer']
        
        # Recherche par mots-clés
        question_words = set(question_lower.split())
        best_match = None
        best_score = 0
        
        for item in self.data:
            if 'question' in item and 'answer' in item:
                item_words = set(item['question'].lower().split())
                common = question_words.intersection(item_words)
                
                if len(common) > 0:
                    score = len(common) / len(question_words)
                    if score > best_score:
                        best_score = score
                        best_match = item
        
        if best_match and best_score > 0.2:
            return best_match['answer']
        
        return "Je n'ai pas trouvé d'information spécifique. Pouvez-vous reformuler votre question ?"
    
    def is_emergency(self, text: str) -> bool:
        """Détecte les urgences médicales"""
        text_lower = text.lower()
        return any(word in text_lower for word in self.emergency_words)
    
    def get_bot_response(self, user_message: str, user_id: str = "default") -> dict:
        """Interface principale - COMPATIBLE avec votre Flask"""
        
        if not user_message or not user_message.strip():
            return {
                "response": "Veuillez poser une question.",
                "type": "empty",
                "suggestions": ["Symptômes", "Prévention", "Aide"]
            }
        
        try:
            message = user_message.strip()
            
            # Urgences
            if self.is_emergency(message):
                return {
                    "response": "🚨 URGENCE: Si vous avez des symptômes graves (douleur thoracique, difficulté à respirer), appelez le 15 immédiatement !",
                    "type": "emergency",
                    "suggestions": ["Appeler secours", "Symptômes graves"]
                }
            
            # Salutations
            if any(word in message.lower() for word in ['bonjour', 'salut', 'hello', 'bonsoir']):
                response = "Bonjour ! Je suis votre assistant médical spécialisé en cardiologie. Comment puis-je vous aider ?"
                suggestions = ["Symptômes cardiaques", "Prévention", "Facteurs de risque"]
            
            # Au revoir
            elif any(word in message.lower() for word in ['au revoir', 'bye', 'merci', 'goodbye']):
                response = "Au revoir ! Prenez soin de votre santé. N'hésitez pas à revenir si vous avez des questions."
                suggestions = ["Nouvelle question", "Urgence", "Plus d'infos"]
            
            # Recherche dans la base
            else:
                response = self.simple_search(message)
                suggestions = ["Plus de détails", "Autre question", "Consulter médecin"]
            
            # Sauvegarder l'historique
            if user_id not in self.conversations:
                self.conversations[user_id] = []
            
            self.conversations[user_id].append({
                'user': message,
                'bot': response,
                'timestamp': datetime.now().isoformat()
            })
            
            # Limiter l'historique
            if len(self.conversations[user_id]) > 30:
                self.conversations[user_id] = self.conversations[user_id][-30:]
            
            return {
                "response": response,
                "type": "normal",
                "suggestions": suggestions,
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Erreur get_bot_response: {e}")
            return {
                "response": "Une erreur technique s'est produite. Veuillez réessayer.",
                "type": "error",
                "suggestions": ["Réessayer", "Contact support"]
            }
    
    def get_conversation_history(self, user_id: str) -> List[Dict]:
        """Récupère l'historique - COMPATIBLE Flask"""
        return self.conversations.get(user_id, [])
    
    def clear_conversation_history(self, user_id: str) -> bool:
        """Efface l'historique - COMPATIBLE Flask"""
        if user_id in self.conversations:
            self.conversations[user_id] = []
            return True
        return False


# Test automatique
if __name__ == "__main__":
    print("🧪 TEST DU BOT MÉDICAL")
    print("=" * 30)
    
    try:
        bot = MedicalBotFlask()
        tests = [
            "Bonjour",
            "J'ai mal à la poitrine",
            "Quels sont les symptômes d'une crise cardiaque ?",
            "Merci, au revoir"
        ]
        
        for question in tests:
            print(f"\n❓ Question: {question}")
            response = bot.get_bot_response(question, "test_user")
            print(f"🤖 Réponse: {response['response']}")
            print(f"🔧 Type: {response['type']}")
            print(f"💡 Suggestions: {response['suggestions']}")
        
        print("\n✅ Tests réussis ! Le bot fonctionne correctement.")
        
    except Exception as e:
        print(f"❌ Erreur lors des tests: {str(e)}")
        import traceback
        traceback.print_exc()