import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import MetadataPanel from './MetadataPanel';

export default {
  component: MetadataPanel,
  title: 'Components/Details Sidebar/Metadata Panel',
} as Meta;

const Template: Story<ComponentProps<typeof MetadataPanel>> = (args) => (
  <div style={{ maxWidth: '25rem' }}>
    <MetadataPanel {...args} />
  </div>
);

export const Default = Template.bind({});

Default.args = {
  loading: false,
  type: 'timeseries',
  name: 'RO_ACID_PUMP_READY',
  description: '',
  externalId: 'houston.smb.MainProgram\\RO_ACID_PUMP_READY',
  lastUpdatedTime: 'Oct 7, 2020 17:04:31',
  isStep: false,
  sourceId: '170545621080978',
  equipmentTag: '',
  equipmentLink: undefined,
  datasetName: 'Timeseries',
  datasetLink:
    'https://fusion.cognite.com/fusion/data-sets/data-set/3678371557883348undefined',
};

export const Calculation = Template.bind({});

Calculation.args = {
  type: 'calculation',
};

export const Loading = Template.bind({});

Loading.args = {
  loading: true,
};

export const Error = Template.bind({});

Error.args = {
  loading: false,
  error: 'Operation Cancelled',
};
