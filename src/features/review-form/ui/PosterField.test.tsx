import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PosterField } from './PosterField';

it('PosterField는 고른 포스터를 미리 보여 주고 오류를 입력에 연결한다', () => {
  render(<PosterField poster="data:image/png;base64,AA" error="다시 올려 주세요." onChange={() => {}} />);
  expect(screen.getByAltText('선택한 포스터 미리보기')).toBeInTheDocument();
  expect(screen.getByLabelText('포스터 이미지 (필수)')).toHaveAttribute('aria-invalid', 'true');
});
