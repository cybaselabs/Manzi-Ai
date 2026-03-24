"""
Analytics — logs every query to a local SQLite database.
"""
import sqlite3
import os
from datetime import datetime

DB_PATH = os.getenv("ANALYTICS_DB_PATH", "./analytics.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS queries (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                question    TEXT    NOT NULL,
                answer_len  INTEGER,
                duration_ms INTEGER,
                sources     TEXT,
                created_at  TEXT    NOT NULL
            )
        """)
        conn.commit()


def log_query(question: str, answer: str, duration_ms: int, sources: list):
    source_labels = ", ".join(s["label"] for s in sources) if sources else ""
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO queries (question, answer_len, duration_ms, sources, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (question, len(answer), duration_ms, source_labels, datetime.utcnow().isoformat()),
        )
        conn.commit()


def get_stats():
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) FROM queries").fetchone()[0]
        avg_ms = conn.execute("SELECT AVG(duration_ms) FROM queries").fetchone()[0]
        recent = conn.execute(
            "SELECT question, created_at FROM queries ORDER BY id DESC LIMIT 20"
        ).fetchall()
        return {
            "total_queries": total,
            "avg_response_ms": round(avg_ms or 0),
            "recent": [{"question": r["question"], "asked_at": r["created_at"]} for r in recent],
        }
