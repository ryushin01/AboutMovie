import type { Meta, StoryObj } from '@storybook/react-vite';
import { SiteLayout } from './SiteLayout';

const meta: Meta<typeof SiteLayout> = {
  title: 'widgets/SiteLayout',
  component: SiteLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Default: StoryObj<typeof SiteLayout> = {};
