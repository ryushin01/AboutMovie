import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeToggle } from './ThemeToggle';

const meta: Meta<typeof ThemeToggle> = { title: 'features/ThemeToggle', component: ThemeToggle };
export default meta;

export const Default: StoryObj<typeof ThemeToggle> = {};
