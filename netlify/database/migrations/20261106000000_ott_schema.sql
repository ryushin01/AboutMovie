-- 평론가 리뷰 사이트에서 영화 전문 OTT로 바꿉니다.
DROP TABLE reviews;

CREATE TABLE movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_title TEXT NOT NULL,
  year INTEGER NOT NULL,
  country TEXT NOT NULL,
  language TEXT NOT NULL,
  genres TEXT[] NOT NULL CHECK (cardinality(genres) > 0),
  director TEXT NOT NULL,
  writer TEXT NOT NULL,
  cast_members TEXT[] NOT NULL,
  runtime_minutes INTEGER NOT NULL CHECK (runtime_minutes > 0),
  age_rating TEXT NOT NULL CHECK (age_rating IN ('all', '12', '15', '19')),
  advisories TEXT[] NOT NULL,
  moods TEXT[] NOT NULL,
  audio_languages TEXT[] NOT NULL,
  subtitle_languages TEXT[] NOT NULL,
  synopsis TEXT NOT NULL,
  import_note TEXT NOT NULL,
  first_import BOOLEAN NOT NULL,
  released_on DATE NOT NULL,
  poster TEXT NOT NULL,
  backdrop TEXT NOT NULL
);
CREATE INDEX movies_released_on_idx ON movies (released_on DESC);

CREATE TABLE subscriptions (
  user_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'standard', 'premium')),
  -- 다음 결제일에 적용할 하위 이용권
  pending_plan TEXT CHECK (pending_plan IN ('basic', 'standard', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired')),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL
);

-- 실제 돈이 오가지 않는 가상 결제 기록입니다.
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('new', 'renewal', 'upgrade')),
  status TEXT NOT NULL CHECK (status IN ('paid', 'failed')),
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX payments_user_idx ON payments (user_id, created_at DESC);
