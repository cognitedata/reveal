import { AssetListScope } from '@cognite/sdk';
import configureStory from 'storybook/configureStory';
import { CdfClient } from 'utils';
import { ExtendedStory } from 'utils/test/storybook';
import { rootAssets, getRandomAssets, getAggregates } from '__mocks/assets';
import { action } from '@storybook/addon-actions';

import AssetHierarchy from './AssetHierarchy';

export default {
  title: 'CDF Explorer/AssetHierarchy',
};
const Template: ExtendedStory<any> = () => (
  <div style={{ height: '100%' }}>
    <AssetHierarchy onSelect={action('onSelect')} />
  </div>
);

export const AssetTree = Template.bind({});

AssetTree.story = configureStory({
  redux: {},
  mockCdfClient: (client: CdfClient) => {
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
