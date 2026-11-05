import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeleteReviewButton } from './DeleteReviewButton';

const meta: Meta<typeof DeleteReviewButton> = {
  title: 'features/DeleteReviewButton',
  component: DeleteReviewButton,
  args: { id: 'story-only', title: '마지막 상영', onDeleted: () => {} },
};
export default meta;

export const Default: StoryObj<typeof DeleteReviewButton> = {};
