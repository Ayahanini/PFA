import faiss
import json
import numpy as np
from sentence_transformers import SentenceTransformer

class KnowledgeBase:
    def __init__(self, filepath):
        # Charger le fichier JSON
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Construire une liste de réponses concaténées
        self.sections = [
            item["question"] + " " + item["answer"]
            for item in data
            if "question" in item and "answer" in item
        ]

        # Initialiser le modèle d'embedding
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # Encoder les sections
        embeddings = self.model.encode(self.sections, convert_to_numpy=True)

        # Vérification que l'embedding n'est pas vide
        if embeddings.shape[0] == 0:
            raise ValueError("Aucun embedding généré. Vérifiez le contenu de votre fichier JSON.")

        # Construire l'index FAISS
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dim)
        self.index.add(embeddings)

    def search(self, query, top_k=3):
        query_vec = self.model.encode([query], convert_to_numpy=True)
        distances, indices = self.index.search(query_vec, top_k)
        return [self.sections[idx] for idx in indices[0]]

    def answer_question(self, question):
        results = self.search(question)
        if not results:
            return "Désolé, je n'ai trouvé aucune information pertinente."

        # Extraire uniquement la réponse de la meilleure correspondance
        top_result = results[0]

        # Isoler la réponse (après le point d'interrogation)
        if "?" in top_result:
            _, answer = top_result.split("?", 1)
            return answer.strip()
        else:
            return top_result.strip()
