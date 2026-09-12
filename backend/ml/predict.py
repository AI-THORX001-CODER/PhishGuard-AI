import pandas as pd
import joblib

# Load trained model
model = joblib.load("../models/phishing_model.pkl")

print("Model loaded successfully!")


# Function to extract URL features
def extract_features(url):

    features = {
        "ranking": 10000000,
        "mld_res": 0,
        "mld.ps_res": 0,
        "card_rem": 0,
        "ratio_Rrem": 0,
        "ratio_Arem": 0,
        "jaccard_RR": 0,
        "jaccard_RA": 0,
        "jaccard_AR": 0,
        "jaccard_AA": 0,
        "jaccard_ARrd": 0,
        "jaccard_ARrem": 0,

        # URL-based features
        "url_length": len(url),
        "dot_count": url.count("."),
        "slash_count": url.count("/"),
        "hyphen_count": url.count("-"),
        "at_count": url.count("@"),
        "digit_count": sum(c.isdigit() for c in url),
        "has_https": int(url.startswith("https"))
    }

    return pd.DataFrame([features])


# Test URL
url = "https://www.google.com"

# Extract features
X = extract_features(url)

# Prediction
prediction = model.predict(X)[0]

print("URL:", url)

if prediction == 1:
    print("Result: PHISHING ⚠️")
else:
    print("Result: LEGITIMATE ✅")