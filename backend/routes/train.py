"""
POST /api/train  — Trigger model training
GET  /api/train/status — Model status
"""

import os
import threading
from flask import Blueprint, jsonify, request

train_bp = Blueprint("train", __name__)

# Shared training state (single-process only — production should use a task queue)
_training_state = {
    "status":  "idle",    # idle | running | done | error
    "result":  None,
    "error":   None,
}

DATASET_PATH = os.path.join(
    os.path.dirname(__file__), "..", "dataset", "sample_data.csv"
)


def _do_training(params: dict):
    global _training_state
    _training_state["status"] = "running"
    try:
        from model.train_model import train_model
        result = train_model(
            dataset_path = DATASET_PATH if os.path.exists(DATASET_PATH) else None,
            model_type   = params.get("model_type", "xgboost"),
            max_depth    = int(params.get("max_depth", 6)),
            n_estimators = int(params.get("n_estimators", 200)),
        )
        _training_state["status"] = "done"
        _training_state["result"] = result
    except Exception as e:
        _training_state["status"] = "error"
        _training_state["error"]  = str(e)
        print(f"[Train] Error: {e}")


@train_bp.route("/train", methods=["POST"])
def start_training():
    """
    Start model training in a background thread.
    Responds immediately so the frontend doesn't time out.
    """
    if _training_state["status"] == "running":
        return jsonify({"status": "running", "message": "Training already in progress"}), 409

    params = request.get_json(silent=True) or {}
    _training_state["status"] = "idle"
    _training_state["result"] = None
    _training_state["error"]  = None

    thread = threading.Thread(target=_do_training, args=(params,), daemon=True)
    thread.start()

    return jsonify({"status": "started", "message": "Model training started in background"})


@train_bp.route("/train/status", methods=["GET"])
def training_status():
    """Poll training progress."""
    state = dict(_training_state)
    if state["status"] == "done" and state["result"]:
        return jsonify({**state["result"], "status": "done"})
    return jsonify({
        "status": state["status"],
        "error":  state.get("error"),
    })
