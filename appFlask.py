from flask import Flask, request, jsonify, render_template, redirect, url_for, flash , send_from_directory, current_app, abort
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
from fpdf import FPDF # Blueprint principal
main_bp = Blueprint('main', __name__)
# Initialisation de l'application Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'votre-cle-secrete-tres-longue-et-complexe'
app.config['WTF_CSRF_TIME_LIMIT'] = 3600  # Durée de validité du token CSRF

# Initialisation des extensions
CORS(app, supports_credentials=True, expose_headers=['X-CSRFToken']) # Active CORS pour les requêtes cross-origin
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'
csrf = CSRFProtect(app)
@main_bp.before_request
def check_csrf():
    if request.path.startswith('/api/'):
        csrf.protect()

bot = MedicalBotFlask("D:/CHATBOTMEDICAL2/PFA/medical_knowledge.json")
# Ajouter ces imports en haut du fichier
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
# Charger le modèle cardiaque (ajouter après les autres initialisations)
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HEART_MODEL_PATH = os.path.join(BASE_DIR, 'D:/CHATBOTMEDICAL2/PFA/modele_heart.pkl')
heart_model_data = None
@main_bp.route('/cardiac-test', methods=['GET'])
@login_required
def cardiac_test():
    """Affiche le formulaire de test cardiaque"""
    return render_template('cardiac_test.html')
@main_bp.route('/cardiac-predict', methods=['POST'])
@login_required
def cardiac_predict():
    """Endpoint pour les prédictions cardiaques avec génération de PDF"""
    conn = None
    cur = None
    
    try:
        # 1. Vérification des données reçues
        if not request.is_json:
            return jsonify({
                "error": "Format invalide",
                "message": "Le contenu doit être au format JSON"
            }), 400

        data = request.get_json()
        app.logger.info(f"Données reçues pour prédiction: {data}")

        # 2. Validation des champs obligatoires
        required_fields = {
            'age': int,
            'sex': int,
            'cp': int,
            'trestbps': int,
            'chol': int,
            'fbs': int,
            'restecg': int,
            'thalach': int,
            'exang': int,
            'oldpeak': float,
            'slope': int,
            'ca': int,
            'thal': int
        }

        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": "Champs manquants",
                "missing": missing_fields
            }), 400


        # 3. Conversion des données en DataFrame
        input_data = {k: [v] for k, v in data.items() if k in required_fields}
        df = pd.DataFrame(input_data)

        # 4. Chargement du modèle
        model_data = load_heart_model()
        if not model_data:
            return jsonify({
                "error": "Modèle indisponible",
                "message": "Le modèle de prédiction n'est pas chargé"
            }), 503

        # 5. Vérification des features
        model_features = model_data['features']
        if set(df.columns) != set(model_features):
            return jsonify({
                "error": "Incompatibilité des caractéristiques",
                "received": list(df.columns),
                "expected": model_features
            }), 400

        # Réorganisation des colonnes
        df = df[model_features]

        # 6. Prédiction
        pipeline = model_data['model']
        try:
            proba = pipeline.predict_proba(df)[0][1]  # Probabilité de classe positive
            prediction = int(proba >= 0.5)  # Seuil à 50%
        except Exception as e:
            app.logger.error(f"Erreur lors de la prédiction: {str(e)}")
            return jsonify({
                "error": "Erreur de prédiction",
                "message": str(e)
            }), 500

        # 7. Enregistrement en base de données
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO cardiac_tests 
            (user_id, age, sex, cp, trestbps, chol, fbs, restecg, 
             thalach, exang, oldpeak, slope, ca, thal, prediction, probability)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            current_user.id,
            data['age'],
            data['sex'],
            data['cp'],
            data['trestbps'],
            data['chol'],
            data['fbs'],
            data['restecg'],
            data['thalach'],
            data['exang'],
            data['oldpeak'],
            data['slope'],
            data['ca'],
            data['thal'],
            prediction,
            float(proba)
        ))
        test_id, created_at = cur.fetchone()
        conn.commit()

        try:
            pdf_path = generate_cardiac_report(
                user=current_user,
                test_id=test_id,
                created_at=created_at,
                prediction=prediction,
                probability=proba,
                input_data=data
            )
            pdf_url = url_for('static', filename=pdf_path, _external=True) if pdf_path else None
        except Exception as e:
            app.logger.error(f"Erreur génération PDF: {str(e)}")
            pdf_url = None
        
        return jsonify({
            "prediction": prediction,
            "probability": float(proba),
            "test_id": test_id,
            "pdf_url": pdf_url,
            "message": "Risque cardiaque élevé" if prediction == 1 else "Risque cardiaque faible",
            "interpretation": get_interpretation(prediction, proba, data)
        }), 200

    except Exception as e:
        app.logger.exception(f"Erreur dans cardiac_predict: {str(e)}")
        if conn:
            conn.rollback()
        return jsonify({
            "error": "Erreur interne",
            "message": str(e)
        }), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def generate_cardiac_report(user, test_id, created_at, prediction, probability, input_data):
    """Génère un PDF avec les résultats de la prédiction cardiaque"""
    try:
        # Vérification des répertoires
        reports_dir = os.path.join(current_app.root_path, 'static/reports')
        os.makedirs(reports_dir, exist_ok=True)
        
        pdf = FPDF()
        pdf.add_page()
        
        # En-tête
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "Rapport d'Analyse Cardiaque", 0, 1, 'C')
        pdf.ln(10)
        
        # Informations patient
        pdf.set_font("Arial", 'B', 12)
        user_name = f"{user.first_name} {user.last_name}" if hasattr(user, 'first_name') and hasattr(user, 'last_name') else user.email
        pdf.cell(0, 10, f"Patient: {user_name}", 0, 1)
        pdf.cell(0, 10, f"Date du test: {created_at.strftime('%d/%m/%Y %H:%M')}", 0, 1)
        pdf.ln(15)
        
        # Résultats
        pdf.set_fill_color(200, 220, 255)
        pdf.cell(0, 10, "RÉSULTATS DE L'ANALYSE", 0, 1, 'C', True)
        pdf.ln(10)
        
        risk_level = "ÉLEVÉ" if prediction == 1 else "FAIBLE"
        color = (255, 0, 0) if prediction == 1 else (0, 128, 0)
        pdf.set_text_color(*color)
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, f"Niveau de risque: {risk_level}", 0, 1, 'C')
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", '', 12)
        pdf.cell(0, 10, f"Probabilité: {probability*100:.2f}%", 0, 1, 'C')
        pdf.ln(15)
        
        # Détails des paramètres
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "Paramètres d'entrée:", 0, 1)
        
        # Tableau des paramètres
        col_widths = [70, 50]
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(col_widths[0], 10, "Paramètre", border=1)
        pdf.cell(col_widths[1], 10, "Valeur", border=1, ln=1)
        
        pdf.set_font("Arial", '', 10)
        for param, value in input_data.items():
            pdf.cell(col_widths[0], 8, param.replace('_', ' ').title(), border=1)
            pdf.cell(col_widths[1], 8, str(value), border=1, ln=1)
        
        # Interprétation
        pdf.ln(15)
        pdf.set_font("Arial", 'I', 10)
        interpretation = get_interpretation(prediction, probability, input_data)
        pdf.multi_cell(0, 8, interpretation)
        
        # Pied de page
        pdf.ln(20)
        pdf.set_font("Arial", 'I', 8)
        pdf.cell(0, 10, "Ce rapport est généré automatiquement et ne remplace pas une consultation médicale.", 0, 1, 'C')
        
        # Sauvegarde
        filename = f"cardiac_report_{test_id}.pdf"
        filepath = os.path.join(reports_dir, filename)
        pdf.output(filepath)
        
        return f"reports/{filename}"
    except Exception as e:
        app.logger.error(f"Erreur lors de la génération du PDF: {str(e)}")
        raise RuntimeError(f"Erreur lors de la génération du rapport: {str(e)}")

@main_bp.route('/view-report/<int:report_id>')
@login_required
def view_report(report_id):
    """Affiche le rapport dans le navigateur avec option de téléchargement"""
    conn = None
    cur = None
    
    try:
        # 1. Vérifier que le rapport appartient à l'utilisateur courant
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, user_id, report_path 
            FROM cardiac_tests 
            WHERE id = %s
        """, (report_id,))
        
        report = cur.fetchone()
        
        if not report:
            abort(404, description="Rapport non trouvé")
            
        if report[1] != current_user.id:
            abort(403, description="Vous n'avez pas accès à ce rapport")
            
        # 2. Vérifier que le fichier PDF existe
        pdf_filename = f"cardiac_report_{report_id}.pdf"
        pdf_path = os.path.join(current_app.root_path, 'static/reports', pdf_filename)
        
        if not os.path.exists(pdf_path):
            app.logger.error(f"Fichier PDF manquant pour le rapport {report_id}")
            abort(404, description="Le rapport n'est pas disponible")
            
        # 3. Préparer les données pour le template
        pdf_url = url_for('static', filename=f'reports/{pdf_filename}')
        download_url = url_for('main.download_report', report_id=report_id)
        
        # 4. Récupérer des métadonnées supplémentaires si nécessaire
        cur.execute("""
            SELECT created_at, prediction, probability
            FROM cardiac_tests
            WHERE id = %s
        """, (report_id,))
        
        created_at, prediction, probability = cur.fetchone()
        
        return render_template(
            'view_report.html',
            pdf_url=pdf_url,
            download_url=download_url,
            report_id=report_id,
            created_at=created_at.strftime('%d/%m/%Y à %H:%M'),
            risk_level="élevé" if prediction == 1 else "faible",
            probability=f"{probability*100:.1f}%"
        )
        
    except Exception as e:
        app.logger.error(f"Erreur dans view_report: {str(e)}")
        abort(500, description="Une erreur est survenue lors de l'accès au rapport")
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@main_bp.route('/download-report/<int:report_id>')
@login_required
def download_report(report_id):
    """Endpoint pour télécharger le rapport PDF"""
    try:
        # Mêmes vérifications d'accès que pour view_report
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT user_id FROM cardiac_tests WHERE id = %s
        """, (report_id,))
        
        report = cur.fetchone()
        
        if not report or report[0] != current_user.id:
            abort(403)
            
        pdf_filename = f"cardiac_report_{report_id}.pdf"
        pdf_path = os.path.join(current_app.root_path, 'static/reports', pdf_filename)
        
        if not os.path.exists(pdf_path):
            abort(404)
            
        return send_from_directory(
            directory=os.path.join(current_app.root_path, 'static/reports'),
            path=pdf_filename,
            as_attachment=True,
            download_name=f"rapport_cardio_{report_id}.pdf"
        )
        
    except Exception as e:
        app.logger.error(f"Erreur dans download_report: {str(e)}")
        abort(500)
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()      
@main_bp.route('/get_last_cardiac_report')
@login_required
def get_last_cardiac_report():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=extras.DictCursor)
    
    try:
        cur.execute("""
            SELECT * FROM cardiac_tests 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT 1
        """, (current_user.id,))
        
        last_test = cur.fetchone()
        
        if not last_test:
            return jsonify({'error': 'Aucun test cardiaque trouvé'}), 404
        
        return jsonify({
            'date': last_test['created_at'].strftime('%d/%m/%Y %H:%M'),
            'prediction': last_test['prediction'],
            'probability': last_test['probability'],
            'message': 'Risque cardiaque élevé' if last_test['prediction'] == 1 else 'Risque cardiaque faible',
            'risk_percentage': round(last_test['probability'] * 100),
            'recommendations': [
                'Consultez un cardiologue rapidement',
                'Évitez les activités physiques intenses',
                'Surveillez votre tension artérielle'
            ] if last_test['prediction'] == 1 else [
                'Continuez vos bilans de santé réguliers',
                'Maintenez une alimentation équilibrée',
                'Pratiquez une activité physique régulière'
            ]
        })
    except Exception as e:
        app.logger.error(f"Erreur dans get_last_cardiac_report: {str(e)}")
        return jsonify({'error': 'Erreur serveur'}), 500
    finally:
        cur.close()
        conn.close()
def get_interpretation(prediction, probability, data):
    """Fournit une interprétation des résultats"""
    age = data['age']
    sex = "homme" if data['sex'] == 1 else "femme"
    
    base_msg = (
        f"Pour un {sex} de {age} ans, le modèle prédit un "
        f"{'risque élevé' if prediction == 1 else 'risque faible'} "
        f"(probabilité: {probability:.1%})."
    )
    
    advice = ""
    if prediction == 1:
        advice = (
            "Consultez un cardiologue. Facteurs de risque détectés: "
            f"pression artérielle: {data['trestbps']} mmHg, "
            f"cholestérol: {data['chol']} mg/dl."
        )
    else:
        advice = (
            "Résultat normal mais maintenez de bonnes habitudes: "
            "alimentation équilibrée et activité physique régulière."
        )
    
    return f"{base_msg} {advice}"
def load_heart_model():
    global heart_model_data
    
    if heart_model_data is None:
        try:
            model_data = joblib.load(HEART_MODEL_PATH)
            
            # Modification ici - utiliser 'model' au lieu de 'pipeline'
            heart_model_data = {
                'model': model_data['model'],  # Changé de 'pipeline' à 'model'
                'features': model_data['features'],
                'version': model_data.get('version', '1.0'),
                'created_at': model_data.get('created_at', 'unknown')
            }
            
            app.logger.info(f"Modèle cardiaque chargé (version {heart_model_data['version']})")
        except Exception as e:
            app.logger.error(f"Erreur chargement modèle cardiaque: {str(e)}")
            return None
    
    return heart_model_data

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
        
        # Convert DictRow objects to regular dictionaries if needed
        cardiac_tests = [dict(test) for test in cardiac_tests]
        
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