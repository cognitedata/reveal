import { CogniteSDKPage } from './CogniteSDK';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'CogniteSDK',
};

export const Base = () => (
  <CogniteSDKPage
    data={{
      id: 1,
      rootId: 1,
      name: 'test',
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
    }}
  />
);
