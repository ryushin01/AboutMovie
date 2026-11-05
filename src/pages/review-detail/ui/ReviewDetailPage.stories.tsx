import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReviewDetailPage } from './ReviewDetailPage';

const meta: Meta<typeof ReviewDetailPage> = {
  title: 'pages/ReviewDetailPage',
  component: ReviewDetailPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

const route = (entry: string) => ({ route: { path: '/reviews/:id', entry } });

export const Default: StoryObj<typeof ReviewDetailPage> = {
  parameters: route('/reviews/sample-last-screening'),
};
export const NotFound: StoryObj<typeof ReviewDetailPage> = { parameters: route('/reviews/nope') };
