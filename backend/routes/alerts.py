"""
/api/alerts — CRUD for detected alerts
"""

from flask import Blueprint, jsonify, request
from utils.db import get_conn

alerts_bp = Blueprint("alerts", __name__)


def _row_to_dict(row) -> dict:
    return {
        "id":             row["id"],
        "attack_type":    row["attack_type"],
        "source_ip":      row["source_ip"],
        "destination_ip": row["destination_ip"],
        "severity":       row["severity"],
        "confidence":     row["confidence"],
        "protocol":       row["protocol"],
        "port":           row["port"],
        "status":         row["status"],
        "timestamp":      row["timestamp"],
    }


@alerts_bp.route("/alerts", methods=["GET"])
def get_alerts():
    """Return paginated / filtered alerts."""
    severity = request.args.get("severity")
    limit    = int(request.args.get("limit", 100))
    offset   = int(request.args.get("offset", 0))

    conn = get_conn()
    c = conn.cursor()
    try:
        if severity and severity != "ALL":
            rows = c.execute(
                "SELECT * FROM alerts WHERE severity=? ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (severity, limit, offset),
            ).fetchall()
            total = c.execute("SELECT COUNT(*) FROM alerts WHERE severity=?", (severity,)).fetchone()[0]
        else:
            rows = c.execute(
                "SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (limit, offset),
            ).fetchall()
            total = c.execute("SELECT COUNT(*) FROM alerts").fetchone()[0]

        return jsonify({
            "alerts": [_row_to_dict(r) for r in rows],
            "total": total,
            "limit": limit,
            "offset": offset,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@alerts_bp.route("/alerts/<int:alert_id>", methods=["DELETE"])
def delete_alert(alert_id):
    """Delete a single alert by ID."""
    conn = get_conn()
    try:
        conn.execute("DELETE FROM alerts WHERE id=?", (alert_id,))
        conn.commit()
        return jsonify({"success": True, "deleted_id": alert_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@alerts_bp.route("/alerts", methods=["DELETE"])
def clear_all_alerts():
    """Delete ALL alerts."""
    conn = get_conn()
    try:
        count = conn.execute("SELECT COUNT(*) FROM alerts").fetchone()[0]
        conn.execute("DELETE FROM alerts")
        conn.commit()
        return jsonify({"success": True, "deleted_count": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
