# /backend/app/chat_state.py
"""
Async SQLite-backed session store for Windows (no Docker needed).
Stores chat sessions in session_store.db file.
"""

import os
import json
import aiosqlite
from typing import Any, Dict

DB_PATH = os.getenv("SESSION_DB_PATH", "session_store.db")

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    data TEXT NOT NULL
);
"""

async def _get_db():
    db = await aiosqlite.connect(DB_PATH)
    await db.execute("PRAGMA journal_mode=WAL;")  # enables concurrency
    await db.execute(CREATE_TABLE_SQL)
    await db.commit()
    return db

async def get_session_data(session_id: str) -> Dict[str, Any]:
    db = await _get_db()
    try:
        async with db.execute("SELECT data FROM sessions WHERE session_id = ?", (session_id,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                return {}
            try:
                return json.loads(row[0])
            except Exception:
                return {}
    finally:
        await db.close()

async def update_session_data(session_id: str, updates: Dict[str, Any]) -> None:
    db = await _get_db()
    try:
        async with db.execute("SELECT data FROM sessions WHERE session_id = ?", (session_id,)) as cursor:
            row = await cursor.fetchone()
            current = json.loads(row[0]) if row else {}

        current.update(updates)
        data_str = json.dumps(current)

        await db.execute(
            """
            INSERT INTO sessions (session_id, data)
            VALUES (?, ?)
            ON CONFLICT(session_id)
            DO UPDATE SET data=excluded.data;
            """,
            (session_id, data_str),
        )
        await db.commit()
    finally:
        await db.close()
