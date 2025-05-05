from flask import Flask, request, jsonify, render_template
from knowledge_base import kb

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data.get('question', '')
    user_data = data.get('user_data', {})
    
    if not question:
        return jsonify({"response": "Aucune question fournie."}), 400
    
    response = kb.answer_question(question, user_data)
    return jsonify({"response": response["response"]})
    
    app = Flask(__name__, template_folder='templates', static_folder='static')
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.route('/ask', methods=['POST'])
    def ask_question():
        data = request.json
        question = data.get('question', '')
        user_data = data.get('user_data', {})
        
        if not question:
            return jsonify({"response": "Aucune question fournie."}), 400
        
        response = kb.answer_question(question, user_data)
        return jsonify({"response": response["response"]})
    
    app = Flask(__name__, template_folder='templates', static_folder='static')
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.route('/ask', methods=['POST'])
    def ask_question():
        data = request.json
        question = data.get('question', '')
        user_data = data.get('user_data', {})
        
        if not question:
            return jsonify({"response": "Aucune question fournie."}), 400
        
        response = kb.answer_question(question, user_data)
        return jsonify({"response": response["response"]})
    
    if __name__ == '__main__':
        app.run(debug=True)