import os
from dotenv import load_dotenv
import os
os.environ["OPENAI_API_KEY"] = "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"
def load_configuration():
    """Charge les variables d'environnement depuis le fichier .env"""
    # Charger les variables d'environnement
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
        print("Variables d'environnement chargées depuis .env")
    else:
        print("Fichier .env non trouvé, utilisation des variables d'environnement système")