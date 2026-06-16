"""
POST /api/scan — Run the ML model on a manually-provided packet.
"""

from flask import Blueprint, jsonify, request
from utils.db import get_conn
from datetime import datetime
import random

scan_bp = Blueprint("scan", __name__)


def _rand_ip():
    prefix = random.choice(["192.168", "10.0", "172.16"])
    return f"{prefix}.{random.randint(0, 255)}.{random.randint(1, 254)}"


@scan_bp.route("/scan", methods=["POST"])
def run_scan():
    """
    Accepts network traffic feature payload, runs the trained model,
    and stores the result as an alert if an attack is detected.
    """
    data = request.get_json(silent=True) or {}

    # Lazy import to avoid circular dependency
    try:
        from model.predict import predict
        result = predict(data)
    except Exception as e:
        print(f"[Scan] Prediction failed: {e}")
        return jsonify({"error": "Prediction failed", "detail": str(e)}), 500

    # Persist detected attacks to the database
    if result.get("is_attack", False):
        conn = get_conn()
        try:
            conn.execute("""
                INSERT INTO alerts
                  (attack_type, source_ip, destination_ip, severity, confidence,
                   protocol, port, status, shap_json, timestamp)
                VALUES (?,?,?,?,?,?,?,?,?,?)
            """, (
                result["prediction"],
                data.get("source_ip", _rand_ip()),
                data.get("dest_ip",   _rand_ip()),
                result["severity"],
                result["confidence"],
                data.get("protocol", "TCP"),
                int(data.get("dest_port", 80)),
                "DETECTED",
                str(result.get("shap_values", {})),
                datetime.now().isoformat(),
            ))
            conn.commit()
        except Exception as e:
            print(f"[Scan] DB write failed: {e}")
        finally:
            conn.close()

    return jsonify(result)
