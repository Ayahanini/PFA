import os
import logging
from typing import Dict, List, Optional, Tuple

from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.base import Embeddings
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.vectorstores import VectorStore
from langchain_core.language_models import LLM
from langchain_community.llms import OpenAI
from langchain.chains import RetrievalQA
from langchain_core.retrievers import BaseRetriever
from langchain_core.prompts import PromptTemplate

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("knowledge_base.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Définition des constantes et chemins
KNOWLEDGE_FILE = "medical_knowledge.txt"
EMBEDDINGS_FOLDER = "embeddings"
FAISS_INDEX_FOLDER = os.path.join(EMBEDDINGS_FOLDER, "faiss_index")
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB limite pour le fichier de connaissances

class MedicalKnowledgeBase:
    """Classe pour gérer la base de connaissances médicales."""
    
    def __init__(self):
        self.embeddings: Optional[Embeddings] = None
        self.vector_store: Optional[VectorStore] = None
        self.llm: Optional[LLM] = None
        self.qa_chain: Optional[RetrievalQA] = None
        self.retriever: Optional[BaseRetriever] = None
        self.is_initialized: bool = False
        self.documents_count: int = 0
        
        # Créer le dossier d'embeddings s'il n'existe pas
        os.makedirs(EMBEDDINGS_FOLDER, exist_ok=True)
    
    def initialize_resources(self, force_reload: bool = False) -> bool:
        """
        Initialise la base de connaissances, soit en chargeant un index existant,
        soit en créant un nouvel index à partir du fichier de connaissances médicales.
        
        Args:
            force_reload (bool): Si True, force la recréation de l'index même s'il existe déjà.
            
        Returns:
            bool: True si l'initialisation est réussie, False sinon.
        """
        try:
            # Vérifier si une clé API OpenAI est disponible
            openai_api_key = os.environ.get("OPENAI_API_KEY")
            if not openai_api_key:
                logger.error("Clé API OpenAI non trouvée dans les variables d'environnement.")
                return False
            
            # Initialiser les embeddings (seulement s'ils n'existent pas déjà)
            if self.embeddings is None:
                self.embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
            
            # Charger un index existant ou en créer un nouveau
            if os.path.exists(FAISS_INDEX_FOLDER) and not force_reload:
                logger.info("Chargement de l'index FAISS existant...")
                self.vector_store = FAISS.load_local(FAISS_INDEX_FOLDER, self.embeddings)
                self.documents_count = len(self.vector_store.index_to_docstore_id)
                logger.info(f"Index chargé avec {self.documents_count} documents.")
            else:
                logger.info("Création d'un nouvel index à partir du fichier de connaissances...")
                if not os.path.exists(KNOWLEDGE_FILE):
                    logger.error(f"Fichier de connaissances {KNOWLEDGE_FILE} non trouvé.")
                    return False
                
                # Vérifier la taille du fichier avant de le charger
                file_size = os.path.getsize(KNOWLEDGE_FILE)
                if file_size > MAX_FILE_SIZE:
                    logger.error(f"Le fichier de connaissances est trop volumineux ({file_size} octets). Maximum autorisé: {MAX_FILE_SIZE} octets.")
                    return False
                
                # Lire le fichier de connaissances
                with open(KNOWLEDGE_FILE, 'r', encoding='utf-8') as f:
                    text = f.read()
                
                # Diviser le texte en chunks
                text_splitter = CharacterTextSplitter(
                    separator="\n\n",
                    chunk_size=1000,
                    chunk_overlap=200,
                    length_function=len
                )
                texts = text_splitter.split_text(text)
                
                # Créer l'index vectoriel
                self.vector_store = FAISS.from_texts(texts, self.embeddings)
                self.documents_count = len(texts)
                
                # Sauvegarder l'index pour une utilisation future
                self.vector_store.save_local(FAISS_INDEX_FOLDER)
                logger.info(f"Nouvel index créé avec {self.documents_count} documents et sauvegardé.")
            
            # Initialiser le modèle de langage (seulement s'il n'existe pas déjà)
            if self.llm is None:
                self.llm = OpenAI(temperature=0, openai_api_key=openai_api_key)
            
            # Créer le retriever
            self.retriever = self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3}
            )
            
            # Créer le template de prompt personnalisé
            qa_prompt_template = """Tu es un assistant médical spécialisé dans les maladies cardiaques. 
Utilise uniquement les informations du contexte pour répondre à la question. 
Si l'information ne se trouve pas dans le contexte, réponds que tu ne connais pas 
la réponse mais que le patient devrait consulter un professionnel de la santé.

Contexte: {context}

Question: {question}

Réponds de manière claire, précise et avec un ton rassurant. Si la question concerne 
un traitement ou un diagnostic spécifique, rappelle toujours que tu n'es pas un médecin 
et que le patient devrait consulter un professionnel de santé.

Réponse:"""
            
            QA_PROMPT = PromptTemplate(
                template=qa_prompt_template,
                input_variables=["context", "question"]
            )
            
            # Créer la chaîne de questions-réponses
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.retriever,
                return_source_documents=True,
                chain_type_kwargs={"prompt": QA_PROMPT}
            )
            
            self.is_initialized = True
            logger.info("Base de connaissances médicales initialisée avec succès.")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de la base de connaissances: {str(e)}")
            self.is_initialized = False
            return False
    
    def answer_question(self, question: str, user_data: Optional[Dict] = None) -> Dict:
        """
        Répond à une question médicale en utilisant la base de connaissances.
        
        Args:
            question (str): La question de l'utilisateur
            user_data (Dict, optional): Données utilisateur pour personnaliser la réponse
            
        Returns:
            Dict: Réponse contenant le texte et des métadonnées
        """
        if not self.is_initialized:
            if not self.initialize_resources():
                return {
                    "response": "Je ne peux pas répondre à votre question actuellement car la base de connaissances n'est pas disponible.",
                    "source": "error",
                    "confidence": 0.0
                }
        
        try:
            # Limiter la taille de la question
            if len(question) > 500:
                question = question[:500]
                logger.warning("Question tronquée car trop longue")
            
            # Enrichir la question avec le contexte utilisateur si disponible
            enhanced_question = question
            context = ""
            if user_data and isinstance(user_data, dict) and "prediction" in user_data:
                pred = user_data["prediction"]
                risk = user_data.get("risk_percentage", 0)
                context = f"Le patient a un {'risque' if pred == 1 else 'faible risque'} de maladie cardiaque (risque estimé: {risk}%)."
                enhanced_question = f"Contexte patient: {context} Question: {question}"
            
            # Obtenir la réponse avec gestion des erreurs d'API
            try:
                result = self.qa_chain({"query": enhanced_question})
            except Exception as api_error:
                logger.error(f"Erreur API lors de la génération de la réponse: {str(api_error)}")
                # Réessayer une fois avec une question plus simple
                try:
                    simplified_question = f"Version simplifiée: {question}"
                    result = self.qa_chain({"query": simplified_question})
                except:
                    # Si ça échoue à nouveau, utiliser les réponses de secours
                    raise
            
            # Extraire et nettoyer la réponse
            response = result["result"]
            
            # Ajouter un avertissement médical si nécessaire
            needs_warning = any(keyword in question.lower() for keyword in [
                "traitement", "médicament", "guérir", "soigner", "prescription", 
                "dose", "posologie", "ordonnance", "doser"
            ])
            
            if needs_warning:
                warning = "\n\nATTENTION: Ces informations sont générales. Veuillez consulter un professionnel de santé pour des conseils médicaux personnalisés."
                response += warning
            
            # Calculer un score de confiance basé sur la similarité des documents
            docs = result.get("source_documents", [])
            confidence = 0.85 if docs else 0.3  # Valeur par défaut
            
            return {
                "response": response,
                "source": "knowledge_base",
                "confidence": confidence
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération de la réponse: {str(e)}")
            
            # Réponses de secours pour les questions courantes
            fallback_responses = {
                "symptômes": "Les symptômes courants des maladies cardiaques incluent douleur thoracique, essoufflement, fatigue, palpitations et œdème. Consultez un médecin si vous ressentez ces symptômes.",
                "prévention": "Pour prévenir les maladies cardiaques, adoptez une alimentation équilibrée, pratiquez une activité physique régulière, évitez de fumer, limitez l'alcool et contrôlez votre tension artérielle et cholestérol.",
                "facteurs de risque": "Les principaux facteurs de risque incluent l'hypertension, l'hypercholestérolémie, le tabagisme, le diabète, l'obésité, la sédentarité, l'âge avancé et les antécédents familiaux.",
                "traitement": "Les traitements des maladies cardiaques peuvent inclure des médicaments, des interventions chirurgicales et des changements de mode de vie. Consultez un médecin pour un traitement adapté à votre situation."
            }
            
            # Trouver la meilleure réponse de secours
            for keyword, response in fallback_responses.items():
                if keyword in question.lower():
                    return {
                        "response": response + "\n\nDésolé pour les limitations de ma réponse, notre système rencontre actuellement des difficultés techniques.",
                        "source": "fallback",
                        "confidence": 0.5
                    }
            
            return {
                "response": "Je suis désolé, je ne peux pas répondre à cette question pour le moment. Veuillez contacter un professionnel de santé pour obtenir des informations médicales fiables.",
                "source": "error",
                "confidence": 0.0
            }
    
    def cleanup_resources(self):
        """
        Nettoie les ressources utilisées par la base de connaissances.
        À appeler lors de la fermeture de l'application.
        """
        try:
            # Libérer les ressources si nécessaire
            self.embeddings = None
            self.vector_store = None
            self.llm = None 
            self.qa_chain = None
            self.retriever = None
            self.is_initialized = False
            logger.info("Ressources de la base de connaissances libérées avec succès.")
        except Exception as e:
            logger.error(f"Erreur lors du nettoyage des ressources: {str(e)}")

# Instance singleton pour utilisation dans l'application
kb = MedicalKnowledgeBase()

# Fonction utilitaire pour l'application Flask
def get_medical_response(query: str, user_data: Optional[Dict] = None) -> str:
    """
    Fonction d'aide pour obtenir une réponse médicale à partir de la base de connaissances.
    
    Args:
        query (str): Question de l'utilisateur
        user_data (Dict, optional): Données utilisateur pour personnaliser la réponse
        
    Returns:
        str: Réponse textuelle
    """
    # Vérifier que la base de connaissances est initialisée
    if not kb.is_initialized and not kb.initialize_resources():
        return "La base de connaissances médicales n'est pas disponible actuellement. Veuillez réessayer plus tard."
    
    result = kb.answer_question(query, user_data)
    return result["response"]