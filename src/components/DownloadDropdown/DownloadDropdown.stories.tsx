import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import DownloadDropdown from './DownloadDropdown';

export default {
  component: DownloadDropdown,
  title: 'Components/Download Dropdown',
} as Meta;

const Template: Story<ComponentProps<typeof DownloadDropdown>> = (args) => (
  <DownloadDropdown {...args} />
);

export const Demo = Template.bind({});

Demo.args = {};
