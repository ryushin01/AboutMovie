import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReviewNewPage } from './ReviewNewPage';

const meta: Meta<typeof ReviewNewPage> = {
  title: 'pages/ReviewNewPage',
  component: ReviewNewPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Default: StoryObj<typeof ReviewNewPage> = {};
