#  ATD CyberGuard

### AI-Powered Phishing URL Detection System

ATD CyberGuard is an AI-powered web security application designed to help users identify potentially suspicious and phishing URLs.

Simply paste a URL into the scanner and the system analyzes its characteristics using a trained Machine Learning model. The application provides a clear prediction, confidence score, risk level, and detection reasons through a simple and responsive interface.

---

##  Project Overview

Phishing attacks are a common cybersecurity threat where attackers use deceptive URLs and websites to trick users into revealing sensitive information.

ATD CyberGuard aims to provide users with a simple way to analyze URLs before interacting with them. The system combines a modern web interface with a Python Flask backend and a trained Random Forest Machine Learning model.

The project demonstrates an end-to-end workflow:

**URL Input → Feature Extraction → ML Prediction → Risk Analysis → Result Display → Scan History**

---

## ✨ Features

- **🔍 URL Scanning** — Classifies URLs as legitimate or phishing using a trained ML model
- **📊 Risk Scoring** — Displays confidence %, risk level (LOW/MEDIUM/HIGH), and detection reasons
- **🕒 Scan History** — Stores up to 100 scans locally with search, sort, and filter capabilities
- **📈 Analytics** — Safety ratio donut chart and 7-day activity breakdown
- **📄 CSV Export** — Download scan history as a CSV file
- **📱 Responsive UI** — Works across desktop, tablet, and mobile devices
- **📋 Clipboard Integration** — Paste URLs from clipboard and copy scanned URLs
- **⚡ Fast Prediction** — Sends URLs directly to the local Flask backend for ML-based classification

---

##  Project Structure

```text
phisguard ai/
│
├── index.html              # Home page — URL scanner
├── history.html            # Scan history & analytics
├── about.html              # About page with FAQ
│
├── script.js               # Scanner logic, API calls & result rendering
├── history.js              # History table, filters, charts & export
├── storage.js              # LocalStorage helpers & clipboard functionality
├── nav.js                  # Mobile navigation toggle
├── toast.js                # Toast notification system
├── about.js                # About page animations
├── style.css               # Application styles
│
└── backend/
    │
    ├── app.py              # Flask API server
    ├── requirements.txt    # Backend dependencies
    │
    ├── ml/
    │   ├── __init__.py     # ML package initializer
    │   ├── url_model.py    # Random Forest model training
    │   ├── url_predict.py  # Standalone URL prediction
    │   └── predict.py      # Prediction utilities
    │
    ├── models/
    │   └── url_model.pkl   # Trained Random Forest model
    │
    ├── data/
    │   ├── raw/
    │   │   └── dataset.csv
    │   │
    │   └── processed/
    │       ├── clean_dataset.csv
    │       ├── features_dataset.csv
    │       ├── train.csv
    │       └── test.csv
    │
    └── utils/
        ├── __init__.py     # Utility package initializer
        └── helpers.py      # Helper functions

## 👥 Team & Contributions

This project was collaboratively developed by a team of three members, with each member contributing to different aspects of the system.
| Team Member | Role | Key Contributions |
|---|---|---|
| Person   | Name                       | Contribution                                                   |
| -------- | -------------------------- | -------------------------------------------------------------- |
| Person 1 | **Abhijeet Singh Rajawat** | Dataset, Data Analysis, Feature Engineering & Machine Learning |
| Person 2 | **Tarun Kushwah**          | Project Integration, Testing & Development                     |
| Person 3 | **Dev Prajapati**          | Frontend Development                                           |

### 🤝 Collaboration

The project was developed through collaborative efforts involving machine learning, backend development, data processing, frontend engineering, and UI/UX design.

## 📄 License

© 2026 **ATD CyberGuard / PhishGuard AI**

This project was developed as a collaborative implementation for learning and demonstrating concepts related to Machine Learning, Web Development, Backend APIs, and Cybersecurity.
