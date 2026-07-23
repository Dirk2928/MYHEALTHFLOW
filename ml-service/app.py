from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import numpy as np

app = Flask(__name__)
CORS(app)

print("Loading ML model...")
model = joblib.load('model.pkl')
label_encoders = joblib.load('encoders.pkl')

with open('feature_info.json', 'r') as f:
    feature_info = json.load(f)

print(f"Model loaded. Features: {feature_info['feature_columns']}")
print(f"Health concerns: {feature_info['health_concerns']}")

@app.route('/', methods=['GET'])
def home():
    return jsonify({'status': 'ok', 'message': 'MyHealthFlow ML API is running'})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_accuracy': feature_info['accuracy'],
        'health_concerns': feature_info['health_concerns']
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        all_symptoms = ['dizziness', 'fever', 'cough', 'headache', 'fatigue']
        symptoms_list = data.get('symptoms', [])
        
        features = {}
        for symptom in all_symptoms:
            features[symptom] = 1 if symptom in symptoms_list else 0
        
        features['severity'] = int(data.get('severity', 1))
        features['duration_days'] = int(data.get('duration_days', 1))
        features['age_group'] = data.get('age_group', 'adult')
        
        age_encoder = label_encoders['age_group']
        if features['age_group'] in age_encoder.classes_:
            features['age_group'] = age_encoder.transform([features['age_group']])[0]
        else:
            features['age_group'] = 0
        
        feature_columns = feature_info['feature_columns']
        X = np.array([[features[col] for col in feature_columns]])
        
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        confidence_idx = list(model.classes_).index(prediction)
        confidence = float(probabilities[confidence_idx])
        
        all_probabilities = {}
        for i, class_name in enumerate(model.classes_):
            all_probabilities[class_name] = float(probabilities[i])
        
        return jsonify({
            'prediction': prediction,
            'confidence': round(confidence * 100, 1),
            'all_probabilities': all_probabilities,
            'disclaimer': 'For nurse review only. Not a medical diagnosis.'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'disclaimer': 'For nurse review only. Not a medical diagnosis.'
        }), 500

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("MyHealthFlow+ Lite - ML Prediction API")
    print("=" * 50)
    print(f"Endpoints:")
    print(f"  GET  /        - Home")
    print(f"  GET  /health  - API health check")
    print(f"  POST /predict - Predict health concern")
    print(f"\nStarting server on http://localhost:5000")
    print("=" * 50 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=True)