import openai
from config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def get_chatbot_response(user_input):
    response = openai.ChatCompletion.create(
        model="gpt-4",  # ou gpt-3.5-turbo si tu préfères
        messages=[
            {"role": "system", "content": "Tu es un assistant médical spécialisé en maladies cardiaques. Réponds de manière claire et bienveillante."},
            {"role": "user", "content": user_input}
        ]
    )
    return response.choices[0].message.content
