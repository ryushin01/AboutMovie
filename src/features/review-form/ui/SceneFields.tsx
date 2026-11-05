import { css } from '@emotion/react';
import type { ChangeEventHandler, RefObject } from 'react';
import type { Scene } from '@/entities/review';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { inputCss } from '@/shared/ui/styles';

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
    object-fit: contain;
    background: var(--surface);
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

interface Props {
  scenes: Scene[];
  fileError?: string;
  /** 장면 id별 설명 오류 */
  errors?: Record<string, string>;
  inputRef: RefObject<HTMLInputElement | null>;
  onFiles: ChangeEventHandler<HTMLInputElement>;
  onDescriptionChange: (id: string, description: string) => void;
  onRemove: (id: string, order: number) => void;
}

export function SceneFields({
  scenes,
  fileError,
  errors,
  inputRef,
  onFiles,
  onDescriptionChange,
  onRemove,
}: Props) {
  return (
    <div>
      <Field
        label="영화 속 장면 이미지"
        hint="여러 장을 함께 고를 수 있습니다. 10MB 이하의 이미지 파일"
        error={fileError}
      >
        {(control) => (
          <input
            {...control}
            ref={inputRef}
            css={inputCss}
            type="file"
            accept="image/*"
            multiple
            onChange={onFiles}
          />
        )}
      </Field>

      {scenes.length > 0 && (
        <ul css={scenesCss}>
          {scenes.map((scene, index) => (
            <li key={scene.id}>
              <img src={scene.src} alt={scene.description || `장면 ${index + 1} 미리보기`} />
              <div>
                <Field
                  label={`장면 ${index + 1} 설명`}
                  required
                  hint="이미지를 볼 수 없는 사람을 위한 대체 텍스트로 쓰입니다."
                  error={errors?.[scene.id]}
                >
                  {(control) => (
                    <input
                      {...control}
                      css={inputCss}
                      value={scene.description}
                      onChange={(e) => onDescriptionChange(scene.id, e.target.value)}
                    />
                  )}
                </Field>
                <Button variant="outline" onClick={() => onRemove(scene.id, index + 1)}>
                  장면 {index + 1} 삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
