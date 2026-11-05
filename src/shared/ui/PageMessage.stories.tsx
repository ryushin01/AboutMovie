import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageMessage } from './PageMessage';

const meta: Meta<typeof PageMessage> = {
  title: 'shared/PageMessage',
  component: PageMessage,
  args: { title: '페이지를 찾을 수 없습니다', children: <p>주소를 다시 확인해 주세요.</p> },
};
export default meta;

export const Default: StoryObj<typeof PageMessage> = {};
