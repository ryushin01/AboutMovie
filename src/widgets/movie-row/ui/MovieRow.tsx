import { css } from '@emotion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { MovieCard, type Movie } from '@/entities/movie';
import { visuallyHidden } from '@/shared/ui/styles';

const GAP = 'clamp(8px, 1vw, 16px)';

const sectionCss = css`
  margin-top: clamp(28px, 3.5vw, 48px);
`;
const headCss = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;
const titleCss = css`
  margin: 0;
  font-size: clamp(1.125rem, 1.8vw, 1.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
`;
const toolsCss = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const moreCss = css`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: inherit;
  font-weight: 700;
`;
const controlsCss = css`
  display: flex;
  gap: 4px;

  /* 터치 화면은 손가락으로 밀어 넘깁니다. */
  @media (hover: none) {
    display: none;
  }
`;
const controlCss = css`
  width: 44px;
  height: 44px;
  color: var(--ink);
  background: var(--surface);
  border: 0;
  border-radius: 50%;
  font: inherit;
  font-size: 1.25rem;
  cursor: pointer;

  &[aria-disabled='true'] {
    opacity: 0.4;
    cursor: default;
  }
`;
/**
 * 화면 폭에 따라 한 줄에 보이는 카드 수가 달라집니다.
 * 소수점만큼 다음 카드가 살짝 보여 옆으로 더 있다는 것을 알려 줍니다.
 */
const listCss = css`
  --cards: 2.3;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - (var(--cards) - 1) * ${GAP}) / var(--cards));
  gap: ${GAP};
  /* 좌우 끝까지 이어지게 본문 여백을 넘어 그리고, 초점 표시가 잘리지 않게 안쪽 여백을 둡니다. */
  margin: 0 calc(-1 * var(--gutter));
  padding: 4px var(--gutter) 8px;
  overflow-x: auto;
  list-style: none;
  scroll-padding-inline: var(--gutter);
  scroll-snap-type: x proximity;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
  li {
    min-width: 0;
    scroll-snap-align: start;
  }
  @media (min-width: 480px) {
    --cards: 3.3;
  }
  @media (min-width: 768px) {
    --cards: 4.3;
  }
  @media (min-width: 1100px) {
    --cards: 5.3;
  }
  @media (min-width: 1440px) {
    --cards: 6.3;
  }
  @media (min-width: 1920px) {
    --cards: 8.3;
  }
`;

interface Props {
  title: string;
  movies: Movie[];
  /** 전체 보기로 갈 리스트 주소 */
  moreTo: string;
}

/** 제목 하나와 옆으로 넘기는 포스터 한 줄입니다. */
export function MovieRow({ title, movies, moreTo }: Props) {
  const titleId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () =>
      setEdges({
        start: list.scrollLeft <= 1,
        end: list.scrollLeft + list.clientWidth >= list.scrollWidth - 1,
      });
    update();
    list.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(list);
    return () => {
      list.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [movies.length]);

  const move = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list || edges[direction === 1 ? 'end' : 'start']) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section aria-labelledby={titleId} css={sectionCss}>
      <div css={headCss}>
        <h2 id={titleId} css={titleCss}>
          {title}
        </h2>
        <div css={toolsCss}>
          <Link to={moreTo} css={moreCss}>
            <span css={visuallyHidden}>{title}</span> 전체 보기
          </Link>
          {!(edges.start && edges.end) && (
            <div css={controlsCss}>
              <button
                type="button"
                css={controlCss}
                aria-label={`${title} 이전 목록`}
                aria-disabled={edges.start}
                onClick={() => move(-1)}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                css={controlCss}
                aria-label={`${title} 다음 목록`}
                aria-disabled={edges.end}
                onClick={() => move(1)}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <ul ref={listRef} css={listCss}>
        {movies.map((movie) => (
          <li key={movie.id}>
            <MovieCard movie={movie} />
          </li>
        ))}
      </ul>
    </section>
  );
}
