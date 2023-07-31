import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { CdfClient } from 'utils';

import RecentAssetCard, { RecentAssetCardProps } from './RecentAssetCard';

const meta: Meta<RecentAssetCardProps> = {
  title: 'CDF Explorer / Recent Asset Card',
  component: RecentAssetCard,
  argTypes: {
    asset: {
      name: 'Asset',
      defaultValue: {
        name: '21PT1019',
        description: 'Some asset description',
      },
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<RecentAssetCardProps> = (args) => (
  <RecentAssetCard {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.assets.aggregate = () => {
      return Promise.resolve([{ count: 18 }]);
    };
    client.cogniteClient.timeseries.aggregate = () => {
      return Promise.resolve([{ count: 346 }]);
    };
    client.cogniteClient.events.aggregate.count = () => {
      return Promise.resolve([{ count: 1381 }]);
    };
    client.cogniteClient.files.aggregate = () => {
      return Promise.resolve([{ count: 42 }]);
    };
    return client;
  },
});
