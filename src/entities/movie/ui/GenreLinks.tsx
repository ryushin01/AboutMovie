import { css } from '@emotion/react';
import { Link } from 'react-router';
import { routes } from '@/shared/config/routes';
import type { Genre } from '../model/types';

const listCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;
const tagCss = css`
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 2px 12px;
  color: inherit;
  border: 1px solid currentColor;
  border-radius: 16px;
  font-size: 0.9375rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

/** 장르 태그. 누르면 그 장르로 걸러 낸 리스트로 갑니다. */
export function GenreLinks({ genres, className }: { genres: readonly Genre[]; className?: string }) {
  return (
    <ul css={listCss} className={className}>
      {genres.map((genre) => (
        <li key={genre}>
          <Link to={routes.movies({ genre })} css={tagCss}>
            {genre}
          </Link>
        </li>
      ))}
    </ul>
  );
}
