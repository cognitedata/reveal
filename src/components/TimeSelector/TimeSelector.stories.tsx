/**
 * TimeSelector StoryBook
 */

import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import TimeSelector from './TimeSelector';

export default {
  component: TimeSelector,
  title: 'Components/DateTime',
} as Meta;

const Template: Story<ComponentProps<typeof TimeSelector>> = (args) => (
  <TimeSelector {...args} />
);

export const TimeDopdown = Template.bind({});

TimeDopdown.args = {
  value: new Date(),
  onChange: () => {},
};
