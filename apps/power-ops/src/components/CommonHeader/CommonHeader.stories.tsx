import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { CommonHeader } from 'components/CommonHeader/CommonHeader';

export default {
  component: CommonHeader,
  title: 'Components/Common Header',
} as Meta;

const Template: Story<ComponentProps<typeof CommonHeader>> = (args) => (
  <CommonHeader {...args} />
);

export const Default = Template.bind({});

Default.args = {
  title: 'Default Header Title',
  titleLabel: 'Some label here',
  children: <span>Something on the right side</span>,
};
