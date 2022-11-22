import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { StatusLabel } from 'components/StatusLabel/StatusLabel';

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
