
CREATE TABLE IF NOT EXISTS t_p79477995_wine_tasting_app.users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p79477995_wine_tasting_app.sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p79477995_wine_tasting_app.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p79477995_wine_tasting_app.tastings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p79477995_wine_tasting_app.users(id),
  name TEXT NOT NULL,
  year TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT DEFAULT '',
  producer TEXT DEFAULT '',
  style TEXT NOT NULL,
  impression TEXT DEFAULT '',
  tasting_date TEXT NOT NULL,
  photo TEXT DEFAULT '',
  color TEXT DEFAULT '',
  density TEXT DEFAULT '',
  aroma_intensity INTEGER DEFAULT 0,
  primary_aromas TEXT DEFAULT '',
  secondary_aromas TEXT DEFAULT '',
  flavor TEXT DEFAULT '',
  finish TEXT DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 3,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p79477995_wine_tasting_app.likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p79477995_wine_tasting_app.users(id),
  tasting_id INTEGER NOT NULL REFERENCES t_p79477995_wine_tasting_app.tastings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tasting_id)
);

CREATE TABLE IF NOT EXISTS t_p79477995_wine_tasting_app.friendships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p79477995_wine_tasting_app.users(id),
  friend_id INTEGER NOT NULL REFERENCES t_p79477995_wine_tasting_app.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);
