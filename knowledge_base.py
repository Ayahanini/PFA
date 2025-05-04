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
    
    def _init_(self):
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