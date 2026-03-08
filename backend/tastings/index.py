"""CRUD дегустаций v5"""
import json, os, traceback, psycopg2

SCHEMA = "t_p79477995_wine_tasting_app"
CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Session-Id"}

def get_conn(): return psycopg2.connect(os.environ["DATABASE_URL"])

def qone(conn, sql, p=()):
    cur = conn.cursor(); cur.execute(sql, p); r = cur.fetchone(); cur.close(); return r

def qall(conn, sql, p=()):
    cur = conn.cursor(); cur.execute(sql, p); r = cur.fetchall(); cur.close(); return r

def qrun(conn, sql, p=()):
    cur = conn.cursor(); cur.execute(sql, p); r = cur.fetchone() if cur.description else None; cur.close(); return r

def row2dict(row, likes=0, is_liked=False):
    return {"id": str(row[0]), "user_id": row[1], "name": row[2], "year": row[3] or "", "country": row[4] or "", "region": row[5] or "", "producer": row[6] or "", "style": row[7], "impression": row[8] or "", "date": row[9] or "", "photo": row[10] or "", "color": row[11] or "", "density": row[12] or "", "aromaIntensity": row[13] or 0, "primaryAromas": row[14] or "", "secondaryAromas": row[15] or "", "flavor": row[16] or "", "finish": row[17] or "", "rating": row[18], "notes": row[19] or "", "likes": likes, "is_liked": is_liked}

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
        user_id = None
        if session_id:
            r = qone(conn, f"SELECT user_id FROM {SCHEMA}.sessions WHERE id=%s", (session_id,))
            user_id = r[0] if r else None

        if method == "GET" and action == "list":
            owner = params.get("user_id")
            target = int(owner) if owner else user_id
            if not target:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
            rows = qall(conn, f"SELECT t.id,t.user_id,t.name,t.year,t.country,t.region,t.producer,t.style,t.impression,t.tasting_date,t.photo,t.color,t.density,t.aroma_intensity,t.primary_aromas,t.secondary_aromas,t.flavor,t.finish,t.rating,t.notes FROM {SCHEMA}.tastings t WHERE t.user_id=%s ORDER BY t.created_at DESC", (target,))
            result = []
            for row in rows:
                lk = qone(conn, f"SELECT COUNT(*) FROM {SCHEMA}.likes WHERE tasting_id=%s", (row[0],))
                liked = qone(conn, f"SELECT 1 FROM {SCHEMA}.likes WHERE tasting_id=%s AND user_id=%s", (row[0], user_id)) if user_id else None
                result.append(row2dict(row, lk[0] if lk else 0, liked is not None))
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(result)}

        if method == "POST" and action == "create":
            if not user_id: return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
            b = json.loads(event.get("body") or "{}")
            r = qrun(conn, f"INSERT INTO {SCHEMA}.tastings (user_id,name,year,country,region,producer,style,impression,tasting_date,photo,color,density,aroma_intensity,primary_aromas,secondary_aromas,flavor,finish,rating,notes) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id", (user_id, b.get("name",""), b.get("year",""), b.get("country",""), b.get("region",""), b.get("producer",""), b.get("style",""), b.get("impression",""), b.get("date",""), b.get("photo",""), b.get("color",""), b.get("density",""), b.get("aromaIntensity",0), b.get("primaryAromas",""), b.get("secondaryAromas",""), b.get("flavor",""), b.get("finish",""), b.get("rating",3), b.get("notes","")))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": str(r[0])})}

        if method == "POST" and action == "like":
            if not user_id: return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
            tid = int(params.get("tasting_id", 0))
            if not tid: return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите tasting_id"})}
            already = qone(conn, f"SELECT 1 FROM {SCHEMA}.likes WHERE user_id=%s AND tasting_id=%s", (user_id, tid))
            if already:
                qrun(conn, f"DELETE FROM {SCHEMA}.likes WHERE user_id=%s AND tasting_id=%s", (user_id, tid)); liked = False
            else:
                qrun(conn, f"INSERT INTO {SCHEMA}.likes (user_id,tasting_id) VALUES (%s,%s)", (user_id, tid)); liked = True
            conn.commit()
            cnt = qone(conn, f"SELECT COUNT(*) FROM {SCHEMA}.likes WHERE tasting_id=%s", (tid,))
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"liked": liked, "likes": cnt[0]})}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
    except Exception as e:
        print("TASTINGS ERROR:", traceback.format_exc())
        return {"statusCode": 500, "headers": CORS, "body": json.dumps({"error": str(e)})}
    finally:
        conn.close()
