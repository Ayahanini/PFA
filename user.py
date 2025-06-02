from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from . import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relations (exemple)
    # profiles = db.relationship('Profile', backref='user', lazy=True)
    
    def __init__(self, email, password):
        self.email = email
        self.set_password(password)
    
    def set_password(self, password):
        """Crée un hash sécurisé du mot de passe"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password):
        """Vérifie si le mot de passe correspond au hash stocké"""
        return check_password_hash(self.password_hash, password)
    
    @property
    def username(self):
        """Retourne la partie avant @ de l'email comme nom d'utilisateur"""
        return self.email.split('@')[0]
    
    def get_id(self):
        """Surcharge pour Flask-Login"""
        return str(self.id)
    
    def update_last_login(self):
        """Met à jour la date de dernière connexion"""
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def __repr__(self):
        return f'<User {self.email}>'