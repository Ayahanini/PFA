from flask import Blueprint, jsonify

# Créer le blueprint des erreurs
errors = Blueprint('errors', __name__)

@errors.app_errorhandler(400)
def bad_request(e):
    return jsonify({
        "error": "Requête incorrecte",
        "message": str(e)
    }), 400

@errors.app_errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Ressource non trouvée",
        "message": "La ressource demandée n'existe pas"
    }), 404

@errors.app_errorhandler(405)
def method_not_allowed(e):
    return jsonify({
        "error": "Méthode non autorisée",
        "message": "Cette méthode n'est pas autorisée pour cette ressource"
    }), 405

@errors.app_errorhandler(500)
def internal_server_error(e):
    return jsonify({
        "error": "Erreur interne du serveur",
        "message": "Une erreur interne s'est produite. Veuillez réessayer plus tard."
    }), 500

@errors.app_errorhandler(503)
def service_unavailable(e):
    return jsonify({
        "error": "Service indisponible",
        "message": "Le service est temporairement indisponible. Veuillez réessayer plus tard."
    }), 503