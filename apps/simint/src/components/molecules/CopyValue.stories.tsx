import { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';

import { CopyValue } from './CopyValue';

const meta: Meta<typeof CopyValue> = {
  component: CopyValue,
};
export default meta;

type Story = StoryObj<typeof CopyValue>;

export const Default: Story = {
  args: {
    value: 'This is a value',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button'));
  },
};
