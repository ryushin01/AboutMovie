import type { Meta, StoryObj } from '@storybook/react-vite';
import { seedReviews } from '@/entities/review';
import { ReviewForm } from './ReviewForm';

const meta: Meta<typeof ReviewForm> = {
  title: 'features/ReviewForm',
  component: ReviewForm,
  args: { cancelTo: '/', onSaved: () => {} },
};
export default meta;

export const New: StoryObj<typeof ReviewForm> = {};
export const Edit: StoryObj<typeof ReviewForm> = { args: { review: seedReviews[0] } };
