"""Друзья v5"""
import json, os, traceback, psycopg2

SCHEMA = "t_p79477995_wine_tasting_app"
CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Session-Id"}

def get_conn(): return psycopg2.connect(os.environ["DATABASE_URL"])

def qone(conn, sql, p=()):
    cur = conn.cursor(); cur.execute(sql, p); r = cur.fetchone(); cur.close(); return r

def qall(conn, sql, p=()):
    cur = conn.cursor(); cur.execute(sql, p); r = cur.fetchall(); cur.close(); return r

def qrun(conn, sql, p=()):
    cur = conn.cursor(); cur.execute(sql, p); cur.close()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}
    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    session_id = headers.get("x-session-id") or headers.get("X-Session-Id", "")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    conn = get_conn()
    try:
        r = qone(conn, f"SELECT user_id FROM {SCHEMA}.sessions WHERE id=%s", (session_id,))
        user_id = r[0] if r else None
        if not user_id:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

        if method == "GET" and action == "list":
            friend_rows = qall(conn, f"SELECT u.id,u.nickname,u.bio,u.avatar FROM {SCHEMA}.users u JOIN {SCHEMA}.friendships f ON f.friend_id=u.id WHERE f.user_id=%s ORDER BY f.created_at DESC", (user_id,))
            friends = []
            for fid, nickname, bio, avatar in friend_rows:
                cnt = qone(conn, f"SELECT COUNT(*),AVG(rating) FROM {SCHEMA}.tastings WHERE user_id=%s", (fid,))
                t_rows = qall(conn, f"SELECT t.id,t.name,t.year,t.country,t.region,t.style,t.tasting_date,t.rating,t.photo,t.color,t.density,t.aroma_intensity,t.primary_aromas,t.impression FROM {SCHEMA}.tastings t WHERE t.user_id=%s ORDER BY t.created_at DESC LIMIT 5", (fid,))
                tastings = []
                for tr in t_rows:
                    lk = qone(conn, f"SELECT COUNT(*) FROM {SCHEMA}.likes WHERE tasting_id=%s", (tr[0],))
                    tastings.append({"id": str(tr[0]), "name": tr[1], "year": tr[2] or "", "country": tr[3] or "", "region": tr[4] or "", "style": tr[5], "date": tr[6] or "", "rating": tr[7], "photo": tr[8] or "", "color": tr[9] or "", "density": tr[10] or "", "aromaIntensity": tr[11] or 0, "primaryAromas": tr[12] or "", "impression": tr[13] or "", "likes": lk[0] if lk else 0})
                friends.append({"id": str(fid), "nickname": nickname, "bio": bio or "", "avatar": avatar or "", "tastingsCount": cnt[0], "avgRating": round(float(cnt[1]),1) if cnt[1] else 0, "tastings": tastings})
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(friends)}

        if method == "GET" and action == "search":
            nick = params.get("nickname", "").strip()
            if not nick: return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите никнейм"})}
            rows = qall(conn, f"SELECT id,nickname,bio,avatar FROM {SCHEMA}.users WHERE nickname ILIKE %s AND id!=%s LIMIT 10", (f"%{nick}%", user_id))
            results = []
            for fid, n, bio, avatar in rows:
                cnt = qone(conn, f"SELECT COUNT(*) FROM {SCHEMA}.tastings WHERE user_id=%s", (fid,))
                isf = qone(conn, f"SELECT 1 FROM {SCHEMA}.friendships WHERE user_id=%s AND friend_id=%s", (user_id, fid))
                results.append({"id": str(fid), "nickname": n, "bio": bio or "", "avatar": avatar or "", "tastingsCount": cnt[0], "is_friend": isf is not None})
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(results)}

        if method == "POST" and action == "add":
            b = json.loads(event.get("body") or "{}"); fid = int(b.get("friend_id", 0))
            if not fid: return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите friend_id"})}
            qrun(conn, f"INSERT INTO {SCHEMA}.friendships (user_id,friend_id) VALUES (%s,%s) ON CONFLICT DO NOTHING", (user_id, fid))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        if method == "POST" and action == "remove":
            b = json.loads(event.get("body") or "{}"); fid = int(b.get("friend_id", 0))
            qrun(conn, f"UPDATE {SCHEMA}.friendships SET created_at=created_at WHERE user_id=%s AND friend_id=%s AND FALSE", (user_id, fid))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
    except Exception as e:
        print("FRIENDS ERROR:", traceback.format_exc())
        return {"statusCode": 500, "headers": CORS, "body": json.dumps({"error": str(e)})}
    finally:
        conn.close()
