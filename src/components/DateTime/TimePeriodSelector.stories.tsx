/**
 * TimePeriodSelector StoryBook
 */

import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import TimePeriodSelector from './TimePeriodSelector';

export default {
  component: TimePeriodSelector,
  title: 'Components/DateTime',
} as Meta;

const Template: Story<ComponentProps<typeof TimePeriodSelector>> = (args) => (
  <TimePeriodSelector {...args} />
);

export const TimePeriod = Template.bind({});

TimePeriod.args = {
  onPeriodClick: () => {},
  optionSelected: '1M',
};
