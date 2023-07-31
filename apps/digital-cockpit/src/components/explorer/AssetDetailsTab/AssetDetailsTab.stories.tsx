import { Meta } from '@storybook/react';
import sinon from 'sinon';
import configureStory from 'storybook/configureStory';
import { CdfClient } from 'utils/cdfClient';
import { ExtendedStory } from 'utils/test/storybook';
import { MockAssets } from '__mocks/assets';
import { MockFiles } from '__mocks/files';

import AssetDetailsTab, { AssetDetailsTabProps } from './AssetDetailsTab';

const meta: Meta<AssetDetailsTabProps> = {
  title: 'Explorer / Details Tab',
  component: AssetDetailsTab,
  argTypes: {
    assetId: {
      name: 'Asset ID',
      type: { name: 'number', required: true },
      defaultValue: 12345,
    },
  },
};

const mockDocsList = () => {
  const stub = sinon.stub();
  stub.callsFake(() => {
    return Promise.resolve({ items: MockFiles.multiple(5) });
  });
  return stub;
};

export default meta;

const Template: ExtendedStory<AssetDetailsTabProps> = (args) => (
  <AssetDetailsTab {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.files.list = mockDocsList();
    client.cogniteClient.assets.retrieve = () =>
      Promise.resolve([MockAssets.multiple()[1]]);
    return client;
  },
});
