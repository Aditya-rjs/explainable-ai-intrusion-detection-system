# XAI-IDS — Explainable AI Based Intrusion Detection System

> B.Tech Final Year Project | Full-Stack Explainable AI Powered Intrusion Detection System for Cyberattack Detection, Threat Analysis, and Security Monitoring.

---

<img width="1916" height="951" alt="Screenshot 2026-05-19 131341" src="https://github.com/user-attachments/assets/3b98c371-fc35-4b38-946a-9eeb4ff8ae12" />


## Overview

XAI-IDS is a full-stack Explainable AI (XAI) based Intrusion Detection System designed to detect, classify, and analyze multiple categories of cyberattacks using Machine Learning and Explainable AI techniques.

The system combines XGBoost, Random Forest, SHAP (SHapley Additive Explanations), Flask REST APIs, and a React-based dashboard to provide real-time threat visibility, attack classification, and transparent prediction explanations.

## Supported attack categories include:

- DDoS Attacks
- Port Scanning
- Brute Force Attacks
- SQL Injection
- Botnet Activity
- DNS Tunneling
- FTP Patator
- SSH Patator

## Key Features

- Explainable AI Threat Detection
- Detects multiple cyberattack categories using Machine Learning models.
- Provides SHAP-based explanations for every prediction.
- Displays feature importance analysis for security investigation.

<img width="1919" height="919" alt="Screenshot 2026-05-20 001348" src="https://github.com/user-attachments/assets/16cf5578-e2a4-40ff-b5df-d731fed73b93" />

## Security Monitoring Dashboard

- Real-time attack monitoring dashboard.
- Threat severity analysis.
- Attack distribution visualization.
- Confidence score tracking.
- Historical alert management.

<img width="1893" height="916" alt="Screenshot 2026-05-20 001248" src="https://github.com/user-attachments/assets/06bc61e5-43db-49a9-a74f-9ffa88361ca4" />

## Traffic Analysis

- Network traffic monitoring and analytics.
- Interactive visualizations using Recharts.
- Protocol and traffic pattern analysis.

<img width="1907" height="920" alt="Screenshot 2026-05-20 001225" src="https://github.com/user-attachments/assets/73a1de67-ab8a-4b4f-9a88-ee42426a837c" />

## Threat Alert Management

- Alert generation and management.
- Threat classification and prioritization.
- Attack history tracking.

<img width="1592" height="381" alt="Screenshot 2026-05-20 001332" src="https://github.com/user-attachments/assets/8e908238-360c-4752-bd7e-7843968c981c" />

## Automated Reporting
- Security report generation.
- Threat summaries.
- Model performance reporting.

<img width="1916" height="916" alt="Screenshot 2026-05-20 001446" src="https://github.com/user-attachments/assets/3a713614-2943-4ba5-ae14-c8256419d990" />

<img width="451" height="274" alt="Screenshot 2026-05-20 002051" src="https://github.com/user-attachments/assets/8b5d0a9a-eba1-41a3-afa6-bb84d0c38614" />

### Technology Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- Recharts

## Backend

- Python
- Flask
- Flask-CORS

## Machine Learning & Explainable AI

- XGBoost
- Random Forest
- Scikit-learn
- SHAP
- Pandas
- NumPy

## Database

- SQLite

## Development Tools

- Git
- GitHub
- VS Code


### System Architecture

## [architecture_diagram]
```
React Dashboard
       |
       ▼
Flask REST API
       |
       ▼
Machine Learning Engine
(XGBoost / Random Forest)
       |
       ▼
SHAP Explainability Layer
       |
       ▼
SQLite Database
```

## Quick Start (Windows)

### 1. Backend (Python Flask + ML)

Open **Command Prompt** or **PowerShell** in the `backend` folder:

```
cd backend
pip install -r requirements.txt
python app.py
```

Backend starts at: http://localhost:5000

---

### 2. Frontend (React + Vite)

Open a **second** terminal in the `frontend` folder:

```
cd frontend
npm install
npm run dev
```

Frontend starts at: http://localhost:3000

Open http://localhost:3000 in your browser.

**Login credentials:** `admin` / `xai@2024`

---

## Project Structure

```
project/
├── backend/
│   ├── app.py                  # Flask server entry point
│   ├── requirements.txt        # Python dependencies
│   ├── model/
│   │   ├── train_model.py      # XGBoost / RandomForest training
│   │   └── predict.py          # Inference + SHAP explanations
│   ├── routes/
│   │   ├── alerts.py           # Alert CRUD
│   │   ├── scan.py             # Manual scan
│   │   ├── stats.py            # Dashboard stats
│   │   ├── train.py            # Model training trigger
│   │   ├── report.py           # Report generation
│   │   └── traffic.py          # Traffic data
│   ├── utils/
│   │   ├── db.py               # SQLite database helpers
│   │   ├── preprocessing.py    # Feature engineering (CICIDS2017)
│   │   └── shap_explainer.py   # SHAP value computation
│   └── dataset/
│       ├── generate_sample.py  # Sample dataset generator
│       └── sample_data.csv     # (Generated — see below)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Router + auth guard
│   │   ├── main.jsx            # React entry point
│   │   ├── index.css           # Tailwind + cyber theme
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ThreatAlerts.jsx
│   │   │   ├── TrafficAnalysis.jsx
│   │   │   ├── ManualScan.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx      # Sidebar + header shell
│   │   └── services/
│   │       └── api.js          # Axios API client
│   ├── package.json
│   └── vite.config.js          # Proxy: /api -> localhost:5000
│
└── README.md                   # This file
```

---

## Features

### Frontend
- Dark cyberpunk UI with animated grid background
- Real-time charts (area, bar, pie, scatter) via Recharts
- Threat Alerts table with SHAP explanation panel
- Manual Scan with SHAP feature importance visualization
- Traffic Analysis with live charts and top-talker table
- Report generation and download
- ML settings panel with live training trigger

### Backend
- Flask REST API with CORS support
- SQLite database (no extra setup required)
- XGBoost or RandomForest classifier
- SHAP explainability for every prediction
- Auto-seeds 50 demo alerts on first run
- CICIDS2017 dataset support

---

## Training the ML Model

### Option A — Demo (no real dataset needed)
Go to `Settings` page in the UI → click **Train Model Now**.
The backend will train on synthetic data in ~10 seconds.

### Option B — Real CICIDS2017 Dataset
1. Download from https://www.unb.ca/cic/datasets/ids-2017.html
2. Place any CSV file in `backend/dataset/`
3. Click **Train Model Now** in Settings, or POST to `/api/train`

### Option C — Generate Sample CSV
```
cd backend/dataset
python generate_sample.py
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/health | Health check |
| GET | /api/stats | Dashboard stats |
| GET | /api/alerts | List alerts |
| DELETE | /api/alerts/:id | Delete alert |
| POST | /api/scan | Run ML detection |
| POST | /api/train | Train model |
| GET | /api/train/status | Training progress |
| GET | /api/traffic | Network traffic data |
| GET | /api/report | List reports |
| POST | /api/report/generate | Generate report |

---

## Supported Attack Types

| Attack | Description |
|--------|-------------|
| DDoS | Distributed Denial of Service |
| Port Scan | Network reconnaissance |
| Brute Force | Password/auth attacks |
| SQL Injection | Database injection |
| Botnet | Bot network traffic |
| DNS Tunneling | DNS-based covert channel |
| FTP Patator | FTP brute-force tool |
| SSH Patator | SSH brute-force tool |

---

## Future Enhancements

- Live Packet Capture Integration
- Real-Time Network Monitoring
- Email & SMS Alerts
- Threat Intelligence Feeds
- Docker Deployment
- Cloud-Based Deployment
- SIEM Integration
- Advanced User Authentication

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm: command not found` | Install Node.js LTS from https://nodejs.org |
| `pip: command not found` | Install Python 3.11+ from https://python.org |
| Port 5000 in use | Change `port=5000` in `app.py` and update vite.config.js proxy |
| Port 3000 in use | Change `port: 3000` in `vite.config.js` |
| SHAP install fails | Run `pip install shap --no-build-isolation` |
| Dashboard shows demo data | Start the backend: `python app.py` in the `backend` folder |

---

*XAI-IDS v1.0 — Built with React, Flask, XGBoost, and SHAP*

---

## CREATOR

Aditya Raj Singh

B.Tech Computer Science & Engineering

LNJPIT, Chapra

Email: aditya.rjs003@gmail.com

LinkedIn: https://www.linkedin.com/in/aditya-raj-singh-5ab5bb259
