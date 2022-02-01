import { AssetListScope, AssetSearchFilter } from '@cognite/sdk';
import { action } from '@storybook/addon-actions';
import configureStory from 'storybook/configureStory';
import { CdfClient } from 'utils';
import { ExtendedStory } from 'utils/test/storybook';
import { rootAssets, getRandomAssets, getAggregates } from '__mocks/assets';

import AssetHierarchy from '../AssetHierarchy';

import AssetSearch from './AssetSearch';

export default {
  title: 'CDF Explorer/AssetSearch',
};

const Template: ExtendedStory<any> = () => (
  <div style={{ height: '100%' }}>
    <AssetSearch
      onSelect={action('AssetSearch:onSelect')}
      // eslint-disable-next-line no-console
      cleanStateComponent={
        <AssetHierarchy onSelect={action('AssetHierarchy:onSelect')} />
      }
    />
  </div>
);

export const AssetSearchPanel = Template.bind({});

AssetSearchPanel.story = configureStory({
  redux: {},
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.assets.search = (params: AssetSearchFilter) => {
      const { filter: { parentIds, root } = {}, limit } = params;
      if (root) {
        return Promise.resolve(rootAssets);
      }
      return new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(
              getRandomAssets({
                parentId: (parentIds?.[0] as number) || rootAssets[0].id,
                count: limit || 2,
              })
            ),
          1000 // emulate request delay
        );
      });
    };
    client.cogniteClient.assets.retrieve = () => Promise.resolve(rootAssets);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    client.cogniteClient.assets.list = (params: AssetListScope | undefined) => {
      const {
        filter: { parentIds, root } = {},
        limit = 1,
        aggregatedProperties,
      } = params as AssetListScope;
      let nextCursor: string;
      if (limit >= 10) {
        nextCursor = `next-${new Date().getTime()}`;
      }
      if (root) {
        return Promise.resolve({ items: rootAssets });
      }
      return new Promise((resolve) => {
        const randAssets = getRandomAssets({
          parentId: parentIds?.[0] || rootAssets[0].id,
          count: limit,
        });
        setTimeout(
          () =>
            resolve({
              items: randAssets.map((ast) => ({
                ...ast,
                aggregates: getAggregates(aggregatedProperties),
              })),
              nextCursor,
            }),
          1000 // emulate request delay
        );
      });
    };

    return client;
  },
});
