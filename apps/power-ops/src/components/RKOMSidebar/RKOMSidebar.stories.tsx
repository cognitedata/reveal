import { expect } from '@storybook/jest';
import { Meta, Story } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { RKOMSidebar } from 'components/RKOMSidebar/RKOMSidebar';
import { ComponentProps } from 'react';
import { reactRouterDecorator } from 'utils/test/storyDecorators';

export default {
  component: RKOMSidebar,
  title: 'Components/RKOM Sidebar',
  argTypes: {
    onNavigate: { action: 'navigate' },
  },
  decorators: [reactRouterDecorator()],
} as Meta;

const Template: Story<ComponentProps<typeof RKOMSidebar>> = (args) => (
  <RKOMSidebar {...args} />
);

export const Default = Template.bind({});

Default.args = {};

export const Interactions = Template.bind({});

Interactions.args = {};

Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  const bidLink = canvas.getByTestId('bid');
  await userEvent.click(bidLink);
  expect(args.onNavigate).toBeCalledWith('bid');
};
