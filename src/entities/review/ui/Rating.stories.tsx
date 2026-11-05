import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating } from './Rating';

const meta: Meta<typeof Rating> = { title: 'entities/Rating', component: Rating, args: { value: 4 } };
export default meta;

export const Default: StoryObj<typeof Rating> = {};
