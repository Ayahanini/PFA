import pandas as pd
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import classification_report
import os

# 1. Configuration centralisée
MODEL_PATH = 'modele_heart.pkl'
TEST_SIZE = 0.2
RANDOM_STATE = 42
TARGET_COL = 'target'

def charger_donnees(fichier):
    """Charge les données avec validation et gestion des erreurs."""
    try:
        df = pd.read_csv(fichier)
        
        # Validation des données
        if TARGET_COL not in df.columns:
            raise ValueError(f"Colonne cible '{TARGET_COL}' absente du dataset")
            
        if df.empty:
            raise ValueError("Le dataset est vide")
            
        X = df.drop(columns=[TARGET_COL])
        y = df[TARGET_COL]
        return X, y
    
    except FileNotFoundError:
        raise FileNotFoundError(f"Fichier {fichier} introuvable")
    except pd.errors.EmptyDataError:
        raise ValueError("Fichier CSV vide ou corrompu")

def entrainer_modele(fichier):
    """Entraîne le modèle avec validation croisée et sauvegarde les métriques."""
    X, y = charger_donnees(fichier)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    
    # 2. Pipeline optimisé
    pipeline = make_pipeline(
        StandardScaler(),
        LogisticRegression(random_state=RANDOM_STATE, max_iter=1000)
    )
    
    # 3. Validation croisée
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='accuracy')
    print(f"Validation croisée (accuracy): {np.mean(cv_scores):.4f} ± {np.std(cv_scores):.4f}")
    
    pipeline.fit(X_train, y_train)
    
    # 4. Évaluation finale
    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    # 5. Sauvegarde avec métadonnées
    model_data = {
        'model': pipeline,
        'features': list(X.columns),
        'metrics': classification_report(y_test, y_pred, output_dict=True),
        'cv_scores': cv_scores.tolist()
    }
    joblib.dump(model_data, MODEL_PATH)
    print(f"Modèle sauvegardé dans {MODEL_PATH}")

def charger_modele():
    """Charge le modèle avec vérification d'intégrité."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Fichier modèle {MODEL_PATH} introuvable")
    
    model_data = joblib.load(MODEL_PATH)
    
    # Vérification de la structure
    required_keys = ['model', 'features', 'metrics']
    if not all(key in model_data for key in required_keys):
        raise ValueError("Fichier modèle corrompu ou incompatible")
        
    return model_data

def predire_risque(valeurs, seuil=0.5):
    """
    Prédit le risque cardiaque avec gestion des erreurs.
    
    Args:
        valeurs (dict): Dictionnaire {nom_feature: valeur}
        seuil (float): Seuil de décision personnalisable (défaut: 0.5)
    
    Returns:
        dict: Résultats de prédiction formatés
    """
    model_data = charger_modele()
    pipeline = model_data['model']
    features = model_data['features']
    
    # 6. Validation des entrées
    missing = set(features) - set(valeurs.keys())
    if missing:
        raise ValueError(f"Features manquantes: {', '.join(missing)}")
    
    extra = set(valeurs.keys()) - set(features)
    if extra:
        print(f"Avertissement: Features inutilisées: {', '.join(extra)}")
    
    # 7. Construction du DataFrame avec ordre des colonnes
    input_data = pd.DataFrame([valeurs], columns=features)
    
    # 8. Prédiction avec seuil ajustable
    proba = pipeline.predict_proba(input_data)[0]
    classe = 1 if proba[1] >= seuil else 0
    
    return {
        "prediction": classe,
        "probability": float(proba[1]),
        "threshold": seuil,
        "message": "Risque cardiaque détecté" if classe == 1 else "Risque cardiaque faible"
    }