import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { DeliveryWeekSelect } from 'components/DeliveryWeekSelect/DeliveryWeekSelect';

export default {
  component: DeliveryWeekSelect,
  title: 'Components/Delivery Week Select',
  argTypes: {
    onChange: { action: 'Value Changed' },
    value: { control: 'date' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof DeliveryWeekSelect>> = (args) => (
  <DeliveryWeekSelect {...args} />
);

export const Default = Template.bind({});

Default.args = {
  options: [
    { weekNumber: 45, startDate: '2022-10-31', endDate: '2022-11-06' },
    { weekNumber: 46, startDate: '2022-11-07', endDate: '2022-11-13' },
    { weekNumber: 47, startDate: '2022-11-14', endDate: '2022-11-20' },
    { weekNumber: 48, startDate: '2022-11-21', endDate: '2022-11-27' },
    { weekNumber: 49, startDate: '2022-11-28', endDate: '2022-12-04' },
  ],
  value: '2022-11-14',
};
