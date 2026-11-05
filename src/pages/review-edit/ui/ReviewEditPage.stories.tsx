import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReviewEditPage } from './ReviewEditPage';

const meta: Meta<typeof ReviewEditPage> = {
  title: 'pages/ReviewEditPage',
  component: ReviewEditPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

const route = (entry: string) => ({ route: { path: '/reviews/:id/edit', entry } });

export const Default: StoryObj<typeof ReviewEditPage> = {
  parameters: route('/reviews/sample-last-screening/edit'),
};
export const NotFound: StoryObj<typeof ReviewEditPage> = { parameters: route('/reviews/nope/edit') };
