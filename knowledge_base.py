import faiss
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import os

class KnowledgeBase:
    def __init__(self, filepath="medical_knowledge.json"):
        # Résoudre chemin absolu pour éviter erreur selon où le script est lancé
        base_dir = os.path.dirname(os.path.abspath(__file__))
        full_path = os.path.join(base_dir, filepath)

        # Charger le fichier JSON
        with open(full_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Vérification du format attendu : une liste d'objets question/answer
        if not isinstance(data, list):
            raise ValueError("Le fichier JSON doit contenir une liste d'objets.")

        # Extraire les questions et réponses
        self.questions = []
        self.answers = []
        for item in data:
            if "question" in item and "answer" in item:
                self.questions.append(item["question"])
                self.answers.append(item["answer"])

        if not self.questions:
            raise ValueError("Aucune question trouvée dans le fichier JSON.")

        # Initialiser le modèle d'embedding
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # Encoder toutes les questions
        embeddings = self.model.encode(self.questions, convert_to_numpy=True)

        if embeddings.shape[0] == 0:
            raise ValueError("Aucun embedding généré. Vérifiez le contenu de votre fichier JSON.")

        # Créer l'index FAISS
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dim)
        self.index.add(embeddings)

    def search(self, query, top_k=3):
        # Encoder la requête utilisateur
        query_vec = self.model.encode([query], convert_to_numpy=True)
        distances, indices = self.index.search(query_vec, top_k)

        # Retourner la liste (question, réponse) des top_k plus proches
        results = []
        for idx in indices[0]:
            if idx < len(self.questions):
                results.append((self.questions[idx], self.answers[idx]))
        return results

    def answer_question(self, question):
        results = self.search(question, top_k=1)
        if not results:
            return "Désolé, je n'ai trouvé aucune information pertinente."

        top_question, top_answer = results[0]
        return top_answer.strip()
