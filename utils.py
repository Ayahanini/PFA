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

# Création d'un logger
logger = logging.getLogger(__name__)

def log_message(message, level="info"):
    """
    Enregistre un message dans les logs.

    Args:
        message (str): Le message à enregistrer.
        level (str): Le niveau du log (info, warning, error, critical).
    """
    if level == "info":
        logger.info(message)
    elif level == "warning":
        logger.warning(message)
    elif level == "error":
        logger.error(message)
    elif level == "critical":
        logger.critical(message)
    else:
        logger.debug(message)

