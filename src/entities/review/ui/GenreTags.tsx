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
  /* 색만으로 구분하지 않도록 굵기도 함께 바꿉니다. */
  &[aria-current='page'] {
    border-width: 2px;
    font-weight: 800;
  }
`;

interface Props {
  genres: readonly Genre[];
  /** 지금 보고 있는 장르 */
  current?: Genre;
  className?: string;
}

/** 장르 태그. 누르면 그 장르의 리뷰 목록으로 갑니다. */
export function GenreTags({ genres, current, className }: Props) {
  return (
    <ul css={listCss} className={className}>
      {genres.map((genre) => (
        <li key={genre}>
          <Link to={routes.genre(genre)} css={tagCss} aria-current={genre === current ? 'page' : undefined}>
            {genre}
          </Link>
        </li>
      ))}
    </ul>
  );
}
