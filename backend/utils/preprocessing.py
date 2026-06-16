"""
Data preprocessing utilities for the CICIDS2017 dataset.
Cleans, encodes, and scales features for model training and inference.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import os

# ── Feature columns used for training ────────────────────────────────────────
FEATURE_COLUMNS = [
    "flow_duration", "total_fwd_packets", "total_bwd_packets",
    "total_length_fwd_packets", "total_length_bwd_packets",
    "fwd_packet_length_max", "fwd_packet_length_min", "fwd_packet_length_mean",
    "bwd_packet_length_max", "bwd_packet_length_min",
    "flow_bytes_s", "flow_packets_s",
    "flow_iat_mean", "flow_iat_std", "flow_iat_max", "flow_iat_min",
    "fwd_iat_total", "fwd_iat_mean", "fwd_iat_std", "fwd_iat_max", "fwd_iat_min",
    "bwd_iat_total", "bwd_iat_mean", "bwd_iat_std",
    "fwd_psh_flags", "fwd_urg_flags", "bwd_urg_flags",
    "fwd_header_length", "bwd_header_length",
    "fwd_packets_s", "bwd_packets_s",
    "min_packet_length", "max_packet_length", "packet_length_mean",
    "packet_length_std", "packet_length_variance",
    "fin_flag_count", "syn_flag_count", "rst_flag_count", "psh_flag_count",
    "ack_flag_count", "urg_flag_count", "ece_flag_count",
    "down_up_ratio", "average_packet_size", "avg_fwd_segment_size",
    "avg_bwd_segment_size", "fwd_header_length_2",
    "subflow_fwd_packets", "subflow_fwd_bytes", "subflow_bwd_packets",
    "subflow_bwd_bytes", "init_win_bytes_forward", "init_win_bytes_backward",
    "act_data_pkt_fwd", "min_seg_size_forward",
    "active_mean", "active_std", "active_max", "active_min",
    "idle_mean", "idle_std", "idle_max", "idle_min",
]

# Attack type labels
ATTACK_LABELS = [
    "BENIGN", "DDoS", "Port Scan", "Brute Force",
    "SQL Injection", "Botnet", "DNS Tunneling", "FTP Patator", "SSH Patator"
]

label_encoder = LabelEncoder()
label_encoder.fit(ATTACK_LABELS)


def load_dataset(csv_path: str) -> pd.DataFrame:
    """Load and clean the CICIDS2017 dataset from a CSV file."""
    print(f"[Preprocessing] Loading dataset: {csv_path}")
    df = pd.read_csv(csv_path)

    # Normalize column names: strip whitespace and lowercase
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("/", "_")
        .str.replace("-", "_")
    )

    # Drop rows with inf or NaN values
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    print(f"[Preprocessing] Loaded {len(df)} clean rows, {df.shape[1]} columns")
    return df


def prepare_features(df: pd.DataFrame, scaler: StandardScaler = None):
    """
    Extract feature matrix X and encode labels y.

    Returns:
        X (ndarray): Scaled feature matrix
        y (ndarray): Encoded label vector
        scaler (StandardScaler): Fitted scaler (reuse for inference)
    """
    # Identify available feature columns
    available = [c for c in FEATURE_COLUMNS if c in df.columns]
    if not available:
        raise ValueError("No matching feature columns found in dataset. "
                         "Make sure you are using the CICIDS2017 dataset.")

    X = df[available].values.astype(np.float32)

    # Fit or apply scaler
    if scaler is None:
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
    else:
        X = scaler.transform(X)

    # Encode labels if present
    y = None
    label_col = next((c for c in df.columns if "label" in c), None)
    if label_col:
        raw_labels = df[label_col].astype(str).str.strip()
        # Map unknown labels to BENIGN
        safe_labels = [l if l in ATTACK_LABELS else "BENIGN" for l in raw_labels]
        y = label_encoder.transform(safe_labels)

    return X, y, scaler, available


def build_inference_row(form_data: dict) -> np.ndarray:
    """
    Convert a manual scan form submission into a feature vector
    compatible with the trained model.

    Only a subset of features is available from the form; the rest are zero-filled.
    """
    row = np.zeros(len(FEATURE_COLUMNS), dtype=np.float32)

    mapping = {
        "packet_size":     FEATURE_COLUMNS.index("max_packet_length") if "max_packet_length" in FEATURE_COLUMNS else -1,
        "flow_duration":   FEATURE_COLUMNS.index("flow_duration") if "flow_duration" in FEATURE_COLUMNS else -1,
        "byte_rate":       FEATURE_COLUMNS.index("flow_bytes_s") if "flow_bytes_s" in FEATURE_COLUMNS else -1,
        "packet_rate":     FEATURE_COLUMNS.index("flow_packets_s") if "flow_packets_s" in FEATURE_COLUMNS else -1,
    }

    flag_map = {"SYN": 1, "SYN-ACK": 1, "ACK": 1, "FIN": 1, "RST": 1, "PSH": 1, "URG": 1}

    for key, idx in mapping.items():
        if idx >= 0 and key in form_data:
            try:
                row[idx] = float(form_data[key])
            except (ValueError, TypeError):
                pass

    # Encode flags
    flags = str(form_data.get("flags", "")).upper()
    if "SYN" in flags and "syn_flag_count" in FEATURE_COLUMNS:
        row[FEATURE_COLUMNS.index("syn_flag_count")] = 1.0
    if "ACK" in flags and "ack_flag_count" in FEATURE_COLUMNS:
        row[FEATURE_COLUMNS.index("ack_flag_count")] = 1.0

    return row.reshape(1, -1)
