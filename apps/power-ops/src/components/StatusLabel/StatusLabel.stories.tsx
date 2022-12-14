import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { StatusLabel } from 'components/StatusLabel/StatusLabel';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export default {
  component: StatusLabel,
  title: 'Components/Status Label',
} as Meta;

const Template: Story<ComponentProps<typeof StatusLabel>> = (args) => (
  <StatusLabel {...args} />
);

export const Default = Template.bind({});

Default.args = {
  status: 'TRIGGERED',
};

export const Failed = Template.bind({});

Failed.args = {
  status: 'FAILED',
};

export const Running = Template.bind({});

Running.args = {
  status: 'RUNNING',
};

export const Finished = Template.bind({});

Finished.args = {
  status: 'FINISHED',
};

export const FailedWithModal = Template.bind({});

FailedWithModal.args = {
  status: 'FAILED',
  icon: 'ArrowUpRight',
  modalContent: {
    title: 'Failed',
    message: 'Some info about it failed\\nThis is part of stacktrace',
  },
};

export const Interactions = Template.bind({});

Interactions.args = {
  status: 'FAILED',
  modalContent: {
    title: 'Failed',
    message: 'Some info about it failed',
  },
};

Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByText('Failed');
  userEvent.click(button);
  const modal = await canvas.findByTestId('more-info-modal');
  expect(modal).toBeInTheDocument();
  const errorLog = await canvas.findByText(args.modalContent!.message);
  expect(errorLog).toBeInTheDocument();
};
