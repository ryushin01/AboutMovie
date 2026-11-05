CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  genre TEXT NOT NULL,
  poster TEXT NOT NULL,
  body JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reviews_created_at_idx ON reviews (created_at DESC);
