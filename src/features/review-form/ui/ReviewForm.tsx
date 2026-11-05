import { css } from '@emotion/react';
import type { Editor } from '@tiptap/react';
import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router';
import { GENRES, uploadImage, useSaveReview, type Review } from '@/entities/review';
import { ApiError } from '@/shared/api/request';
import { readImageFile, SCENE_MAX_EDGE } from '@/shared/lib/readImageFile';
import { Button, buttonCss } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { inputCss } from '@/shared/ui/styles';
import {
  isDraftChanged,
  toDraft,
  toReviewInput,
  validateDraft,
  type Draft,
  type DraftErrors,
} from '../model/draft';
import { useImageUpload } from '../model/useImageUpload';
import { useLeaveGuard } from '../model/useLeaveGuard';
import { PosterField } from './PosterField';

// 편집기는 무거우므로 글을 쓸 때만 받습니다.
const RichEditor = lazy(() => import('./RichEditor'));

const formCss = css`
  display: grid;
  gap: 32px;
  min-width: 0;
  max-width: 860px;
  margin: 0;
  padding: 0;
  border: 0;
`;
const rowCss = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
`;
const actionsCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;
const alertCss = css`
  margin: 0;
  color: var(--accent);
  font-weight: 700;
`;

const hasErrors = (errors: DraftErrors) => Object.keys(errors).length > 0;

interface Props {
  /** 수정할 리뷰. 없으면 새로 작성합니다. */
  review?: Review;
  cancelTo: string;
  onSaved: (id: string) => void;
}

export function ReviewForm({ review, cancelTo, onSaved }: Props) {
  const [initialDraft] = useState<Draft>(() => toDraft(review));
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [status, setStatus] = useState('');
  const save = useSaveReview();
  const submitLock = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  // 저장 중 잠겼던 버튼에서 초점을 잃으므로 실패 안내로 옮깁니다.
  useEffect(() => {
    if (save.isError) alertRef.current?.focus();
  }, [save.isError]);

  const saved = useRef(false);
  useLeaveGuard(isDraftChanged(initialDraft, draft), saved);

  const change = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const { uploading, handlePoster } = useImageUpload({ setDraft, setErrors, setStatus });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitLock.current || uploading) return;

    const next = validateDraft(draft);
    flushSync(() => setErrors(next));
    if (hasErrors(next)) {
      // 편집기의 aria-invalid는 다음 렌더링에 붙으므로 오류 항목은 따로 확인합니다.
      const onlyBody = Object.keys(next).length === 1 && next.body;
      if (onlyBody) editorRef.current?.commands.focus();
      else formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    submitLock.current = true;
    save.mutate(toReviewInput(draft, review?.id), {
      onSuccess: (result) => {
        saved.current = true;
        onSaved(result.id);
      },
      onSettled: () => {
        submitLock.current = false;
      },
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {/* 저장 중에 고친 내용이 사라지지 않도록 입력을 잠급니다. */}
      <fieldset disabled={save.isPending} css={formCss}>
        <Field label="영화 제목" required error={errors.title}>
          {(control) => (
            <input
              {...control}
              css={inputCss}
              maxLength={100}
              value={draft.title}
              onChange={(e) => change({ title: e.target.value })}
            />
          )}
        </Field>

        <div css={rowCss}>
          <Field label="개봉 연도" required hint="예: 2024" error={errors.year}>
            {(control) => (
              <input
                {...control}
                css={inputCss}
                inputMode="numeric"
                value={draft.year}
                onChange={(e) => change({ year: e.target.value })}
              />
            )}
          </Field>
          <Field label="평점" required error={errors.rating}>
            {(control) => (
              <select
                {...control}
                css={inputCss}
                value={draft.rating}
                onChange={(e) => change({ rating: e.target.value })}
              >
                <option value="">선택해 주세요</option>
                {[5, 4, 3, 2, 1].map((score) => (
                  <option key={score} value={score}>
                    {score}점
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <Field label="장르" required error={errors.genre}>
          {(control) => (
            <select
              {...control}
              css={inputCss}
              value={draft.genre}
              onChange={(e) => change({ genre: e.target.value })}
            >
              <option value="">선택해 주세요</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          )}
        </Field>

        <PosterField poster={draft.poster} error={errors.poster} onChange={handlePoster} />

        <Field label="리뷰 내용" required error={errors.body}>
          {(control, labelId) => (
            <Suspense fallback={<output css={{ display: 'block' }}>편집기를 불러오는 중입니다.</output>}>
              <RichEditor
                value={draft.body}
                onChange={(body) => change({ body })}
                onUploadImage={async (file) => uploadImage(await readImageFile(file, SCENE_MAX_EDGE))}
                editorRef={editorRef}
                labelId={labelId}
                invalid={Boolean(errors.body)}
                describedBy={control['aria-describedby']}
                disabled={save.isPending}
              />
            </Suspense>
          )}
        </Field>

        <output css={{ display: 'block', color: 'var(--muted)' }}>{status}</output>

        {save.isError && (
          <p ref={alertRef} role="alert" tabIndex={-1} css={alertCss}>
            {save.error instanceof ApiError && save.error.status === 401
              ? '로그인이 끝났습니다. 다른 탭에서 다시 로그인한 뒤 저장해 주세요.'
              : '저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.'}
          </p>
        )}

        <div css={actionsCss}>
          <Button type="submit" disabled={save.isPending || uploading}>
            {save.isPending ? '저장 중…' : '저장'}
          </Button>
          <Link to={cancelTo} css={buttonCss('outline')}>
            취소
          </Link>
        </div>
      </fieldset>
    </form>
  );
}
