import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { MockAssets } from '__mocks/assets';
import { MockTimeSeries } from '__mocks/timeseries';
import { ExtendedStory } from 'utils/test/storybook';
import { CdfClient } from 'utils';
import { MockFiles } from '__mocks/files';
import { action } from '@storybook/addon-actions';
import { MockDatapoints } from '__mocks/datapoints';

import GlobalSearch from './GlobalSearch';
import { GlobalSearchProps } from '.';

const meta: Meta<GlobalSearchProps> = {
  title: 'Search / Global Search',
  component: GlobalSearch,
  argTypes: {
    query: {
      name: 'Search Query',
      defaultValue: '02-V-2415',
      control: {
        type: 'text',
      },
    },
    onResultSelected: {
      name: 'onResultSelected',
      defaultValue: action('selected'),
    },
  },
};

export default meta;

const Template: ExtendedStory<GlobalSearchProps> = (args) => (
  <GlobalSearch {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    // client.cogniteClient.setProject('project');
    client.cogniteClient.assets.search = () => {
      return Promise.resolve(MockAssets.multiple(5));
    };
    client.cogniteClient.timeseries.search = () => {
      return Promise.resolve(MockTimeSeries.multiple(5));
    };
    client.cogniteClient.files.search = () => {
      return Promise.resolve(MockFiles.multiple(5));
    };
    client.cogniteClient.datapoints.retrieve = () => {
      return Promise.resolve([MockDatapoints.datapoint(50)]);
    };
    client.cogniteClient.datapoints.retrieveLatest = () => {
      return Promise.resolve([MockDatapoints.datapoint(50)]);
    };
    client.cogniteClient.files.getDownloadUrls = () => {
      return Promise.resolve([
        {
          id: 1,
          downloadUrl: 'https://picsum.photos/500/300',
        },
      ]);
    };
    return client;
  },
});
