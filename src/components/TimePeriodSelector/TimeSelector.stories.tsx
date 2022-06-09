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
  dateTo: new Date('2022-03-21T15:15:48.496Z'),
  dateFrom: new Date('2021-03-08T17:40:16.621Z'),
  handleDateChange: () => {},
};
