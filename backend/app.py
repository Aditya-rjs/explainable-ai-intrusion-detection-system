"""
XAI-IDS Backend — Flask REST API
Explainable AI Based Intrusion Detection System

Run: python app.py
"""

from flask import Flask
from flask_cors import CORS

from routes.stats import stats_bp
from routes.alerts import alerts_bp
from routes.scan import scan_bp
from routes.train import train_bp
from routes.report import report_bp
from routes.traffic import traffic_bp
from utils.db import init_db

app = Flask(__name__)

# Allow requests from the React frontend (Vite dev server on port 3000)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register all blueprints under /api
app.register_blueprint(stats_bp,   url_prefix="/api")
app.register_blueprint(alerts_bp,  url_prefix="/api")
app.register_blueprint(scan_bp,    url_prefix="/api")
app.register_blueprint(train_bp,   url_prefix="/api")
app.register_blueprint(report_bp,  url_prefix="/api")
app.register_blueprint(traffic_bp, url_prefix="/api")


@app.route("/api/health")
def health():
    return {"status": "ok", "service": "XAI-IDS API"}


if __name__ == "__main__":
    # Initialize the SQLite database and seed demo data
    init_db()
    print("=" * 50)
    print("  XAI-IDS API Server starting...")
    print("  URL: http://localhost:5000")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5000, debug=True)
