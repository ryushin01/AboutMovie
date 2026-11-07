import { css } from '@emotion/react';
import { useId, useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { routes } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { inputCss, visuallyHidden } from '@/shared/ui/styles';

const searchCss = css`
  flex: 1 1 240px;
  max-width: 460px;
`;
const formCss = css`
  display: flex;
  gap: 8px;
`;

/** 머리글의 검색창. 어느 화면에서든 제목, 감독, 배우로 찾아 리스트로 갑니다. */
export function MovieSearch() {
  const id = useId();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigate(routes.movies(q.trim() ? { q: q.trim() } : {}));
  };

  return (
    <search css={searchCss}>
      <form css={formCss} onSubmit={handleSubmit}>
        <label htmlFor={id} css={visuallyHidden}>
          영화 검색
        </label>
        <input
          id={id}
          css={inputCss}
          type="search"
          placeholder="제목, 감독, 배우"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit" variant="outline" css={{ flex: 'none', paddingInline: 16 }}>
          검색
        </Button>
      </form>
    </search>
  );
}
