# fix_import.py - Script pour corriger automatiquement l'import dans appFlask.py
# CRÉEZ ce fichier et exécutez-le

import os
import re

def fix_import_in_flask():
    """Corrige automatiquement l'import dans appFlask.py"""
    
    flask_file = "appFlask.py"
    
    if not os.path.exists(flask_file):
        print(f"❌ Fichier {flask_file} non trouvé")
        return False
    
    print(f"🔧 Correction de l'import dans {flask_file}...")
    
    try:
        # Lire le fichier
        with open(flask_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Sauvegarder une copie
        with open(f"{flask_file}.backup", 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Sauvegarde créée: {flask_file}.backup")
        
        # Remplacements nécessaires
        replacements = [
            # Corriger l'import principal
            (r'from medical_bot import MedicalBotFlask', 'from medical_bot import MedicalBotFlask'),
            (r'from bot import MedicalBotFlask', 'from medical_bot import MedicalBotFlask'),
            
            # Corriger les erreurs de syntaxe dans les blueprints
            (r"Blueprint\('main', name\)", "Blueprint('main', _name_)"),
            (r"Blueprint\('auth', name", "Blueprint('auth', _name_"),
            
            # Corriger la variable Flask
            (r'app = Flask\(name\)', 'app = Flask(_name_)'),
            
            # Corriger les références _file_
            (r'file', '_file_'),
            
            # Corriger le if _name_ == "_main_"
            (r'if name == "main":', 'if _name_ == "_main_":'),
        ]
        
        # Appliquer les remplacements
        original_content = content
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        # Vérifier si des changements ont été faits
        if content != original_content:
            # Écrire le fichier corrigé
            with open(flask_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print("✅ Corrections appliquées:")
            for pattern, replacement in replacements:
                if re.search(pattern, original_content):
                    print(f"   • {pattern} → {replacement}")
            
            return True
        else:
            print("ℹ Aucune correction nécessaire")
            return True
            
    except Exception as e:
        print(f"❌ Erreur lors de la correction: {e}")
        return False

def test_corrected_import():
    """Teste si l'import corrigé fonctionne"""
    print("\n🧪 Test de l'import corrigé...")
    
    try:
        # Supprimer les modules du cache
        import sys
        modules_to_clear = ['medical_bot', 'medical_bot', 'bot']
        for module in modules_to_clear:
            if module in sys.modules:
                del sys.modules[module]
        
        # Tester l'import
        from PFA.medical_bot_new import MedicalBotFlask
        print("✅ Import réussi")
        
        # Tester la création du bot
        bot = MedicalBotFlask()
        print("✅ Bot créé avec succès")
        
        # Test simple
        response = bot.get_bot_response("Test", "test_user")
        print(f"✅ Réponse test: {response.get('response', 'Erreur')[:50]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur test import: {e}")
        return False

def main():
    print("🚀 CORRECTION AUTOMATIQUE DE L'IMPORT")
    print("=" * 45)
    
    # Étape 1: Corriger le fichier Flask
    if fix_import_in_flask():
        print("\n✅ Fichier appFlask.py corrigé")
    else:
        print("\n❌ Erreur lors de la correction")
        return
    
    # Étape 2: Tester l'import
    if test_corrected_import():
        print("\n🎉 SUCCÈS TOTAL !")
        print("💡 Vous pouvez maintenant démarrer votre application:")
        print("   python appFlask.py")
    else:
        print("\n❌ Le test a échoué")
        print("💡 Vérifiez manuellement les corrections")

if __name__ == "_main_":
    main()
