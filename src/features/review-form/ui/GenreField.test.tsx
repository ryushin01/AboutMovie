import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GenreField } from './GenreField';

describe('GenreField', () => {
  it('장르 묶음에 이름을 붙이고 19개를 모두 보여 준다', () => {
    render(<GenreField value={[]} onChange={() => {}} />);
    expect(screen.getByRole('group', { name: '장르 (필수)' })).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(19);
  });

  it('고른 순서와 상관없이 목록 순서로 넘긴다', async () => {
    const onChange = vi.fn();
    render(<GenreField value={['SF']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: '액션' }));
    expect(onChange).toHaveBeenCalledWith(['액션', 'SF']);
  });

  it('다시 누르면 뺀다', async () => {
    const onChange = vi.fn();
    render(<GenreField value={['액션', 'SF']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'SF' }));
    expect(onChange).toHaveBeenCalledWith(['액션']);
  });

  it('오류를 안내하고 묶음과 연결한다', () => {
    render(<GenreField value={[]} error="장르를 고르세요." onChange={() => {}} />);
    expect(screen.getByRole('checkbox', { name: '액션' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('group', { name: '장르 (필수)' })).toHaveAccessibleDescription(
      expect.stringContaining('오류: 장르를 고르세요.'),
    );
  });
});
