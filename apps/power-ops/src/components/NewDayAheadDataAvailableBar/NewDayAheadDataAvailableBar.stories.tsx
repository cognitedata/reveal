import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { NewDayAheadDataAvailableBar } from 'components/NewDayAheadDataAvailableBar/NewDayAheadDataAvailableBar';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export default {
  component: NewDayAheadDataAvailableBar,
  title: 'Components/New Day Ahead Data Available Bar',
  argTypes: { onReloadClick: { action: 'Reload Button Click' } },
} as Meta;

const Template: Story<ComponentProps<typeof NewDayAheadDataAvailableBar>> = (
  args
) => <NewDayAheadDataAvailableBar {...args} />;

export const Default = Template.bind({});

export const Interactions = Template.bind({});

Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const reloadButton = canvas.getByText('Update');
  await userEvent.click(reloadButton);
  expect(args.onReloadClick).toBeCalled();
};
