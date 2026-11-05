import { useRestoreSampleReviews } from '@/entities/review';
import { Button } from '@/shared/ui/Button';

/** 데모를 처음 상태로 돌려 볼 수 있게 합니다. 직접 쓴 리뷰는 남습니다. */
export function RestoreSamplesButton() {
  const restore = useRestoreSampleReviews();

  return (
    <>
      <Button variant="outline" disabled={restore.isPending} onClick={() => restore.mutate()}>
        샘플 리뷰 되돌리기
      </Button>
      <output css={{ display: 'block', marginTop: 12, color: 'var(--muted)' }}>
        {restore.isSuccess && '샘플 리뷰를 처음 상태로 되돌렸습니다. 직접 쓴 리뷰는 그대로입니다.'}
      </output>
      {restore.isError && <p role="alert">되돌리지 못했습니다. 다시 시도해 주세요.</p>}
    </>
  );
}
