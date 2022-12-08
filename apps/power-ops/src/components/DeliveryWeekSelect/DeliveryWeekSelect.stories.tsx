import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { DeliveryWeekSelect } from 'components/DeliveryWeekSelect/DeliveryWeekSelect';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export default {
  component: DeliveryWeekSelect,
  title: 'Components/RKOM Header/Delivery Week',
  argTypes: {
    onChange: { action: 'Value Changed' },
    value: { control: 'date' },
  },
  args: {
    options: [
      { weekNumber: 44, startDate: '2022-10-31', endDate: '2022-11-06' },
      { weekNumber: 45, startDate: '2022-11-07', endDate: '2022-11-13' },
      { weekNumber: 46, startDate: '2022-11-14', endDate: '2022-11-20' },
      { weekNumber: 47, startDate: '2022-11-21', endDate: '2022-11-27' },
      { weekNumber: 48, startDate: '2022-11-28', endDate: '2022-12-04' },
    ],
    value: '2022-11-14',
  },
} as Meta;

const Template: Story<ComponentProps<typeof DeliveryWeekSelect>> = (args) => (
  <DeliveryWeekSelect {...args} />
);

export const Closed = Template.bind({});

export const Opened = Template.bind({});

Opened.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const select = canvas.getByText('Delivery Week:');
  userEvent.click(select);
};

export const Interactions = Template.bind({});

Interactions.play = async ({ canvasElement, args, ...rest }) => {
  const canvas = within(canvasElement);
  Opened.play!({ canvasElement, args, ...rest });
  const week44 = await canvas.findByText('Week 44, 2022');
  userEvent.click(week44);
  expect(args.onChange).toBeCalledWith('2022-10-31');
};
