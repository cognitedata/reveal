import { CogniteEventV3ish } from 'modules/wellSearch/types';

import { createdAndLastUpdatedTime } from './log';

export const mockCogniteEvent: CogniteEventV3ish = {
  assetIds: ['759155409324883'], // wellbore id
  ...createdAndLastUpdatedTime,
  id: 1,
};

export const mockCogniteEventList: CogniteEventV3ish[] = [
  {
    assetIds: ['12', '10'],
    ...createdAndLastUpdatedTime,
    id: 1,
  },
  {
    assetIds: ['5'],
    ...createdAndLastUpdatedTime,
    id: 1,
  },
  {
    ...createdAndLastUpdatedTime,
    id: 1,
  },
  { assetIds: [], ...createdAndLastUpdatedTime, id: 1 },
];
