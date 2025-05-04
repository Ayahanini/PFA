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

