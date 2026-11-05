import { css } from '@emotion/react';
import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/ui/Button';

const dialogCss = css`
  width: min(480px, calc(100vw - 32px));
  padding: 24px;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--ink);

  &::backdrop {
    background: rgb(0 0 0 / 0.6);
  }
`;
const titleCss = css`
  margin: 0 0 20px;
  font-size: 1.25rem;
`;
const actionsCss = css`
  display: flex;
  gap: 8px;
  margin-top: 24px;
`;

interface Props {
  title: string;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
}

/** 네이티브 dialog라 초점 가두기, Esc 닫기, 초점 복귀를 브라우저가 맡습니다. */
export function EditorDialog({ title, submitLabel, submitting, onSubmit, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // 포털이어도 React 이벤트는 바깥 리뷰 폼까지 올라가므로 여기서 멈춥니다.
    event.stopPropagation();
    onSubmit();
  };

  return createPortal(
    <dialog ref={ref} css={dialogCss} aria-labelledby="editor-dialog-title" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <h2 id="editor-dialog-title" css={titleCss}>
          {title}
        </h2>
        {children}
        <div css={actionsCss}>
          <Button type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
          <Button variant="outline" disabled={submitting} onClick={onClose}>
            취소
          </Button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
