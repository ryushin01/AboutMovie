import { css } from '@emotion/react';
import type { ChangeEventHandler } from 'react';
import { Field } from '@/shared/ui/Field';
import { inputCss } from '@/shared/ui/styles';

const previewCss = css`
  display: block;
  width: 160px;
  aspect-ratio: 2 / 3;
  margin-top: 12px;
  object-fit: contain;
  background: var(--surface);
`;

interface Props {
  poster: string;
  error?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export function PosterField({ poster, error, onChange }: Props) {
  return (
    <Field label="포스터 이미지" required hint="10MB 이하의 이미지 파일" error={error}>
      {(control) => (
        <>
          <input {...control} css={inputCss} type="file" accept="image/*" onChange={onChange} />
          {poster && <img css={previewCss} src={poster} alt="선택한 포스터 미리보기" />}
        </>
      )}
    </Field>
  );
}
