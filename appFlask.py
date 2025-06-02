from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
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
from bot import MedicalBotFlask  # Importer votre bot personnalisé
# Blueprint principal
main_bp = Blueprint('main', __name__)
# Initialisation de l'application Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'votre-cle-secrete-tres-longue-et-complexe'
app.config['WTF_CSRF_TIME_LIMIT'] = 3600  # Durée de validité du token CSRF

# Initialisation des extensions
CORS(app, supports_credentials=True)  # Active CORS pour les requêtes cross-origin
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'
csrf = CSRFProtect(app)


bot = MedicalBotFlask("D:/CHATBOTMEDICAL2/PFA/medical_knowledge.json")
# Ajouter ces imports en haut du fichier
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

# Charger le modèle cardiaque (ajouter après les autres initialisations)
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HEART_MODEL_PATH = os.path.join(BASE_DIR, 'modele_heart.pkl')
heart_model_data = None
@main_bp.route('/cardiac-predict', methods=['POST'])
@login_required
def cardiac_predict():
    try:
        # Récupérer les données JSON
        data = request.get_json()
        app.logger.info(f"Données reçues: {data}")
        
        # Vérifier que toutes les clés sont présentes
        required_keys = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                         'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        
        for key in required_keys:
            if key not in data:
                app.logger.error(f"Clé manquante: {key}")
                return jsonify({"error": f"Donnée manquante: {key}"}), 400
        
        # Convertir les données en DataFrame
        df = pd.DataFrame([data])
        
        # Charger le modèle
        model_data = load_heart_model()
        if not model_data:
            app.logger.error("Modèle non disponible")
            return jsonify({"error": "Modèle non disponible"}), 500
        
        # Vérifier que les colonnes correspondent
        model_features = model_data['features']
        if set(df.columns) != set(model_features):
            app.logger.error(f"Colonnes incompatibles. Reçues: {df.columns}, Attendues: {model_features}")
            return jsonify({
                "error": "Colonnes incompatibles",
                "received": list(df.columns),
                "expected": model_features
            }), 400
        
        # Réorganiser les colonnes selon l'ordre attendu par le modèle
        df = df[model_features]
        
        # Faire la prédiction
        pipeline = model_data['model']
        try:
            proba = pipeline.predict_proba(df)[0][1]
        except Exception as e:
            app.logger.error(f"Erreur lors de la prédiction: {str(e)}")
            return jsonify({"error": "Erreur de prédiction", "details": str(e)}), 500
        
        prediction = 1 if proba >= 0.5 else 0
        
        # Journaliser le résultat
        app.logger.info(f"Prédiction réussie: prediction={prediction}, probabilité={proba}")
        
        return jsonify({
            "prediction": prediction,
            "probability": float(proba),
            "message": "Risque cardiaque élevé" if prediction == 1 else "Risque cardiaque faible"
        })
        
    except Exception as e:
        app.logger.error(f"Erreur non gérée: {str(e)}")
        return jsonify({"error": "Erreur interne du serveur"}), 500
@main_bp.route('/cardiac-test')
@login_required
def cardiac_test():
    """Affiche le formulaire de test cardiaque"""
    app.logger.info("Tentative de chargement du modèle cardiaque")
    model_data = load_heart_model()
    
    if not model_data:
        app.logger.error("Échec du chargement du modèle cardiaque")
        flash("Erreur technique : le modèle médical est indisponible. Contactez l'administrateur.", "danger")
        return redirect(url_for('main.index'))
    
    app.logger.info(f"Modèle chargé avec {len(model_data['features'])} features")
    features = model_data['features']
    exemple = model_data.get('exemple', {})
    
    return render_template('cardiac_test.html', 
                          features=features, 
                          exemple=exemple,
                          user=current_user)
def load_heart_model():
    """Charge le modèle cardiaque avec gestion robuste des erreurs"""
    global heart_model_data
    
    if heart_model_data is not None:
        return heart_model_data
    
    # Vérifier si le fichier existe
    if not os.path.exists(HEART_MODEL_PATH):
        app.logger.error(f"Fichier modèle introuvable: {HEART_MODEL_PATH}")
        return None
    
    try:
        # Charger le fichier
        loaded_data = joblib.load(HEART_MODEL_PATH)
        app.logger.info("Fichier modèle chargé avec succès")
        
        # Vérifier la structure
        if not isinstance(loaded_data, dict):
            app.logger.error("Le fichier modèle n'est pas un dictionnaire")
            return None
            
        if 'model' not in loaded_data:
            app.logger.error("Clé 'model' manquante dans le fichier modèle")
            return None
            
        # Vérifier les features
        if 'features' not in loaded_data:
            app.logger.warning("Clé 'features' manquante - tentative de récupération")
            
            # Essayer de récupérer les noms de colonnes à partir du modèle
            try:
                pipeline = loaded_data['model']
                
                # Méthode 1: pour les versions récentes de scikit-learn
                if hasattr(pipeline, 'feature_names_in_'):
                    features = pipeline.feature_names_in_.tolist()
                    app.logger.info(f"Features récupérées via feature_names_in_: {features}")
                
                # Méthode 2: pour les pipelines StandardScaler
                elif (hasattr(pipeline, 'named_steps') and 
                      'scaler' in pipeline.named_steps and 
                      hasattr(pipeline.named_steps['scaler'], 'feature_names_in_')):
                    scaler = pipeline.named_steps['scaler']
                    features = scaler.feature_names_in_.tolist()
                    app.logger.info(f"Features récupérées via le scaler: {features}")
                
                # Méthode 3: liste par défaut (à adapter à votre dataset)
                else:
                    features = [
                        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 
                        'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
                    ]
                    app.logger.warning(f"Utilisation des features par défaut: {features}")
                
                loaded_data['features'] = features
                
            except Exception as e:
                app.logger.error(f"Erreur récupération features: {str(e)}")
                return None
        
        # Vérifier l'exemple
        if 'exemple' not in loaded_data:
            app.logger.warning("Clé 'exemple' manquante - création d'un exemple par défaut")
            loaded_data['exemple'] = {feature: 0.0 for feature in loaded_data['features']}
        
        heart_model_data = loaded_data
        return heart_model_data
        
    except Exception as e:
        app.logger.error(f"Erreur chargement modèle cardiaque: {str(e)}")
        return None
@app.route('/check-model')
def check_model():
    """Vérifie l'état du modèle médical"""
    model_data = load_heart_model()
    
    if not model_data:
        return jsonify({
            "status": "error",
            "message": "Modèle non disponible",
            "path": HEART_MODEL_PATH,
            "exists": os.path.exists(HEART_MODEL_PATH)
        }), 500
    
    return jsonify({
        "status": "success",
        "features": model_data.get('features', []),
        "exemple": model_data.get('exemple', {}),
        "model_type": str(type(model_data['model']))
    })
def save_cardiac_result(user_id, input_data, result):
    """Enregistre le résultat du test dans la base de données"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cardiac_tests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                test_data JSONB NOT NULL,
                result JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cur.execute("""
            INSERT INTO cardiac_tests (user_id, test_data, result)
            VALUES (%s, %s, %s)
        """, (user_id, 
              {'input': input_data}, 
              {'prediction': result['prediction'], 
               'probability': result['probability']}))
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Erreur sauvegarde résultat: {str(e)}")
    finally:
        cur.close()
        conn.close()

# Ajouter cette route pour l'historique des tests
@main_bp.route('/cardiac-history')
@login_required
def cardiac_history():
    """Affiche l'historique des tests cardiaques de l'utilisateur"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=extras.DictCursor)
    
    try:
        cur.execute("""
            SELECT * FROM cardiac_tests 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (current_user.id,))
        
        tests = cur.fetchall()
        return render_template('cardiac_history.html', tests=tests, user=current_user)
    except Exception as e:
        app.logger.error(f"Erreur historique cardiaque: {str(e)}")
        flash("Erreur lors du chargement de l'historique", "danger")
        return redirect(url_for('main.profile'))
    finally:
        cur.close()
        conn.close()
@app.route('/api/messages', methods=['POST'])
@login_required
def handle_message():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Message manquant"}), 400

        user_message = data['message'].strip()
        user_id = current_user.get_id()
        
        bot_response = bot.get_bot_response(user_message, user_id)
        return jsonify(bot_response)
    
    except Exception as e:
        app.logger.error(f"Erreur du chatbot: {str(e)}")
        return jsonify({"error": "Erreur interne du serveur"}), 500

@app.route('/csrf-token', methods=['GET'])
def get_csrf_token():
    return jsonify({'csrf_token': generate_csrf()})
class User(UserMixin):
    def __init__(self, id_, email, password_hash, first_name=None, last_name=None, created_at=None, last_login=None, is_active=True):
        self.id = id_
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
        return check_password_hash(self.password_hash, password)
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}" if self.first_name and self.last_name else self.email

@login_manager.user_loader
def load_user(user_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=extras.DictCursor)
    
    try:
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user_data = cur.fetchone()
        
        if user_data:
            return User(
                id_=user_data['id'],
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
        app.logger.error(f"Error loading user: {str(e)}")
        return None
    finally:
        cur.close()
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
        conn.commit()
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Database initialization error: {str(e)}")
        raise
    finally:
        cur.close()
        conn.close()

# Blueprint d'authentification
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
                user = User(
                    id_=user_data['id'],
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
@login_required
def logout():
    logout_user()
    flash('Vous avez été déconnecté avec succès.', 'info')
    return redirect(url_for('auth.login'))



@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/chatbot')
@login_required
def chatbot():
    """Route pour afficher l'interface du chatbot"""
    return render_template('chatbot.html', user=current_user)

@main_bp.route('/profile')
@login_required
def profile():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=extras.DictCursor)
    
    try:
        # Récupérer les tests cardiaques de l'utilisateur
        cur.execute("""
            SELECT * FROM cardiac_tests 
            WHERE user_id = %s 
            ORDER BY created_at DESC
            LIMIT 10
        """, (current_user.id,))
        
        cardiac_tests = cur.fetchall()
        
        return render_template('profile.html', 
                              user=current_user,
                              cardiac_tests=cardiac_tests)
    except Exception as e:
        app.logger.error(f"Erreur chargement profil: {str(e)}")
        flash("Erreur lors du chargement du profil", "danger")
        return redirect(url_for('main.index'))
    finally:
        cur.close()
        conn.close()

@main_bp.route('/ask', methods=['POST'])
@login_required
def ask():
    """Route pour traiter les questions du chatbot (API)"""
    user_message = request.json.get('message', '')
    if not user_message:
        return jsonify({'error': 'Message vide'}), 400
    
    try:
        # Simuler une réponse du chatbot (à remplacer par votre véritable implémentation)
        bot_response = f"Réponse à: {user_message}"
        return jsonify({'response': bot_response})
    except Exception as e:
        app.logger.error(f"Erreur du chatbot: {str(e)}")
        return jsonify({'error': 'Une erreur est survenue'}), 500

# Enregistrement des blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(main_bp)

# Gestion des erreurs
@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404

@app.errorhandler(403)
def forbidden(e):
    return render_template('errors/403.html'), 403

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('errors/500.html'), 500

# Commandes CLI
@app.cli.command('create-admin')
@click.argument('email')
@click.argument('password')
def create_admin(email, password):
    """Crée un compte administrateur"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            print("Un compte avec cet email existe déjà.")
            return
            
        password_hash = generate_password_hash(password, method='pbkdf2:sha256')
        cur.execute("""
            INSERT INTO users (email, password_hash, is_active)
            VALUES (%s, %s, TRUE)
            RETURNING id
        """, (email, password_hash))
        
        conn.commit()
        print(f"Administrateur {email} créé avec succès.")
    except Exception as e:
        conn.rollback()
        print(f"Erreur lors de la création de l'administrateur: {str(e)}")
    finally:
        cur.close()
        conn.close()

@app.cli.command('init-db')
def init_db_command():
    """Initialise la base de données"""
    init_db()
    print("Base de données initialisée.")

# Point d'entrée principal
if __name__ == "__main__":
    app.cli.add_command(init_db_command)
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)