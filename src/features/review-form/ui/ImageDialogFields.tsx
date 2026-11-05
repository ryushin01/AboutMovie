import { useState } from 'react';
import { Field } from '@/shared/ui/Field';
import { inputCss } from '@/shared/ui/styles';
import { EditorDialog } from './EditorDialog';

export interface ImageValue {
  src: string;
  alt: string;
}

interface Props {
  onUpload: (file: File) => Promise<string>;
  onInsert: (image: ImageValue) => void;
  onClose: () => void;
}

/** 본문에 넣을 이미지와 대체 텍스트를 함께 받습니다. 대체 텍스트 없이는 넣을 수 없습니다. */
export function ImageDialogFields({ onUpload, onInsert, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState('');
  const [errors, setErrors] = useState<{ file?: string; alt?: string }>({});
  const [uploading, setUploading] = useState(false);

  const submit = async () => {
    const next = {
      file: file ? undefined : '이미지 파일을 골라 주세요.',
      alt: alt.trim() ? undefined : '이미지 설명을 입력해 주세요.',
    };
    setErrors(next);
    if (!file || next.alt) return;

    setUploading(true);
    try {
      onInsert({ src: await onUpload(file), alt: alt.trim() });
    } catch (error) {
      setErrors({ file: (error as Error).message });
      setUploading(false);
    }
  };

  return (
    <EditorDialog
      title="이미지 넣기"
      submitLabel={uploading ? '올리는 중…' : '넣기'}
      submitting={uploading}
      onSubmit={submit}
      onClose={onClose}
    >
      <div css={{ display: 'grid', gap: 20 }}>
        <Field label="이미지 파일" required hint="10MB 이하의 이미지 파일" error={errors.file}>
          {(control) => (
            <input
              {...control}
              css={inputCss}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          )}
        </Field>
        <Field label="이미지 설명" required hint="화면을 볼 수 없는 독자에게 읽어 줍니다." error={errors.alt}>
          {(control) => (
            <input
              {...control}
              css={inputCss}
              maxLength={200}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          )}
        </Field>
      </div>
    </EditorDialog>
  );
}
