import type { Meta, StoryObj } from '@storybook/react-vite';
import { seedReviews } from '../model/seed';
import { ReviewCard } from './ReviewCard';

const meta: Meta<typeof ReviewCard> = {
  title: 'entities/ReviewCard',
  component: ReviewCard,
  args: { review: seedReviews[0] },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};
export default meta;

export const Default: StoryObj<typeof ReviewCard> = {};
