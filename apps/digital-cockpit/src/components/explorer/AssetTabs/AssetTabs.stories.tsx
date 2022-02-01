import { IdEither, InternalId } from '@cognite/sdk';
import sinon from 'sinon';
import configureStory from 'storybook/configureStory';
import { CdfClient } from 'utils';
import { ExtendedStory } from 'utils/test/storybook';
import { getRandomAssets } from '__mocks/assets';
import { MockFiles } from '__mocks/files';

import AssetTabsComponent from './AssetTabs';

export default {
  title: 'CDF Explorer/AssetTabs',
};

const mockSearch = () => {
  const stub = sinon.stub();
  stub.callsFake((args) => {
    if (args.search?.name) {
      return Promise.resolve(MockFiles.multiple(4));
    }
    return Promise.resolve(MockFiles.multiple(8));
  });
  return stub;
};

const Template: ExtendedStory<any> = () => (
  <div style={{ height: '100%' }}>
    <AssetTabsComponent assetId={{ id: 1234567890 }} />
  </div>
);

export const AssetTabs = Template.bind({});

AssetTabs.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    // mock AssetTabs requests
    client.cogniteClient.assets.retrieve = (ids: IdEither[]) => {
      const { id } = ids[0] as InternalId;
      return new Promise((resolve) => {
        // return parentId 2/3 times
        const parentId =
          Math.random() * 10 > 3
            ? Math.trunc(Math.random() * 10000)
            : undefined;
        setTimeout(
          () =>
            resolve(
              getRandomAssets({
                id,
                parentId,
                count: 1,
              })
            ),
          1000 // emulate request delay
        );
      });
    };

    // mock DocumentTab requests
    client.cogniteClient.get = () =>
      Promise.resolve({
        data: '',
        status: 200,
        headers: {},
      } as any);
    client.cogniteClient.files.search = mockSearch();

    return client;
  },
});
