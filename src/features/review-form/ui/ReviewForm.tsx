import { css } from '@emotion/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router';
import { useSaveReview, type Review } from '@/entities/review';
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
import { SceneFields } from './SceneFields';

const formCss = css`
  display: grid;
  gap: 32px;
  min-width: 0;
  max-width: 760px;
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
  const sceneInputRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  // 저장 중 잠겼던 버튼에서 초점을 잃으므로 실패 안내로 옮깁니다.
  useEffect(() => {
    if (save.isError) alertRef.current?.focus();
  }, [save.isError]);

  const saved = useRef(false);
  useLeaveGuard(isDraftChanged(initialDraft, draft), saved);

  const change = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const { reading, handlePoster, handleScenes } = useImageUpload({ setDraft, setErrors, setStatus });

  const removeScene = (id: string, order: number) => {
    change({ scenes: draft.scenes.filter((scene) => scene.id !== id) });
    setStatus(`장면 ${order}을 삭제했습니다.`);
    // 삭제한 버튼에 있던 초점을 잃지 않도록 옮깁니다.
    sceneInputRef.current?.focus();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitLock.current || reading > 0) return;

    const next = validateDraft(draft);
    flushSync(() => setErrors(next));
    if (hasErrors(next)) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
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

        <PosterField poster={draft.poster} error={errors.poster} onChange={handlePoster} />

        <Field label="리뷰 내용" required error={errors.body}>
          {(control) => (
            <textarea
              {...control}
              css={[inputCss, { minHeight: 280, resize: 'vertical', lineHeight: 1.7 }]}
              value={draft.body}
              onChange={(e) => change({ body: e.target.value })}
            />
          )}
        </Field>

        <SceneFields
          scenes={draft.scenes}
          fileError={errors.sceneFile}
          errors={errors.scenes}
          inputRef={sceneInputRef}
          onFiles={handleScenes}
          onDescriptionChange={(id, description) =>
            change({ scenes: draft.scenes.map((s) => (s.id === id ? { ...s, description } : s)) })
          }
          onRemove={removeScene}
        />

        <output css={{ display: 'block', color: 'var(--muted)' }}>{status}</output>

        {save.isError && (
          <p ref={alertRef} role="alert" tabIndex={-1} css={alertCss}>
            저장하지 못했습니다. 저장 공간이 부족하면 이미지를 줄여 다시 시도해 주세요.
          </p>
        )}

        <div css={actionsCss}>
          <Button type="submit" disabled={save.isPending || reading > 0}>
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
