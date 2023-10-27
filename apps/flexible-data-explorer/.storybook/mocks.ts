import { DataModelV2 } from '@fdx/shared/types/services';

import { CogniteClient } from '@cognite/sdk';

import { PROJECT } from './constants';

export const mockCogniteClient = new CogniteClient({
  appId: 'flexible-data-explorer',
  project: PROJECT,
  getToken: () => Promise.resolve('mock token'),
});

export const mockDataModel: DataModelV2 = {
  space: 'fdx',
  externalId: 'MovieDM',
  version: '1',
};
