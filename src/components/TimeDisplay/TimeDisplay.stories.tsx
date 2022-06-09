import { ComponentStory } from '@storybook/react';
import React from 'react';
import { TimeDisplay } from './TimeDisplay';

export default {
  title: 'Component/TimeDisplay',
  component: TimeDisplay,
  argTypes: {
    value: {
      type: 'date',
    },
    withTooltip: {
      type: 'boolean',
    },
    relative: {
      type: 'boolean',
    },
  },
};
export const Example: ComponentStory<typeof TimeDisplay> = args => (
  <TimeDisplay {...args} />
);
Example.args = {
  value: new Date(),
  withTooltip: true,
  relative: true,
};
