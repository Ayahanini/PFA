import pandas as pd
import joblib
import os
import sys
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

def train_and_save_model(input_file='heart.csv', output_file='modele_heart.pkl'):
    try:
        print(f"Chargement des données depuis: {input_file}")
        df = pd.read_csv(input_file)
        print(f"Données chargées: {df.shape[0]} lignes, {df.shape[1]} colonnes")
        
        # Vérification des colonnes
        if 'target' not in df.columns:
            print("Erreur: La colonne 'target' est manquante dans le dataset")
            return False
        
        print("Séparation des caractéristiques et de la cible")
        X = df.drop(columns=['target'])
        y = df['target']
        
        print("Division en ensemble d'entraînement et de test")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print("Création du pipeline")
        pipeline = make_pipeline(
            StandardScaler(),
            LogisticRegression(max_iter=1000, random_state=42)
        )
        
        print("Entraînement du modèle...")
        pipeline.fit(X_train, y_train)
        
        print("Évaluation du modèle")
        y_pred = pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Précision du modèle: {accuracy:.4f}")
        
        # Création des métadonnées
        model_data = {
            'model': pipeline,
            'features': list(X.columns),
            'exemple': X.iloc[0].to_dict(),
            'accuracy': accuracy
        }
        
        print(f"Sauvegarde du modèle dans: {output_file}")
        joblib.dump(model_data, output_file)
        
        # Vérification que le fichier a été créé
        if os.path.exists(output_file):
            print("✅ Modèle sauvegardé avec succès!")
            return True
        else:
            print("❌ Échec de la sauvegarde du modèle")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de l'entraînement: {str(e)}")
        return False

if __name__ == "__main__":
    # Utiliser le premier argument comme fichier d'entrée si fourni
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'heart.csv'
    
    # Chemin de sortie dans le même répertoire que le script
    output_file = os.path.join(os.path.dirname(__file__), 'modele_heart.pkl')
    
    success = train_and_save_model(input_file, output_file)
    
    if not success:
        sys.exit(1)  # Quitter avec code d'erreur