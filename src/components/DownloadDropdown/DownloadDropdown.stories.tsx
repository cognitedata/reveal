import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import DownloadDropdown from './DownloadDropdown';

export default {
  component: DownloadDropdown,
  title: 'Components/Download Dropdown',
  argTypes: {
    onDownloadCalculations: { action: 'Clicked on Download Calculations' },
    onDownloadImage: { action: 'Clicked on Download as Image' },
    onCsvDownload: { action: 'Clicked on Download as CSV' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof DownloadDropdown>> = (args) => (
  <DownloadDropdown {...args} />
);

export const DevOrStaging = Template.bind({});

DevOrStaging.args = {
  onDownloadCalculations: () => {},
};

export const Production = Template.bind({});

Production.args = {
  onDownloadCalculations: undefined,
};
