import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import type { Scene } from '@/entities/review';
import { createId } from '@/shared/lib/createId';
import { POSTER_MAX_EDGE, readImageFile, SCENE_MAX_EDGE } from '@/shared/lib/readImageFile';
import type { Draft, DraftErrors } from './draft';

interface Options {
  setDraft: Dispatch<SetStateAction<Draft>>;
  setErrors: Dispatch<SetStateAction<DraftErrors>>;
  setStatus: (status: string) => void;
}

/** 파일 입력을 읽어 초안에 넣습니다. 읽는 동안 reading이 0보다 큽니다. */
export function useImageUpload({ setDraft, setErrors, setStatus }: Options) {
  const [reading, setReading] = useState(0);

  const handlePoster = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setReading((n) => n + 1);
    try {
      const poster = await readImageFile(file, POSTER_MAX_EDGE);
      setDraft((prev) => ({ ...prev, poster }));
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
    try {
      // 큰 이미지를 한꺼번에 디코딩하면 메모리가 부족할 수 있어 한 장씩 처리합니다.
      const added: Scene[] = [];
      const failed: string[] = [];
      for (const file of files) {
        try {
          added.push({ id: createId(), src: await readImageFile(file, SCENE_MAX_EDGE), description: '' });
        } catch (error) {
          failed.push((error as Error).message);
        }
      }
      setDraft((prev) => ({ ...prev, scenes: [...prev.scenes, ...added] }));
      setErrors((prev) => ({ ...prev, sceneFile: failed.join(' ') || undefined }));
      if (added.length > 0) setStatus(`장면 이미지 ${added.length}개를 넣었습니다. 설명을 입력해 주세요.`);
    } finally {
      input.value = '';
      setReading((n) => n - 1);
    }
  };

  return { reading, handlePoster, handleScenes };
}
