import { css } from '@emotion/react';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router';
import { useSaveReview, type Review } from '@/entities/review';
import { readImageFile } from '@/shared/lib/readImageFile';
import { Button, buttonCss } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { inputCss } from '@/shared/ui/styles';
import { toDraft, toReviewInput, validateDraft, type Draft, type DraftErrors } from '../model/draft';

const formCss = css`
  display: grid;
  gap: 32px;
  max-width: 760px;
`;
const rowCss = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
`;
const previewCss = css`
  display: block;
  width: 160px;
  aspect-ratio: 2 / 3;
  margin-top: 12px;
  object-fit: cover;
`;
const scenesCss = css`
  display: grid;
  gap: 24px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: minmax(0, 200px) minmax(0, 1fr);
    gap: 16px;
    align-items: start;
    padding-top: 24px;
    border-top: 1px solid var(--field-line);
  }
  img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }
  button {
    margin-top: 12px;
  }
  @media (max-width: 560px) {
    li {
      grid-template-columns: minmax(0, 1fr);
    }
  }
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
  const [draft, setDraft] = useState<Draft>(() => toDraft(review));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [reading, setReading] = useState(0);
  const [status, setStatus] = useState('');
  const save = useSaveReview();
  const submitLock = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const sceneInputRef = useRef<HTMLInputElement>(null);

  const change = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handlePoster = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setReading((n) => n + 1);
    try {
      const poster = await readImageFile(file);
      change({ poster });
      setErrors((prev) => ({ ...prev, poster: undefined }));
      setStatus('포스터 이미지를 넣었습니다.');
    } catch (error) {
      setErrors((prev) => ({ ...prev, poster: (error as Error).message }));
    } finally {
      input.value = '';
      setReading((n) => n - 1);
    }
  };

  const handleScenes = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    setReading((n) => n + 1);
    const results = await Promise.allSettled(files.map(readImageFile));
    const added = results.flatMap((r) =>
      r.status === 'fulfilled' ? [{ id: crypto.randomUUID(), src: r.value, description: '' }] : [],
    );
    const failed = results.flatMap((r) => (r.status === 'rejected' ? [(r.reason as Error).message] : []));
    setDraft((prev) => ({ ...prev, scenes: [...prev.scenes, ...added] }));
    setErrors((prev) => ({ ...prev, sceneFile: failed.join(' ') || undefined }));
    if (added.length > 0) setStatus(`장면 이미지 ${added.length}개를 넣었습니다. 설명을 입력해 주세요.`);
    input.value = '';
    setReading((n) => n - 1);
  };

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
      onSuccess: (saved) => onSaved(saved.id),
      onSettled: () => {
        submitLock.current = false;
      },
    });
  };

  return (
    <form ref={formRef} css={formCss} onSubmit={handleSubmit} noValidate>
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

      <Field label="포스터 이미지" required hint="10MB 이하의 이미지 파일" error={errors.poster}>
        {(control) => (
          <>
            <input {...control} css={inputCss} type="file" accept="image/*" onChange={handlePoster} />
            {draft.poster && <img css={previewCss} src={draft.poster} alt="선택한 포스터 미리보기" />}
          </>
        )}
      </Field>

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

      <div>
        <Field
          label="영화 속 장면 이미지"
          hint="여러 장을 함께 고를 수 있습니다. 10MB 이하의 이미지 파일"
          error={errors.sceneFile}
        >
          {(control) => (
            <input
              {...control}
              ref={sceneInputRef}
              css={inputCss}
              type="file"
              accept="image/*"
              multiple
              onChange={handleScenes}
            />
          )}
        </Field>

        {draft.scenes.length > 0 && (
          <ul css={scenesCss}>
            {draft.scenes.map((scene, index) => (
              <li key={scene.id}>
                <img src={scene.src} alt={scene.description || `장면 ${index + 1} 미리보기`} />
                <div>
                  <Field
                    label={`장면 ${index + 1} 설명`}
                    required
                    hint="이미지를 볼 수 없는 사람을 위한 대체 텍스트로 쓰입니다."
                    error={errors.scenes?.[scene.id]}
                  >
                    {(control) => (
                      <input
                        {...control}
                        css={inputCss}
                        value={scene.description}
                        onChange={(e) =>
                          change({
                            scenes: draft.scenes.map((s) =>
                              s.id === scene.id ? { ...s, description: e.target.value } : s,
                            ),
                          })
                        }
                      />
                    )}
                  </Field>
                  <Button variant="outline" onClick={() => removeScene(scene.id, index + 1)}>
                    장면 {index + 1} 삭제
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p role="status" css={{ margin: 0, color: 'var(--muted)' }}>
        {status}
      </p>

      {save.isError && (
        <p role="alert" css={alertCss}>
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
    </form>
  );
}
