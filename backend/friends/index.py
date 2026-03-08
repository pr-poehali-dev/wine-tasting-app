"""
Друзья: поиск, добавление/удаление, список с дегустациями.
Роутинг через ?action=list|search|add|remove
"""
import json
import os
import psycopg2

SCHEMA = "t_p79477995_wine_tasting_app"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_id(cur, session_id: str):
    cur.execute(f"SELECT user_id FROM {SCHEMA}.sessions WHERE id=%s", (session_id,))
    row = cur.fetchone()
    return row[0] if row else None


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
        user_id = get_user_id(cur, session_id) if session_id else None

        if not user_id:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

        # GET ?action=list
        if method == "GET" and action == "list":
            cur.execute(
                f"SELECT u.id, u.nickname, u.bio, u.avatar FROM {SCHEMA}.users u "
                f"JOIN {SCHEMA}.friendships f ON f.friend_id = u.id "
                f"WHERE f.user_id = %s ORDER BY f.created_at DESC",
                (user_id,)
            )
            friends = []
            for row in cur.fetchall():
                fid, nickname, bio, avatar = row
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.tastings WHERE user_id=%s", (fid,))
                count = cur.fetchone()[0]
                cur.execute(f"SELECT AVG(rating) FROM {SCHEMA}.tastings WHERE user_id=%s", (fid,))
                avg = cur.fetchone()[0]
                cur.execute(
                    f"SELECT t.id, t.name, t.year, t.country, t.region, t.style, t.tasting_date, t.rating, t.photo, "
                    f"t.color, t.density, t.aroma_intensity, t.primary_aromas, t.impression "
                    f"FROM {SCHEMA}.tastings t WHERE t.user_id=%s ORDER BY t.created_at DESC LIMIT 5",
                    (fid,)
                )
                tastings = []
                for tr in cur.fetchall():
                    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.likes WHERE tasting_id=%s", (tr[0],))
                    likes = cur.fetchone()[0]
                    tastings.append({
                        "id": str(tr[0]),
                        "name": tr[1],
                        "year": tr[2] or "",
                        "country": tr[3] or "",
                        "region": tr[4] or "",
                        "style": tr[5],
                        "date": tr[6] or "",
                        "rating": tr[7],
                        "photo": tr[8] or "",
                        "color": tr[9] or "",
                        "density": tr[10] or "",
                        "aromaIntensity": tr[11] or 0,
                        "primaryAromas": tr[12] or "",
                        "impression": tr[13] or "",
                        "likes": likes,
                    })
                friends.append({
                    "id": str(fid),
                    "nickname": nickname,
                    "bio": bio or "",
                    "avatar": avatar or "",
                    "tastingsCount": count,
                    "avgRating": round(float(avg), 1) if avg else 0,
                    "tastings": tastings,
                })
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(friends)}

        # GET ?action=search&nickname=...
        if method == "GET" and action == "search":
            nickname = params.get("nickname", "").strip()
            if not nickname:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите никнейм"})}

            cur.execute(
                f"SELECT id, nickname, bio, avatar FROM {SCHEMA}.users "
                f"WHERE nickname ILIKE %s AND id != %s LIMIT 10",
                (f"%{nickname}%", user_id)
            )
            results = []
            for row in cur.fetchall():
                fid, nick, bio, avatar = row
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.tastings WHERE user_id=%s", (fid,))
                count = cur.fetchone()[0]
                cur.execute(f"SELECT 1 FROM {SCHEMA}.friendships WHERE user_id=%s AND friend_id=%s", (user_id, fid))
                is_friend = cur.fetchone() is not None
                results.append({
                    "id": str(fid),
                    "nickname": nick,
                    "bio": bio or "",
                    "avatar": avatar or "",
                    "tastingsCount": count,
                    "is_friend": is_friend,
                })
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(results)}

        # POST ?action=add
        if method == "POST" and action == "add":
            body = json.loads(event.get("body") or "{}")
            friend_id = int(body.get("friend_id", 0))
            if not friend_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите friend_id"})}

            cur.execute(
                f"INSERT INTO {SCHEMA}.friendships (user_id, friend_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (user_id, friend_id)
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        # POST ?action=remove
        if method == "POST" and action == "remove":
            body = json.loads(event.get("body") or "{}")
            friend_id = int(body.get("friend_id", 0))
            cur.execute(
                f"UPDATE {SCHEMA}.friendships SET created_at=created_at WHERE user_id=%s AND friend_id=%s AND FALSE",
                (user_id, friend_id)
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}

    finally:
        cur.close()
        conn.close()
