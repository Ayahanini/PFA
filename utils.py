import logging

# Configuration du logger
logging.basicConfig(
    level=logging.INFO,  # Niveau de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app_logs.log"),  # Enregistre les logs dans un fichier
        logging.StreamHandler()              # Affiche les logs dans la console
    ]
)

