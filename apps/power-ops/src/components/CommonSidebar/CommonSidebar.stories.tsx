import { Meta, Story } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { CommonSidebar } from 'components/CommonSidebar/CommonSidebar';
import { ComponentProps } from 'react';

export default {
  component: CommonSidebar,
  title: 'Components/Common Sidebar',
  argTypes: {
    onOpenCloseClick: { action: 'tried to open or close' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof CommonSidebar>> = (args) => (
  <CommonSidebar {...args}>Hey!</CommonSidebar>
);

export const Open = Template.bind({});

Open.args = {
  initiallyOpen: true,
};

export const Closed = Template.bind({});

Closed.args = {
  initiallyOpen: false,
};

export const Interactions = Template.bind({});

Interactions.args = {
  initiallyOpen: true,
};

Interactions.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);

  // Show/Hide button tests
  const hideButton = canvas.getByLabelText('Show or hide sidebar');
  await userEvent.click(hideButton);
  expect(canvas.queryByText('Hey!')).not.toBeInTheDocument();
  await userEvent.click(hideButton);
  expect(canvas.getByText('Hey!')).toBeInTheDocument();
};
