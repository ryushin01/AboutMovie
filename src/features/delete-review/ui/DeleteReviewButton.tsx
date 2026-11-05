import { useDeleteReview } from '@/entities/review';
import { Button } from '@/shared/ui/Button';

interface Props {
  id: string;
  title: string;
  onDeleted: () => void;
}

export function DeleteReviewButton({ id, title, onDeleted }: Props) {
  const remove = useDeleteReview();

  const handleClick = () => {
    if (remove.isPending) return;
    if (!window.confirm(`'${title}' 리뷰를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    remove.mutate(id, { onSuccess: onDeleted });
  };

  return (
    <>
      <Button variant="outline" disabled={remove.isPending} onClick={handleClick}>
        삭제
      </Button>
      {remove.isError && <p role="alert">삭제하지 못했습니다. 다시 시도해 주세요.</p>}
    </>
  );
}
