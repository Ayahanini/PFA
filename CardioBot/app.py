import os
from aiohttp import web
from botbuilder.core import (
    BotFrameworkAdapterSettings,
    BotFrameworkAdapter,
    MemoryStorage,
    ConversationState,
    UserState,
)
from botbuilder.core.integration import aiohttp_error_middleware
from botbuilder.schema import Activity
from bot import MedicalBot
from knowledge_base import KnowledgeBase

# Récupération des identifiants (laisser vides pour test local)
APP_ID = os.environ.get("MicrosoftAppId", "")
APP_PASSWORD = os.environ.get("MicrosoftAppPassword", "")

# Configuration de l’adaptateur Bot Framework
SETTINGS = BotFrameworkAdapterSettings(APP_ID, APP_PASSWORD)
ADAPTER = BotFrameworkAdapter(SETTINGS)

# Mémoire (stateless en local)
MEMORY = MemoryStorage()
CONVERSATION_STATE = ConversationState(MEMORY)
USER_STATE = UserState(MEMORY)

# Chargement de la base de connaissances
kb = KnowledgeBase("D:/CHATBOTMEDICAL2/botbuilder-tools/CardioBot/medical_knowledge.json")

# Création du bot
BOT = MedicalBot(CONVERSATION_STATE, USER_STATE, kb)

# Point de terminaison pour recevoir les messages
async def messages(req: web.Request) -> web.Response:
    if "application/json" in req.headers.get("Content-Type", ""):
        body = await req.json()
    else:
        return web.Response(status=415)

    activity = Activity().deserialize(body)
    auth_header = req.headers.get("Authorization", "")

    try:
        async def aux_func(turn_context):
            await BOT.on_turn(turn_context)
            await CONVERSATION_STATE.save_changes(turn_context)
            await USER_STATE.save_changes(turn_context)

        response = await ADAPTER.process_activity(activity, auth_header, aux_func)

        if response:
            return web.json_response(data=response.body, status=response.status)
        return web.Response(status=200)

    except Exception as error:
        raise error

# Création de l’application web
APP = web.Application(middlewares=[aiohttp_error_middleware])
APP.router.add_post("/api/messages", messages)

if __name__ == "__main__":
    web.run_app(APP, host="localhost", port=3978)
