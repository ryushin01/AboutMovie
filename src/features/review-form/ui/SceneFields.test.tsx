import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SceneFields } from './SceneFields';

const scene = { id: 'a', src: 'data:image/png;base64,AA', description: '' };
const props = {
  inputRef: createRef<HTMLInputElement>(),
  onFiles: () => {},
  onDescriptionChange: () => {},
  onRemove: () => {},
};

describe('SceneFields', () => {
  it('장면이 없으면 목록을 그리지 않는다', () => {
    render(<SceneFields {...props} scenes={[]} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('설명 입력과 삭제를 알리고, 장면별 오류를 연결한다', async () => {
    const onDescriptionChange = vi.fn();
    const onRemove = vi.fn();
    render(
      <SceneFields
        {...props}
        scenes={[scene]}
        errors={{ a: '장면 설명을 입력해 주세요.' }}
        onDescriptionChange={onDescriptionChange}
        onRemove={onRemove}
      />,
    );

    const input = screen.getByLabelText('장면 1 설명 (필수)');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(input, '바');
    expect(onDescriptionChange).toHaveBeenCalledWith('a', '바');

    await userEvent.click(screen.getByRole('button', { name: '장면 1 삭제' }));
    expect(onRemove).toHaveBeenCalledWith('a', 1);
  });
});
