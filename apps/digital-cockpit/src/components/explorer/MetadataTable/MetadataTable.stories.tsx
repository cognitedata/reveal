import { Meta } from '@storybook/react';
import configureStory from 'storybook/configureStory';
import { CdfClient } from 'utils/cdfClient';
import { ExtendedStory } from 'utils/test/storybook';
import { MockAssets } from '__mocks/assets';

import MetadataTable, { MetadataTableProps } from './MetadataTable';

const meta: Meta<MetadataTableProps> = {
  title: 'Explorer / Metadata Details table',
  component: MetadataTable,
  argTypes: {
    assetId: {
      name: 'Asset ID',
      type: { name: 'number', required: true },
      defaultValue: 12345,
    },
  },
};

export default meta;

const Template: ExtendedStory<MetadataTableProps> = (args) => (
  <MetadataTable {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.assets.retrieve = () =>
      Promise.resolve([MockAssets.multiple()[1]]);
    return client;
  },
});

export const NoData = Template.bind({});
NoData.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.assets.retrieve = () =>
      Promise.resolve([MockAssets.single()]);
    return client;
  },
});
