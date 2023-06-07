import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import ChartListDropdown from './ChartListDropdown';

export default {
  component: ChartListDropdown,
  title: 'Components/Chart List Page/Chart List Dropdown',
  argTypes: {
    onDuplicateClick: { action: 'Clicked on Duplicate' },
    onDeleteClick: { action: 'Clicked on Delete' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof ChartListDropdown>> = (args) => (
  <ChartListDropdown {...args} />
);

export const Default = Template.bind({});

Default.args = {
  name: 'Chart Name',
};

export const ReadOnly = Template.bind({});

ReadOnly.args = {
  name: 'Chart Name',
  readOnly: true,
};
