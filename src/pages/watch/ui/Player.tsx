import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { formatRuntime, type Movie } from '@/entities/movie';
import { Button } from '@/shared/ui/Button';

const screenCss = css`
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  max-height: 70vh;
  width: 100%;
  color: #fff;
  background: #000;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.55;
  }
`;
const subtitleCss = css`
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: 16px;
  margin: 0;
  text-align: center;
  font-size: clamp(0.875rem, 2vw, 1.5rem);
  font-weight: 700;
  text-shadow: 0 1px 4px #000;
`;
const qualityCss = css`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 2px 8px;
  background: rgb(0 0 0 / 0.8);
  font-size: 0.875rem;
  font-weight: 700;
`;
const controlsCss = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;
const seekCss = css`
  flex: 1 1 200px;
  min-width: 0;
  height: 44px;
  accent-color: var(--accent);
`;

const clock = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const rest = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${rest}`;
};

/**
 * 재생 화면입니다. 실제 영상은 없고 진행 시간만 흐릅니다.
 * 자동으로 시작하지 않으며, 표준 버튼과 슬라이더만 써서 키보드로 모두 조작할 수 있습니다.
 */
export function Player({ movie, quality }: { movie: Movie; quality: string }) {
  const duration = movie.runtimeMinutes * 60;
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [muted, setMuted] = useState(false);
  const [subtitles, setSubtitles] = useState(true);

  // 끝까지 가면 재생이 멈춘 것으로 봅니다.
  const running = playing && position < duration;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setPosition((current) => Math.min(current + 1, duration));
    }, 1000);
    return () => clearInterval(timer);
  }, [running, duration]);

  return (
    <section aria-label="재생 화면">
      <div css={screenCss}>
        <img src={movie.backdrop} alt="" />
        <span css={qualityCss}>{quality}</span>
        {subtitles && <p css={subtitleCss}>[가상 자막] 실제 영상은 재생되지 않습니다.</p>}
      </div>
      <div css={controlsCss}>
        <Button onClick={() => setPlaying(!running)}>{running ? '일시정지' : '재생'}</Button>
        <input
          css={seekCss}
          type="range"
          aria-label="재생 위치"
          aria-valuetext={`${clock(position)} / ${clock(duration)}`}
          min={0}
          max={duration}
          step={10}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
        <span>
          {clock(position)} / {clock(duration)}
        </span>
        <Button variant="outline" aria-pressed={muted} onClick={() => setMuted(!muted)}>
          음소거
        </Button>
        <Button variant="outline" aria-pressed={subtitles} onClick={() => setSubtitles(!subtitles)}>
          자막
        </Button>
      </div>
      <p css={{ margin: '12px 0 0', color: 'var(--muted)' }}>
        {movie.audioLanguages.join(', ')} 음성 · {movie.subtitleLanguages.join(', ')} 자막 ·{' '}
        {formatRuntime(movie.runtimeMinutes)}
      </p>
    </section>
  );
}
