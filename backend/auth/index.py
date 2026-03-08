"""
Аутентификация: регистрация, вход, выход, получение текущего пользователя.
Роутинг через query-параметр ?action=register|login|me|profile
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = "t_p79477995_wine_tasting_app"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers", {}) or {}
    session_id = headers.get("x-session-id") or headers.get("X-Session-Id", "")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # POST ?action=register
        if method == "POST" and action == "register":
            body = json.loads(event.get("body") or "{}")
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            nickname = body.get("nickname", "").strip()

            if not email or not password or not nickname:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email=%s OR nickname=%s", (email, nickname))
            if cur.fetchone():
                return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Email или никнейм уже занят"})}

            pw_hash = hash_password(password)
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (email, password_hash, nickname) VALUES (%s, %s, %s) RETURNING id",
                (email, pw_hash, nickname)
            )
            user_id = cur.fetchone()[0]

            token = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (id, user_id) VALUES (%s, %s)", (token, user_id))
            conn.commit()

            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({"session_id": token, "user_id": user_id, "nickname": nickname})
            }

        # POST ?action=login
        if method == "POST" and action == "login":
            body = json.loads(event.get("body") or "{}")
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")

            pw_hash = hash_password(password)
            cur.execute(
                f"SELECT id, nickname, bio, avatar FROM {SCHEMA}.users WHERE email=%s AND password_hash=%s",
                (email, pw_hash)
            )
            row = cur.fetchone()
            if not row:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

            user_id, nickname, bio, avatar = row
            token = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (id, user_id) VALUES (%s, %s)", (token, user_id))
            conn.commit()

            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({"session_id": token, "user_id": user_id, "nickname": nickname, "bio": bio or "", "avatar": avatar or ""})
            }

        # GET ?action=me
        if method == "GET" and action == "me":
            if not session_id:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

            cur.execute(
                f"SELECT u.id, u.nickname, u.bio, u.avatar FROM {SCHEMA}.users u "
                f"JOIN {SCHEMA}.sessions s ON s.user_id = u.id WHERE s.id=%s",
                (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия не найдена"})}

            user_id, nickname, bio, avatar = row
            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({"user_id": user_id, "nickname": nickname, "bio": bio or "", "avatar": avatar or ""})
            }

        # PUT ?action=profile
        if method == "PUT" and action == "profile":
            if not session_id:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

            cur.execute(f"SELECT user_id FROM {SCHEMA}.sessions WHERE id=%s", (session_id,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия не найдена"})}

            user_id = row[0]
            body = json.loads(event.get("body") or "{}")
            nickname = body.get("nickname", "").strip()
            bio = body.get("bio", "")
            avatar = body.get("avatar", "")

            cur.execute(
                f"UPDATE {SCHEMA}.users SET nickname=%s, bio=%s, avatar=%s WHERE id=%s",
                (nickname, bio, avatar, user_id)
            )
            conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}

    finally:
        cur.close()
        conn.close()
