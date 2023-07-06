import { ComponentProps } from 'react';

import { Meta, Story } from '@storybook/react';

import AlertIcon from './AlertIcon';

export default {
  component: AlertIcon,
  title: 'Components/AlertIcon',
} as Meta;

const Template: Story<ComponentProps<typeof AlertIcon>> = (args: any) => (
  <AlertIcon {...args} />
);

export const IconOnly = Template.bind({});
export const Info = Template.bind({});
export const Warning = Template.bind({});
export const Error = Template.bind({});

IconOnly.args = {
  icon: 'InfoFilled',
  type: 'default',
  onClick: () => {},
};

Info.args = {
  value: 'Info',
  icon: 'InfoFilled',
  type: 'default',
  onClick: () => {},
};

Warning.args = {
  value: 'Warning',
  icon: 'WarningFilled',
  type: 'warning',
  onClick: () => {},
};

Error.args = {
  value: 'Error',
  icon: 'ErrorFilled',
  type: 'danger',
  onClick: () => {},
};
