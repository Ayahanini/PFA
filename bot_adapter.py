import os
from botbuilder.core import (
    BotFrameworkAdapter,
    BotFrameworkAdapterSettings,
    MemoryStorage,
    ConversationState,
    UserState,
)
from PFA.medical_bot_new import MedicalBot
from knowledge_base import KnowledgeBase

APP_ID = os.environ.get("MicrosoftAppId", "")
APP_PASSWORD = os.environ.get("MicrosoftAppPassword", "")

SETTINGS = BotFrameworkAdapterSettings(APP_ID, APP_PASSWORD)
ADAPTER = BotFrameworkAdapter(SETTINGS)

MEMORY = MemoryStorage()
CONVERSATION_STATE = ConversationState(MEMORY)
USER_STATE = UserState(MEMORY)

# Charger la base de connaissances
KB = KnowledgeBase("D:/CHATBOTMEDICAL2/PFA/medical_knowledge.json")

BOT = MedicalBot()
