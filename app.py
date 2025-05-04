from flask import Flask
from flask_cors import CORS
from routes import  initialize_routes
from errors import errors  # Importer le blueprint des erreurs
from knowledge_base import kb  # Importer l'instance kb de knowledge_base

def create_app():
    """Crée et configure l'application Flask"""
    app = Flask(__name__)
    
    # Enregistrer le blueprint des erreurs
    app.register_blueprint(errors)
    
    # Configuration CORS
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://votre-domaine.com"]}})
    
    # Initialiser les routes
    initialize_routes(app)
    
    return app

def initialize():
    """Initialise les ressources nécessaires pour l'application"""
    # Initialiser la base de connaissances médicales
    kb_initialized = kb.initialize_resources()
    if not kb_initialized:
        print("AVERTISSEMENT: La base de connaissances médicales n'a pas pu être initialisée.")
    else:
        print(f"Base de connaissances initialisée avec {kb.documents_count} documents.")
    
    # Vous pouvez ajouter d'autres initialisations ici si nécessaire
    # Par exemple: initialiser d'autres modèles ou services

if __name__ == "__main__":
    # Initialiser les ressources avant de démarrer le serveur
    initialize()
  