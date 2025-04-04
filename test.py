import requests

# URLs de ton API
url_chat = "http://127.0.0.1:5001/chat"
url_predict = "http://127.0.0.1:5001/predict"

# Données à envoyer
data = {"message": "symptomes"}

# Requête vers /chat
response_chat = requests.post(url_chat, json=data)
print("Réponse de /chat :", response_chat.json())

# Requête vers /predict
response_predict = requests.post(url_predict, json=data)
print("Réponse de /predict :", response_predict.json())
