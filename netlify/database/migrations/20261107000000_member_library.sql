-- 회원의 찜 목록과 이어 보기 위치입니다. 작품이 지워지면 함께 지웁니다.
CREATE TABLE watchlist (
  user_id TEXT NOT NULL,
  movie_id TEXT NOT NULL REFERENCES movies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);

CREATE TABLE watch_progress (
  user_id TEXT NOT NULL,
  movie_id TEXT NOT NULL REFERENCES movies (id) ON DELETE CASCADE,
  position_seconds INTEGER NOT NULL CHECK (position_seconds > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);
CREATE INDEX watch_progress_recent_idx ON watch_progress (user_id, updated_at DESC);
