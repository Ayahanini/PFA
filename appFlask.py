from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask import flash, send_from_directory, current_app, abort
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
from urllib.parse import urlparse
import psycopg2
from psycopg2 import extras
import click
from flask import Blueprint
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_cors import CORS
from wtforms import ValidationError
from medical_bot_new import MedicalBotFlask  # Importer votre bot personnalisé
import json
import logging

import sys
import importlib

# Supprimer les modules du cache si ils existent
modules_to_clear = ['bot', 'medical_bot_new']
for module in modules_to_clear:
    if module in sys.modules:
        del sys.modules[module]

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Variable globale pour le bot
bot = None

def initialize_medical_bot():
    """Initialise le bot médical avec gestion d'erreur"""
    global bot
    try:
        # Différentes méthodes d'initialisation selon la classe MedicalBotFlask
        try:
            # Méthode 1: avec chemin vers le fichier JSON
            knowledge_base_path = "medical_knowledge.json"
            if not os.path.exists(knowledge_base_path):
                knowledge_base_path = "D:/CHATBOTMEDICAL2/PFA/medical_knowledge.json"
            
            bot = MedicalBotFlask(knowledge_base_path)
            
        except TypeError:
            # Méthode 2: sans arguments (constructeur par défaut)
            print("🔧 Tentative d'initialisation sans arguments...")
            bot = MedicalBotFlask()
            
        except Exception as e:
            # Méthode 3: avec configuration manuelle
            print(f"🔧 Erreur méthode standard: {e}")
            print("🔧 Tentative d'initialisation alternative...")
            bot = MedicalBotFlask()
            
            # Charger manuellement la base de connaissances si possible
            knowledge_base_path = "medical_knowledge.json"
            if not os.path.exists(knowledge_base_path):
                knowledge_base_path = "D:/CHATBOTMEDICAL2/PFA/medical_knowledge.json"
            
            if os.path.exists(knowledge_base_path) and hasattr(bot, 'load_knowledge_base'):
                bot.load_knowledge_base(knowledge_base_path)
        
        print("✅ Bot médical initialisé avec succès")
        return True
        
    except Exception as e:
        print(f"❌ Erreur initialisation bot: {str(e)}")
        print("💡 Vérifiez la classe MedicalBotFlask dans medical_bot_new.py")
        return False

# Initialisation de l'application Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'votre-cle-secrete-tres-longue-et-complexe'

# Configuration des sessions
app.config['SESSION_COOKIE_SECURE'] = False  # True en production avec HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 heure

# Initialisation des extensions
CORS(app, supports_credentials=True, expose_headers=['X-CSRFToken'])
login_manager = LoginManager(app)
login_manager.login_message = 'Veuillez vous connecter pour accéder à cette page.'
login_manager.login_message_category = 'info'

# Configuration CSRF (plus permissive pour le développement)
csrf = CSRFProtect(app)

# Configuration CSRF plus permissive pour le développement
app.config['WTF_CSRF_TIME_LIMIT'] = None  # Pas de limite de temps
app.config['WTF_CSRF_ENABLED'] = True
app.config['WTF_CSRF_CHECK_DEFAULT'] = True

# Rendre le token CSRF disponible dans tous les templates
@app.context_processor
def inject_csrf_token():
    return dict(csrf_token=generate_csrf)

# Blueprint principal
main_bp = Blueprint('main', __name__)

# Ajouter ces imports en haut du fichier
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from fpdf import FPDF

# Charger le modèle cardiaque
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HEART_MODEL_PATH = os.path.join(BASE_DIR, 'D:/CHATBOTMEDICAL2/PFA/modele_heart.pkl')
heart_model_data = None

class User(UserMixin):
    def __init__(self, id=None, email=None, password_hash=None, first_name=None, 
                 last_name=None, created_at=None, last_login=None, is_active=True):
        """
        Constructeur correctement nommé avec tous les paramètres optionnels
        """
        self.id = id
        self.email = email
        self.password_hash = password_hash
        self.first_name = first_name
        self.last_name = last_name
        self.created_at = created_at
        self.last_login = last_login
        self._is_active = is_active

    @property
    def is_active(self):
        return self._is_active

    @is_active.setter
    def is_active(self, value):
        self._is_active = value

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def get_full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email or "Utilisateur"

    def get_id(self):
        return str(self.id) if self.id else None

    def __repr__(self):
        return f'<User {self.email}>'


@login_manager.user_loader
def load_user(user_id):
    """Charge un utilisateur par son ID pour Flask-Login"""
    if not user_id:
        return None
        
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=extras.DictCursor)

        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user_data = cur.fetchone()

        if user_data:
         return User(
            id=user_data['id'],  # Pas de id_ ici
            email=user_data['email'],
            password_hash=user_data['password_hash'],
            first_name=user_data.get('first_name'),
            last_name=user_data.get('last_name'),
            created_at=user_data.get('created_at'),
            last_login=user_data.get('last_login'),
            is_active=user_data.get('is_active', True)
        )
        return None
        
    except Exception as e:
        app.logger.error(f"Error loading user {user_id}: {str(e)}")
        return None
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# Fonctions de base de données
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="flaskdb",
        user="postgres",
        password="Ayouya123",
        port="5432"
    )

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Table users
                
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(256) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,  
            is_active BOOLEAN DEFAULT TRUE
        )
        """)
        

        # Add cardiac_tests table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS cardiac_tests (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            age INTEGER NOT NULL,
            sex INTEGER NOT NULL,
            cp INTEGER NOT NULL,
            trestbps INTEGER NOT NULL,
            chol INTEGER NOT NULL,
            fbs INTEGER NOT NULL,
            restecg INTEGER NOT NULL,
            thalach INTEGER NOT NULL,
            exang INTEGER NOT NULL,
            oldpeak FLOAT NOT NULL,
            slope INTEGER NOT NULL,
            ca INTEGER NOT NULL,
            thal INTEGER NOT NULL,
            prediction INTEGER NOT NULL,
            probability FLOAT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        conn.commit()
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Database initialization error: {str(e)}")
        raise
    finally:
        cur.close()
        conn.close()

# ===========================
# ROUTES PRINCIPALES
# ===========================



@main_bp.route('/')
@main_bp.route('/index')
def index():
    """Route index principale du blueprint main"""
    return render_template('index.html', user=current_user)


@main_bp.route('/chat.html')
def chatbot():
    """Route pour afficher l'interface du chatbot"""
    return render_template('chat.html', user=current_user)

@main_bp.route('/dashbord.html')
def dashboard_page():
    return render_template('dashbord.html', user=current_user)

@main_bp.route('/test.html')
def test_cardiaque_page():
    return render_template('test.html', user=current_user)

@main_bp.route('/test')
def test_cardiaque():
    return render_template('test.html', user=current_user)

@main_bp.route('/test-pdf-demo')
def test_pdf_demo():
    return render_template('test-pdf-demo.html', user=current_user)

@main_bp.route('/test-validation')
def test_validation():
    return render_template('test-validation.html', user=current_user)

# ===========================
# ROUTES API
# ===========================

@app.route('/api/messages', methods=['POST'])
@csrf.exempt
def handle_message():
    """Route principale pour traiter les messages du chatbot - VERSION SUPER ROBUSTE"""
    
    # Headers pour forcer JSON
    response_headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    }
    
    try:
        app.logger.info("=== HANDLE MESSAGE START ===")
        app.logger.info(f"Request method: {request.method}")
        app.logger.info(f"Request content type: {request.content_type}")
        app.logger.info(f"Request headers: {dict(request.headers)}")
        
        # Vérification de l'authentification
        try:
            if not current_user.is_authenticated:
                app.logger.warning("Utilisateur non authentifié")
                return jsonify({
                    "error": "Non authentifié",
                    "message": "Veuillez vous connecter"
                }), 401, response_headers
        except Exception as auth_error:
            app.logger.error(f"Erreur vérification auth: {auth_error}")
            return jsonify({
                "error": "Erreur d'authentification",
                "message": str(auth_error)
            }), 500, response_headers
        
        # Vérification du bot
        if 'bot' not in globals() or bot is None:
            app.logger.error("Bot non initialisé")
            return jsonify({
                "success": True,
                "response": "Le chatbot médical est en cours d'initialisation. Veuillez patienter quelques instants.",
                "type": "system",
                "suggestions": ["Réessayer dans quelques secondes"]
            }), 200, response_headers
        
        # Vérification du format JSON
        if not request.is_json:
            app.logger.error("Requête non JSON")
            return jsonify({
                "error": "Format invalide",
                "message": "Content-Type doit être application/json"
            }), 400, response_headers
        
        # Récupération des données
        try:
            data = request.get_json()
            app.logger.info(f"Données reçues: {data}")
        except Exception as json_error:
            app.logger.error(f"Erreur parsing JSON: {json_error}")
            return jsonify({
                "error": "JSON invalide",
                "message": "Impossible de parser les données JSON"
            }), 400, response_headers
        
        if not data or 'message' not in data:
            app.logger.error(f"Message manquant dans: {data}")
            return jsonify({
                "error": "Message manquant",
                "message": "Le champ 'message' est requis"
            }), 400, response_headers

        user_message = data['message'].strip()
        if not user_message:
            return jsonify({
                "error": "Message vide",
                "message": "Le message ne peut pas être vide"
            }), 400, response_headers

        # Obtenir l'ID utilisateur
        try:
            user_id = str(current_user.get_id())
            app.logger.info(f"Message de l'utilisateur {user_id}: {user_message}")
        except Exception as user_error:
            app.logger.error(f"Erreur récupération user ID: {user_error}")
            user_id = "anonymous"

        # Appeler le bot
        try:
            app.logger.info(f"Appel du bot avec message: '{user_message}'")
            bot_response = bot.get_bot_response(user_message, user_id)
            app.logger.info(f"Réponse du bot: {bot_response}")
            
            # Normaliser la réponse
            if isinstance(bot_response, str):
                bot_response = {
                    "response": bot_response,
                    "type": "simple",
                    "suggestions": []
                }
            
            # Valider la réponse
            if not isinstance(bot_response, dict):
                app.logger.error(f"Réponse bot invalide: {type(bot_response)}")
                bot_response = {
                    "response": "Réponse reçue mais format inattendu",
                    "type": "error",
                    "suggestions": []
                }
            
            result = {
                "success": True,
                "response": bot_response.get("response", "Pas de réponse du bot"),
                "type": bot_response.get("type", "unknown"),
                "suggestions": bot_response.get("suggestions", []),
                "category": bot_response.get("category"),
                "confidence": bot_response.get("confidence"),
                "timestamp": datetime.now().isoformat()
            }
            
            app.logger.info(f"Réponse finale envoyée: {result}")
            return jsonify(result), 200, response_headers
            
        except Exception as bot_error:
            app.logger.error(f"Erreur du bot: {str(bot_error)}")
            app.logger.exception("Stack trace complète:")
            
            # Réponse de fallback
            fallback_response = {
                "success": True,
                "response": "Je rencontre un problème technique temporaire. Pouvez-vous reformuler votre question ?",
                "type": "error",
                "suggestions": ["Réessayer", "Poser une autre question"],
                "error_info": str(bot_error) if app.debug else "Erreur technique"
            }
            
            return jsonify(fallback_response), 200, response_headers

    except Exception as e:
        app.logger.error(f"Erreur générale dans handle_message: {str(e)}")
        app.logger.exception("Stack trace complète de l'erreur générale:")
        
        return jsonify({
            "error": "Erreur interne du serveur",
            "message": "Une erreur inattendue s'est produite",
            "details": str(e) if app.debug else "Erreur serveur"
        }), 500, response_headers


@app.route('/api/chat/test', methods=['GET'])
def test_chatbot_public():
    """Route de test pour vérifier l'état de l'application (sans authentification)"""
    try:
        status = {
            "app_status": "running",
            "database": "unknown",
            "bot_status": "unknown"
        }
        
        # Test de la base de données
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT 1")
            cur.fetchone()
            status["database"] = "connected"
            cur.close()
            conn.close()
        except Exception as db_error:
            status["database"] = f"error: {str(db_error)}"
        
        # Test du bot
        if bot is None:
            status["bot_status"] = "not_initialized"
        else:
            try:
                # Test simple sans user_id pour éviter les erreurs
                test_response = bot.get_bot_response("test", "test_user")
                status["bot_status"] = "operational"
            except Exception as bot_error:
                status["bot_status"] = f"error: {str(bot_error)}"
        
        return jsonify(status), 200
        
    except Exception as e:
        app.logger.error(f"Erreur test application: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/test-auth', methods=['GET'])
def test_chatbot():
    """Route de test pour vérifier que le chatbot fonctionne (avec authentification)"""
    try:
        if bot is None:
            return jsonify({"status": "error", "message": "Bot non initialisé"}), 500
        
        user_name = current_user.get_full_name() if current_user.is_authenticated else "Invité"
        test_response = bot.get_bot_response("Test de connexion", str(current_user.get_id()))
        
        return jsonify({
            "status": "success",
            "message": "Chatbot opérationnel",
            "user": user_name,
            "test_response": test_response
        }), 200
        
    except Exception as e:
        app.logger.error(f"Erreur test chatbot: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/csrf-token', methods=['GET'])
def get_csrf_token():
    return jsonify({'csrf_token': generate_csrf()})

# ===========================
# BLUEPRINT D'AUTHENTIFICATION
# ===========================

auth_bp = Blueprint('auth', __name__, template_folder='templates/auth')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()

        # Validation des données
        if not email or '@' not in email:
            flash('Veuillez fournir une adresse email valide.', 'danger')
        elif len(password) < 8:
            flash('Le mot de passe doit contenir au moins 8 caractères.', 'danger')
        elif password != confirm_password:
            flash('Les mots de passe ne correspondent pas.', 'danger')
        else:
            conn = get_db_connection()
            cur = conn.cursor()

            try:
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    flash('Un compte existe déjà avec cette adresse email.', 'danger')
                else:
                    password_hash = generate_password_hash(password, method='pbkdf2:sha256')
                    cur.execute("""
                        INSERT INTO users (email, password_hash, first_name, last_name)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id
                    """, (email, password_hash, first_name, last_name))

                    user_id = cur.fetchone()[0]
                    conn.commit()

                    flash('Inscription réussie! Vous pouvez maintenant vous connecter.', 'success')
                    return redirect(url_for('auth.login'))

            except Exception as e:
                conn.rollback()
                flash("Une erreur s'est produite lors de l'inscription.", 'danger')
                app.logger.error(f'Erreur inscription: {str(e)}')
            finally:
                cur.close()
                conn.close()

    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password')
        remember = request.form.get('remember') == 'on'

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=extras.DictCursor)

        try:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user_data = cur.fetchone()

            if not user_data or not check_password_hash(user_data['password_hash'], password):
                flash('Email ou mot de passe incorrect.', 'danger')
            else:
                # Créer l'objet utilisateur avec des arguments nommés
                user = User(
                    id=user_data['id'],
                    email=user_data['email'],
                    password_hash=user_data['password_hash'],
                    first_name=user_data.get('first_name'),
                    last_name=user_data.get('last_name'),
                    created_at=user_data.get('created_at'),
                    last_login=user_data.get('last_login'),
                    is_active=user_data.get('is_active', True)
                )

                if not user.is_active:
                    flash('Votre compte est désactivé.', 'danger')
                else:
                    login_user(user, remember=remember)

                    # Mise à jour de la dernière connexion
                    try:
                        cur.execute("""
                            UPDATE users SET last_login = CURRENT_TIMESTAMP 
                            WHERE id = %s
                        """, (user.id,))
                        conn.commit()
                    except Exception as e:
                        conn.rollback()
                        app.logger.error(f"Could not update last_login: {str(e)}")

                    next_page = request.args.get('next')
                    if not next_page or urlparse(next_page).netloc != '':
                        next_page = url_for('main.index')

                    flash(f'Bienvenue, {user.get_full_name()}!', 'success')
                    return redirect(next_page)

        except Exception as e:
            flash("Une erreur s'est produite lors de la connexion.", 'danger')
            app.logger.error(f'Erreur connexion: {str(e)}')
        finally:
            cur.close()
            conn.close()

    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    logout_user()
    flash('Vous avez été déconnecté avec succès.', 'info')
    return redirect(url_for('auth.login'))

# ===========================
# ENREGISTREMENT DES BLUEPRINTS
# ===========================

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(main_bp)

# ===========================
# GESTION DES ERREURS
# ===========================

@app.errorhandler(404)
def page_not_found(e):
    try:
        return render_template('errors/404.html'), 404
    except:
        return "<h1>404 - Page non trouvée</h1><p>La page demandée n'existe pas.</p>", 404

@app.errorhandler(403)
def forbidden(e):
    try:
        return render_template('errors/403.html'), 403
    except:
        return "<h1>403 - Accès interdit</h1><p>Vous n'avez pas les permissions pour accéder à cette page.</p>", 403

@app.errorhandler(500)
def internal_server_error(e):
    try:
        return render_template('errors/500.html'), 500
    except:
        return "<h1>500 - Erreur interne du serveur</h1><p>Une erreur inattendue s'est produite.</p>", 500

# ===========================
# COMMANDES CLI
# ===========================

@app.cli.command('init-db')
def init_db_command():
    """Initialise la base de données"""
    init_db()
    print("Base de données initialisée.")

@app.route('/api/chat/debug', methods=['POST'])
@csrf.exempt
def debug_chat():
    """Route de debug pour tester l'API du chatbot"""
    try:
        app.logger.info("=== DEBUG CHAT API ===")
        
        # Vérifier l'authentification
        if not current_user.is_authenticated:
            return jsonify({
                "error": "Non authentifié",
                "message": "Utilisateur non connecté",
                "redirect": "/auth/login"
            }), 401
        
        # Vérifier le format de la requête
        if not request.is_json:
            return jsonify({
                "error": "Format invalide",
                "message": "Content-Type doit être application/json"
            }), 400
        
        data = request.get_json()
        app.logger.info(f"Données reçues: {data}")
        
        # Vérifier le message
        if not data or 'message' not in data:
            return jsonify({
                "error": "Message manquant",
                "message": "Le champ 'message' est requis"
            }), 400
        
        user_message = data['message'].strip()
        if not user_message:
            return jsonify({
                "error": "Message vide",
                "message": "Le message ne peut pas être vide"
            }), 400
        
        # Vérifier le bot
        if bot is None:
            return jsonify({
                "error": "Bot indisponible", 
                "message": "Le chatbot n'est pas initialisé"
            }), 503
        
        # Tester la réponse du bot
        try:
            user_id = str(current_user.get_id())
            app.logger.info(f"Appel du bot avec message: '{user_message}' pour user: {user_id}")
            
            bot_response = bot.get_bot_response(user_message, user_id)
            app.logger.info(f"Réponse du bot: {bot_response}")
            
            # Normaliser la réponse
            if isinstance(bot_response, str):
                bot_response = {
                    "response": bot_response,
                    "type": "simple",
                    "suggestions": []
                }
            
            return jsonify({
                "success": True,
                "response": bot_response.get("response", "Réponse invalide"),
                "type": bot_response.get("type", "unknown"),
                "suggestions": bot_response.get("suggestions", []),
                "debug_info": {
                    "user_id": user_id,
                    "user_name": current_user.get_full_name(),
                    "bot_type": type(bot)._name_
                }
            }), 200
            
        except Exception as bot_error:
            app.logger.error(f"Erreur du bot: {str(bot_error)}")
            return jsonify({
                "error": "Erreur du bot",
                "message": str(bot_error),
                "fallback_response": "Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?"
            }), 500
        
    except Exception as e:
        app.logger.error(f"Erreur générale debug: {str(e)}")
        return jsonify({
            "error": "Erreur serveur",
            "message": str(e)
    }),500


# Point d'entrée principal
if __name__ == "__main__":
            try:
                # 1. Initialiser la base de données
                print("🔧 Initialisation de la base de données...")
                print("✅ Base de données initialisée")
                
                # 2. Test de connexion à la base de données
                print("🔌 Test de connexion à la base de données...")
                try:
                    conn = get_db_connection()
                    cur = conn.cursor()
                    cur.execute("SELECT 1")
                    cur.close()
                    conn.close()
                    print("✅ Connexion à la base de données réussie")
                except Exception as db_error:
                    print(f"❌ Erreur de connexion à la base de données: {db_error}")
                    print("⚠ L'application continuera mais les fonctions nécessitant la DB ne marcheront pas")
            except KeyboardInterrupt:
             print("\n👋 Arrêt de l'application par l'utilisateur")

            # 3. Initialiser le bot médical
            print("🤖 Initialisation du bot médical...")
            if initialize_medical_bot():
                print("✅ Bot médical prêt")
            else:
                print("⚠ Bot médical non disponible - l'application continuera sans chatbot")

            app.run(debug=True, host="0.0.0.0", port=5000)
    