import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import CopyButton from './CopyButton';

export default {
  component: CopyButton,
  title: 'Components/Copy Button',
} as Meta;

const Template: Story<ComponentProps<typeof CopyButton>> = (args) => (
  <CopyButton {...args} />
);

export const Default = Template.bind({});

Default.args = {
  value: 'test',
};
