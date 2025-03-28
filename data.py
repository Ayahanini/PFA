import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import f1_score, classification_report
df = pd.read_csv('D:/CHATBOTMEDICAL2/PFA/heart.csv')
print(df.head())
df = df.dropna()
df = pd.get_dummies(df)

# Séparer les caractéristiques et la cible
X = df.drop('target', axis=1)
y = df['target']

# Normalisation des données
scaler = StandardScaler()
X = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# Choix du nombre de voisins (k)
k = 5

# Initialiser et entraîner le modèle
model = KNeighborsClassifier(n_neighbors=k)
model.fit(X_train, y_train)

# Prédire
y_pred = model.predict(X_test)
f1 = f1_score(y_test, y_pred, average='weighted')
print(f'F1-Score: {f1:.2f}')

# Rapport complet
print(classification_report(y_test, y_pred))