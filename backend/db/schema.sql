-- create users table
CREATE TABLE IF NOT EXISTS users(
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- create notes table
CREATE TABLE IF NOT EXISTS notes(
    id              SERIAL PRIMARY KEY,   
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL DEFAULT '',
    is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);

-- the CREATE above is IF NOT EXISTS, so a database that already has a notes table
-- skips it entirely and would never pick up new columns. these migrate those.
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- soft delete. NULL means the note is live, a timestamp means it is in the trash
-- and is due to be purged 7 days after that moment
ALTER TABLE notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- both list queries filter user_id and deleted_at together, so one composite index
-- serves both. deleted_at on its own has poor selectivity since most rows are NULL
CREATE INDEX IF NOT EXISTS notes_user_deleted_idx ON notes(user_id, deleted_at);
