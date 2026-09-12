from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import pandas as pd
import re

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------
# Load trained URL model
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "url_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print("URL model loaded successfully!")
except Exception as e:
    model = None
    print("Error loading URL model:", e)


# ---------------------------------------------------------
# Feature extraction
# Must match the features used while training url_model.pkl
# ---------------------------------------------------------

def extract_features(url):

    ip_pattern = r"https?://(\d{1,3}\.){3}\d{1,3}"

    features = {
        "url_length": len(url),
        "dot_count": url.count("."),
        "slash_count": url.count("/"),
        "hyphen_count": url.count("-"),
        "at_count": url.count("@"),
        "digit_count": sum(c.isdigit() for c in url),
        "has_https": int(url.startswith("https")),
        "question_count": url.count("?"),
        "equal_count": url.count("="),
        "percent_count": url.count("%"),
        "underscore_count": url.count("_"),
        "has_ip": int(bool(re.search(ip_pattern, url)))
    }

    return pd.DataFrame([features])


# ---------------------------------------------------------
# Home API
# ---------------------------------------------------------

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "project": "PhishGuard AI",
        "status": "Backend is running",
        "model_loaded": model is not None
    })


# ---------------------------------------------------------
# Prediction API
# ---------------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid or missing JSON body"
        }), 400

    url = data.get("url")

    if not url or not isinstance(url, str):
        return jsonify({
            "error": "URL is required"
        }), 400

    url = url.strip()

    if not url:
        return jsonify({
            "error": "URL is required"
        }), 400

    # Check model
    if model is None:
        return jsonify({
            "error": "ML model is not loaded"
        }), 500

    try:

        # Extract features
        X = extract_features(url)

        # ML prediction
        prediction = model.predict(X)[0]

        # Convert prediction into readable result
        if prediction == 1:
            result = "phishing"
        else:
            result = "legitimate"

        # Confidence if model supports probability
        confidence = None

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(X)[0]
            confidence = float(max(probabilities))

        response = {
            "url": url,
            "prediction": result
        }

        if confidence is not None:
            response["confidence"] = confidence

        return jsonify(response), 200

    except Exception as e:

        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
        }), 500


# ---------------------------------------------------------
# Model status
# ---------------------------------------------------------

@app.route("/model-status", methods=["GET"])
def model_status():

    return jsonify({
        "model_loaded": model is not None,
        "model_path": MODEL_PATH
    })


# ---------------------------------------------------------
# Run Flask server
# ---------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)