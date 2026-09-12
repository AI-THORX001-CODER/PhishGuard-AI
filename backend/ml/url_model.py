import pandas as pd
import re
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


# Load dataset
df = pd.read_csv("../data/processed/features_dataset.csv")


# Function to extract URL features
def extract_features(url):

    # Check if URL contains an IP address
    ip_pattern = r"https?://(\d{1,3}\.){3}\d{1,3}"

    features = {
        "url_length": len(url),
        "dot_count": url.count("."),
        "slash_count": url.count("/"),
        "hyphen_count": url.count("-"),
        "at_count": url.count("@"),
        "digit_count": sum(c.isdigit() for c in url),
        "has_https": int(url.startswith("https")),

        # New features
        "question_count": url.count("?"),
        "equal_count": url.count("="),
        "percent_count": url.count("%"),
        "underscore_count": url.count("_"),
        "has_ip": int(bool(re.search(ip_pattern, url)))
    }

    return features


# Create URL features from dataset
url_features = pd.DataFrame(
    df["domain"].apply(extract_features).tolist()
)

X = pd.DataFrame(url_features)
y = df["label"]


# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# Train model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)


# Test model
y_pred = model.predict(X_test)

print("Improved URL Model trained successfully!")
print("Test Accuracy:", accuracy_score(y_test, y_pred))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))


# Save model
joblib.dump(model, "../models/url_model.pkl")

print("Model saved successfully!")
print("Features used:", list(X.columns))