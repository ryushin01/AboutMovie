import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotFoundPage } from './NotFoundPage';

const meta: Meta<typeof NotFoundPage> = {
  title: 'pages/NotFoundPage',
  component: NotFoundPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Default: StoryObj<typeof NotFoundPage> = {};
