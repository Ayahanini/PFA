# fix_everything.py - SOLUTION AUTOMATIQUE COMPLÈTE
# Créez ce fichier et exécutez-le pour tout corriger automatiquement

import os
import json
import re
import sys

def step1_create_medical_bot_new():
    """Étape 1: Créer le bon fichier medical_bot_new.py"""
    print("🔧 Étape 1: Création de medical_bot_new.py...")
    
    content = '''# medical_bot_new.py - Chatbot médical fonctionnel
import json
import os
from typing import Dict, List
from datetime import datetime

class MedicalBotFlask:
    """Chatbot médical simplifié et fonctionnel"""
    
    def _init_(self, kb_path: str = "medical_knowledge.json"):
        """Initialise le bot - CETTE VERSION ACCEPTE DES PARAMETRES"""
        print(f"🤖 Initialisation du bot avec fichier: {kb_path}")
        
        # Gérer les chemins de fichier
        if not os.path.exists(kb_path):
            # Essayer d'autres emplacements
            possible_paths = [
                kb_path,
                os.path.join(os.getcwd(), "medical_knowledge.json"),
                "D:/CHATBOTMEDICAL2/PFA/medical_knowledge.json",
                os.path.join(os.path.dirname(_file_), "medical_knowledge.json")
            ]
            
            found_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    found_path = path
                    print(f"✅ Fichier trouvé: {path}")
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
if _name_ == "_main_":
    print("🧪 TEST DU BOT")
    try:
        bot = MedicalBotFlask()
        response = bot.get_bot_response("Bonjour", "test")
        print(f"✅ Test réussi: {response['response'][:50]}...")
    except Exception as e:
        print(f"❌ Test échoué: {e}")
'''
    
    try:
        with open("medical_bot_new.py", "w", encoding="utf-8") as f:
            f.write(content)
        print("✅ medical_bot_new.py créé avec succès")
        return True
    except Exception as e:
        print(f"❌ Erreur création medical_bot_new.py: {e}")
        return False

def step2_fix_json():
    """Étape 2: Corriger le fichier JSON"""
    print("\n🔧 Étape 2: Correction du fichier JSON...")
    
    try:
        # Lire le fichier JSON
        with open("medical_knowledge.json", "r", encoding="utf-8") as f:
            content = f.read()
        
        # Sauvegarder une copie
        with open("medical_knowledge.json.backup", "w", encoding="utf-8") as f:
            f.write(content)
        
        # Corriger les erreurs de JSON (virgules en trop, etc.)
        # Supprimer les virgules avant les }]
        content = re.sub(r',(\s*})', r'\1', content)
        content = re.sub(r',(\s*])', r'\1', content)
        
        # Écrire le fichier corrigé
        with open("medical_knowledge.json", "w", encoding="utf-8") as f:
            f.write(content)
        
        # Tester que le JSON est valide
        with open("medical_knowledge.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        print(f"✅ JSON corrigé et validé ({len(data)} entrées)")
        return True
        
    except Exception as e:
        print(f"❌ Erreur correction JSON: {e}")
        return False

def step3_fix_flask_import():
    """Étape 3: Corriger l'import dans appFlask.py"""
    print("\n🔧 Étape 3: Correction de l'import dans appFlask.py...")
    
    try:
        # Lire appFlask.py
        with open("appFlask.py", "r", encoding="utf-8") as f:
            content = f.read()
        
        # Sauvegarder une copie
        with open("appFlask.py.backup", "w", encoding="utf-8") as f:
            f.write(content)
        
        # Remplacements critiques
        replacements = [
            # L'import principal - LE PLUS IMPORTANT
            (r'from medical_bot import MedicalBotFlask', 'from medical_bot_new import MedicalBotFlask'),
            
            # Autres corrections potentielles
            (r"Blueprint\('main', name\)", "Blueprint('main', _name_)"),
            (r"Blueprint\('auth', name", "Blueprint('auth', _name_"),
            (r'app = Flask\(name\)', 'app = Flask(_name_)'),
            (r'if name == "main":', 'if _name_ == "_main_":'),
        ]
        
        # Appliquer les remplacements
        changes_made = []
        for pattern, replacement in replacements:
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                changes_made.append(f"{pattern} → {replacement}")
        
        # Écrire le fichier corrigé
        with open("appFlask.py", "w", encoding="utf-8") as f:
            f.write(content)
        
        print("✅ appFlask.py corrigé")
        if changes_made:
            print("   Changements effectués:")
            for change in changes_made:
                print(f"   • {change}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur correction appFlask.py: {e}")
        return False

def step4_test_everything():
    """Étape 4: Tester que tout fonctionne"""
    print("\n🧪 Étape 4: Test complet du système...")
    
    try:
        # Supprimer les modules du cache
        modules_to_clear = ['medical_bot', 'medical_bot_new', 'bot']
        for module in modules_to_clear:
            if module in sys.modules:
                del sys.modules[module]
        
        # Test 1: Import
        print("   Test 1: Import du nouveau module...")
        from medical_bot_new import MedicalBotFlask
        print("   ✅ Import réussi")
        
        # Test 2: Création du bot
        print("   Test 2: Création du bot...")
        bot = MedicalBotFlask()
        print("   ✅ Bot créé avec succès")
        
        # Test 3: Réponses
        print("   Test 3: Test des réponses...")
        tests = [
            ("Bonjour", "greeting"),
            ("Quels sont les symptômes des maladies cardiaques ?", "medical"),
            ("Au revoir", "farewell")
        ]
        
        for question, expected_type in tests:
            response = bot.get_bot_response(question, "test_user")
            if isinstance(response, dict) and 'response' in response:
                print(f"   ✅ {expected_type}: {response['response'][:40]}...")
            else:
                print(f"   ❌ {expected_type}: Format invalide")
                return False
        
        print("✅ Tous les tests réussis")
        return True
        
    except Exception as e:
        print(f"❌ Erreur test: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Fonction principale - Corrige tout automatiquement"""
    print("🚀 CORRECTION AUTOMATIQUE COMPLÈTE")
    print("=" * 50)
    print("Ce script va corriger TOUS les problèmes automatiquement:")
    print("1. Créer medical_bot_new.py")
    print("2. Corriger medical_knowledge.json") 
    print("3. Corriger l'import dans appFlask.py")
    print("4. Tester que tout fonctionne")
    print("=" * 50)
    
    # Demander confirmation
    while True:
        confirm = input("\nVoulez-vous continuer ? (y/N): ").lower()
        if confirm in ['y', 'yes', 'oui']:
            break
        elif confirm in ['n', 'no', 'non', '']:
            print("❌ Annulé par l'utilisateur")
            return
        else:
            print("Veuillez répondre par 'y' ou 'n'")
    
    # Exécuter les étapes
    steps = [
        ("Création medical_bot_new.py", step1_create_medical_bot_new),
        ("Correction JSON", step2_fix_json),
        ("Correction import Flask", step3_fix_flask_import),
        ("Test complet", step4_test_everything)
    ]
    
    results = []
    for step_name, step_func in steps:
        try:
            success = step_func()
            results.append((step_name, success))
            if not success:
                print(f"\n❌ Échec à l'étape: {step_name}")
                break
        except Exception as e:
            print(f"\n❌ Erreur à l'étape {step_name}: {e}")
            results.append((step_name, False))
            break
    
    # Résumé final
    print(f"\n{'='*50}")
    print("📊 RÉSUMÉ FINAL")
    print(f"{'='*50}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for step_name, success in results:
        status = "✅ RÉUSSI" if success else "❌ ÉCHOUÉ"
        print(f"{step_name:<25} : {status}")
    
    if passed == total:
        print(f"\n🎉 PARFAIT ! Toutes les corrections ont été appliquées !")
        print("\n📝 Prochaines étapes:")
        print("1. Démarrez votre application: python appFlask.py")
        print("2. Vous devriez voir:")
        print("   ✅ Base de données initialisée")
        print("   🤖 Initialisation du bot avec fichier: medical_knowledge.json")
        print("   ✅ XXX questions chargées depuis medical_knowledge.json")
        print("   ✅ MedicalBotFlask initialisé avec succès")
        print("   ✅ Bot médical initialisé avec succès")
        print("   ✅ Application entièrement initialisée")
        print("\n💡 Si vous voyez ces messages, votre chatbot fonctionne !")
    else:
        print(f"\n⚠ {total-passed} étape(s) ont échoué")
        print("💡 Vérifiez les erreurs ci-dessus")

if __name__ == "_main_":
    main()
