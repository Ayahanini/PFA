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
