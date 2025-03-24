import type { Source } from '../../../../src/data-providers/FdmSDK';
import { COGNITE_ASSET_SOURCE } from '../../../../src/data-providers/core-dm-provider/dataModels';

export const simpleSourcesFixtures: Source[] = [
  {
    type: 'view',
    externalId: 'externalId1',
    space: 'space1',
    version: 'v1'
  },
  {
    type: 'view',
    externalId: 'externalId2',
    space: 'space2',
    version: 'v1'
  }
];

