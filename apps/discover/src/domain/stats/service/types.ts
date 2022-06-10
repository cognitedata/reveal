import { BaseAPIResult } from 'services/types';

import { StatsGetResponse } from '@cognite/discover-api-types';

export interface StatsApiResult extends BaseAPIResult {
  data: {
    stats: StatsGetResponse;
  };
}
