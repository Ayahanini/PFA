import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import f1_score, classification_report
df = pd.read_csv('D:/CHATBOTMEDICAL2/PFA/heart.csv')
print(df.head())