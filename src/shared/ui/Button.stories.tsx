import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = { title: 'shared/Button', component: Button, args: { children: '저장' } };
export default meta;

export const Primary: StoryObj<typeof Button> = {};
export const Outline: StoryObj<typeof Button> = { args: { variant: 'outline' } };
export const Disabled: StoryObj<typeof Button> = { args: { disabled: true } };
