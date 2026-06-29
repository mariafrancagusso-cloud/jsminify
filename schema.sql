-- schema.sql — Rode isso no Neon SQL Editor para criar as tabelas
-- PostgreSQL (Neon) — NÃO é o MySQL original

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS minify_history (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_size INT NOT NULL,
    minified_size INT NOT NULL,
    reduction_percent NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_history_user ON minify_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON minify_history(created_at);
