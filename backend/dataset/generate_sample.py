"""
generate_sample.py — Generate a sample CICIDS2017-style CSV dataset.

Run:   python generate_sample.py
Output: sample_data.csv (2000 rows)

This is for demo/testing only.
For the real dataset visit: https://www.unb.ca/cic/datasets/ids-2017.html
"""

import csv
import random
import os

ATTACK_LABELS = [
    "BENIGN", "DDoS", "Port Scan", "Brute Force",
    "SQL Injection", "Botnet", "DNS Tunneling", "FTP Patator", "SSH Patator"
]

COLUMNS = [
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
    "label",
]

# Attack-specific feature profiles (mean, std) for realism
ATTACK_PROFILES = {
    "BENIGN":        (0.3, 0.2),
    "DDoS":          (0.9, 0.1),
    "Port Scan":     (0.7, 0.2),
    "Brute Force":   (0.6, 0.2),
    "SQL Injection": (0.5, 0.3),
    "Botnet":        (0.4, 0.2),
    "DNS Tunneling": (0.5, 0.2),
    "FTP Patator":   (0.6, 0.15),
    "SSH Patator":   (0.65, 0.15),
}

def generate_row(label):
    mean, std = ATTACK_PROFILES.get(label, (0.5, 0.2))
    n_feat = len(COLUMNS) - 1  # exclude label column
    values = [max(0.0, random.gauss(mean * 10000, std * 10000)) for _ in range(n_feat)]
    values = [f"{v:.4f}" for v in values]
    return values + [label]

if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(__file__), "sample_data.csv")
    n_samples = 2000
    samples_per_class = n_samples // len(ATTACK_LABELS)

    with open(out_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(COLUMNS)
        for label in ATTACK_LABELS:
            for _ in range(samples_per_class):
                writer.writerow(generate_row(label))

    print(f"Generated {n_samples} rows -> {out_path}")
