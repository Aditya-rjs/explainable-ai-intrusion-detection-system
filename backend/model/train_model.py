"""
Model training script for XAI-IDS.
Supports XGBoost and Random Forest classifiers.

Usage (standalone):
    python -m model.train_model --model xgboost --dataset dataset/sample_data.csv

Or call train_model() from Flask routes.
"""

import os
import pickle
import time
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("[Model] XGBoost not installed — will use RandomForest only")

from utils.preprocessing import (
    load_dataset, prepare_features, ATTACK_LABELS, label_encoder
)

MODEL_DIR  = os.path.join(os.path.dirname(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "features.pkl")


def train_model(
    dataset_path: str = None,
    model_type: str = "xgboost",
    max_depth: int = 6,
    n_estimators: int = 200,
    test_size: float = 0.2,
    random_state: int = 42,
) -> dict:
    """
    Train the intrusion detection model.

    Args:
        dataset_path: Path to the CICIDS2017 CSV file.
                      If None, generates synthetic training data.
        model_type:   'xgboost' or 'random_forest'
        max_depth:    Max tree depth (XGBoost / RF)
        n_estimators: Number of trees (RF / XGBoost rounds)
        test_size:    Fraction of data held out for evaluation
        random_state: Random seed for reproducibility

    Returns:
        dict with accuracy, precision, recall, f1_score, training_time, etc.
    """
    start = time.time()
    print(f"[Model] Starting training — model={model_type}")

    # ── Load or generate data ─────────────────────────────────────────────────
    if dataset_path and os.path.exists(dataset_path):
        df = load_dataset(dataset_path)
        X, y, scaler, feature_names = prepare_features(df)
        print(f"[Model] Loaded real dataset: {X.shape[0]} samples, {X.shape[1]} features")
    else:
        print("[Model] No dataset found — generating synthetic data for demo")
        X, y, scaler, feature_names = _generate_synthetic_data(n_samples=5000)

    # ── Train / test split ────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # ── Build model ───────────────────────────────────────────────────────────
    n_classes = len(np.unique(y))

    if model_type == "xgboost" and XGBOOST_AVAILABLE:
        model = xgb.XGBClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            use_label_encoder=False,
            eval_metric="mlogloss",
            random_state=random_state,
            n_jobs=-1,
            num_class=n_classes if n_classes > 2 else None,
        )
    else:
        model_type = "random_forest"
        model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=random_state,
            n_jobs=-1,
        )

    print(f"[Model] Training {model_type} on {len(X_train)} samples...")
    model.fit(X_train, y_train)

    # ── Evaluate ──────────────────────────────────────────────────────────────
    y_pred = model.predict(X_test)

    acc  = round(accuracy_score(y_test, y_pred) * 100, 2)
    prec = round(precision_score(y_test, y_pred, average="weighted", zero_division=0) * 100, 2)
    rec  = round(recall_score(y_test, y_pred, average="weighted", zero_division=0) * 100, 2)
    f1   = round(f1_score(y_test, y_pred, average="weighted", zero_division=0) * 100, 2)

    elapsed = round(time.time() - start, 1)

    print(f"[Model] Accuracy={acc}%  Precision={prec}%  Recall={rec}%  F1={f1}%")
    print(f"[Model] Training completed in {elapsed}s")

    # ── Save artifacts ────────────────────────────────────────────────────────
    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(MODEL_PATH,    "wb") as f: pickle.dump(model,        f)
    with open(SCALER_PATH,   "wb") as f: pickle.dump(scaler,       f)
    with open(FEATURES_PATH, "wb") as f: pickle.dump(feature_names, f)
    print(f"[Model] Saved to {MODEL_DIR}")

    return {
        "status": "success",
        "model_type": model_type,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "training_time": f"{elapsed}s",
        "samples_trained": len(X_train),
        "samples_tested": len(X_test),
        "n_classes": n_classes,
        "feature_count": len(feature_names),
    }


def load_model():
    """
    Load a previously trained model, scaler, and feature list.
    Returns (model, scaler, feature_names) or (None, None, None) if not found.
    """
    if not os.path.exists(MODEL_PATH):
        return None, None, None

    with open(MODEL_PATH,    "rb") as f: model         = pickle.load(f)
    with open(SCALER_PATH,   "rb") as f: scaler        = pickle.load(f)
    with open(FEATURES_PATH, "rb") as f: feature_names = pickle.load(f)

    return model, scaler, feature_names


def _generate_synthetic_data(n_samples: int = 5000):
    """
    Generate synthetic labelled network traffic data for demo purposes.
    Produces realistic-ish feature distributions for each attack class.
    """
    from utils.preprocessing import FEATURE_COLUMNS, label_encoder
    from sklearn.preprocessing import StandardScaler

    n_features = len(FEATURE_COLUMNS)
    n_classes  = len(ATTACK_LABELS)
    samples_per_class = n_samples // n_classes

    X_parts, y_parts = [], []
    for cls_idx, label in enumerate(ATTACK_LABELS):
        # Different distributions per class to help the model discriminate
        mean  = np.random.uniform(0.2, 0.8, n_features) * (cls_idx + 1)
        scale = np.random.uniform(0.1, 0.5, n_features)
        chunk = np.random.normal(mean, scale, (samples_per_class, n_features)).astype(np.float32)
        chunk = np.clip(chunk, 0, None)
        X_parts.append(chunk)
        y_parts.append(np.full(samples_per_class, cls_idx, dtype=np.int64))

    X = np.vstack(X_parts)
    y = np.concatenate(y_parts)

    # Shuffle
    idx = np.random.permutation(len(X))
    X, y = X[idx], y[idx]

    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    return X, y, scaler, FEATURE_COLUMNS
