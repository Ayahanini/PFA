import nltk
from nltk.tokenize import word_tokenize

nltk.download('punkt')
import os

# Définir le chemin des données NLTK
nltk_data_path = "D:/CHATBOTMEDICAL2/sklearn-env/nltk_data"
os.makedirs(nltk_data_path, exist_ok=True)  # Créer le dossier s'il n'existe pas
nltk.data.path.append(nltk_data_path)  # Ajouter à la liste des chemins

# Télécharger punkt dans ce dossier spécifique
nltk.download('punkt', download_dir=nltk_data_path)
def analyser_question(question):
    """Analyse une question et retourne une réponse."""
    # Vérifier si la question est vide
    if not question or question.strip() == "":
        return "Veuillez poser une question sur les maladies cardiaques."
    
        
    question = question.lower()
    mots = word_tokenize(question)
    
    if any(m in mots for m in ['symptômes', 'symptome', 'signes']):
        return "Les symptômes des maladies cardiaques incluent douleur thoracique, essoufflement, fatigue, etc."
    elif any(m in mots for m in ['prévention', 'éviter', 'réduire']):
        return "Pour prévenir les maladies cardiaques : alimentation saine, exercice, éviter le tabac et surveiller le cholestérol."
    elif any(m in mots for m in ['facteurs', 'risques', 'cause']):
        return "Les facteurs de risque incluent : hypertension, diabète, obésité, sédentarité, stress."
    else:
        return "Je ne comprends pas cette question. Pouvez-vous reformuler?"
    
     # logique du chatbot ici
    return "Réponse simulée"

