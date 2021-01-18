import React from 'react';

import { CogniteSDKPage } from './CogniteSDK';

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
