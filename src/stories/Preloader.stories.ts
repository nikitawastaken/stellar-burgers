import { Preloader } from '@ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
	title: 'Example/Preloader',
	component: Preloader,
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	parameters: {
		// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
		layout: 'fullscreen',
	},
} satisfies Meta<typeof Preloader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultPreloader: Story = {
	args: {},
};
