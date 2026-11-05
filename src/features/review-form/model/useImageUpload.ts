import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { uploadImage } from '@/entities/review';
import { POSTER_MAX_EDGE, readImageFile } from '@/shared/lib/readImageFile';
import type { Draft, DraftErrors } from './draft';

interface Options {
  setDraft: Dispatch<SetStateAction<Draft>>;
  setErrors: Dispatch<SetStateAction<DraftErrors>>;
  setStatus: (status: string) => void;
}

/** 포스터를 줄여서 올리고 주소를 초안에 넣습니다. 올리는 동안 uploading이 참입니다. */
export function useImageUpload({ setDraft, setErrors, setStatus }: Options) {
  const [uploading, setUploading] = useState(false);

  const handlePoster = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus('포스터 이미지를 올리는 중입니다.');
    try {
      const poster = await uploadImage(await readImageFile(file, POSTER_MAX_EDGE));
      setDraft((prev) => ({ ...prev, poster }));
      setErrors((prev) => ({ ...prev, poster: undefined }));
      setStatus('포스터 이미지를 넣었습니다.');
    } catch (error) {
      setStatus('');
      setErrors((prev) => ({ ...prev, poster: (error as Error).message }));
    } finally {
      input.value = '';
      setUploading(false);
    }
  };

  return { uploading, handlePoster };
}
