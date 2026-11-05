import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomePage } from './HomePage';

const meta: Meta<typeof HomePage> = {
  title: 'pages/HomePage',
  component: HomePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Default: StoryObj<typeof HomePage> = {};
