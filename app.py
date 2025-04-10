from flask import Flask
from flask_cors import CORS
from routes import initialize_routes
from knowledge_base import initialize_resources
from errors import errors  # Importer le blueprint des erreurs

app = Flask(__name__)
# Enregistrer le blueprint des erreurs
app.register_blueprint(errors)

# Configuration CORS
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://votre-domaine.com"]}})

# Initialiser les ressources (modèle ML et base de connaissances)
initialize_resources()

# Initialiser les routes
initialize_routes(app)

if __name__ == "_main_":
    app.run(debug=False, host='0.0.0.0',port=5000)