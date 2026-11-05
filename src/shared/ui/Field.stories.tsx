import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { inputCss } from './styles';

const meta: Meta<typeof Field> = {
  title: 'shared/Field',
  component: Field,
  args: { label: '제목', required: true, children: (control) => <input css={inputCss} {...control} /> },
};
export default meta;

export const Default: StoryObj<typeof Field> = {};
export const WithHint: StoryObj<typeof Field> = { args: { hint: '100자까지 입력할 수 있습니다.' } };
export const WithError: StoryObj<typeof Field> = { args: { error: '제목을 입력해 주세요.' } };
