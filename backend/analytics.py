"""
Analytics — logs every query to SQLite for admin review.
"""

import sqlite3
import json
import os

DB_PATH = os.getenv("ANALYTICS_DB", "/app/data/analytics.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS queries (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            question    TEXT    NOT NULL,
            answer      TEXT    NOT NULL,
            duration_ms INTEGER,
            sources     TEXT,
            created_at  TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()


def log_query(question: str, answer: str, duration_ms: int, sources: list):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO queries (question, answer, duration_ms, sources) VALUES (?, ?, ?, ?)",
        (question, answer, duration_ms, json.dumps(sources)),
    )
    conn.commit()
    conn.close()


def get_stats():
    conn = sqlite3.connect(DB_PATH)
    total = conn.execute("SELECT COUNT(*) FROM queries").fetchone()[0]
    avg_ms = conn.execute("SELECT AVG(duration_ms) FROM queries").fetchone()[0]
    recent = conn.execute(
        "SELECT question, created_at FROM queries ORDER BY id DESC LIMIT 20"
    ).fetchall()
    conn.close()

    return {
        "total_queries": total,
        "avg_response_ms": round(avg_ms or 0),
        "recent": [{"question": r[0], "asked_at": r[1]} for r in recent],
    }
