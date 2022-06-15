import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import { ComponentProps, useState } from 'react';
import DateTimeRangeSelector from './DateTimeRangeSelector';

export default {
  component: DateTimeRangeSelector,
  title: 'Components/DateTime',
} as Meta;

const Template: Story<ComponentProps<typeof DateTimeRangeSelector>> = (
  args
) => {
  const [range, setRange] = useState(args.range);
  const handleChange = (startDate: Date, endDate: Date) => {
    setRange({ startDate, endDate });
  };
  return (
    <DateTimeRangeSelector {...args} range={range} onChange={handleChange} />
  );
};

export const DateTimeRange = Template.bind({});

DateTimeRange.args = {
  range: {
    startDate: dayjs('2022-06-10T17:22:45.929Z').subtract(7, 'day').toDate(),
    endDate: new Date('2022-06-10T18:22:45.929Z'),
  },
};
