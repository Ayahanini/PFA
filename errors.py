from flask import Blueprint, jsonify
import traceback
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("error_logs.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
# Création du blueprint pour les erreurs
errors = Blueprint('errors', __name__)

# Définition des types d'erreurs
ERROR_TYPES = {
    'INPUT_VALIDATION': {'code': 400, 'message': 'Erreur de validation des données d\'entrée'},
    'MISSING_DATA': {'code': 400, 'message': 'Données requises manquantes'},
    'FEATURE_COUNT_MISMATCH': {'code': 400, 'message': 'Nombre incorrect de caractéristiques'},
    'DATA_TYPE': {'code': 400, 'message': 'Type de données incorrect'},
    'SERVER': {'code': 500, 'message': 'Erreur serveur interne'}
}

def error_response(error_type, details=None, original_error=None):
    """Génère une réponse d'erreur standardisée."""
    if error_type not in ERROR_TYPES:
        error_type = 'SERVER'
    
    error_info = ERROR_TYPES[error_type]
    status_code = error_info['code']
    
    error_data = {
        'error': {
            'type': error_type,
            'message': error_info['message']
        }
    }
    
    if details:
        error_data['error']['details'] = details
    
    # Journalisation de l'erreur
    if original_error:
        logger.error(f"{error_type} - {details if details else error_info['message']}")
        logger.error(traceback.format_exc())
    
    return jsonify(error_data), status_code

def handle_model_prediction_error(e):
    """Gère les erreurs de prédiction du modèle."""
    error_msg = str(e)
    if "could not convert string to float" in error_msg:
        return error_response('DATA_TYPE', "Les caractéristiques doivent être numériques", e)
    elif "has X features, but StandardScaler is expecting" in error_msg:
        return error_response('FEATURE_COUNT_MISMATCH', "Le nombre de caractéristiques fournies ne correspond pas à celui attendu par le modèle", e)
    else:
        return error_response('SERVER',error_msg, e)

