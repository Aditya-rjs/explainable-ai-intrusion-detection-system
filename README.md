# XAI-IDS — Explainable AI Based Intrusion Detection System

> B.Tech Final Year Project | Cybersecurity Dashboard with XGBoost + SHAP

---

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

## Viva Talking Points

1. **XGBoost** — gradient boosted decision trees, state-of-the-art for tabular data
2. **SHAP (SHapley Additive exPlanations)** — model-agnostic explainability; shows which features caused the prediction
3. **CICIDS2017** — standard benchmark dataset for IDS research (Canadian Institute for Cybersecurity)
4. **Flask REST API** — stateless, scalable, easy to extend
5. **SQLite** — zero-config embedded database, perfect for local deployment

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
