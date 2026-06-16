"""
GET /api/traffic — Simulated live network traffic data
"""

import random
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request

traffic_bp = Blueprint("traffic", __name__)


def _rand_ip():
    prefix = random.choice(["192.168", "10.0", "172.16"])
    return f"{prefix}.{random.randint(0, 255)}.{random.randint(1, 254)}"


@traffic_bp.route("/traffic", methods=["GET"])
def get_traffic():
    """
    Return simulated network traffic metrics.
    In production, this would stream from a packet capture library
    (e.g. scapy or pyshark).
    """
    protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS"]
    n = int(request.args.get("n", 20))  # number of time buckets

    # Time-series data (last n intervals of 1 minute each)
    now = datetime.now()
    timeline = []
    for i in range(n):
        ts = (now - timedelta(minutes=n - i)).strftime("%H:%M")
        timeline.append({
            "t":         ts,
            "inbound":   random.randint(100, 700),
            "outbound":  random.randint(80, 400),
            "malicious": random.randint(5, 60),
        })

    # Protocol breakdown
    proto_data = [
        {"name": p, "packets": random.randint(200, 5000)}
        for p in protocols
    ]

    # Top talkers
    talkers = [
        {
            "rank":    i + 1,
            "src_ip":  _rand_ip(),
            "dst_ip":  _rand_ip(),
            "proto":   random.choice(protocols),
            "packets": random.randint(500, 8000),
            "bytes_mb": round(random.uniform(0.5, 12), 1),
            "risk":    random.choice(["HIGH", "HIGH", "MEDIUM", "LOW"]),
        }
        for i in range(6)
    ]

    return jsonify({
        "timeline":      timeline,
        "protocol_dist": proto_data,
        "top_talkers":   talkers,
        "throughput_gbps": round(random.uniform(1.2, 4.5), 1),
        "active_flows":  random.randint(800, 2500),
        "timestamp":     now.isoformat(),
    })
