"""
Database utilities — SQLite via Python's built-in sqlite3.
No extra dependencies required.
"""

import sqlite3
import random
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "xai_ids.db")


def get_conn():
    """Return a SQLite connection with row_factory for dict-like rows."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables and seed demo data if the database is new."""
    conn = get_conn()
    c = conn.cursor()

    # ── Alerts table ────────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            attack_type   TEXT    NOT NULL,
            source_ip     TEXT    NOT NULL,
            destination_ip TEXT   NOT NULL,
            severity      TEXT    NOT NULL,
            confidence    REAL    NOT NULL,
            protocol      TEXT    NOT NULL,
            port          INTEGER NOT NULL,
            status        TEXT    DEFAULT 'DETECTED',
            shap_json     TEXT,
            timestamp     TEXT    NOT NULL
        )
    """)

    # ── Reports table ────────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            title           TEXT  NOT NULL,
            generated_at    TEXT  NOT NULL,
            total_alerts    INTEGER,
            critical_count  INTEGER,
            blocked_count   INTEGER,
            model_accuracy  REAL,
            top_attack      TEXT
        )
    """)

    # ── Seed data if tables are empty ────────────────────────────────────────
    count = c.execute("SELECT COUNT(*) FROM alerts").fetchone()[0]
    if count == 0:
        _seed_alerts(c)
        _seed_reports(c)

    conn.commit()
    conn.close()
    print("[DB] Database initialised:", DB_PATH)


def _rand_ip():
    prefix = random.choice(["192.168", "10.0", "172.16"])
    return f"{prefix}.{random.randint(0, 255)}.{random.randint(1, 254)}"


def _seed_alerts(c):
    """Insert 50 realistic demo alerts."""
    types = ["DDoS", "Port Scan", "Brute Force", "SQL Injection",
             "Botnet", "DNS Tunneling", "FTP Patator", "SSH Patator"]
    severities = ["CRITICAL", "HIGH", "HIGH", "MEDIUM", "MEDIUM", "LOW"]
    protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS"]

    now = datetime.now()
    rows = []
    for i in range(50):
        ts = (now - timedelta(hours=random.randint(0, 72))).isoformat()
        rows.append((
            random.choice(types),
            _rand_ip(),
            _rand_ip(),
            random.choice(severities),
            round(random.uniform(70, 99), 2),
            random.choice(protocols),
            random.randint(1, 65535),
            "DETECTED",
            None,
            ts,
        ))

    c.executemany("""
        INSERT INTO alerts
          (attack_type, source_ip, destination_ip, severity, confidence,
           protocol, port, status, shap_json, timestamp)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    """, rows)
    print("[DB] Seeded 50 demo alerts")


def _seed_reports(c):
    """Insert 3 demo reports."""
    types = ["Weekly Summary", "Incident Report", "Traffic Analysis"]
    now = datetime.now()
    for i, title in enumerate(types):
        c.execute("""
            INSERT INTO reports
              (title, generated_at, total_alerts, critical_count,
               blocked_count, model_accuracy, top_attack)
            VALUES (?,?,?,?,?,?,?)
        """, (
            title,
            (now - timedelta(days=i * 3)).isoformat(),
            random.randint(100, 600),
            random.randint(5, 30),
            random.randint(80, 500),
            round(random.uniform(95, 99), 2),
            random.choice(["DDoS", "Port Scan", "Brute Force"]),
        ))
    print("[DB] Seeded 3 demo reports")
