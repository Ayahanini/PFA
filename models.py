import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

def charger_donnees(fichier):
    """Charge les données depuis un fichier CSV."""
    df = pd.read_csv(fichier)
    X = df.drop(columns=['target'])  # Supposons que la colonne cible s'appelle 'target'
    y = df['target']
    return X, y
def entrainer_modele(fichier):
    """Entraîne le modèle et le sauvegarde dans un fichier."""
    X, y = charger_donnees(fichier)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    modele = Pipeline([
        ('scaler', StandardScaler()),
        ('clf', LogisticRegression())
    ])
    modele.fit(X_train, y_train)
    joblib.dump(modele, 'modele_heart.pkl')
    print("Modèle entraîné et sauvegardé.")

def charger_modele():
    """Charge le modèle sauvegardé."""
    return joblib.load('modele_heart.pkl')

def predire_risque(modele, valeurs):
    """Prédit le risque de maladie cardiaque à partir des données utilisateur."""
    df_utilisateur = pd.DataFrame([valeurs])
    prediction = modele.predict(df_utilisateur)[0]
    return {
        "prediction": int(prediction),
        "message": "Maladie cardiaque détectée" if prediction == 1 else "Pas de maladie cardiaque"
}


