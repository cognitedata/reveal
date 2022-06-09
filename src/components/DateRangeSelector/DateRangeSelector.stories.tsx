/**
 * DateRangeSelector StoryBook
 */

import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import DateRangeSelector from './DateRangeSelector';

export default {
  component: DateRangeSelector,
  title: 'Components/DateTime',
} as Meta;

const Template: Story<ComponentProps<typeof DateRangeSelector>> = (args) => (
  <DateRangeSelector {...args} />
);

export const DateRangeDropdown = Template.bind({});

DateRangeDropdown.args = {
  dateTo: new Date('2022-03-21T15:15:48.496Z'),
  dateFrom: new Date('2021-03-08T17:40:16.621Z'),
  handleDateChange: () => {},
};
