import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field } from './Field';

describe('Field', () => {
  it('레이블과 오류를 입력 요소에 연결한다', () => {
    render(
      <Field label="제목" required error="제목을 입력해 주세요.">
        {(control) => <input {...control} />}
      </Field>,
    );
    const input = screen.getByLabelText('제목 (필수)');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('오류: 제목을 입력해 주세요.');
  });
});
