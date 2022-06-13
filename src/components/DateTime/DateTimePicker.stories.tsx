import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import { ComponentProps } from 'react';
import DateTimePicker from './DateTimePicker';

export default {
  component: DateTimePicker,
  title: 'Components/DateTime/DateAndPeriod',
} as Meta;

const Template: Story<ComponentProps<typeof DateTimePicker>> = (args) => (
  <DateTimePicker {...args} />
);

export const DateTimeWithPeriod = Template.bind({});

DateTimeWithPeriod.args = {
  range: {
    startDate: dayjs('2022-06-10T18:22:45.929Z').subtract(20, 'day').toDate(),
    endDate: new Date('2022-06-10T18:22:45.929Z'),
  },
  onChange: () => {},
};

export const OneDay = Template.bind({});

OneDay.args = {
  ...DateTimeWithPeriod.args,
  range: {
    startDate: dayjs('2022-06-10T18:22:45.929Z').subtract(1, 'day').toDate(),
    endDate: new Date('2022-06-10T18:22:45.929Z'),
  },
};

export const TwoDays = Template.bind({});

TwoDays.args = {
  ...DateTimeWithPeriod.args,
  range: {
    startDate: dayjs('2022-06-10T18:22:45.929Z').subtract(2, 'days').toDate(),
    endDate: new Date('2022-06-10T18:22:45.929Z'),
  },
};

export const OneWeek = Template.bind({});

OneWeek.args = {
  ...DateTimeWithPeriod.args,
  range: {
    startDate: dayjs('2022-06-10T18:22:45.929Z').subtract(1, 'week').toDate(),
    endDate: new Date('2022-06-10T18:22:45.929Z'),
  },
};
export const OneMonth = Template.bind({});

OneMonth.args = {
  ...DateTimeWithPeriod.args,
  range: {
    startDate: dayjs('2022-06-10T18:22:45.929Z').subtract(1, 'month').toDate(),
    endDate: new Date('2022-06-10T18:22:45.929Z'),
  },
};
export const SixMonths = Template.bind({});

SixMonths.args = {
  ...DateTimeWithPeriod.args,
  range: {
    startDate: dayjs('2022-06-10T18:22:45.929Z').subtract(6, 'months').toDate(),
    endDate: new Date('2022-06-10T18:22:45.929Z'),
  },
};

export const OneYear = Template.bind({});

OneYear.args = {
  ...DateTimeWithPeriod.args,
  range: {
    startDate: dayjs('2022-06-10T18:22:45.929Z').subtract(1, 'year').toDate(),
    endDate: new Date('2022-06-10T18:22:45.929Z'),
  },
};
