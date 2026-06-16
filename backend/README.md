# XAI-IDS Backend

Python Flask REST API with XGBoost + SHAP Explainable AI.

## Requirements

- Python 3.11+
- pip

## Setup & Run

```
pip install -r requirements.txt
python app.py
```

API runs at: http://localhost:5000

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/health | Health check |
| GET | /api/stats | Dashboard statistics |
| GET | /api/alerts | List all alerts |
| DELETE | /api/alerts/:id | Delete one alert |
| DELETE | /api/alerts | Delete all alerts |
| POST | /api/scan | Run detection on a packet |
| POST | /api/train | Train the ML model |
| GET | /api/train/status | Training status |
| GET | /api/traffic | Network traffic data |
| GET | /api/report | List reports |
| POST | /api/report/generate | Generate new report |

## Dataset

The system supports the **CICIDS2017** dataset.

1. Download from https://www.unb.ca/cic/datasets/ids-2017.html
2. Place any CSV file in `dataset/`
3. POST to `/api/train` to train the model

Or run the sample generator for demo data:

```
cd dataset
python generate_sample.py
```

## Project Structure

```
backend/
├── app.py              # Flask app entry point
├── requirements.txt    # Python dependencies
├── model/
│   ├── train_model.py  # XGBoost/RandomForest training
│   └── predict.py      # Inference + SHAP explanations
├── routes/
│   ├── alerts.py       # Alert CRUD
│   ├── scan.py         # Manual scan endpoint
│   ├── stats.py        # Dashboard stats
│   ├── train.py        # Model training trigger
│   ├── report.py       # Report generation
│   └── traffic.py      # Traffic data
├── utils/
│   ├── db.py           # SQLite helpers
│   ├── preprocessing.py # Feature engineering
│   └── shap_explainer.py # SHAP value computation
└── dataset/
    ├── sample_data.csv  # Generated demo data
    └── generate_sample.py
```
