import { visuallyHidden } from '@/shared/ui/styles';

/** 별 모양과 별개로 점수를 텍스트로 제공합니다. */
export function Rating({ value }: { value: number }) {
  return (
    <span>
      <span aria-hidden="true">{'★'.repeat(value) + '☆'.repeat(5 - value)}</span>
      <span css={visuallyHidden}>평점 5점 만점에 {value}점</span>
    </span>
  );
}
