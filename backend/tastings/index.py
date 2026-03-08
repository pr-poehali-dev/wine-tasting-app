"""
CRUD дегустаций: получение, создание, лайки.
Роутинг через ?action=list|create|like&tasting_id=N
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


def tasting_row_to_dict(row, likes_count=0, is_liked=False):
    return {
        "id": str(row[0]),
        "user_id": row[1],
        "name": row[2],
        "year": row[3],
        "country": row[4],
        "region": row[5] or "",
        "producer": row[6] or "",
        "style": row[7],
        "impression": row[8] or "",
        "date": row[9] or "",
        "photo": row[10] or "",
        "color": row[11] or "",
        "density": row[12] or "",
        "aromaIntensity": row[13] or 0,
        "primaryAromas": row[14] or "",
        "secondaryAromas": row[15] or "",
        "flavor": row[16] or "",
        "finish": row[17] or "",
        "rating": row[18],
        "notes": row[19] or "",
        "likes": likes_count,
        "is_liked": is_liked,
    }


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

        # GET ?action=list[&user_id=N]
        if method == "GET" and action == "list":
            owner_id = params.get("user_id")
            if owner_id:
                cur.execute(
                    f"SELECT t.id, t.user_id, t.name, t.year, t.country, t.region, t.producer, t.style, "
                    f"t.impression, t.tasting_date, t.photo, t.color, t.density, t.aroma_intensity, "
                    f"t.primary_aromas, t.secondary_aromas, t.flavor, t.finish, t.rating, t.notes "
                    f"FROM {SCHEMA}.tastings t WHERE t.user_id=%s ORDER BY t.created_at DESC",
                    (int(owner_id),)
                )
            else:
                if not user_id:
                    return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
                cur.execute(
                    f"SELECT t.id, t.user_id, t.name, t.year, t.country, t.region, t.producer, t.style, "
                    f"t.impression, t.tasting_date, t.photo, t.color, t.density, t.aroma_intensity, "
                    f"t.primary_aromas, t.secondary_aromas, t.flavor, t.finish, t.rating, t.notes "
                    f"FROM {SCHEMA}.tastings t WHERE t.user_id=%s ORDER BY t.created_at DESC",
                    (user_id,)
                )

            rows = cur.fetchall()
            result = []
            for row in rows:
                tasting_id = row[0]
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.likes WHERE tasting_id=%s", (tasting_id,))
                likes_count = cur.fetchone()[0]
                is_liked = False
                if user_id:
                    cur.execute(f"SELECT 1 FROM {SCHEMA}.likes WHERE tasting_id=%s AND user_id=%s", (tasting_id, user_id))
                    is_liked = cur.fetchone() is not None
                result.append(tasting_row_to_dict(row, likes_count, is_liked))

            return {"statusCode": 200, "headers": CORS, "body": json.dumps(result)}

        # POST ?action=create
        if method == "POST" and action == "create":
            if not user_id:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

            body = json.loads(event.get("body") or "{}")
            cur.execute(
                f"INSERT INTO {SCHEMA}.tastings "
                f"(user_id, name, year, country, region, producer, style, impression, tasting_date, "
                f"photo, color, density, aroma_intensity, primary_aromas, secondary_aromas, flavor, finish, rating, notes) "
                f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (
                    user_id,
                    body.get("name", ""),
                    body.get("year", ""),
                    body.get("country", ""),
                    body.get("region", ""),
                    body.get("producer", ""),
                    body.get("style", ""),
                    body.get("impression", ""),
                    body.get("date", ""),
                    body.get("photo", ""),
                    body.get("color", ""),
                    body.get("density", ""),
                    body.get("aromaIntensity", 0),
                    body.get("primaryAromas", ""),
                    body.get("secondaryAromas", ""),
                    body.get("flavor", ""),
                    body.get("finish", ""),
                    body.get("rating", 3),
                    body.get("notes", ""),
                )
            )
            new_id = cur.fetchone()[0]
            conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": str(new_id)})}

        # POST ?action=like&tasting_id=N
        if method == "POST" and action == "like":
            if not user_id:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

            tasting_id = int(params.get("tasting_id", 0))
            if not tasting_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите tasting_id"})}

            cur.execute(f"SELECT 1 FROM {SCHEMA}.likes WHERE user_id=%s AND tasting_id=%s", (user_id, tasting_id))
            if cur.fetchone():
                cur.execute(f"DELETE FROM {SCHEMA}.likes WHERE user_id=%s AND tasting_id=%s", (user_id, tasting_id))
                liked = False
            else:
                cur.execute(f"INSERT INTO {SCHEMA}.likes (user_id, tasting_id) VALUES (%s,%s)", (user_id, tasting_id))
                liked = True
            conn.commit()

            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.likes WHERE tasting_id=%s", (tasting_id,))
            count = cur.fetchone()[0]

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"liked": liked, "likes": count})}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}

    finally:
        cur.close()
        conn.close()
