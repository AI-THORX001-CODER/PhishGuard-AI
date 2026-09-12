import pandas as pd
import re
import joblib

# Load URL model
model = joblib.load("../models/url_model.pkl")

print("URL model loaded successfully!")


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

url = "http://192.168.1.100/login.php?verify=12345"
X = extract_features(url)

prediction = model.predict(X)[0]

print("URL:", url)

if prediction == 1:
    print("Result: PHISHING ⚠️")
else:
    print("Result: LEGITIMATE ✅")