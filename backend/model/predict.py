"""
Inference helpers — load the trained model and run predictions.
"""

import numpy as np
from model.train_model import load_model
from utils.preprocessing import ATTACK_LABELS, label_encoder, build_inference_row
from utils.shap_explainer import get_shap_values, get_top_features

# Severity thresholds based on model confidence
def _get_severity(confidence: float, is_attack: bool) -> str:
    if not is_attack:
        return "LOW"
    if confidence >= 95:
        return "CRITICAL"
    if confidence >= 85:
        return "HIGH"
    if confidence >= 75:
        return "MEDIUM"
    return "LOW"


def predict(form_data: dict) -> dict:
    """
    Run the trained XGBoost model on form_data from the manual scan endpoint.

    Returns a dict suitable for the /api/scan JSON response.
    """
    model, scaler, feature_names = load_model()

    if model is None:
        return _mock_prediction(form_data)

    # Build feature vector from form
    row = build_inference_row(form_data)

    # Apply scaler if it was fitted on the same feature set
    try:
        row_scaled = scaler.transform(row)
    except Exception:
        row_scaled = row

    # Predict class and probabilities
    pred_class = int(model.predict(row_scaled)[0])
    proba      = model.predict_proba(row_scaled)[0]
    confidence = round(float(proba[pred_class]) * 100, 2)

    attack_name = ATTACK_LABELS[pred_class] if pred_class < len(ATTACK_LABELS) else "Unknown"
    is_attack   = attack_name != "BENIGN"
    severity    = _get_severity(confidence, is_attack)

    # SHAP explanations
    try:
        shap_values  = get_shap_values(model, row_scaled, feature_names)
        top_features = get_top_features(shap_values)
    except Exception as e:
        print(f"[Predict] SHAP failed: {e}")
        shap_values  = {}
        top_features = []

    return {
        "prediction":   attack_name,
        "confidence":   confidence,
        "severity":     severity,
        "is_attack":    is_attack,
        "shap_values":  shap_values,
        "top_features": top_features,
        "probabilities": {
            ATTACK_LABELS[i]: round(float(p) * 100, 2)
            for i, p in enumerate(proba)
            if i < len(ATTACK_LABELS)
        },
    }


def _mock_prediction(form_data: dict) -> dict:
    """Fallback when no model has been trained yet."""
    import random
    attack_name = random.choice(ATTACK_LABELS)
    confidence  = round(random.uniform(70, 98), 2)
    is_attack   = attack_name != "BENIGN"

    # Synthetic SHAP values
    from utils.preprocessing import FEATURE_COLUMNS
    features = FEATURE_COLUMNS[:10]
    shap_values = {f: round(float(np.random.uniform(-0.4, 0.4)), 4) for f in features}

    return {
        "prediction":   attack_name,
        "confidence":   confidence,
        "severity":     _get_severity(confidence, is_attack),
        "is_attack":    is_attack,
        "shap_values":  shap_values,
        "top_features": features[:3],
        "note":         "Model not trained yet — showing demo prediction. Use /api/train to train.",
    }
