import { css } from '@emotion/react';
import { useId } from 'react';
import { GENRES, type Genre } from '@/entities/review';

const fieldsetCss = css`
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
`;
const legendCss = css`
  margin-bottom: 8px;
  padding: 0;
  font-weight: 700;
`;
const gridCss = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(130px, 40vw), 1fr));
  gap: 4px 12px;
`;
const optionCss = css`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  cursor: pointer;

  input {
    flex: none;
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--accent);
  }
`;
const hintCss = css`
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 0.9375rem;
`;
const errorCss = css`
  margin: 8px 0 0;
  color: var(--accent);
  font-size: 0.9375rem;
  font-weight: 700;
`;

interface Props {
  value: Genre[];
  error?: string;
  onChange: (genres: Genre[]) => void;
}

/** 장르를 여러 개 고릅니다. 고른 순서와 상관없이 목록 순서로 저장합니다. */
export function GenreField({ value, error, onChange }: Props) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const toggle = (genre: Genre, checked: boolean) =>
    onChange(GENRES.filter((item) => (item === genre ? checked : value.includes(item))));

  return (
    <fieldset css={fieldsetCss} aria-describedby={error ? `${hintId} ${errorId}` : hintId}>
      <legend css={legendCss}>장르 (필수)</legend>
      <div css={gridCss}>
        {GENRES.map((genre) => (
          <label key={genre} css={optionCss}>
            <input
              type="checkbox"
              checked={value.includes(genre)}
              aria-invalid={error ? true : undefined}
              onChange={(event) => toggle(genre, event.target.checked)}
            />
            {genre}
          </label>
        ))}
      </div>
      <p id={hintId} css={hintCss}>
        해당하는 장르를 모두 고릅니다.
      </p>
      {error && (
        <p id={errorId} css={errorCss}>
          오류: {error}
        </p>
      )}
    </fieldset>
  );
}
