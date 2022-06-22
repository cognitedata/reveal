import { Flex } from '@cognite/cogs.js';
import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import SharingDropdown from './SharingDropdown';

export default {
  component: SharingDropdown,
  title: 'Components/App Bar/Sharing Dropdown',
  argTypes: {
    onToggleChartAccess: { action: 'Tried to toggle the access of the chart' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof SharingDropdown>> = (args) => (
  <Flex style={{ width: 600 }}>
    <div style={{ flexGrow: 1 }} />
    <SharingDropdown {...args} />
  </Flex>
);

export const Private = Template.bind({});

Private.args = {
  chart: { name: 'Chart Name', public: false },
  disabled: false,
  visible: true,
};

export const Public = Template.bind({});

Public.args = {
  chart: { name: 'Chart Name', public: true },
  disabled: false,
  visible: true,
};
