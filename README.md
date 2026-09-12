# PhishGuard AI

AI-powered phishing URL detection. Paste a link, get a verdict in under a second.

## Features

- **URL Scanning** — Classifies URLs as safe or phishing using a trained ML model
- **Risk Scoring** — Visual gauge with confidence %, risk level (LOW/MEDIUM/HIGH), and detection reasons
- **Scan History** — Stores up to 100 scans locally with search, sort, and filter capabilities
- **Analytics** — Safety ratio donut chart and 7-day activity breakdown
- **CSV Export** — Download scan history as a CSV file
- **Responsive UI** — Works on desktop, tablet, and mobile
- **Clipboard Integration** — Paste URLs from clipboard and copy scanned URLs

## Project Structure

```
phisguard ai/
├── index.html          # Home page — URL scanner
├── history.html        # Scan history & analytics
├── about.html          # About page with FAQ
├── script.js           # Scanner logic, API calls, result rendering
├── history.js          # History table, filters, charts, export
├── storage.js          # LocalStorage helpers & clipboard copy
├── nav.js              # Mobile nav toggle
├── toast.js            # Toast notifications
├── about.js            # About page animations
├── style.css           # All styles
└── backend/
    ├── app.py          # Flask API server
    ├── requirements.txt
    ├── ml/
    │   ├── url_model.py      # Model training script
    │   ├── url_predict.py    # Standalone prediction
    │   └── predict.py
    ├── models/
│   └── url_model.pkl     # Trained Random Forest model
├── data/
│   ├── raw/
│   │   └── dataset.csv
│   └── processed/
│       ├── clean_dataset.csv
│       ├── features_dataset.csv
│       ├── train.csv
│       └── test.csv
    └── utils/
        └── helpers.py
```

## Tech Stack

**Frontend:** HTML5, CSS3, JavaScript (ES6+), SVG, LocalStorage API, Clipboard API

**Backend:** Python, Flask, Flask-CORS, scikit-learn (Random Forest), pandas, joblib

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### 1. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Flask server

```bash
python app.py
```

The backend runs at `http://127.0.0.1:5000`.

### 3. Open the frontend

Open `index.html` in a browser. The scanner sends URLs to the local Flask backend for prediction.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server status & model load check |
| POST | `/predict` | Classify a URL (`{"url": "..."}`) |
| GET | `/model-status` | Check if ML model is loaded |

### `/predict` Response

```json
{
  "url": "https://example.com",
  "prediction": "legitimate",
  "confidence": 0.96
}
```

## How It Works

1. User enters a URL on the home page
2. Frontend extracts 12 features (length, dots, slashes, hyphens, digits, HTTPS, IP presence, etc.)
3. The trained Random Forest model classifies the URL as `legitimate` or `phishing`
4. A confidence score and risk level are displayed with detection reasons
5. The scan is saved to browser history

## 👥 Team & Contributions

This project was collaboratively developed by a team of three members, with each member contributing to different aspects of the system.

| Team Member | Role | Key Contributions |
|---|---|---|
| **Tarun Kushwah** | Backend & Machine Learning | ML model development, URL feature extraction, model training and prediction logic |
| **Abhijeet Singh Rajawat** | Backend & Database | Backend integration, database management, API support and data handling |
| **Dev Kumar Prajapati** | Frontend, UI/UX & Design | Frontend development, responsive UI/UX design, user interaction, scan history and frontend-backend integration |

### 🤝 Collaboration

The project was developed through collaborative efforts involving machine learning, backend development, database management, frontend engineering, and UI/UX design.



## License

© 2026 ATD CyberGuard / PhishGuard AI
