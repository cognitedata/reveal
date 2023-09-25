import { CogniteClient } from '@cognite/sdk';

import { DataModelV2 } from '../src/app/services/types';

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
