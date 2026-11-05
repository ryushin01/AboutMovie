import { useEffect, type RefObject } from 'react';
import { useBlocker } from 'react-router';

/** 저장하지 않은 내용이 있으면 화면을 나가기 전에 확인합니다. */
export function useLeaveGuard(changed: boolean, saved: RefObject<boolean>) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      changed && !saved.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('작성 중인 내용이 사라집니다. 이 화면을 나갈까요?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  // 새로고침이나 탭 닫기는 라우터가 막을 수 없어 브라우저 경고를 씁니다.
  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (!saved.current) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [changed, saved]);
}
