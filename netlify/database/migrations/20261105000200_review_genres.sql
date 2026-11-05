-- 리뷰 하나에 장르를 여러 개 붙일 수 있게 바꿉니다.
ALTER TABLE reviews ADD COLUMN genres TEXT[];
UPDATE reviews SET genres = ARRAY[genre];
ALTER TABLE reviews
  ALTER COLUMN genres SET NOT NULL,
  ADD CONSTRAINT reviews_genres_not_empty CHECK (cardinality(genres) > 0),
  DROP COLUMN genre;
