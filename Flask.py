from flask import Flask, request, jsonify
from knowledge_base import kb

app = Flask(__name__)

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data.get('question', '')
    user_data = data.get('user_data', {})
    
    if not question:
        return jsonify({"error": "Aucune question fournie."}), 400
    
    response = kb.answer_question(question, user_data)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)