import { GENRES, GenreLinks, useHome } from '@/entities/movie';
import { routes } from '@/shared/config/routes';
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle';
import { PageMessage } from '@/shared/ui/PageMessage';
import { MovieRow } from '@/widgets/movie-row';
import { FeaturedMovie } from './FeaturedMovie';

/** 3단 구조의 첫 단계: 메인 → 리스트 → 디테일 */
export function HomePage() {
  useDocumentTitle();
  const { data, isPending, isError } = useHome();

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
