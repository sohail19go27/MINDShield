from flask import Flask, request, jsonify
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)

# Train a tiny synthetic model at startup to simulate predictions
def train_model():
    # Synthetic features: clarity, focus, moodEncoded, sleepHours, productivity, stress
    rng = np.random.RandomState(42)
    n = 200
    clarity = rng.uniform(3,9,size=n)
    focus = clarity + rng.normal(0,1,size=n)
    mood = rng.randint(0,5,size=n)
    sleep = rng.uniform(4,9,size=n)
    productivity = rng.uniform(3,9,size=n)
    stress = rng.randint(0,2,size=n)

    X = np.vstack([clarity, focus, mood, sleep, productivity, stress]).T
    # target: next day clarity: base on clarity and sleep
    y = clarity * 0.6 + sleep * 0.3 + rng.normal(0,0.5,size=n)

    model = LinearRegression()
    model.fit(X, y)
    return model

MODEL = train_model()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    try:
        clarity = float(data.get('clarityRating', 0))
        focus = float(data.get('focusLevel', 0))
        mood = float(data.get('moodEncoded', 3))
        sleep = float(data.get('sleepHours', 0))
        productivity = float(data.get('productivity', 0))
        stress = float(data.get('stress', 0))

        X = np.array([[clarity, focus, mood, sleep, productivity, stress]])
        pred = MODEL.predict(X)[0]

        # trend heuristic: compare predicted to current clarity
        diff = pred - clarity
        if diff > 0.3:
            trend = 'improving'
        elif diff < -0.3:
            trend = 'declining'
        else:
            trend = 'stable'

        return jsonify({ 'predictedClarity': round(float(pred), 2), 'trend': trend })
    except Exception as e:
        return jsonify({ 'error': str(e) }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
