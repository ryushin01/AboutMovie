import { formatRuntime, GENRES, GenreLinks, useHome, useLibrary, type MemberLibrary } from '@/entities/movie';
import { useSession } from '@/entities/session';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { PageMessage } from '@/shared/ui/PageMessage';
import { MovieRow } from '@/widgets/movie-row';
import { FeaturedMovie } from './FeaturedMovie';

const remaining = ({ continueWatching }: MemberLibrary) =>
  Object.fromEntries(
    continueWatching.map(({ movie, positionSeconds }) => [
      movie.id,
      `${formatRuntime(Math.max(1, Math.ceil(movie.runtimeMinutes - positionSeconds / 60)))} 남음`,
    ]),
  );

/** 3단 구조의 첫 단계: 메인 → 리스트 → 디테일 */
export function HomePage() {
  useDocumentTitle();
  const { data, isPending, isError } = useHome();
  const { user } = useSession();
  const { data: library } = useLibrary(user?.id);

  if (isPending) return <output css={{ display: 'block', paddingTop: 32 }}>영화를 불러오는 중입니다.</output>;
  if (isError) {
    return (
      <p role="alert" css={{ paddingTop: 32 }}>
        영화를 불러오지 못했습니다. 새로고침해 주세요.
      </p>
    );
  }
  if (!data.featured) return <PageMessage title="아직 공개된 영화가 없습니다" />;

  return (
    <>
      <FeaturedMovie movie={data.featured} />
      <nav aria-label="장르별 영화" css={{ marginTop: 24 }}>
        <GenreLinks genres={GENRES} />
      </nav>
      {library && library.continueWatching.length > 0 && (
        <MovieRow
          title="이어 보기"
          movies={library.continueWatching.map((item) => item.movie)}
          notes={remaining(library)}
        />
      )}
      {library && library.watchlist.length > 0 && <MovieRow title="찜한 영화" movies={library.watchlist} />}
      {data.rows.map((row) => (
        <MovieRow
          key={row.title}
          title={row.title}
          movies={row.movies}
          moreTo={`${routes.movies()}?${row.query}`}
        />
      ))}
    </>
  );
}
